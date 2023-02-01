"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("mongodb");
const db_service_1 = require("../../services/db.service");
const logger_service_1 = __importDefault(require("../../services/logger.service"));
dotenv_1.default.config();
exports.chatService = {
    query,
    getById,
    add,
    update,
    addMessage,
};
function query(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, db_service_1.getCollection)('conversation');
            const chats = yield collection
                .find({
                participants: {
                    $elemMatch: { _id: user._id },
                },
            })
                .sort({ timestamp: -1 })
                .toArray();
            return chats.map(chat => ({
                user: chat.participants.filter((participant) => participant._id !== user._id),
                lastMsg: { txt: chat.lastMsg, timestamp: chat.timestamp },
                chatId: chat.chatId,
            }));
        }
        catch (err) {
            console.log(err);
            logger_service_1.default.error('Failed to get chats', err);
            throw err;
        }
    });
}
function getById(chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, db_service_1.getCollection)('chat');
            const chat = yield collection.findOne({ _id: new mongodb_1.ObjectId(chatId) });
            return chat;
        }
        catch (err) {
            logger_service_1.default.error(`while finding chat ${chatId}`, err);
            throw err;
        }
    });
}
function update(chat, curUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Mark every message as read
        const messages = chat.messages
            .filter(message => message.fromUser !== curUserId)
            .map(message => {
            message.read = true;
            return message;
        });
        const collection = yield (0, db_service_1.getCollection)('chat');
        yield collection.updateOne({
            _id: new mongodb_1.ObjectId(chat._id),
        }, { $set: { messages } });
        const updatedChat = { _id: new mongodb_1.ObjectId(chat._id), messages };
        return updatedChat;
    });
}
function add(participants) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const chatId = yield _findByParticipants(participants);
            if (chatId)
                return chatId;
            const conversationCollection = yield (0, db_service_1.getCollection)('conversation');
            const chatCollection = yield (0, db_service_1.getCollection)('chat');
            const { insertedId } = yield chatCollection.insertOne({ messages: [] });
            conversationCollection.insertOne({
                chatId: insertedId,
                participants,
                lastMsg: '',
                timestamp: null,
            });
            return insertedId;
        }
        catch (err) {
            console.log(err);
            logger_service_1.default.error(`while adding chat`, err);
            throw err;
        }
    });
}
function addMessage(message, chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const chatCollection = yield (0, db_service_1.getCollection)('chat');
            const chat = yield chatCollection.findOne({ _id: new mongodb_1.ObjectId(chatId) });
            if (!chat)
                throw new Error('failed to get chat');
            message.timestamp = Date.now();
            chat.messages.push(message);
            const messages = chat.messages;
            yield chatCollection.updateOne({ _id: new mongodb_1.ObjectId(chatId) }, { $set: messages });
            // Update conversation aswell
            const conversationCollection = yield (0, db_service_1.getCollection)('conversation');
            const conversation = yield conversationCollection.findOne({
                chatId: new mongodb_1.ObjectId(chatId),
            });
            if (!conversation)
                throw new Error('failed to get conversation');
            const conversationToSave = {
                participants: conversation.participants,
                lastMsg: message.txt || message.type.split('/')[0],
                chatId: conversation.chatId,
                timestamp: message.timestamp,
            };
            yield conversationCollection.updateOne({ chatId: new mongodb_1.ObjectId(chatId) }, { $set: conversationToSave });
            return chat;
        }
        catch (err) {
            logger_service_1.default.error('While adding message');
            throw err;
        }
    });
}
function _findByParticipants(users) {
    return __awaiter(this, void 0, void 0, function* () {
        // If the input is multiple users return the chatId
        const collection = yield (0, db_service_1.getCollection)('conversation');
        const chat = yield collection
            .find({
            participants: {
                $all: [
                    { $elemMatch: { _id: users[0]._id } },
                    { $elemMatch: { _id: users[1]._id } },
                ],
            },
        })
            .toArray();
        return chat[0]._id;
    });
}

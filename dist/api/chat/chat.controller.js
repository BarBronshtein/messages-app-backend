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
exports.addChat = exports.addMessage = exports.updateChat = exports.getChatById = exports.getChats = void 0;
const chat_service_1 = require("./chat.service");
const logger_service_1 = __importDefault(require("../../services/logger.service"));
function getChats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const chats = yield chat_service_1.chatService.query(res.locals.loggedinUser);
            res.send(chats);
        }
        catch (err) {
            logger_service_1.default.error('Failed to get chats', err);
            res.status(500).send({ err: 'Faile to get chats' });
        }
    });
}
exports.getChats = getChats;
function getChatById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const chat = yield chat_service_1.chatService.getById(req.params.id);
            res.send(chat);
        }
        catch (err) {
            logger_service_1.default.error('Failed to get chat', err);
            res.status(500).send({ err: 'Failed to get chat' });
        }
    });
}
exports.getChatById = getChatById;
function updateChat(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedChat = yield chat_service_1.chatService.update(req.body.chat, req.body.user);
            res.send(updatedChat);
        }
        catch (err) {
            logger_service_1.default.error('Failed to update chat', err);
            res.status(500).send({ err: 'Failed to update chat' });
        }
    });
}
exports.updateChat = updateChat;
function addMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const message = req.body;
            const updatedChat = yield chat_service_1.chatService.addMessage(message, req.params.id);
            // Consider only sending the added message instead of all the chat
            res.send(updatedChat);
        }
        catch (err) {
            logger_service_1.default.error('Failed to add message', err);
            res.status(500).send({ err: 'Failed to add message' });
        }
    });
}
exports.addMessage = addMessage;
function addChat(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const participants = req.body;
            const addedChat = yield chat_service_1.chatService.add(participants);
            res.json(addedChat);
        }
        catch (err) {
            logger_service_1.default.error('Failed to add chat', err);
            res.status(500).send({ err: 'Failed to add chat' });
        }
    });
}
exports.addChat = addChat;

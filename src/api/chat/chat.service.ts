import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
import { Chat, Message, User } from '../../models';
import { getCollection } from '../../services/db.service';
import logger from '../../services/logger.service';

dotenv.config();

export const chatService = {
	query,
	getById,
	add,
	update,
	addMessage,
};

async function query(user: User) {
	try {
		const collection = await getCollection('conversation');
		const chats = await collection
			.find({
				participants: {
					$elemMatch: { _id: user._id },
				},
			})
			.sort({ timestamp: -1 })
			.toArray();
		return chats.map(chat => ({
			user: chat.participants.filter(
				(participant: User) => participant._id !== user._id
			),
			lastMsg: { txt: chat.lastMsg, timestamp: chat.timestamp },
			chatId: chat.chatId,
			_id: chat._id,
		}));
	} catch (err) {
		console.log(err);
		logger.error('Failed to get chats', err);
		throw err;
	}
}
async function getById(chatId: ObjectId | string, curUserId: string) {
	try {
		const collection = await getCollection('chat');
		const chat = await collection.findOne({ _id: new ObjectId(chatId) });
		const chatToSend: any = {
			...chat,
			userId: chat?.participants.filter(
				(userId: string) => curUserId !== userId
			)[0],
		};
		delete chatToSend.participants;
		return chatToSend;
	} catch (err) {
		logger.error(`while finding chat ${chatId}`, err);
		throw err;
	}
}
async function update(chat: Chat, curUserId: ObjectId | string) {
	// Mark every message as read
	const messages = chat.messages
		.filter(message => message.fromUser !== curUserId)
		.map(message => {
			message.read = true;
			return message;
		});
	const collection = await getCollection('chat');
	await collection.updateOne(
		{
			_id: new ObjectId(chat._id),
		},
		{ $set: { messages } }
	);
	const updatedChat = { _id: new ObjectId(chat._id), messages };
	return updatedChat;
}

async function add(participants: User[], curUserId: string | ObjectId) {
	try {
		const chatId = await _findByParticipants(participants);
		if (chatId) return chatId;
		const conversationCollection = await getCollection('conversation');
		const chatCollection = await getCollection('chat');
		const { insertedId } = await chatCollection.insertOne({
			messages: [],
			participants: participants.map(user => user._id),
		});

		const conversationDocument = await conversationCollection.insertOne({
			chatId: insertedId,
			participants,
			lastMsg: '',
			timestamp: null,
		});
		const conversationToSend = {
			_id: conversationDocument.insertedId,
			chatId: insertedId,
			user: participants.filter(user => user._id !== curUserId),
			lastMsg: { txt: '', timestamp: null },
		};
		return { chatId: insertedId, conversation: conversationToSend };
	} catch (err) {
		console.log(err);
		logger.error(`while adding chat`, err);
		throw err;
	}
}
async function addMessage(message: Message, chatId: ObjectId | string) {
	try {
		const chatCollection = await getCollection('chat');
		const chat = await chatCollection.findOne({ _id: new ObjectId(chatId) });
		if (!chat) throw new Error('failed to get chat');

		chat.messages.push(message);
		const chatToSave = { messages: chat.messages, userId: chat.userId };

		await chatCollection.updateOne(
			{ _id: new ObjectId(chatId) },
			{ $set: chatToSave }
		);
		_updateConversationWhenAddingMessage(message, chatId);
		return message;
	} catch (err) {
		logger.error('While adding message', err);
		throw err;
	}
}

async function _updateConversationWhenAddingMessage(
	message: any,
	chatId: string | ObjectId
) {
	try {
		const conversationCollection = await getCollection('conversation');
		const conversation = await conversationCollection.findOne({
			chatId: new ObjectId(chatId),
		});
		if (!conversation) throw new Error('failed to get conversation');

		const conversationToSave = {
			participants: conversation.participants,
			lastMsg: message.txt || message.type,
			chatId: conversation.chatId,
			timestamp: message.timestamp,
		};
		await conversationCollection.updateOne(
			{ _id: new ObjectId(conversation._id) },
			{ $set: conversationToSave }
		);
	} catch (err) {
		logger.error('Failed to update conversation');
		throw err;
	}
}

async function _findByParticipants(users: User[]) {
	const collection = await getCollection('conversation');
	const chat = await collection
		.find({
			participants: {
				$all: [
					{ $elemMatch: { _id: users[0]._id } },
					{ $elemMatch: { _id: users[1]._id } },
				],
			},
		})
		.toArray();
	return chat[0]?.chatId;
}

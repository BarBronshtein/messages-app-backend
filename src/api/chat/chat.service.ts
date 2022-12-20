import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
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

type Chat = {
	_id: ObjectId;
	messages: any[];
};

async function query() {
	try {
		const collection = await getCollection('conversation');
		const chats = await collection.find().sort({ timestamp: -1 });
		return chats;
	} catch (err) {
		logger.error('Failed to get chats', err);
		throw err;
	}
}
async function getById(chatId: ObjectId | string) {
	try {
		const collection = await getCollection('chat');
		const chat = await collection.findOne({ _id: new ObjectId(chatId) });
		return chat;
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
async function add(participants: string[] | ObjectId[]) {
	try {
		const conversationCollection = await getCollection('chat');
		const chatCollection = await getCollection('conversation');
		const { insertedId } = await chatCollection.insertOne({ messages: [] });
		conversationCollection.insertOne({
			chatId: insertedId,
			participants,
			lastMsg: '',
			timestamp: null,
		});
	} catch (err) {
		logger.error(`while adding chat`, err);
		throw err;
	}
}
async function addMessage(message: any, chatId: ObjectId | string) {
	// If contains a file store in a diffrent collection and have a pointer to that file
	try {
		if (message.file) {
			// Replace with
			// fileService.add(message.fil)
			const fileCollection = await getCollection('file');
			const { insertedId } = await fileCollection.insertOne({
				file: message.file,
			});

			message.type = message.file.type.split('/')[0];
			message.url = `serverUrl/api/assets/${insertedId}`;
			delete message.file;
		}

		const collection = await getCollection('chat');
		const chat = await collection.findOne({ _id: new ObjectId(chatId) });
		if (!chat) throw new Error('failed to get chat');
		chat.messages.push(message);
		const messages = chat.messages;
		await collection.updateOne({ _id: new ObjectId(chatId) }, { messages });
		// Update conversation aswell
		return chat;
	} catch (err) {
		logger.error('While adding message');
		throw err;
	}
}

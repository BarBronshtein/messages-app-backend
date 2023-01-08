import dotenv from 'dotenv';
import { ObjectId, WithId } from 'mongodb';
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
type User = any;

async function query(user: User | User[]) {
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
		}));
	} catch (err) {
		console.log(err);
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
async function add(participants: { _id: string | ObjectId; photo: string }[]) {
	try {
		const chatId = await _findByParticipants(participants);
		if (chatId) return chatId;
		const conversationCollection = await getCollection('conversation');
		const chatCollection = await getCollection('chat');
		const { insertedId } = await chatCollection.insertOne({ messages: [] });
		conversationCollection.insertOne({
			chatId: insertedId,
			participants,
			lastMsg: '',
			timestamp: null,
		});
		return insertedId;
	} catch (err) {
		console.log(err);
		logger.error(`while adding chat`, err);
		throw err;
	}
}
async function addMessage(message: any, chatId: ObjectId | string) {
	// If contains a file store in a diffrent collection and have a pointer to that file
	try {
		if (message.file) {
			// Replace with
			// fileService.update(message.file)
			const fileCollection = await getCollection('file');
			const { insertedId } = await fileCollection.insertOne({
				file: message.file,
			});

			message.type = message.file.type.split('/')[0];
			message.url = `${process.env.APP_DOMAIN}/api/files/${insertedId}`;
			delete message.file;
		}

		const chatCollection = await getCollection('chat');
		const chat = await chatCollection.findOne({ _id: new ObjectId(chatId) });
		if (!chat) throw new Error('failed to get chat');
		message.timestamp = Date.now();
		chat.messages.push(message);
		const messages = chat.messages;
		await chatCollection.updateOne(
			{ _id: new ObjectId(chatId) },
			{ $set: messages }
		);

		// Update conversation aswell
		const conversationCollection = await getCollection('conversation');
		const conversation = await conversationCollection.findOne({
			chatId: new ObjectId(chatId),
		});
		if (!conversation) throw new Error('failed to get conversation');
		const conversationToSave = {
			participants: conversation.participants,
			lastMsg: message.txt || message.type.split('/')[0],
			chatId: conversation.chatId,
			timestamp: message.timestamp,
		};
		await conversationCollection.updateOne(
			{ chatId: new ObjectId(chatId) },
			{ $set: conversationToSave }
		);
		// Todo:update conversation data in Client

		return chat;
	} catch (err) {
		logger.error('While adding message');
		throw err;
	}
}

async function _findByParticipants(users: User[]) {
	// If the input is multiple users return the chatId
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
	return chat[0]._id;
}

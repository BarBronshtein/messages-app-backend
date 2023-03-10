import { Request, Response } from 'express';

import { chatService } from './chat.service';
import logger from '../../services/logger.service';

async function getChats(req: Request, res: Response) {
	try {
		const chats = await chatService.query(res.locals.loggedinUser);
		res.send(chats);
	} catch (err) {
		logger.error('Failed to get chats', err);
		res.status(500).send({ err: 'Faile to get chats' });
	}
}

async function getChatById(req: Request, res: Response) {
	const { _id } = res.locals.loggedinUser;
	try {
		const chat = await chatService.getById(req.params.id, _id);
		res.send(chat);
	} catch (err) {
		logger.error('Failed to get chat', err);
		res.status(500).send({ err: 'Failed to get chat' });
	}
}

async function updateChat(req: Request, res: Response) {
	try {
		const updatedChat = await chatService.update(req.body.chat, req.body.user);
		res.send(updatedChat);
	} catch (err) {
		logger.error('Failed to update chat', err);
		res.status(500).send({ err: 'Failed to update chat' });
	}
}

async function addMessage(req: Request, res: Response) {
	try {
		const message = req.body;
		const addedMessage = await chatService.addMessage(message, req.params.id);
		res.send(addedMessage);
	} catch (err) {
		logger.error('Failed to add message', err);
		res.status(500).send({ err: 'Failed to add message' });
	}
}

async function addChat(req: Request, res: Response) {
	try {
		const participants = req.body;
		const addedChat = await chatService.add(
			participants,
			res.locals.loggedinUser._id
		);
		res.json(addedChat);
	} catch (err) {
		logger.error('Failed to add chat', err);
		res.status(500).send({ err: 'Failed to add chat' });
	}
}

export { getChats, getChatById, updateChat, addMessage, addChat };

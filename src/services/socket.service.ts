import http from 'http';
import logger from './logger.service';
import { Server, Socket } from 'socket.io';
import { ObjectId } from 'mongodb';
import { IncomingMessage, ServerResponse } from 'http';

interface ISocket extends Socket {
	userId?: string | ObjectId;
	myTopic?: string;
}

type MySocketAction = {
	type: MySocketTypes;
	data: any;
	label?: string;
	room?: string | null;
};

enum MySocketTypes {
	SET_USER_SOCKET = 'SET_USER_SOCKET',
	DISCONNET_USER_SOCKET = 'DISCONNET_USER_SOCKET',
	SET_TOPIC = 'SET_TOPIC',
	CLIENT_EMIT_ADD_MESSAGE = 'CLIENT_EMIT_ADD_MESSAGE',
	CLIENT_EMIT_CONVERSATION_UPDATE = 'CLIENT_EMIT_CONVERSATION_UPDATE',
	SERVER_EMIT_ADD_MESSAGE = 'SERVER_EMIT_ADD_MESSAGE',
	SERVER_EMIT_CONVERSATION_UPDATE = 'SERVER_EMIT_CONVERSATION_UPDATE',
}

let gIo = new Server();
function setupSocketAPI(
	http: http.Server<typeof IncomingMessage, typeof ServerResponse>
) {
	gIo.attach(http, {
		cors: {
			origin: '*',
		},
	});
	gIo.on('connection', (socket: ISocket) => {
		logger.info(
			`New connected socket [id: ${socket.id}] with [userId: ${socket.handshake.query.userId}]`
		);
		socket.userId = socket.handshake.query.userId as string;
		socket.myTopic = socket.handshake.query.topic as string | undefined;
		socket.on(MySocketTypes.SET_USER_SOCKET, (userId: string | ObjectId) => {
			logger.info(`Setting socket.userId=${userId} for socket [id:${socket.id}]`);
			socket.userId = userId;
		});
		socket.on(MySocketTypes.DISCONNET_USER_SOCKET, () => {
			logger.info(`Removing socket.userId for socket [id: ${socket.id}]`);
			delete socket.userId;
		});
		socket.on(MySocketTypes.SET_TOPIC, (topic: string) => {
			// topic is the chatId
			if (socket.myTopic === topic) return;
			if (socket.myTopic) {
				socket.leave(socket.myTopic);
				logger.info(`Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`);
			}
			socket.join(topic);
			socket.myTopic = topic;
			logger.info(`Socket is joining topic ${socket.myTopic} [id: ${socket.id}]`);
		});
		socket.on(MySocketTypes.CLIENT_EMIT_ADD_MESSAGE, msg => {
			broadcast({
				type: MySocketTypes.SERVER_EMIT_ADD_MESSAGE,
				data: msg,
				room: socket.myTopic || msg.chatId,
				userId: socket.userId!,
			});
		});
		socket.on(MySocketTypes.CLIENT_EMIT_CONVERSATION_UPDATE, conversation => {
			logger.info(
				`Emitting [event: ${MySocketTypes.SERVER_EMIT_CONVERSATION_UPDATE}] to [userId: ${socket.userId}]`
			);
			emitToUser({
				type: MySocketTypes.SERVER_EMIT_CONVERSATION_UPDATE,
				data: {
					...conversation,
					user: conversation.user.filter((user: any) => user._id !== socket.userId),
				},
				userId: socket.userId!,
			});
			logger.info(
				`Emitting [event: ${
					MySocketTypes.SERVER_EMIT_CONVERSATION_UPDATE
				}] to [userId: ${
					conversation.user.filter((user: any) => user._id !== socket.userId)?.[0]
				}`
			);
			emitToUser({
				type: MySocketTypes.SERVER_EMIT_CONVERSATION_UPDATE,
				data: {
					...conversation,
					user: conversation.user.filter((user: any) => user._id === socket.userId),
				},
				userId: conversation.user.filter(
					(user: any) => user._id !== socket.userId
				)?.[0],
			});
		});
		socket.on('disconnect', () => {
			logger.info(`Socket disconnected [id: ${socket.id}]`);
		});
	});
}

function emitTo({ type, data, label }: MySocketAction) {
	if (label) gIo.to(label).emit(type, data);
	else gIo.emit(type, data);
}

async function emitToUser({
	type,
	data,
	userId,
}: MySocketAction & { userId: ObjectId | string }) {
	const socket = await _getUserSocket(userId);

	if (socket) {
		logger.info(
			`Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`
		);
		socket.emit(type, data);
	} else {
		logger.info(`No active socket for user: ${JSON.stringify(userId)}`);
		_printSockets();
	}
}

// If possible, send to all sockets BUT not the current socket
// Optionally, broadcast to a room / to all
async function broadcast({
	type,
	data,
	room = null,
	userId,
}: MySocketAction & { userId: ObjectId | string }) {
	logger.info(`Broadcasting event: ${type}`);
	_printSockets();
	const excludedSocket = await _getUserSocket(userId);
	if (room && excludedSocket) {
		logger.info(`Broadcast to room ${room} excluding user: ${userId}`);
		excludedSocket.broadcast.to(room).emit(type, data);
	} else if (excludedSocket) {
		logger.info(`Broadcast to all excluding user: ${userId}`);
		excludedSocket.broadcast.emit(type, data);
	} else if (room) {
		logger.info(`Emit to room: ${room}`);
		gIo.to(room).emit(type, data);
	} else {
		logger.info(`Emit to all`);
		gIo.emit(type, data);
	}
}

async function _getUserSocket(
	userId: ObjectId | string
): Promise<Socket | undefined> {
	const sockets = await _getAllSockets();
	const socket = sockets.find(s => s.userId === userId);
	return socket;
}
async function _getAllSockets(): Promise<ISocket[]> {
	// return all Socket instances
	const sockets = (await gIo.fetchSockets()) as unknown as ISocket[];
	return sockets;
}

async function _printSockets() {
	const sockets = await _getAllSockets();
	console.log(`Sockets: (count: ${sockets.length}):`);
	sockets.forEach(_printSocket);
}
function _printSocket(socket: ISocket) {
	console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`);
	// logger.info(`Socket - socketId: ${socket.id} userId: ${socket.userId}`);
}

export const socketService = {
	// set up the sockets service and define the API
	setupSocketAPI,
	// emit to everyone / everyone in a specific room (label)
	emitTo,
	// emit to a specific user (if currently active in system)
	emitToUser,
	// Send to all sockets BUT not the current socket - if found
	// (otherwise broadcast to a room / to all)
	broadcast,
};

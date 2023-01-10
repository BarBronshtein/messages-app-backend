import logger from './logger.service';
import { Http2SecureServer } from 'http2';
import { Server, Socket, RemoteSocket } from 'socket.io';
import { ObjectId } from 'mongodb';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

interface ISocket extends Socket {
	userId?: string | ObjectId;
}

type MySocketAction = {
	type: MySocketTypes;
	data: any;
	label: ISocket;
	room: string | null;
};

enum MySocketTypes {
	SET_USER_SOCKET = 'SET_USER_SOCKET',
	DISCONNET_USER_SOCKET = 'DISCONNET_USER_SOCKET',
}

let gIo = new Server();
function setupSocketAPI(http: Http2SecureServer) {
	gIo.attach(http, {
		cors: {
			origin: '*',
		},
	});
	gIo.on('connection', (socket: ISocket) => {
		logger.info(`New connected socket [id: ${socket.id}]`);
		socket.on(MySocketTypes.SET_USER_SOCKET, (userId: string | ObjectId) => {
			logger.info(`Setting socket.userId=${userId}for socket [id:${socket.id}]`);
			socket.userId = userId;
		});
		socket.on(MySocketTypes.DISCONNET_USER_SOCKET, () => {
			logger.info(`Removing socket.userId for socket [id: ${socket.id}]`);
			delete socket.userId;
		});
		socket.on('disconnect', () => {
			logger.info(`Socket disconnected [id: ${socket.id}]`);
		});
	});
}

function emitTo({ type, data, label }: MySocketAction) {
	if (label) gIo.to('watching:' + label).emit(type, data);
	else gIo.emit(type, data);
}

async function emitToUser({
	type,
	data,
	userId,
}: MySocketAction & { userId: ObjectId }) {
	const socket = await _getUserSocket(userId);

	if (socket) {
		logger.info(
			`Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`
		);
		socket.emit(type, data);
	} else {
		logger.info(`No active socket for user: ${userId}`);
		// _printSockets()
	}
}

// If possible, send to all sockets BUT not the current socket
// Optionally, broadcast to a room / to all
async function broadcast({
	type,
	data,
	room = null,
	userId,
}: MySocketAction & { userId: ObjectId }) {
	logger.info(`Broadcasting event: ${type}`);
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

async function _getUserSocket(userId: ObjectId): Promise<Socket | undefined> {
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
}

module.exports = {
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

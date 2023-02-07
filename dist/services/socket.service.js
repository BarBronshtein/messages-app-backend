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
exports.socketService = void 0;
const logger_service_1 = __importDefault(require("./logger.service"));
const socket_io_1 = require("socket.io");
var MySocketTypes;
(function (MySocketTypes) {
    MySocketTypes["SET_USER_SOCKET"] = "SET_USER_SOCKET";
    MySocketTypes["DISCONNET_USER_SOCKET"] = "DISCONNET_USER_SOCKET";
    MySocketTypes["SET_TOPIC"] = "SET_TOPIC";
    MySocketTypes["CLIENT_EMIT_ADD_MESSAGE"] = "CLIENT_EMIT_ADD_MESSAGE";
    MySocketTypes["CLIENT_EMIT_CONVERSATION_UPDATE"] = "CLIENT_EMIT_CONVERSATION_UPDATE";
    MySocketTypes["SERVER_EMIT_ADD_MESSAGE"] = "SERVER_EMIT_ADD_MESSAGE";
    MySocketTypes["SERVER_EMIT_CONVERSATION_UPDATE"] = "SERVER_EMIT_CONVERSATION_UPDATE";
})(MySocketTypes || (MySocketTypes = {}));
let gIo = new socket_io_1.Server();
function setupSocketAPI(http) {
    gIo.attach(http, {
        cors: {
            origin: '*',
        },
    });
    gIo.on('connection', (socket) => {
        logger_service_1.default.info(`New connected socket [id: ${socket.id}]`);
        socket.on(MySocketTypes.SET_USER_SOCKET, (userId) => {
            logger_service_1.default.info(`Setting socket.userId=${userId}for socket [id:${socket.id}]`);
            socket.userId = userId;
        });
        socket.on(MySocketTypes.DISCONNET_USER_SOCKET, () => {
            logger_service_1.default.info(`Removing socket.userId for socket [id: ${socket.id}]`);
            delete socket.userId;
        });
        socket.on(MySocketTypes.SET_TOPIC, (topic) => {
            // topic is the chatId
            if (socket.myTopic === topic)
                return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic);
                logger_service_1.default.info(`Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`);
            }
            socket.join(topic);
            socket.myTopic = topic;
            logger_service_1.default.info(`Socket is joining topic ${socket.myTopic} [id: ${socket.id}]`);
        });
        socket.on(MySocketTypes.CLIENT_EMIT_ADD_MESSAGE, msg => {
            broadcast({
                type: MySocketTypes.SERVER_EMIT_ADD_MESSAGE,
                data: msg,
                room: socket.myTopic,
                userId: socket.userId,
            });
        });
        socket.on(MySocketTypes.CLIENT_EMIT_CONVERSATION_UPDATE, conversation => {
            emitToUser({
                type: MySocketTypes.SERVER_EMIT_CONVERSATION_UPDATE,
                data: conversation,
                userId: socket.userId,
            });
            emitToUser({
                type: MySocketTypes.SERVER_EMIT_CONVERSATION_UPDATE,
                data: conversation,
                userId: conversation.user[0]._id,
            });
        });
        socket.on('disconnect', () => {
            logger_service_1.default.info(`Socket disconnected [id: ${socket.id}]`);
        });
    });
}
function emitTo({ type, data, label }) {
    if (label)
        gIo.to(label).emit(type, data);
    else
        gIo.emit(type, data);
}
function emitToUser({ type, data, userId, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const socket = yield _getUserSocket(userId);
        if (socket) {
            logger_service_1.default.info(`Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`);
            socket.emit(type, data);
        }
        else {
            logger_service_1.default.info(`No active socket for user: ${userId}`);
            // _printSockets()
        }
    });
}
// If possible, send to all sockets BUT not the current socket
// Optionally, broadcast to a room / to all
function broadcast({ type, data, room = null, userId, }) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_service_1.default.info(`Broadcasting event: ${type}`);
        const excludedSocket = yield _getUserSocket(userId);
        if (room && excludedSocket) {
            logger_service_1.default.info(`Broadcast to room ${room} excluding user: ${userId}`);
            excludedSocket.broadcast.to(room).emit(type, data);
        }
        else if (excludedSocket) {
            logger_service_1.default.info(`Broadcast to all excluding user: ${userId}`);
            excludedSocket.broadcast.emit(type, data);
        }
        else if (room) {
            logger_service_1.default.info(`Emit to room: ${room}`);
            gIo.to(room).emit(type, data);
        }
        else {
            logger_service_1.default.info(`Emit to all`);
            gIo.emit(type, data);
        }
    });
}
function _getUserSocket(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const sockets = yield _getAllSockets();
        const socket = sockets.find(s => s.userId === userId);
        return socket;
    });
}
function _getAllSockets() {
    return __awaiter(this, void 0, void 0, function* () {
        // return all Socket instances
        const sockets = (yield gIo.fetchSockets());
        return sockets;
    });
}
function _printSockets() {
    return __awaiter(this, void 0, void 0, function* () {
        const sockets = yield _getAllSockets();
        console.log(`Sockets: (count: ${sockets.length}):`);
        sockets.forEach(_printSocket);
    });
}
function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`);
}
exports.socketService = {
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

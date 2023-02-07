"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
// Express App Config
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
socket_service_1.socketService.setupSocketAPI(httpServer);
const corsOptions = {
    origin: [
        'http://127.0.0.1:5050',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://localhost:5050',
        'http://localhost:5173',
        'http://localhost:5174',
        'https://chattyapp.lol',
    ],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
const chat_routes_1 = __importDefault(require("./api/chat/chat.routes"));
const file_routes_1 = __importDefault(require("./api/file/file.routes"));
const socket_service_1 = require("./services/socket.service");
app.use('/api/chat', chat_routes_1.default);
app.use('/api/file', file_routes_1.default);
httpServer.listen(process.env.PORT || 7050, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
});

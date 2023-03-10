import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { socketService } from './services/socket.service';

dotenv.config();
const app = express();
const httpServer = http.createServer(app);

// Express App Config
app.use(cookieParser());
app.use(express.json());
socketService.setupSocketAPI(httpServer);
const corsOptions = {
	origin: [
		'http://127.0.0.1:5050',
		'http://127.0.0.1:5173',
		'http://127.0.0.1:5174',
		'http://localhost:5050',
		'http://localhost:5173',
		'http://localhost:5174',
		'https://chattyapp.lol',
		'https://d7he6ye4gz1us.cloudfront.net',
	],
	credentials: true,
};
app.use(cors(corsOptions));

import chatRoutes from './api/chat/chat.routes';
import fileRoutes from './api/file/file.routes';

app.use('/api/chat', chatRoutes);
app.use('/api/file', fileRoutes);

httpServer.listen(process.env.PORT || 7050, () => {
	console.log(`Server is running at http://localhost:${process.env.PORT}`);
});

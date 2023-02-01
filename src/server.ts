import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
const app = express();
// Express App Config
app.use(cookieParser());
app.use(express.json());

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
app.use(cors(corsOptions));

import chatRoutes from './api/chat/chat.routes';
import fileRoutes from './api/file/file.routes';

app.use('/api/chat', chatRoutes);
app.use('/api/file', fileRoutes);

app.listen(process.env.PORT || 7050, () => {
	console.log(`Server is running at http://localhost:${process.env.PORT}`);
});

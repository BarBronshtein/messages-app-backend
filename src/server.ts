import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
const app = express();

// Express App Config
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
	// app.use(express.static(path.resolve(__dirname, 'public')));
} else {
	const corsOptions = {
		origin: [
			'http://127.0.0.1:5050',
			'http://127.0.0.1:5173',
			'http://127.0.0.1:5174',
			'http://localhost:5050',
			'http://localhost:5173',
			'http://localhost:5174',
		],
		credentials: true,
	};
	app.use(cors(corsOptions));
}
app.get('/**', (req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT || 7050, () => {
	console.log(`Server is running at http://localhost:${process.env.PORT}`);
});

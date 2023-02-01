import { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import logger from '../services/logger.service';
import dotenv from 'dotenv';

dotenv.config();

async function requireAuth(req: Request, res: Response, next: NextFunction) {
	const authCookie = req.cookies.loginToken;
	if (!authCookie) return res.status(401).send('Not Authenticated');
	try {
		const response = await axios.get(
			`${process.env.REMOTE_AUTH_SERVICE_URL}/api/auth/authenticate` || '',
			{ headers: { Cookie: `loginToken=${authCookie}` } }
		);
		if (response.status !== 200 || !response.data) {
			return res.status(401).send('Token is invalid');
		}
		res.locals.loggedinUser = response.data;
		// The token is valid,attach user to res locals, proceed to the next middleware or route handler
		next();
	} catch (err) {
		logger.error('While verifying authorization');
		return res
			.status(401)
			.send('An error occurred while verifying authorization');
	}
}

export default requireAuth;

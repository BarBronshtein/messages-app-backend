import { NextFunction, Request, Response } from 'express';
import axios from 'axios';

async function requireAuth(req: Request, res: Response, next: NextFunction) {
	const authCookie = req?.cookies?.loginToken;
	if (authCookie) return res.status(401).send('Not Authenticated');
	try {
		const response = await axios.post(
			process.env.REMOTE_AUTH_SERVICE_URL || '',
			{},
			{ headers: { Cookie: `loginToken=${authCookie}` } }
		);
		console.log(response.data);
		if (response.status !== 200) {
			return res.status(401).send('Token is invalid');
		}
		// The token is valid, proceed to the next middleware or route handler
		return next();
	} catch (err) {
		return res
			.status(401)
			.send('An error occurred while verifying authorization');
	}
}

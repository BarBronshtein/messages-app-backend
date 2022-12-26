import { Request, Response } from 'express';
import logger from '../../services/logger.service';

async function get(req: Request, res: Response) {
	try {
		const file = await fileService.getById(req.params.id);
		res.send(file);
	} catch (err) {
		logger.error('Failed to get file', err);
		res.status(500).send({ err: 'Failed to get file' });
	}
}

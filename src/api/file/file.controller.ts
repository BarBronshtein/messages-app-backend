import { Request, Response } from 'express';
import logger from '../../services/logger.service';
import fs from 'fs';
import { fileService } from './file.service';
import formidable from 'formidable';
export const fileController = {
	get,
	upload,
};

async function get(req: Request, res: Response) {
	try {
		const file = await fileService.getById(req.params.id);
		res.send(file);
	} catch (err) {
		logger.error('Failed to get file', err);
		res.status(500).send({ err: 'Failed to get file' });
	}
}

async function upload(req: Request, res: Response) {
	try {
		const form = new formidable.IncomingForm();
		form.parse(
			req,
			(err: any, fields: formidable.Fields, files: formidable.Files) => {
				fs.readFile(
					(files.file as formidable.File).filepath,
					async (err: NodeJS.ErrnoException | null, data: Buffer) => {
						if (err) throw new Error(err.message);
						const url = await fileService.upload(
							data,
							(files.file as formidable.File).mimetype?.replace('/', '.') || '.txt'
						);
						res.send(`api/file${req.url}/${url}`);
					}
				);
			}
		);
	} catch (err) {
		logger.error('Failed to upload file', err);
		res.status(500).send({ err: 'Failed to upload file' });
	}
}

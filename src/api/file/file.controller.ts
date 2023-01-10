import { Request, Response } from 'express';
import logger from '../../services/logger.service';
import fs from 'fs';
import { fileService } from './file.service';
import formidable from 'formidable';
export const fileController = {
	upload,
};

async function upload(req: Request, res: Response) {
	try {
		const form = new formidable.IncomingForm();
		form.parse(
			req,
			(err: any, fields: formidable.Fields, files: formidable.Files) => {
				fs.readFile(
					(files.file as formidable.File).filepath,
					async (err: NodeJS.ErrnoException | null, data: Buffer) => {
						if ((files.file as formidable.File).size > 5272880)
							throw new Error('File is too large');
						if (err) throw new Error(err.message);
						const url = await fileService.upload(
							data,
							(files.file as formidable.File).mimetype?.replace('/', '.') || '.txt'
						);
						res.send(url);
					}
				);
			}
		);
	} catch (err) {
		logger.error('Failed to upload file', err);
		res.status(500).send({ err: 'Failed to upload file' });
	}
}

import dotenv from 'dotenv';
import logger from '../../services/logger.service';
import { connect } from '../../services/s3.service';
dotenv.config();

const BUCKET = process.env.AWS_S3_BUCKET || '';

export const fileService = {
	getById,
	upload,
};

async function getById(fileId: string) {
	const s3 = await connect();
	return await s3
		.getObject(
			{
				Bucket: BUCKET,
				Key: fileId,
			},
			(err: any, data: any) => {
				if (err) {
					logger.error('Issues when trying to get object from bucket');
					console.log(err);
				} else {
					console.log(data);
					return data;
				}
			}
		)
		.promise();
}

async function upload(file: Buffer, fileType: string) {
	const key = `chat-assets/${_makeId()}-${fileType}`;
	try {
		const s3 = await connect();

		await s3
			.upload({
				Body: file,
				Bucket: BUCKET,
				Key: key,
			})
			.promise();
		console.log('Successfully uploaded data to ' + BUCKET + '/' + key);
		return `${process.env.AWS_ASSET_BUCKET}/${key}`;
	} catch (err) {
		logger.error('Failed to upload file to s3', err);
		throw err;
	}
}

function _makeId(length = 8) {
	const str = 'abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let id = '';
	for (let i = 0; i < length; i++) {
		id += str.charAt(Math.trunc(Math.random() * str.length));
	}
	return id;
}

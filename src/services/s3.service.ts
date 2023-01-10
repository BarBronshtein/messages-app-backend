import * as AWS from 'aws-sdk';
import dotenv from 'dotenv';
import loggerService from './logger.service';
dotenv.config();

let s3: null | AWS.S3 = null;

export async function connect() {
	if (s3) return s3;
	try {
		s3 = new AWS.S3({
			accessKeyId: process.env.AWS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_KEY,
			region: process.env.AWS_REGION,
		});
		return s3;
	} catch (err) {
		loggerService.error('could not connect to s3', err);
		throw err;
	}
}

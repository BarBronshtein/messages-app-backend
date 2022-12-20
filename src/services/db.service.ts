import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import config from '../config';
import logger from './logger.service';

// Database name

let dbConn: Db | null = null;
dotenv.config();

export async function getCollection(collectionName: string) {
	try {
		const db = await connect();
		const collection = db.collection(collectionName);
		return collection;
	} catch (err) {
		logger.error('Failed to get Mongo collection', err);
		throw err;
	}
}

async function connect() {
	if (dbConn) return dbConn;
	try {
		const client = new MongoClient(config.dbURL);
		const db = client.db(process.env.DB_NAME);
		dbConn = db;
		return db;
	} catch (err) {
		logger.error('Cannot Connect to DB', err);
		throw err;
	}
}

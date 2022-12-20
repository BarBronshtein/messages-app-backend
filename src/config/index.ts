let dbURL: string;
if (process.env.NODE_ENV === 'production')
	dbURL = process.env.DB_CONN_STRING as string;
else dbURL = 'mongodb://localhost:27017';
export default {
	dbURL,
};

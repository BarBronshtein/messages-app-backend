"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let dbURL;
if (process.env.NODE_ENV === 'production')
    dbURL = process.env.DB_CONN_STRING;
else
    dbURL = 'mongodb://localhost:27017';
exports.default = {
    dbURL,
};

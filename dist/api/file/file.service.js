"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileService = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const logger_service_1 = __importDefault(require("../../services/logger.service"));
const s3_service_1 = require("../../services/s3.service");
dotenv_1.default.config();
const BUCKET = process.env.AWS_S3_BUCKET || '';
exports.fileService = {
    upload,
};
function upload(file, fileType) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = `chat-assets/${_makeId()}-${fileType}`;
        try {
            const s3 = yield (0, s3_service_1.connect)();
            yield s3
                .upload({
                Body: file,
                Bucket: BUCKET,
                Key: key,
            })
                .promise();
            console.log('Successfully uploaded data to ' + BUCKET + '/' + key);
            return `${process.env.AWS_ASSET_BUCKET}/${key}`;
        }
        catch (err) {
            logger_service_1.default.error('Failed to upload file to s3', err);
            throw err;
        }
    });
}
function _makeId(length = 8) {
    const str = 'abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += str.charAt(Math.trunc(Math.random() * str.length));
    }
    return id;
}

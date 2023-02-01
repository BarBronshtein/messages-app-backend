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
exports.fileController = void 0;
const logger_service_1 = __importDefault(require("../../services/logger.service"));
const fs_1 = __importDefault(require("fs"));
const file_service_1 = require("./file.service");
const formidable_1 = __importDefault(require("formidable"));
exports.fileController = {
    upload,
};
function upload(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const form = new formidable_1.default.IncomingForm();
            form.parse(req, (err, fields, files) => {
                fs_1.default.readFile(files.file.filepath, (err, data) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    if (files.file.size > 5272880)
                        throw new Error('File is too large');
                    if (err)
                        throw new Error(err.message);
                    const url = yield file_service_1.fileService.upload(data, ((_a = files.file.mimetype) === null || _a === void 0 ? void 0 : _a.replace('/', '.')) || '.txt');
                    res.send(url);
                }));
            });
        }
        catch (err) {
            logger_service_1.default.error('Failed to upload file', err);
            res.status(500).send({ err: 'Failed to upload file' });
        }
    });
}

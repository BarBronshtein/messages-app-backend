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
const axios_1 = __importDefault(require("axios"));
const logger_service_1 = __importDefault(require("../services/logger.service"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function requireAuth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const authCookie = req.cookies;
        console.log(authCookie);
        if (!authCookie)
            return res.status(401).send('Not Authenticated');
        try {
            const response = yield axios_1.default.get(`${process.env.REMOTE_AUTH_SERVICE_URL}/api/auth/authenticate` || '', { headers: { Cookie: `loginToken=${authCookie}` } });
            if (response.status !== 200 || !response.data) {
                return res.status(401).send('Token is invalid');
            }
            res.locals.loggedinUser = response.data;
            // The token is valid,attach user to res locals, proceed to the next middleware or route handler
            next();
        }
        catch (err) {
            logger_service_1.default.error('While verifying authorization');
            return res
                .status(401)
                .send('An error occurred while verifying authorization');
        }
    });
}
exports.default = requireAuth;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const logsDir = './logs';
if (!fs_1.default.existsSync(logsDir))
    fs_1.default.mkdirSync(logsDir);
// Define the time format
function getTime() {
    return new Date().toLocaleString();
}
function doLog(level, ...args) {
    const strs = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg));
    let line = strs.join(' | ');
    line = `${getTime()} - ${level} - ${line}\n`;
    console.log(line);
    fs_1.default.appendFileSync('./logs/backend.log', line);
}
exports.default = {
    debug(...args) {
        // if (process.env.NODE_NEV === 'production') return
        doLog('DEBUG', ...args);
    },
    info(...args) {
        doLog('INFO', ...args);
    },
    warn(...args) {
        doLog('WARN', ...args);
    },
    error(...args) {
        doLog('ERROR', ...args);
    },
};

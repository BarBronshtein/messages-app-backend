import fs from 'fs';

const logsDir = './logs';
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

// Define the time format
function getTime() {
	return new Date().toLocaleString();
}

function doLog(level: string, ...args: unknown[]) {
	const strs = args.map(arg =>
		typeof arg === 'string' ? arg : JSON.stringify(arg)
	);
	let line = strs.join(' | ');
	line = `${getTime()} - ${level} - ${line}\n`;
	console.log(line);
	fs.appendFileSync('./logs/backend.log', line);
}

export default {
	debug(...args: unknown[]) {
		// if (process.env.NODE_NEV === 'production') return
		doLog('DEBUG', ...args);
	},
	info(...args: unknown[]) {
		doLog('INFO', ...args);
	},
	warn(...args: unknown[]) {
		doLog('WARN', ...args);
	},
	error(...args: unknown[]) {
		doLog('ERROR', ...args);
	},
};

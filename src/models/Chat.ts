import { Message } from './Message';

export type Chat = {
	_id: string;
	messages: Message[];
	participants: string[];
};

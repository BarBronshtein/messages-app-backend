import { User } from './User';

export type Conversation = {
	participants: User[];
	lastMsg?: string;
	chatId: string;
	timestamp: number | null;
	_id: string;
};

export interface SocketConversation {
	user: User[];
}

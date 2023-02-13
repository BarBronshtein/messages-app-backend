export type Message = {
	id: string;
	fromUser: string;
	type?: 'video' | 'img' | 'audio';
	txt: string;
	timestamp: number;
	read?: boolean;
};

export interface SocketMessage extends Message {
	chatId?: string;
}

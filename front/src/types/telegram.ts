export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Message {
  id: string;
  sender: User;
  text: string;
  timestamp: number;
  isRead: boolean;
}

export type ChatType = "group" | "channel" | "personal";

export interface Chat {
  id: string;
  type: ChatType;
  name: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount?: number;
  messages: Message[];
}
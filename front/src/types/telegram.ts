export interface User {
  id: string;
  name: string;
  avatar_url?: string;
  username?: string;
}

export interface Sender {
  id: number;
  name: string;
  username?: string;
}

export interface Message {
  id: string;
  sender: User;
  text: string;
  timestamp: number;
  isRead: boolean;
  mediaType?: string | null;
  mediaUrl?: string | null;
  duration?: number | null;
  sender_avatar_url?: string | null; // Added new field
  from_author?: boolean; // Added new field from_author (camelCase)
}

export interface MessageFromAPI {
  id: number;
  sender: Sender;
  text: string;
  date: number;
  is_read: boolean;
  media_type?: string | null;
  media_url?: string | null;
  duration?: number | null;
  sender_avatar_url?: string | null;
  from_author?: boolean; // Added new field
}

export type ChatType = "group" | "channel" | "personal";

export interface Chat {
  id: string | number;  // API returns numeric IDs
  type: ChatType;
  name: string;
  avatar_url?: string;
  last_message?: MessageFromAPI;
  unread_count?: number;
  messages: Message[];
}

export interface TelegramApiResponse {
  stats: {
    personal_unread: number;
    group_unread: number;
    channel_unread: number;
  };
  chats: Chat[];
}

export interface PaginationState {
  loading: boolean;
  hasMore: boolean;
  offsetDate?: number;
  limit: number;
}

export interface MessagePaginationState {
  loading: boolean;
  hasMore: boolean;
  offset_id: number;
  limit: number;
}
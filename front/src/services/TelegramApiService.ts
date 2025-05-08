import type { Chat, Message, ChatType, MessageFromAPI } from '../types/telegram';

const API_BASE_URL = 'http://localhost:8000';
const DEFAULT_MESSAGE_LIMIT = 15; // Added constant for message limit

interface ChatsResponse {
  chats: Chat[];
  stats: {
    total: number;
    personal_unread: number;
    group_unread: number;
    channel_unread: number;
  };
  next_offset_date?: number; // Added next_offset_date for pagination
}

interface MessagesResponse {
  messages: Message[];
}

export class TelegramApiService {
  /**
   * Convert API message format to client-side format
   */
  static convertToClientMessage(message: MessageFromAPI): Message {
    let senderAvatarFullUrl: string | undefined = undefined;
    if (message.sender_avatar_url) {
      if (message.sender_avatar_url.startsWith('http://') || message.sender_avatar_url.startsWith('https://')) {
        senderAvatarFullUrl = message.sender_avatar_url;
      } else {
        const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const path = message.sender_avatar_url.startsWith('/') ? message.sender_avatar_url : `/${message.sender_avatar_url}`;
        senderAvatarFullUrl = `${base}${path}`;
      }
    }

    return {
      id: message.id.toString(),
      sender: {
        id: message.sender.id.toString(),
        name: message.sender.name,
        username: message.sender.username,
      },
      text: message.text,
      timestamp: message.date * 1000, // Convert to milliseconds if needed
      isRead: message.is_read,
      mediaType: message.media_type,
      mediaUrl: message.media_url,
      duration: message.duration,
      sender_avatar_url: senderAvatarFullUrl,
      from_author: message.from_author, // Added from_author mapping
    };
  }

  /**
   * Convert API chat format to client-side format
   */
  static convertToClientChat(apiChat: any): Chat {
    let fullAvatarUrl: string | undefined = undefined;
    if (apiChat.avatar_url) {
      if (apiChat.avatar_url.startsWith('http://') || apiChat.avatar_url.startsWith('https://')) {
        fullAvatarUrl = apiChat.avatar_url;
      } else {
        const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const path = apiChat.avatar_url.startsWith('/') ? apiChat.avatar_url : `/${apiChat.avatar_url}`;
        fullAvatarUrl = `${base}${path}`;
      }
    }

    return {
      id: apiChat.id.toString(),
      type: apiChat.type as ChatType,
      name: apiChat.name,
      avatar_url: fullAvatarUrl, // Use the constructed full URL
      unread_count: apiChat.unread_count || 0,
      last_message: apiChat.last_message ? apiChat.last_message : undefined,
      messages: [],
    };
  }

  /**
   * Fetch chats with optional type filtering
   */
  static async getChats(type: ChatType | 'all' = 'all', limit: number = 20, offsetDate?: number): Promise<ChatsResponse> {
    try {
      const typeParam = type !== 'all' ? `&filter_type=${type}` : '';
      const offsetParam = offsetDate ? `&offset_date=${offsetDate}` : '';
      const response = await fetch(`${API_BASE_URL}/telegram/chats?limit=${limit}${typeParam}${offsetParam}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const apiResponse: { chats: any[], stats: any, next_offset_date?: number } = await response.json();
      const clientChats: Chat[] = apiResponse.chats.map(apiChat => this.convertToClientChat(apiChat));

      return {
        chats: clientChats,
        stats: apiResponse.stats,
        next_offset_date: apiResponse.next_offset_date
      };
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      throw error;
    }
  }

  /**
   * Load more chats with pagination
   */
  static async loadMoreChats(
    type: ChatType | 'all' = 'all', 
    limit: number = 20,
    offsetDate?: number
  ): Promise<ChatsResponse> {
    return this.getChats(type, limit, offsetDate);
  }

  /**
   * Fetch messages for a specific chat
   */
  static async getMessages(
    chatId: string, 
    limit: number = DEFAULT_MESSAGE_LIMIT, // Use constant
    offset_id: number = 0
  ): Promise<MessagesResponse> {
    try {
      const offsetParam = offset_id > 0 ? `&offset_id=${offset_id}` : '';
      const response = await fetch(
        `${API_BASE_URL}/telegram/chats/${chatId}/messages?limit=${limit}${offsetParam}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const apiMessages: MessageFromAPI[] = await response.json();
      const clientMessages: Message[] = apiMessages.map(this.convertToClientMessage);
      
      return { messages: clientMessages };
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw error;
    }
  }

  /**
   * Load more messages with pagination (older messages)
   */
  static async loadMoreMessages(
    chatId: string,
    limit: number = DEFAULT_MESSAGE_LIMIT, // Use constant
    offset_id: number = 0
  ): Promise<MessagesResponse> {
    return this.getMessages(chatId, limit, offset_id);
  }

  /**
   * Send a message to a chat
   */
  static async sendMessage(chatId: string, text: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/telegram/chats/${chatId}/send_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Get media (photo, sticker, voice, document) from a message
   */
  static getMediaUrl(chatId: string, messageId: string): string {
    return `${API_BASE_URL}/telegram/media/${chatId}/${messageId}`;
  }
  
  /**
   * Get chat avatar_url URL
   */
  static getChatAvatarUrl(chatId: string): string {
    return `${API_BASE_URL}/telegram/chat_avatar/${chatId}`;
  }
}
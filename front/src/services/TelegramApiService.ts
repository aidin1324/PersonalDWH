import type { Chat, Message, ChatType, MessageFromAPI, UserProfileInsights, ChatSummaryResponse } from '../types/telegram';

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
   * Get full chat with messages (for mock purposes)
   * @param chatId ID of the chat to get
   * @returns Promise with the full chat including messages
   */  static async getFullChat(chatId: string | number): Promise<Chat> {
    try {
      // First try to get the chat from API
      try {
        const response = await fetch(`${API_BASE_URL}/telegram/chats/${chatId}`);
        
        if (response.ok) {
          const chatData = await response.json();
          console.log(`Retrieved chat data for ID ${chatId}:`, chatData);
          
          // Then get messages for the chat
          const messagesResponse = await this.getMessages(String(chatId), 20);
          chatData.messages = messagesResponse.messages;
          
          return chatData;
        }
      } catch (apiError) {
        console.warn(`API call for chat ${chatId} failed:`, apiError);
        // Continue to fallback
      }
      
      // Fallback: Get from chats list
      console.log(`Using fallback method to find chat ${chatId}`);
      const chatsResponse = await this.getChats();
      const chat = chatsResponse.chats.find(c => String(c.id) === String(chatId));
      
      if (!chat) {
        throw new Error(`Chat not found: ${chatId}`);
      }
      
      // Then get messages for the chat
      const messagesResponse = await this.getMessages(String(chatId), 20);
      chat.messages = messagesResponse.messages;
      
      return chat;
    } catch (error) {
      console.error('Failed to get full chat:', error);
      // Return an empty chat as fallback with the correct chat ID
      return {
        id: String(chatId),
        type: 'unknown', // Changed from 'personal' to neutral 'unknown'
        name: 'Chat ' + chatId,
        messages: [], 
        unread_count: 0,
        avatar_url: undefined
      };
    }
  }

  /**
   * Get chat avatar_url URL
   */
  static getChatAvatarUrl(chatId: string): string {
    return `${API_BASE_URL}/telegram/chat_avatar/${chatId}`;
  }  /**
   * Get chat summary with TL;DR, key points, important and unread messages
   * @param chatId ID of the chat to get summary for
   * @param maxTokens Maximum number of tokens to analyze (optional)
   * @returns Promise with chat summary data
   */  static async getChatSummary(
    chatId: string | number, 
    maxTokens: number = 4000
  ): Promise<ChatSummaryResponse> {
    try {
      // Make direct API call first
      try {
        const apiUrl = `${API_BASE_URL}/telegram/chats/${chatId}/summary`;
        console.log(`Direct API call to: ${apiUrl}?max_tokens=${maxTokens}`);
        
        const response = await fetch(`${apiUrl}?max_tokens=${maxTokens}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API response received successfully');
          return data;
        }
        
        console.warn(`API returned status: ${response.status}`);
      } catch (directApiError) {
        console.warn('Direct API call failed:', directApiError);
      }
      
      // If direct API call failed, get chat info and try fallback
      const chat = await this.getFullChat(chatId);
      console.log(`Using fallback for chat ${chatId} of type ${chat.type}`);
      
      try {
        // Try API again with chat type info
        const apiUrl = `${API_BASE_URL}/telegram/chats/${chatId}/summary`;
        const response = await fetch(`${apiUrl}?max_tokens=${maxTokens}&type=${chat.type}`);
        
        if (response.ok) {
          const data = await response.json();
          return data;
        }
        
        throw new Error(`API error: ${response.status}`);
      } catch (apiError) {
        console.log(`All API attempts failed for chat ${chatId}, using mock data`);
        
        // If API is not available, use our mock implementation
        return await import('../services/AIAgentService').then(module => {
          return module.AIAgentService.getMockChatSummary(chat);
        });
      }
    } catch (error) {
      console.error('Failed to fetch chat summary:', error);
      throw error;
    }
  }
  
  /**
   * Получает AI-портрет (Persona Mirror) пользователя или собеседника
   * @param chatId ID чата
   * @param analyzePerson 'self' для анализа себя или имя/username собеседника
   * @returns Promise с результатами анализа
   */
  static async getPersonaMirror(
    chatId: string | number,
    analyzePerson: 'self' | string // 'self' или username/имя собеседника
  ): Promise<UserProfileInsights> {
    const url = `${API_BASE_URL}/telegram/chats/${chatId}/persona_mirror?analyze_person=${encodeURIComponent(analyzePerson)}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch persona mirror data`);
      }
      
      const data = await response.json();
      console.log('Raw persona mirror data:', data);
      
      // Проверяем наличие необходимых полей
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format: expected object');
      }
      
      // Создаем безопасную версию данных с дефолтными значениями
      const safeData: UserProfileInsights = {
        core_interests_and_passions: data.core_interests_and_passions || [],
        communication_style_and_preferences: data.communication_style_and_preferences || {
          dominant_style: {
            description: 'Нет данных',
            formality: 'Нет данных',
            verbosity: 'Нет данных',
            tone_preference_hint: 'Нет данных',
            example_phrases: []
          },
          linguistic_markers: {
            characteristic_vocabulary_or_jargon: [],
            frequent_personal_expressions: [],
            persona_changing_over_time: []
          }
        },
        cognitive_approach_and_decision_making: data.cognitive_approach_and_decision_making || {
          information_processing_hint: { style: 'Нет данных', example_phrases: [] },
          problem_solving_tendencies: { approach: 'Нет данных', example_phrases: [] },
          expression_of_opinions: { manner: 'Нет данных', example_phrases: [] }
        },
        learning_and_development_indicators: data.learning_and_development_indicators || [],
        values_and_motivators_hint: data.values_and_motivators_hint || [],
        persona_mirror: data.persona_mirror || { persona_mirror: 'Психологический портрет недоступен' }
      };
      
      return safeData;
    } catch (error) {
      console.error('Failed to get persona mirror:', error);
      throw error;
    }
  }
}
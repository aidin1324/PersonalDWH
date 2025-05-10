import type { Chat, Message } from '../types/telegram';

export type AIAnalysisType = 
  | 'sentiment' 
  | 'summary' 
  | 'suggestions'
  | 'draft' 
  | 'translate' 
  | 'insights'
  | 'persona_mirror';

interface AIResponse {
  content: string;
  type: AIAnalysisType;
  timestamp: number;
}

/**
 * Analyzes conversation based on requested analysis type
 * @param chat The chat to analyze
 * @param type Type of analysis to perform
 * @returns Promise with analysis result
 */
export async function analyzeConversation(chat: Chat, type: AIAnalysisType): Promise<string> {
  if (!chat || !chat.messages || chat.messages.length === 0) {
    return "No messages to analyze";
  }
  
  try {
    let response: AIResponse;
    
    switch (type) {
      case 'sentiment':
        response = await AIAgentService.analyzeSentiment(chat.messages);
        break;
      case 'summary':
        response = await AIAgentService.summarizeConversation(chat.messages);
        break;
      case 'suggestions':
        response = await AIAgentService.draftResponse(chat.messages);
        break;      case 'insights':
        response = await AIAgentService.getConversationInsights(chat);
        break;
      case 'translate':
        response = await AIAgentService.translateMessages(chat.messages);
        break;
      case 'persona_mirror':
        response = await AIAgentService.getPersonaMirrorSummary(chat);
        break;
      default:
        response = await AIAgentService.summarizeConversation(chat.messages);
    }
    
    return response.content;
  } catch (error) {
    console.error("Error analyzing conversation:", error);
    return "An error occurred while analyzing the conversation. Please try again later.";
  }
}

// AI Agent service for analyzing and managing conversations
export class AIAgentService {
  
  /**
   * Analyzes sentiment of the conversation
   * @param _messages List of messages to analyze
   * @returns Promise with sentiment analysis
   */
  static async analyzeSentiment(_messages: Message[]): Promise<AIResponse> {
    // In a real app, this would call an API
    // For now, we'll simulate a response
    await this.simulateApiDelay();

    const sentiments = ['positive', 'neutral', 'slightly negative', 'mixed', 'very positive', 'professional'];
    const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    
    return {
      content: `The overall tone of this conversation appears to be ${randomSentiment}. The participants seem to be engaged in a constructive dialogue with clear communication patterns.`,
      type: 'sentiment',
      timestamp: Date.now()
    };
  }

  /**
   * Summarizes the conversation
   * @param messages List of messages to summarize
   * @returns Promise with conversation summary
   */
  static async summarizeConversation(messages: Message[]): Promise<AIResponse> {
    // Simulate API call
    await this.simulateApiDelay();

    // Extract names for a more realistic summary
    const participants = new Set<string>();
    messages.forEach(msg => participants.add(msg.sender.name));
    
    return {
      content: `This conversation between ${Array.from(participants).join(', ')} involves ${messages.length} messages discussing project details, scheduling, and next steps. Key points include meeting times, task assignments, and upcoming deadlines.`,
      type: 'summary',
      timestamp: Date.now()
    };
  }

  /**
   * Draft a response based on conversation context
   * @param messages List of messages for context
   * @returns Promise with drafted response
   */
  static async draftResponse(messages: Message[]): Promise<AIResponse> {
    await this.simulateApiDelay();
    
    // Get the most recent message for context
    const last_message = messages[messages.length - 1];
    
    let draftedResponse = "I've reviewed the information and I'm available to meet tomorrow. Let me know what time works best for you, and I'll make sure to prepare the reports you requested.";
    
    if (last_message.text.toLowerCase().includes('meeting')) {
      draftedResponse = "Yes, I can make the meeting tomorrow. What time would work best for you? I'll prepare the necessary materials.";
    } else if (last_message.text.toLowerCase().includes('help')) {
      draftedResponse = "I'd be happy to help with that. Could you provide a bit more information about what you need specifically?";
    }

    return {
      content: draftedResponse,
      type: 'draft',
      timestamp: Date.now()
    };
  }
  
  /**
   * Translate messages to another language
   * @param _messages List of messages to translate
   * @returns Promise with translated content
   */
  static async translateMessages(_messages: Message[]): Promise<AIResponse> {
    await this.simulateApiDelay();
    
    return {
      content: "All messages have been translated to English. I've preserved the original meaning and context as accurately as possible.",
      type: 'translate',
      timestamp: Date.now()
    };
  }

  /**
   * Provide deeper insights about the conversation
   * @param chat The chat to analyze
   * @returns Promise with conversation insights
   */
  static async getConversationInsights(chat: Chat): Promise<AIResponse> {
    await this.simulateApiDelay();
    
    return {
      content: `Based on my analysis of this ${chat.messages.length}-message conversation:
      
1. **Communication patterns**: Messages are typically exchanged within 5-10 minute intervals
2. **Topic trends**: The conversation primarily focuses on project planning and coordination
3. **Key entities mentioned**: Project Alpha, Q3 deliverables, client meeting
4. **Action items**: Schedule follow-up meeting, prepare presentation, contact vendors
5. **Sentiment trend**: Started formal, becoming more casual and collaborative over time`,
      type: 'insights',
      timestamp: Date.now()
    };
  }
  /**
   * Helper function to simulate API delay
   */
  private static async simulateApiDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1500));
  }
  /**
   * Get Persona Mirror summary for a chat
   * @param chat The chat to analyze
   * @returns Promise with persona mirror analysis
   */
  static async getPersonaMirrorSummary(chat: Chat): Promise<AIResponse> {
    await this.simulateApiDelay();
    
    // Проверяем, является ли чат личным (не группой/каналом)
    const isPersonalChat = chat.type === 'personal';
    
    return {
      content: isPersonalChat 
        ? "Persona Mirror позволяет создать AI-портрет личности на основе сообщений в чате. Выберите, кого вы хотите проанализировать: себя или собеседника." 
        : "Функция Persona Mirror доступна только для личных чатов.",
      type: 'persona_mirror',
      timestamp: Date.now()
    };
  }

  /**
   * Generate a mock chat summary for testing
   * @param chat The chat to summarize
   * @returns Promise with mocked chat summary
   */  static async getMockChatSummary(chat: Chat) {
    await this.simulateApiDelay();
    
    // Generate mock data based on available messages
    const messageCount = chat.messages?.length || 0;
    const participants = new Set<string>();
    const importantMessages: any[] = [];
    const unreadMessages: any[] = [];
    
    if (chat.messages) {
      chat.messages.forEach((msg, index) => {
        participants.add(msg.sender.name);
        
        // Add some messages as important (every 3rd one for demo)
        if (index % 3 === 0 && importantMessages.length < 3) {
          importantMessages.push({
            id: Number(msg.id),
            text: msg.text,
            date: Math.floor(msg.timestamp / 1000),
            sender: {
              id: Number(msg.sender.id),
              name: msg.sender.name,
              username: msg.sender.username || null
            },
            media_type: null,
            media_url: null,
            duration: null,
            is_read: msg.isRead,
            sender_avatar_url: msg.sender_avatar_url || null,
            from_author: msg.from_author || false
          });
        }
        
        // Collect unread messages
        if (!msg.isRead) {
          unreadMessages.push(msg);
        }
      });
    }
    
    // If no important messages found from real data, create mock ones
    if (importantMessages.length === 0) {
      importantMessages.push({
        id: 1001,
        text: "Привет! Как твои дела сегодня?",
        date: Math.floor(Date.now() / 1000) - 7200,
        sender: {
          id: 42,
          name: "Alice",
          username: null
        },
        media_type: null,
        media_url: null,
        duration: null,
        is_read: true,
        sender_avatar_url: null,
        from_author: false
      });
      
      importantMessages.push({
        id: 1002,
        text: "Давай обсудим детали проекта и запланируем встречу на завтра.",
        date: Math.floor(Date.now() / 1000) - 3600,
        sender: {
          id: 42,
          name: "Alice",
          username: null
        },
        media_type: null,
        media_url: null,
        duration: null,
        is_read: true,
        sender_avatar_url: null,
        from_author: false
      });
    }
    
    return {
      summary: {
        summary: `Это ${messageCount}-сообщений в разговоре между ${Array.from(participants).join(', ')} о различных темах, включая планирование проектов, встречи и технические требования.`,
        key_points: [
          "Обсуждение сроков завершения проекта и предстоящих дедлайнов",
          "Согласование времени и места проведения следующей встречи команды",
          "Вопросы по техническим требованиям и спецификациям проекта",
          "Договоренности о следующих шагах и распределении задач"
        ],
        important_messages: importantMessages,
        unread_messages: unreadMessages,
        total_analyzed: messageCount
      }
    };
  }
}
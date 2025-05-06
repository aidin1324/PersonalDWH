import type { Chat, Message } from '../types/telegram';

export type AIAnalysisType = 
  | 'sentiment' 
  | 'summary' 
  | 'suggestions'
  | 'draft' 
  | 'translate' 
  | 'insights';

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
        break;
      case 'insights':
        response = await AIAgentService.getConversationInsights(chat);
        break;
      case 'translate':
        response = await AIAgentService.translateMessages(chat.messages);
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
    const lastMessage = messages[messages.length - 1];
    
    let draftedResponse = "I've reviewed the information and I'm available to meet tomorrow. Let me know what time works best for you, and I'll make sure to prepare the reports you requested.";
    
    if (lastMessage.text.toLowerCase().includes('meeting')) {
      draftedResponse = "Yes, I can make the meeting tomorrow. What time would work best for you? I'll prepare the necessary materials.";
    } else if (lastMessage.text.toLowerCase().includes('help')) {
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
}
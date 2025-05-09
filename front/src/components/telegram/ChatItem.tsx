import React from 'react';
import { motion } from 'framer-motion';
import type { Chat } from '../../types/telegram';
import { AvatarFallback } from '../../utils/avatarUtils';

interface ChatItemProps {
  chat: Chat;
  onSelectChat: (chatId: string) => void;
  isSelected: boolean;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, onSelectChat, isSelected }) => {
  // Destructure chat properties with safe fallbacks
  const { 
    name, 
    avatar_url, 
    last_message, 
    unread_count = 0 
  } = chat;
  
  // Format badge count for display (truncate large numbers)
  const formatBadgeCount = (count: number): string => {
    if (count > 99) return '99+';
    return count.toString();
  };
  
  // Use last_message from API or fallback to last_message for backward compatibility
  const message = last_message;
  
  const truncateText = (text: string, maxLength: number) => {
    return text?.length > maxLength ? text.substring(0, maxLength) + '...' : text || '';
  };
  
  // Handle both timestamp and date formats from API
  const messageTime = message
    ? ('timestamp' in message && typeof message.timestamp === 'number'
        ? message.timestamp
        : ('date' in message && typeof message.date === 'number'
            ? message.date * 1000
            : 0))
    : 0;
    
  const formattedTime = messageTime
    ? new Date(messageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  
  // Extract message text, handle both API and mock data formats
  const messageText = message ? (message.text || '') : '';
  // Use from_author if present, otherwise fallback to sender.id === 'me'
  const isOwnMessage = message?.from_author === true || String(message?.sender?.id) === 'me';
  
  const messagePreview = message 
    ? `${isOwnMessage ? "You: " : ""}${truncateText(messageText, 35)}`
    : "No messages yet";

  return (
    <motion.div
      whileHover={{ backgroundColor: isSelected ? "#e0e7ff99" : "#f3f4f699" }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelectChat(String(chat.id))}
      className={`flex items-center p-3 cursor-pointer transition-all duration-200 border-b border-gray-100
        ${isSelected 
          ? "bg-indigo-50 border-l-4 border-l-indigo-500" 
          : "bg-white hover:bg-gray-50 border-l-4 border-l-transparent"}`}
    >
      <div className="relative">
        {avatar_url ? (
          <motion.img 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            src={avatar_url} 
            alt={name} 
            className="w-12 h-12 rounded-full mr-3 object-cover shadow-sm border border-gray-200" 
          />
        ) : (
          <AvatarFallback name={name} sizeClasses="w-12 h-12" containerClasses="mr-3" />
        )}
        {chat.type === 'personal' && (
          <span className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className={`font-semibold truncate ${isSelected ? 'text-indigo-900' : 'text-gray-800'}`}>
            {name}
          </p>
          {message && formattedTime && (
            <p className={`text-xs ${isSelected ? 'text-indigo-700' : 'text-gray-500'} ml-2 whitespace-nowrap`}>
              {formattedTime}
            </p>
          )}
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className={`text-sm truncate ${isSelected ? 'text-indigo-800' : 'text-gray-600'}`}>
            {messagePreview}
          </p>
          
          <div className="ml-2 flex-shrink-0 flex items-center space-x-1">
            {(message?.from_author === true || String(message?.sender?.id) === 'me') && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`text-xs ${
                  message && 
                  (('is_read' in message && message.is_read) || 
                   ('isRead' in message && (message as any).isRead))
                    ? 'text-blue-500' 
                    : 'text-gray-400'
                }`}
              >
                {message && 
                 (('is_read' in message && message.is_read) || 
                  ('isRead' in message && (message as any).isRead)) ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </motion.span>
            )}
            
            {unread_count > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className={`flex items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold
                  ${unread_count > 9 ? 'min-w-[18px] h-5 px-1' : 'w-5 h-5'}`}
              >
                {formatBadgeCount(unread_count)}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatItem;
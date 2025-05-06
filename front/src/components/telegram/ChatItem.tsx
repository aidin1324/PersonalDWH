import React from 'react';
import { motion } from 'framer-motion';
import type { Chat } from '../../types/telegram';

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelectChat: (chatId: string) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, isSelected, onSelectChat }) => {
  const { name, avatar, lastMessage, unreadCount } = chat;
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  
  const formattedTime = lastMessage 
    ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '';
  
  const messagePreview = lastMessage 
    ? `${lastMessage.sender.name === "Me" ? "You: " : ""}${truncateText(lastMessage.text, 35)}`
    : "No messages yet";

  return (
    <motion.div
      whileHover={{ backgroundColor: isSelected ? "rgba(224, 231, 255, 0.6)" : "rgba(243, 244, 246, 0.6)" }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelectChat(chat.id)}
      className={`flex items-center p-3 cursor-pointer transition-all duration-200 border-b border-gray-100
        ${isSelected 
          ? "bg-indigo-50 border-l-4 border-l-indigo-500" 
          : "bg-white hover:bg-gray-50 border-l-4 border-l-transparent"}`}
    >
      <div className="relative">
        <motion.img 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          src={avatar || 'https://via.placeholder.com/40'} 
          alt={name} 
          className="w-12 h-12 rounded-full mr-3 object-cover shadow-sm border border-gray-200" 
        />
        {chat.type === 'personal' && (
          <span className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-gray-800'} truncate`}>
            {name}
          </p>
          {lastMessage && (
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
            {lastMessage?.sender.id === "me" && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`text-xs ${lastMessage.isRead ? 'text-blue-500' : 'text-gray-400'}`}
              >
                {lastMessage.isRead ? (
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
            
            {unreadCount && unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-500 text-white text-xs font-bold"
              >
                {unreadCount}
              </motion.span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatItem;
import React from 'react';
import { motion } from 'framer-motion';
import type { Message, User } from '../../types/telegram';

interface MessageItemProps {
  message: Message;
  currentUser: User; 
}

const MessageItem: React.FC<MessageItemProps> = ({ message, currentUser }) => {
  const isMyMessage = message.sender.id === currentUser.id;
  
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
  
  // Format date if message is from a different day
  const formattedDate = new Date(message.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
  
  // Check if message is recent (within the last 24 hours)
  const isRecent = Date.now() - message.timestamp < 24 * 60 * 60 * 1000;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`flex mb-4 px-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
    >
      {!isMyMessage && (
        <div className="mr-2 hidden sm:block self-end">
          <motion.img 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            src={message.sender.avatar || 'https://via.placeholder.com/32'} 
            alt={message.sender.name} 
            className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
          />
        </div>
      )}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className={`max-w-xs sm:max-w-sm md:max-w-md px-4 py-3 rounded-2xl shadow-sm 
          ${isMyMessage 
            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-br-none' 
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
          }`}
      >
        {!isMyMessage && (
          <div className="flex items-center space-x-1 mb-1.5">
            <span className="text-xs font-semibold text-gray-700">{message.sender.name}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{isRecent ? formattedTime : formattedDate}</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        {isMyMessage && (
          <div className="flex items-center justify-end mt-1 space-x-1">
            <span className={`text-xs ${isMyMessage ? 'text-indigo-200' : 'text-gray-400'}`}>
              {isRecent ? formattedTime : formattedDate}
            </span>
            {message.isRead && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" 
                className="w-3 h-3 text-indigo-200"
                aria-label="Read"
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
      </motion.div>
      {isMyMessage && (
         <div className="ml-2 hidden sm:block self-end">
           <motion.img 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            src={currentUser.avatar || 'https://via.placeholder.com/32'} 
            alt={currentUser.name} 
            className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
          />
         </div>
      )}
    </motion.div>
  );
};

export default MessageItem;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PhotoIcon, DocumentIcon, PlayIcon } from '@heroicons/react/24/solid';
import type { Message, User } from '../../types/telegram';
import { TelegramApiService } from '../../services/TelegramApiService';
import { AvatarFallback } from '../../utils/avatarUtils';
import ReactMarkdown from 'react-markdown';

interface MessageItemProps {
  message: Message;
  currentUser: User;
  showMedia: boolean;
  chatId?: string;
}

// Use React.memo to prevent unnecessary re-renders
const MessageItem: React.FC<MessageItemProps> = React.memo(({ message, currentUser, showMedia, chatId }) => {
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  
  // Check if message is from the current user
  const isMyMessage = message.from_author === true || message.sender.id === currentUser.id;
  
  // Format time
  const formattedTime = new Date(message.timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Format date
  const formattedDate = new Date(message.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
  
  // Check if message is recent (within the last 24 hours)
  const isRecent = Date.now() - message.timestamp < 24 * 60 * 60 * 1000;

  // Format duration for voice messages
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Handle media loading
  const handleMediaLoad = () => {
    setMediaLoaded(true);
  };

  const handleMediaError = () => {
    setMediaError(true);
  };

  // Render media content based on type
  const renderMediaContent = () => {
    if (!showMedia || !message.mediaType || !message.mediaUrl || !chatId) return null;

    const mediaUrl = message.mediaUrl.startsWith('http') 
      ? message.mediaUrl 
      : TelegramApiService.getMediaUrl(chatId, message.id);

    switch (message.mediaType) {
      case 'photo':
        return (
          <div className="mt-2 rounded-lg overflow-hidden relative">
            {!mediaLoaded && !mediaError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-3 w-3 bg-indigo-400 rounded-full"></div>
                  <div className="h-3 w-3 bg-indigo-400 rounded-full"></div>
                  <div className="h-3 w-3 bg-indigo-400 rounded-full"></div>
                </div>
              </div>
            )}
            {mediaError ? (
              <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center">
                <PhotoIcon className="h-12 w-12 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Unable to load image</span>
              </div>
            ) : (
              <img 
                src={mediaUrl} 
                alt="Photo" 
                className={`rounded-lg max-w-full max-h-60 object-contain ${!mediaLoaded ? 'h-40 bg-gray-100' : ''}`}
                onLoad={handleMediaLoad}
                onError={handleMediaError}
                loading="lazy" // Add lazy loading
              />
            )}
          </div>
        );

      case 'sticker':
        return (
          <div className="mt-2 max-w-[128px] max-h-[128px]">
            {!mediaLoaded && !mediaError && (
              <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-3 w-3 bg-indigo-400 rounded-full"></div>
                  <div className="h-3 w-3 bg-indigo-400 rounded-full"></div>
                  <div className="h-3 w-3 bg-indigo-400 rounded-full"></div>
                </div>
              </div>
            )}
            {mediaError ? (
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-sm text-gray-500">Sticker</span>
              </div>
            ) : (
              <img 
                src={mediaUrl} 
                alt="Sticker" 
                className={`object-contain ${!mediaLoaded ? 'invisible' : ''}`}
                onLoad={handleMediaLoad}
                onError={handleMediaError}
                loading="lazy"
              />
            )}
          </div>
        );

      case 'voice':
        return (
          <div className="mt-2 flex items-center space-x-2 bg-gray-100 rounded-lg p-2 w-56">
            <PlayIcon className="h-6 w-6 text-indigo-600" />
            <div className="flex-1">
              <div className="h-1 bg-indigo-200 rounded">
                <div className="h-full w-0 bg-indigo-600 rounded"></div>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {message.duration ? formatDuration(message.duration) : '0:00'}
            </span>
          </div>
        );

      case 'document':
        return (
          <div className="mt-2 flex items-center bg-gray-100 rounded-lg p-3">
            <DocumentIcon className="h-8 w-8 text-indigo-600 mr-2" />
            <div>
              <p className="text-sm font-medium">Document</p>
              <p className="text-xs text-gray-500">Tap to download</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`flex mb-4 px-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
    >
      {!isMyMessage && (
        <div className="mr-2 hidden sm:block self-end">
          {(message.sender_avatar_url || message.sender.avatar_url) ? (
            <motion.img 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              src={message.sender_avatar_url || message.sender.avatar_url} 
              alt={message.sender.name} 
              className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
              loading="lazy"
            />
          ) : (
            <AvatarFallback name={message.sender.name} sizeClasses="w-8 h-8" textClasses="text-sm" />
          )}
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
        
        {message.text && (
          <div className="text-sm whitespace-pre-wrap break-words">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}
        
        {renderMediaContent()}
        
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
          {currentUser.avatar_url ? (
            <motion.img 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              src={currentUser.avatar_url} 
              alt={currentUser.name} 
              className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
              loading="lazy"
            />
          ) : (
            <AvatarFallback name={currentUser.name} sizeClasses="w-8 h-8" textClasses="text-sm" />
          )}
         </div>
      )}
    </motion.div>
  );
});

MessageItem.displayName = 'MessageItem';

export default MessageItem;
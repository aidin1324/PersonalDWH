import React from 'react';
import type { Chat } from '../../types/telegram';
import ChatItem from './ChatItem';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChatId, onSelectChat }) => {
  if (chats.length === 0) {
    return <p className="p-4 text-gray-500">No chats found for this filter.</p>;
  }
  return (
    <div className="bg-white border-r border-gray-300 overflow-y-auto h-full">
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isSelected={selectedChatId === chat.id}
          onSelectChat={onSelectChat}
        />
      ))}
    </div>
  );
};

export default ChatList;
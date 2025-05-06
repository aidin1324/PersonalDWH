import type { Chat, User, Message } from '../types/telegram';

const mockUsers: Record<string, User> = {
  u1: { id: "u1", name: "Alice", avatar: "https://i.pravatar.cc/150?u=alice" },
  u2: { id: "u2", name: "Bob", avatar: "https://i.pravatar.cc/150?u=bob" },
  u3: { id: "u3", name: "Charlie", avatar: "https://i.pravatar.cc/150?u=charlie" },
  me: { id: "me", name: "Me", avatar: "https://i.pravatar.cc/150?u=me" },
};

const mockMessages: Record<string, Message[]> = {
  chat1: [
    { id: "m1", sender: mockUsers.u1, text: "Hey, how are you?", timestamp: Date.now() - 100000, isRead: false },
    { id: "m2", sender: mockUsers.me, text: "I'm good, thanks! And you?", timestamp: Date.now() - 90000, isRead: true },
    { id: "m3", sender: mockUsers.u1, text: "Doing well! Working on the new project.", timestamp: Date.now() - 80000, isRead: false },
  ],
  chat2: [
    { id: "m4", sender: mockUsers.u2, text: "Team meeting at 3 PM.", timestamp: Date.now() - 200000, isRead: true },
    { id: "m5", sender: mockUsers.me, text: "Got it, thanks for the reminder!", timestamp: Date.now() - 190000, isRead: true },
  ],
  chat3: [
    { id: "m6", sender: mockUsers.u3, text: "Check out this cool article: [link]", timestamp: Date.now() - 300000, isRead: false },
  ],
  chat4: [
    { id: "m7", sender: mockUsers.u1, text: "Lunch today?", timestamp: Date.now() - 50000, isRead: false },
    { id: "m8", sender: mockUsers.me, text: "Sure, where to?", timestamp: Date.now() - 40000, isRead: true },
  ],
};

export const mockChats: Chat[] = [
  {
    id: "chat1",
    type: "personal",
    name: "Alice",
    avatar: mockUsers.u1.avatar,
    lastMessage: mockMessages.chat1[mockMessages.chat1.length - 1],
    unreadCount: 2,
    messages: mockMessages.chat1,
  },
  {
    id: "chat2",
    type: "group",
    name: "Project Team",
    avatar: "https://i.pravatar.cc/150?u=group1",
    lastMessage: mockMessages.chat2[mockMessages.chat2.length - 1],
    unreadCount: 0,
    messages: mockMessages.chat2,
  },
  {
    id: "chat3",
    type: "channel",
    name: "Tech News",
    avatar: "https://i.pravatar.cc/150?u=channel1",
    lastMessage: mockMessages.chat3[mockMessages.chat3.length - 1],
    unreadCount: 1,
    messages: mockMessages.chat3,
  },
  {
    id: "chat4",
    type: "personal",
    name: "Bob",
    avatar: mockUsers.u2.avatar,
    lastMessage: mockMessages.chat4[mockMessages.chat4.length - 1],
    unreadCount: 1,
    messages: mockMessages.chat4,
  },
];
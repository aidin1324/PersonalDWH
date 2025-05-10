import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, ClipboardDocumentListIcon, ChatBubbleOvalLeftEllipsisIcon, 
    ClockIcon, InformationCircleIcon, BellIcon, KeyIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import type { ChatSummary } from '../../types/telegram';
import { formatTimestamp } from '../../utils/dateUtils';

interface ChatSummaryViewProps {
    summary: ChatSummary | null;
    isLoading: boolean;
    error: string | null;
    onClose: () => void;
}

// Helper component for message rendering
const MessageItem: React.FC<{ message: any; highlight?: boolean }> = ({ message, highlight = false }) => {
    const borderColor = highlight ? 'border-blue-400' : 'border-gray-200';
    const bgColor = highlight ? 'bg-blue-50' : 'bg-white';
    
    return (
        <div className={`border-l-2 ${borderColor} pl-3 py-2 ${bgColor} rounded-r-md`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    {message.sender_avatar_url ? (
                        <img 
                            src={message.sender_avatar_url} 
                            alt={message.sender?.name || 'User'} 
                            className="h-6 w-6 rounded-full mr-2"
                        />
                    ) : (
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs mr-2">
                            {(message.sender?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="font-medium text-gray-700">{message.sender?.name || 'Unknown'}</span>
                </div>
                <span className="text-xs text-gray-500 flex items-center">
                    <ClockIcon className="inline h-3 w-3 mr-1" />
                    {formatTimestamp(message.date * 1000)}
                </span>
            </div>
            <p className="text-gray-600 mt-1">{message.text}</p>
            
            {/* Show media attachments if present */}
            {message.media_type && message.media_url && (
                <div className="mt-2">
                    {message.media_type.includes('image') ? (
                        <img 
                            src={message.media_url} 
                            alt="Media attachment" 
                            className="max-h-32 rounded-md object-cover"
                        />
                    ) : message.media_type.includes('video') ? (
                        <div className="bg-gray-100 rounded-md p-2 text-sm text-gray-500 flex items-center">
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            Video attachment
                            {message.duration && <span className="ml-1">({Math.floor(message.duration / 60)}:{(message.duration % 60).toString().padStart(2, '0')})</span>}
                        </div>
                    ) : (
                        <div className="bg-gray-100 rounded-md p-2 text-sm text-gray-500 flex items-center">
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            Attachment: {message.media_type}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ChatSummaryView: React.FC<ChatSummaryViewProps> = ({ summary, isLoading, error, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-500 to-indigo-600">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Chat Summary</h2>
                            {summary && (
                                <p className="text-blue-100 text-sm">
                                    {summary.total_analyzed} messages analyzed
                                </p>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent"
                            ></motion.div>
                            <p className="text-sm text-gray-500 mt-3">Generating summary...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-4 rounded-md shadow-sm">
                            <p className="text-red-600">Error: {error}</p>
                            <button 
                                onClick={onClose} 
                                className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                            >
                                Close
                            </button>
                        </div>
                    ) : summary ? (
                        <div className="space-y-6">
                            {/* Main Summary Section */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                    <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-2" />
                                    Summary
                                </h4>
                                <p className="text-gray-700">{summary.summary}</p>
                            </div>

                            {/* Key Points Section */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                    <KeyIcon className="h-5 w-5 text-indigo-500 mr-2" />
                                    Key Points
                                </h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {summary.key_points.map((point, index) => (
                                        <li key={index} className="text-gray-700">{point}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Important Messages Section */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                    <InformationCircleIcon className="h-5 w-5 text-amber-500 mr-2" />
                                    Important Messages
                                </h4>
                                <div className="space-y-3">
                                    {summary.important_messages.map((msg) => (
                                        <MessageItem key={msg.id} message={msg} highlight={true} />
                                    ))}
                                </div>
                            </div>

                            {/* Unread Messages Section */}
                            {summary.unread_messages && summary.unread_messages.length > 0 && (
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                                    <h4 className="font-semibold text-gray-800 mb-2 flex justify-between items-center">
                                        <div className="flex items-center">
                                            <BellIcon className="h-5 w-5 text-red-500 mr-2" />
                                            <span>Unread Messages</span>
                                        </div>
                                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                            {summary.unread_messages.length} {summary.unread_messages.length === 1 ? 'message' : 'messages'}
                                        </span>
                                    </h4>
                                    <div className="space-y-3">
                                        {summary.unread_messages.map((msg) => (
                                            <MessageItem key={msg.id} message={msg} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg p-8 shadow-sm border border-blue-100 text-center">
                            <ChatBubbleOvalLeftEllipsisIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No summary available for this chat.</p>
                            <p className="text-sm text-gray-400 mt-2">Chat history will be analyzed once available.</p>
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500">
                    AI Chat Summary analyzes message patterns and content to provide insights.
                    Results are for informational purposes only.
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ChatSummaryView;

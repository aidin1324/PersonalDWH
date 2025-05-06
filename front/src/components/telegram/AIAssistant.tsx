import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, ArrowPathIcon, ChatBubbleBottomCenterTextIcon, LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import type { Chat } from '../../types/telegram';
import { analyzeConversation } from '../../services/AIAgentService';

interface AIAssistantProps {
  chat: Chat;
  onClose: () => void;
}

type AnalysisType = 'sentiment' | 'summary' | 'suggestions' | null;

const AIAssistant: React.FC<AIAssistantProps> = ({ chat, onClose }) => {
  const [analysisType, setAnalysisType] = useState<AnalysisType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleAnalyze = async (type: AnalysisType) => {
    setAnalysisType(type);
    setIsLoading(true);
    
    try {
      const result = await analyzeConversation(chat, type || 'summary');
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysis('Sorry, I encountered an error while analyzing the conversation. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisType(null);
    setAnalysis(null);
  };

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 border-t border-indigo-100 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <SparklesIcon className="h-5 w-5 text-indigo-500 mr-2" />
            <h3 className="font-medium text-indigo-900">AI Communication Assistant</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </motion.button>
        </div>

        {!analysisType && !analysis ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAnalyze('sentiment')}
              className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-indigo-100 hover:border-indigo-300 transition-colors"
            >
              <ChartBarIcon className="h-6 w-6 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">Sentiment Analysis</span>
              <span className="text-xs text-gray-500 mt-1">Analyze emotional tone</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAnalyze('summary')}
              className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-indigo-100 hover:border-indigo-300 transition-colors"
            >
              <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">Conversation Summary</span>
              <span className="text-xs text-gray-500 mt-1">Get key points</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAnalyze('suggestions')}
              className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-indigo-100 hover:border-indigo-300 transition-colors"
            >
              <LightBulbIcon className="h-6 w-6 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">Reply Suggestions</span>
              <span className="text-xs text-gray-500 mt-1">Get response ideas</span>
            </motion.button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4 border border-indigo-100 mb-4">
            <div className="flex items-center mb-3">
              <span className="text-sm font-medium text-indigo-800 mr-2">
                {analysisType === 'sentiment' ? 'Sentiment Analysis' : 
                 analysisType === 'summary' ? 'Conversation Summary' : 
                 analysisType === 'suggestions' ? 'Reply Suggestions' : 'Analysis'}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={resetAnalysis}
                className="p-1 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-100"
              >
                <ArrowPathIcon className="h-3.5 w-3.5" />
              </motion.button>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-6">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <SparklesIcon className="h-8 w-8 text-indigo-400" />
                </motion.div>
                <p className="text-sm text-gray-500 mt-3">Analyzing the conversation...</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose-sm max-w-none text-gray-700"
              >
                {analysis && 
                  analysis.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))
                }
              </motion.div>
            )}
          </div>
        )}
        
        <p className="text-xs text-gray-500 italic">
          Note: AI analysis is for assistance only. For best results, provide clear context.
        </p>
      </div>
    </motion.div>
  );
};

export default AIAssistant;
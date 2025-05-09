import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, ArrowPathIcon, ChatBubbleBottomCenterTextIcon, LightBulbIcon, ChartBarIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import type { Chat, UserProfileInsights } from '../../types/telegram';
import { analyzeConversation } from '../../services/AIAgentService';
import { TelegramApiService } from '../../services/TelegramApiService';
import PersonaMirrorView from './PersonaMirrorView';

interface AIAssistantProps {
  chat: Chat;
  onClose: () => void;
}

type AnalysisType = 'sentiment' | 'summary' | 'suggestions' | 'persona_mirror' | null;

const AIAssistant: React.FC<AIAssistantProps> = ({ chat, onClose }) => {
  const [analysisType, setAnalysisType] = useState<AnalysisType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [personaMirrorData, setPersonaMirrorData] = useState<UserProfileInsights | null>(null);
  const [showPersonaMirrorTarget, setShowPersonaMirrorTarget] = useState<boolean>(false);
  const [personaTarget, setPersonaTarget] = useState<'self' | 'other'>('other');
  const [personaName, setPersonaName] = useState<string>('');
  const [showPersonaMirrorResult, setShowPersonaMirrorResult] = useState<boolean>(false);
  
  // Только для личных чатов
  const isPersonalChat = chat.type === 'personal';

  const handleAnalyze = async (type: AnalysisType) => {
    // Сбросим предыдущие результаты
    setAnalysisType(type);
    setAnalysis(null);
    setPersonaMirrorData(null);
    setShowPersonaMirrorResult(false);
    
    if (type === 'persona_mirror') {
      if (isPersonalChat) {
        setShowPersonaMirrorTarget(true);
      } else {
        setAnalysis('Persona Mirror доступен только для личных чатов');
        setIsLoading(false);
      }
      return;
    }
    
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
  
  const handlePersonaMirror = async (target: 'self' | 'other') => {
    setPersonaTarget(target);
    setIsLoading(true);
    setShowPersonaMirrorTarget(false);
    
    try {
      // Определяем, кого анализируем - себя или собеседника
      let analyzePerson: string = 'self';
      let name: string = 'вас';
      
      if (target === 'other') {
        // Найдем собеседника в чате по from_author: false флагу
        const otherUser = chat.messages?.find(msg => msg.from_author === false)?.sender;
        
        if (otherUser) {
          analyzePerson = otherUser.name;
          name = otherUser.name;
        } else {
          // Запасной вариант - если не найден по флагу from_author
          const currentUserId = 'me';
          const fallbackUser = chat.messages?.find(msg => msg.sender.id !== currentUserId)?.sender;
          
          if (fallbackUser) {
            analyzePerson = fallbackUser.name;
            name = fallbackUser.name;
          } else {
            analyzePerson = 'other';
            name = 'собеседника';
          }
        }
      }
      
      setPersonaName(name);
      const data = await TelegramApiService.getPersonaMirror(chat.id, analyzePerson);
      console.log('Received persona mirror data:', data);
      setPersonaMirrorData(data);
      setShowPersonaMirrorResult(true);
    } catch (error) {
      console.error('Persona Mirror failed:', error);
      setAnalysis('Извините, произошла ошибка при анализе личности. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisType(null);
    setAnalysis(null);
    setPersonaMirrorData(null);
    setShowPersonaMirrorTarget(false);
    setShowPersonaMirrorResult(false);
  };
  
  const closePersonaMirrorResult = () => {
    setShowPersonaMirrorResult(false);
    resetAnalysis();
  };

  return (
    <>      {showPersonaMirrorResult && personaMirrorData && (
        <>
          {/* Добавляем дополнительный слой проверки для безопасного рендеринга */}
          {typeof personaMirrorData === 'object' ? (
            <PersonaMirrorView 
              data={personaMirrorData} 
              targetName={personaName} 
              onClose={closePersonaMirrorResult} 
            />
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
              <div className="bg-white rounded-lg p-6 max-w-md">
                <h3 className="text-lg font-semibold mb-3">Ошибка данных</h3>
                <p>Получены некорректные данные от сервера. Пожалуйста, попробуйте позже.</p>
                <button 
                  onClick={closePersonaMirrorResult}
                  className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </>
      )}
    
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
          
          {showPersonaMirrorTarget ? (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-indigo-100 mb-4">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                <UserCircleIcon className="h-5 w-5 text-indigo-600 mr-2" />
                Кого вы хотите проанализировать?
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePersonaMirror('self')}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100 hover:border-indigo-300 transition-colors"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                    <UserCircleIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <span className="text-base font-medium text-gray-800">Меня</span>
                  <span className="text-xs text-gray-500 mt-1">Создать AI-портрет моей личности</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePersonaMirror('other')}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100 hover:border-purple-300 transition-colors"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <UserCircleIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <span className="text-base font-medium text-gray-800">Собеседника</span>
                  <span className="text-xs text-gray-500 mt-1">Создать AI-портрет моего собеседника</span>
                </motion.button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                Создание AI-портрета основано на анализе сообщений в чате и может занять некоторое время.
              </p>
              
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={resetAnalysis}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : !analysisType && !analysis ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
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
              
              {isPersonalChat && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAnalyze('persona_mirror')}
                  className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-indigo-100 hover:border-indigo-300 transition-colors"
                >
                  <UserCircleIcon className="h-6 w-6 text-indigo-600 mb-2" />
                  <span className="text-sm font-medium text-gray-800">Persona Mirror</span>
                  <span className="text-xs text-gray-500 mt-1">Создать AI-портрет</span>
                </motion.button>
              )}
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
    </>
  );
};

export default AIAssistant;

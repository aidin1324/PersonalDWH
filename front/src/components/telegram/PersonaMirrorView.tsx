import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import type { UserProfileInsights } from '../../types/telegram';

interface PersonaMirrorViewProps {
  data: UserProfileInsights;
  targetName: string;
  onClose: () => void;
}

const PersonaMirrorView: React.FC<PersonaMirrorViewProps> = ({ data, targetName, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    interests: true,
    communication: false,
    cognition: false,
    learning: false,
    values: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const tabButtonClass = (tabName: string) => 
    `px-4 py-2 text-sm font-medium rounded-md transition ${
      activeTab === tabName 
      ? 'bg-indigo-100 text-indigo-700' 
      : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
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
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Persona Mirror</h2>
              <p className="text-indigo-100 text-sm">
                ИИ-портрет: {targetName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 px-5 py-3 flex gap-2 border-b overflow-x-auto">
          <button 
            className={tabButtonClass('overview')}
            onClick={() => setActiveTab('overview')}
          >
            Обзор
          </button>
          <button 
            className={tabButtonClass('communication')}
            onClick={() => setActiveTab('communication')}
          >
            Стиль общения
          </button>
          <button 
            className={tabButtonClass('cognition')}
            onClick={() => setActiveTab('cognition')}
          >
            Когнитивный подход
          </button>
          <button 
            className={tabButtonClass('values')}
            onClick={() => setActiveTab('values')}
          >
            Интересы и ценности
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Persona Mirror Full Overview */}              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100">
                <h3 className="text-lg font-semibold text-indigo-900 mb-3">Психологический портрет</h3>
                <div className="prose prose-indigo max-w-none text-gray-700">
                  <p className="whitespace-pre-wrap">
                    {data?.persona_mirror?.persona_mirror || "Информация о психологическом портрете недоступна"}
                  </p>
                </div>
              </div>
              
              {/* Expandable Sections */}
              <div className="space-y-4">
                {/* Interests */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => toggleSection('interests')}
                    className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center">
                      <div className="mr-3 bg-indigo-100 p-2 rounded-md">                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                       </div>
                    </div>
                    <span className="text-gray-800 font-medium">Интересы и увлечения</span>
                    <div className="ml-auto">
                      {expandedSections.interests ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  
                  {expandedSections.interests && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="space-y-4">                        {data?.core_interests_and_passions?.map((interest, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-md border border-gray-100 shadow-sm">
                            <h4 className="font-medium text-gray-900">{interest?.interest_area || "Интерес"}</h4>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {interest?.keywords_indicators?.map((keyword, i) => (
                                <span key={i} className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-md">
                                  {keyword}
                                </span>
                              )) || "Нет ключевых слов"}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              <span className="font-medium">Уровень вовлечённости:</span> {interest?.engagement_level_hint || "Не указан"}
                            </p>
                            <div className="mt-2 text-sm text-gray-600">
                              <p className="font-medium mb-1">Примеры фраз:</p>
                              <ul className="list-disc pl-5 space-y-1">
                                {interest?.example_phrases?.map((phrase, i) => (
                                  <li key={i}><em>"{phrase}"</em></li>
                                )) || <li>Примеры отсутствуют</li>}
                              </ul>
                            </div>
                          </div>
                        )) || <p className="text-gray-500">Информация об интересах недоступна</p>}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Communication */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => toggleSection('communication')}
                    className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center">
                      <div className="mr-3 bg-purple-100 p-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <span className="text-gray-800 font-medium">Стиль коммуникации</span>
                    </div>
                    <div className="ml-auto">
                      {expandedSections.communication ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  
                  {expandedSections.communication && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Доминирующий стиль</h4>                        <p className="text-gray-700">{data?.communication_style_and_preferences?.dominant_style?.description || "Информация о стиле общения недоступна"}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Формальность:</span> {data?.communication_style_and_preferences?.dominant_style?.formality || "Не указано"}
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Подробность:</span> {data.communication_style_and_preferences.dominant_style.verbosity}
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Тон:</span> {data.communication_style_and_preferences.dominant_style.tone_preference_hint}
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="font-medium text-sm mb-1">Примеры фраз:</p>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                            {data.communication_style_and_preferences.dominant_style.example_phrases.map((phrase, i) => (
                              <li key={i}><em>"{phrase}"</em></li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Лингвистические особенности</h4>
                          {/* Jargon */}
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Профессиональный словарь</h5>
                          <div className="space-y-2">
                            {data.communication_style_and_preferences.linguistic_markers.characteristic_vocabulary_or_jargon &&
                             data.communication_style_and_preferences.linguistic_markers.characteristic_vocabulary_or_jargon.length > 0 ? (
                              data.communication_style_and_preferences.linguistic_markers.characteristic_vocabulary_or_jargon.map((jargon, i) => (
                                <div key={i} className="bg-gray-50 p-2 rounded text-sm">
                                  <p><span className="font-medium">Область:</span> {jargon.domain}</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {jargon.terms.map((term, j) => (
                                      <span key={j} className="inline-block bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded">
                                        {term}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="mt-1 text-gray-600 italic">"{jargon.example_phrase}"</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500">Профессиональный словарь не обнаружен</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Personal expressions */}
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Характерные выражения</h5>
                          <div className="space-y-2">
                            {data.communication_style_and_preferences.linguistic_markers.frequent_personal_expressions.map((expr, i) => (
                              <div key={i} className="bg-gray-50 p-2 rounded text-sm">
                                <p className="font-medium">{expr.expression}</p>
                                <p className="text-gray-600 italic">"{expr.example_phrase}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Persona changes */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Изменения в разговоре</h5>
                          <div className="space-y-2">
                            {data.communication_style_and_preferences.linguistic_markers.persona_changing_over_time.map((change, i) => (
                              <div key={i} className="bg-gray-50 p-2 rounded text-sm">
                                <p className="font-medium mb-1">{change.conversation_function}</p>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-500">В начале:</p>
                                    <p className="text-gray-700">{change.from_description}</p>
                                  </div>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                  </svg>
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-500">К концу:</p>
                                    <p className="text-gray-700">{change.to_description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Cognition */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => toggleSection('cognition')}
                    className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center">
                      <div className="mr-3 bg-blue-100 p-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      </div>
                    </div>
                    <span className="text-gray-800 font-medium">Когнитивный подход</span>
                    <div className="ml-auto">
                      {expandedSections.cognition ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  
                  {expandedSections.cognition && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="space-y-4">
                        {/* Information Processing */}
                        <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-2">Обработка информации</h4>
                          <p className="text-gray-700">{data.cognitive_approach_and_decision_making.information_processing_hint.style}</p>
                          <div className="mt-2">
                            <p className="font-medium text-sm mb-1">Примеры фраз:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                              {data.cognitive_approach_and_decision_making.information_processing_hint.example_phrases.map((phrase, i) => (
                                <li key={i}><em>"{phrase}"</em></li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {/* Problem Solving */}
                        <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-2">Решение проблем</h4>
                          <p className="text-gray-700">{data.cognitive_approach_and_decision_making.problem_solving_tendencies.approach}</p>
                          <div className="mt-2">
                            <p className="font-medium text-sm mb-1">Примеры фраз:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                              {data.cognitive_approach_and_decision_making.problem_solving_tendencies.example_phrases.map((phrase, i) => (
                                <li key={i}><em>"{phrase}"</em></li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {/* Expression of Opinions */}
                        <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-2">Выражение мнений</h4>
                          <p className="text-gray-700">{data.cognitive_approach_and_decision_making.expression_of_opinions.manner}</p>
                          <div className="mt-2">
                            <p className="font-medium text-sm mb-1">Примеры фраз:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                              {data.cognitive_approach_and_decision_making.expression_of_opinions.example_phrases.map((phrase, i) => (
                                <li key={i}><em>"{phrase}"</em></li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Learning */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => toggleSection('learning')}
                    className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center">
                      <div className="mr-3 bg-green-100 p-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-gray-800 font-medium">Обучение и развитие</span>
                    <div className="ml-auto">
                      {expandedSections.learning ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  
                  {expandedSections.learning && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="space-y-3">
                        {data.learning_and_development_indicators.map((learning, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-md border border-gray-100 shadow-sm">
                            <h4 className="font-medium text-gray-900">{learning.learning_topic_or_skill}</h4>
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-medium">Тип подтверждения:</span> {learning.evidence_type}
                            </p>
                            <div className="mt-2 text-sm text-gray-600">
                              <p className="font-medium mb-1">Примеры фраз:</p>
                              <ul className="list-disc pl-5 space-y-1">
                                {learning.example_phrases.map((phrase, i) => (
                                  <li key={i}><em>"{phrase}"</em></li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Values */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => toggleSection('values')}
                    className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center">
                      <div className="mr-3 bg-amber-100 p-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-gray-800 font-medium">Ценности и мотиваторы</span>
                    <div className="ml-auto">
                      {expandedSections.values ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  
                  {expandedSections.values && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="space-y-3">
                        {data.values_and_motivators_hint.map((value, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-md border border-gray-100 shadow-sm">
                            <h4 className="font-medium text-gray-900">{value.inferred_value_or_motivator}</h4>
                            <div className="mt-2 text-sm text-gray-600">
                              <p className="font-medium mb-1">Примеры фраз:</p>
                              <ul className="list-disc pl-5 space-y-1">
                                {value.example_phrases.map((phrase, i) => (
                                  <li key={i}><em>"{phrase}"</em></li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'communication' && (
            <div className="space-y-6">
              {/* Dominant Style */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Стиль общения</h3>
                <p className="text-gray-800 mb-4">{data.communication_style_and_preferences.dominant_style.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-purple-800 mb-1">Формальность</p>
                    <p className="text-gray-700">{data.communication_style_and_preferences.dominant_style.formality}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-purple-800 mb-1">Подробность</p>
                    <p className="text-gray-700">{data.communication_style_and_preferences.dominant_style.verbosity}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-purple-800 mb-1">Предпочитаемый тон</p>
                    <p className="text-gray-700">{data.communication_style_and_preferences.dominant_style.tone_preference_hint}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Примеры характерных фраз:</p>
                  <div className="bg-gray-50 rounded-md p-3">
                    <ul className="space-y-2">
                      {data.communication_style_and_preferences.dominant_style.example_phrases.map((phrase, i) => (
                        <li key={i} className="text-gray-700 italic">"{phrase}"</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Linguistic Markers */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Языковые особенности</h3>
                  {/* Vocabulary */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Профессиональный словарь и жаргон</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.communication_style_and_preferences.linguistic_markers.characteristic_vocabulary_or_jargon && 
                     data.communication_style_and_preferences.linguistic_markers.characteristic_vocabulary_or_jargon.length > 0 ? (
                      data.communication_style_and_preferences.linguistic_markers.characteristic_vocabulary_or_jargon.map((jargon, i) => (
                        <div key={i} className="bg-gray-50 p-4 rounded-md">
                          <p className="font-medium text-gray-900">{jargon.domain}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {jargon.terms.map((term, j) => (
                              <span key={j} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                {term}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 mt-2 italic">Пример: "{jargon.example_phrase}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center p-4 bg-gray-50 rounded-md text-gray-500">
                        Профессиональный словарь и жаргон не обнаружены
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Expressions */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Частые выражения</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.communication_style_and_preferences.linguistic_markers.frequent_personal_expressions.map((expr, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-md">
                        <p className="font-medium text-gray-900">"{expr.expression}"</p>
                        <p className="text-sm text-gray-600 mt-2 italic">Контекст: "{expr.example_phrase}"</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Persona Changes */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">Изменения в коммуникации</h4>
                  {data.communication_style_and_preferences.linguistic_markers.persona_changing_over_time.map((change, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-md mb-4">
                      <p className="font-medium text-gray-900 mb-2">{change.conversation_function}</p>
                      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        <div className="flex-1 p-3 bg-white rounded-md border border-gray-200">
                          <p className="text-xs font-medium text-gray-500 uppercase">В начале диалога</p>
                          <p className="text-gray-800 mt-1">{change.from_description}</p>
                        </div>
                        <div className="flex justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 transform md:rotate-0 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                        <div className="flex-1 p-3 bg-white rounded-md border border-gray-200">
                          <p className="text-xs font-medium text-gray-500 uppercase">К концу диалога</p>
                          <p className="text-gray-800 mt-1">{change.to_description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'cognition' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Когнитивный подход</h3>
                
                <div className="space-y-6">
                  {/* Information Processing */}
                  <div>
                    <h4 className="text-md font-medium text-blue-800 mb-2">Обработка информации</h4>
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p className="text-gray-900">{data.cognitive_approach_and_decision_making.information_processing_hint.style}</p>
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Характерные фразы:</p>
                        <div className="mt-2 grid gap-2">
                          {data.cognitive_approach_and_decision_making.information_processing_hint.example_phrases.map((phrase, i) => (
                            <div key={i} className="bg-white p-2 rounded italic text-gray-700 border border-blue-100">
                              "{phrase}"
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Problem Solving */}
                  <div>
                    <h4 className="text-md font-medium text-green-800 mb-2">Решение проблем</h4>
                    <div className="bg-green-50 p-4 rounded-md">
                      <p className="text-gray-900">{data.cognitive_approach_and_decision_making.problem_solving_tendencies.approach}</p>
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Характерные фразы:</p>
                        <div className="mt-2 grid gap-2">
                          {data.cognitive_approach_and_decision_making.problem_solving_tendencies.example_phrases.map((phrase, i) => (
                            <div key={i} className="bg-white p-2 rounded italic text-gray-700 border border-green-100">
                              "{phrase}"
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expression of Opinions */}
                  <div>
                    <h4 className="text-md font-medium text-amber-800 mb-2">Выражение мнений</h4>
                    <div className="bg-amber-50 p-4 rounded-md">
                      <p className="text-gray-900">{data.cognitive_approach_and_decision_making.expression_of_opinions.manner}</p>
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Характерные фразы:</p>
                        <div className="mt-2 grid gap-2">
                          {data.cognitive_approach_and_decision_making.expression_of_opinions.example_phrases.map((phrase, i) => (
                            <div key={i} className="bg-white p-2 rounded italic text-gray-700 border border-amber-100">
                              "{phrase}"
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'values' && (
            <div className="space-y-6">
              {/* Interests */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Интересы и увлечения</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.core_interests_and_passions.map((interest, i) => (
                    <div key={i} className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
                      <h4 className="text-indigo-900 font-medium">{interest.interest_area}</h4>
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Уровень вовлечённости:</span> {interest.engagement_level_hint}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {interest.keywords_indicators.map((keyword, j) => (
                          <span key={j} className="inline-block bg-indigo-200 text-indigo-900 text-xs px-2 py-1 rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 bg-white rounded p-3 text-sm">
                        <p className="font-medium text-gray-700 mb-1">Примеры фраз:</p>
                        <ul className="list-disc pl-4 text-gray-600 space-y-1">
                          {interest.example_phrases.map((phrase, j) => (
                            <li key={j} className="italic">"{phrase}"</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Learning */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Обучение и развитие</h3>
                <div className="space-y-4">
                  {data.learning_and_development_indicators.map((learning, i) => (
                    <div key={i} className="bg-green-50 p-4 rounded-md">
                      <h4 className="text-green-900 font-medium">{learning.learning_topic_or_skill}</h4>
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">Тип подтверждения:</span>
                        <span className="ml-1 text-sm text-gray-800">{learning.evidence_type}</span>
                      </div>
                      <div className="mt-3 bg-white rounded p-3 text-sm">
                        <p className="font-medium text-gray-700 mb-1">Примеры фраз:</p>
                        <ul className="list-disc pl-4 text-gray-600 space-y-1">
                          {learning.example_phrases.map((phrase, j) => (
                            <li key={j} className="italic">"{phrase}"</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Values */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ценности и мотиваторы</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.values_and_motivators_hint.map((value, i) => (
                    <div key={i} className="bg-amber-50 p-4 rounded-md">
                      <h4 className="text-amber-900 font-medium">{value.inferred_value_or_motivator}</h4>
                      <div className="mt-3 bg-white rounded p-3 text-sm">
                        <p className="font-medium text-gray-700 mb-1">Подтверждающие фразы:</p>
                        <ul className="list-disc pl-4 text-gray-600 space-y-1">
                          {value.example_phrases.map((phrase, j) => (
                            <li key={j} className="italic">"{phrase}"</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500">
          AI Persona Mirror анализирует стиль коммуникации на основе сообщений.
          Результаты представлены исключительно в информационных целях.
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PersonaMirrorView;

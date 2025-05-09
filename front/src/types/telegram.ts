export interface User {
  id: string;
  name: string;
  avatar_url?: string;
  username?: string;
}

export interface Sender {
  id: number;
  name: string;
  username?: string;
}

export interface Message {
  id: string;
  sender: User;
  text: string;
  timestamp: number;
  isRead: boolean;
  mediaType?: string | null;
  mediaUrl?: string | null;
  duration?: number | null;
  sender_avatar_url?: string | null; // Added new field
  from_author?: boolean; // Added new field from_author (camelCase)
}

export interface MessageFromAPI {
  id: number;
  sender: Sender;
  text: string;
  date: number;
  is_read: boolean;
  media_type?: string | null;
  media_url?: string | null;
  duration?: number | null;
  sender_avatar_url?: string | null;
  from_author?: boolean; // Added new field
}

export type ChatType = "group" | "channel" | "personal";

export interface Chat {
  id: string | number;  // API returns numeric IDs
  type: ChatType;
  name: string;
  avatar_url?: string;
  last_message?: MessageFromAPI;
  unread_count?: number;
  messages: Message[];
}

export interface TelegramApiResponse {
  stats: {
    personal_unread: number;
    group_unread: number;
    channel_unread: number;
  };
  chats: Chat[];
}

export interface PaginationState {
  loading: boolean;
  hasMore: boolean;
  offsetDate?: number;
  limit: number;
}

export interface MessagePaginationState {
  loading: boolean;
  hasMore: boolean;
  offset_id: number;
  limit: number;
}

// Persona Mirror типы
export interface Interest {
  interest_area: string;
  keywords_indicators: string[];
  engagement_level_hint: string;
  example_phrases: string[];
}

export interface DominantStyle {
  description: string;
  formality: string;
  verbosity: string;
  tone_preference_hint: string;
  example_phrases: string[];
}

export interface JargonTerm {
  domain: string;
  terms: string[];
  example_phrase: string;
}

export interface PersonalExpression {
  expression: string;
  example_phrase: string;
}

export interface PersonaChange {
  conversation_function: string;
  from_description: string;
  to_description: string;
}

export interface LinguisticMarkers {
  characteristic_vocabulary_or_jargon: JargonTerm[];
  frequent_personal_expressions: PersonalExpression[];
  persona_changing_over_time: PersonaChange[];
}

export interface CommunicationStyle {
  dominant_style: DominantStyle;
  linguistic_markers: LinguisticMarkers;
}

export interface InformationProcessingHint {
  style: string;
  example_phrases: string[];
}

export interface ProblemSolvingTendencies {
  approach: string;
  example_phrases: string[];
}

export interface ExpressionOfOpinions {
  manner: string;
  example_phrases: string[];
}

export interface CognitiveApproach {
  information_processing_hint: InformationProcessingHint;
  problem_solving_tendencies: ProblemSolvingTendencies;
  expression_of_opinions: ExpressionOfOpinions;
}

export interface LearningIndicator {
  learning_topic_or_skill: string;
  evidence_type: string;
  example_phrases: string[];
}

export interface ValueMotivator {
  inferred_value_or_motivator: string;
  example_phrases: string[];
}

export interface PersonaMirror {
  persona_mirror: string;
}

export interface UserProfileInsights {
  core_interests_and_passions: Interest[];
  communication_style_and_preferences: CommunicationStyle;
  cognitive_approach_and_decision_making: CognitiveApproach;
  learning_and_development_indicators: LearningIndicator[];
  values_and_motivators_hint: ValueMotivator[];
  persona_mirror: PersonaMirror;
}
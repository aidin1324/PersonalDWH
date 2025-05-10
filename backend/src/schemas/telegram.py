"""
Pydantic models for Telegram API.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class ChatType(str, Enum):
    PERSONAL = "personal"
    GROUP = "group"
    CHANNEL = "channel"
    ALL = "all"

class Sender(BaseModel):
    id: int
    name: str
    username: Optional[str] = None

class Message(BaseModel):
    """Представляет сообщение Telegram."""
    id: int
    text: Optional[str] = None
    date: int
    sender: Sender
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    duration: Optional[int] = None
    is_read: Optional[bool] = None
    sender_avatar_url: Optional[str] = None
    from_author: bool  # True если сообщение от текущего пользователя

class Chat(BaseModel):
    """Представляет чат/диалог Telegram."""
    id: int
    type: ChatType
    name: str
    unread_count: Optional[int] = 0
    last_message: Optional[Message] = None
    avatar_url: Optional[str] = None  # URL для аватарки

class ChatStats(BaseModel):
    """Статистика непрочитанных сообщений по типу чата."""
    personal_unread: int = 0
    group_unread: int = 0
    channel_unread: int = 0

class AuthRequestCode(BaseModel):
    phone_number: str

class AuthSubmitCode(BaseModel):
    phone_number: str
    phone_code_hash: str
    code: str
    password: Optional[str] = None

class AuthStatus(BaseModel):
    is_authorized: bool
    user_id: Optional[int] = None
    phone: Optional[str] = None

class PhoneCodeHash(BaseModel):
    phone_code_hash: str

# --- Persona Mirror AI Feature Schemas ---
class Interest(BaseModel):
    """Интерес или хобби пользователя."""
    interest_area: str = Field(..., description="Название интереса или хобби, например, 'Классическая музыка', 'Python-разработка', 'Путешествия по Азии'")
    keywords_indicators: List[str] = Field(..., description="Список ключевых слов или фраз-индикаторов, связанных с интересом")
    engagement_level_hint: str = Field(..., description="Уровень вовлечённости: 'глубокое погружение', 'активное обсуждение', 'поверхностное упоминание'")
    example_phrases: List[str] = Field(..., description="Примеры фраз пользователя, подтверждающие интерес")

class DominantStyle(BaseModel):
    """Доминирующий стиль коммуникации пользователя."""
    description: str = Field(..., description="Общее описание стиля коммуникации, например, 'Неформальный и дружелюбный с юмором и эмодзи', 'Формальный, точный и аргументированный'")
    formality: str = Field(..., description="Уровень формальности: 'формальный', 'неформальный', 'смешанный'")
    verbosity: str = Field(..., description="Степень подробности: 'кратко', 'умеренно подробно', 'подробно'")
    tone_preference_hint: str = Field(..., description="Предпочтительный тон: 'позитивный', 'прямой и честный', 'избегает конфликтов' и т.д.")
    example_phrases: List[str] = Field(..., description="Примеры фраз, иллюстрирующих стиль")

class JargonTerm(BaseModel):
    """Жаргонные или профессиональные термины пользователя."""
    domain: str = Field(..., description="Домен жаргона, например, 'IT', 'Наука', 'Искусство'")
    terms: List[str] = Field(..., description="Список терминов или фраз")
    example_phrase: str = Field(..., description="Пример предложения с этим жаргоном")

class PersonalExpression(BaseModel):
    """Часто используемое личное выражение или идиома."""
    expression: str = Field(..., description="Выражение или идиома")
    example_phrase: str = Field(..., description="Пример предложения с этим выражением")

class PersonaChange(BaseModel):
    """Изменение персоны пользователя во времени."""
    conversation_function: str = Field(..., description="Как меняется разговор в течении общения?")
    from_description: str = Field(..., description="Описание персоны в начале диалога")
    to_description: str = Field(..., description="Описание персоны к концу диалога")

class LinguisticMarkers(BaseModel):
    """Лингвистические маркеры: жаргон, выражения, изменения стиля."""
    characteristic_vocabulary_or_jargon: List[JargonTerm] = Field(
        ..., description="Список профессионального словаря или жаргона"
    )
    frequent_personal_expressions: List[PersonalExpression] = Field(
        ..., description="Список часто используемых выражений или идиом"
    )
    persona_changing_over_time: List[PersonaChange] = Field(
        ..., description="Информация о смене персоны во времени"
    )
    class Config:
        populate_by_name = True
        
class CommunicationStyle(BaseModel):
    """Коммуникационный стиль пользователя и лингвистические маркеры."""
    dominant_style: DominantStyle = Field(..., description="Сводка по доминирующему стилю")
    linguistic_markers: LinguisticMarkers = Field(..., description="Лингвистические маркеры, включая жаргон и выражения")

class InformationProcessingHint(BaseModel):
    """Стиль обработки информации пользователем."""
    style: str = Field(..., description="Стиль обработки: 'аналитический', 'интуитивный', 'ищет мнения', 'быстро принимает решения'")
    example_phrases: List[str] = Field(..., description="Фразы, показывающие стиль обработки информации")

class ProblemSolvingTendencies(BaseModel):
    """Склонности к решению проблем."""
    approach: str = Field(..., description="Подход: 'предлагает решения', 'задаёт уточняющие вопросы', 'ищет компромисс', 'анализирует риски'")
    example_phrases: List[str] = Field(..., description="Фразы, иллюстрирующие стиль решения проблем")

class ExpressionOfOpinions(BaseModel):
    """Манера выражения мнений."""
    manner: str = Field(..., description="Манера: 'уверенно и прямо', 'мягко и косвенно', 'спорит', 'редко выражает мнение'")
    example_phrases: List[str] = Field(..., description="Примеры выражения мнений")

class CognitiveApproach(BaseModel):
    """Когнитивный подход пользователя."""
    information_processing_hint: InformationProcessingHint = Field(
        ..., description="Подсказки по обработке информации"
    )
    problem_solving_tendencies: ProblemSolvingTendencies = Field(
        ..., description="Склонности к решению проблем"
    )
    expression_of_opinions: ExpressionOfOpinions = Field(
        ..., description="Стиль выражения мнений"
    )

class LearningIndicator(BaseModel):
    """Индикаторы обучения и развития пользователя."""
    learning_topic_or_skill: str = Field(..., description="Тема или навык, который изучает пользователь")
    evidence_type: str = Field(..., description="Тип подтверждения: 'упоминает курсы', 'задаёт вопросы', 'делится знаниями', 'обсуждает книги или статьи'")
    example_phrases: List[str] = Field(..., description="Примеры фраз, указывающих на обучение")

class ValueMotivator(BaseModel):
    """Ценности и мотиваторы пользователя."""
    inferred_value_or_motivator: str = Field(..., description="Вычисленная ценность или мотиватор, например, 'Точность', 'Инновации', 'Сотрудничество', 'Эффективность'")
    example_phrases: List[str] = Field(..., description="Фразы, из которых выводится ценность или мотиватор")

class PersonaMirror(BaseModel):
    """Прочие наблюдения и инсайты о пользователе."""
    persona_mirror: str = Field(..., description="На основе чата, описать человека, какой он по факту? Построить его портрет (250-350 слов)")

class UserProfileInsights(BaseModel):
    """AI-карточка Persona Mirror, ВСЕ ДОЛЖНО БЫТЬ ОТНОСИТЕЛЬНО ANALYZE PERSON: краткий портрет собеседника (интересы, стиль, когнитивные особенности и др.). все на русском"""
    core_interests_and_passions: List[Interest] = Field(..., description="Список основных интересов и увлечений пользователя с индикаторами и примерами")
    communication_style_and_preferences: CommunicationStyle = Field(..., description="Стиль коммуникации и лингвистические маркеры")
    cognitive_approach_and_decision_making: CognitiveApproach = Field(..., description="Как пользователь обрабатывает информацию и принимает решения")
    learning_and_development_indicators: List[LearningIndicator] = Field(..., description="Индикаторы обучения и развития пользователя")
    values_and_motivators_hint: List[ValueMotivator] = Field(..., description="Предполагаемые ценности и мотиваторы пользователя")
    persona_mirror: PersonaMirror = Field(..., description="Полное описание человека, строим его портрет")
    class Config:
        populate_by_name = True

class ChatSummary(BaseModel):
    """Сводка по чату: summary, key points, важные сообщения, последние непрочитанные."""
    summary: str
    key_points: List[str]
    important_messages: List[Message]
    unread_messages: List[Message]
    total_analyzed: int
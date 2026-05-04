"""AI response schemas."""
from pydantic import BaseModel


class AnimalInsightResponse(BaseModel):
    animal_id: int
    model: str
    summary: str


class AssistantChatRequest(BaseModel):
    question: str


class AssistantChatResponse(BaseModel):
    model: str
    answer: str

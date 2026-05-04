"""AI insight endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.ai import AnimalInsightResponse, AssistantChatRequest, AssistantChatResponse
from app.services.ai_service import answer_assistant_question, generate_animal_insight

router = APIRouter(prefix="/api/ai", tags=["AI Insights"])


@router.post("/animals/{animal_id}/insight", response_model=AnimalInsightResponse)
def animal_insight(
    animal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a local AI summary for an animal record."""
    return generate_animal_insight(db, animal_id, current_user)


@router.post("/assistant/chat", response_model=AssistantChatResponse)
def assistant_chat(
    data: AssistantChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Answer a user question using scoped livestock system data."""
    return answer_assistant_question(db, data.question, current_user)

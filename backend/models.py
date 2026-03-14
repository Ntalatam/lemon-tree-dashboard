from pydantic import BaseModel
from typing import Optional


class FeedbackCreate(BaseModel):
    pantry_name: str
    neighborhood: str
    rating: int
    comment: str


class FeedbackResponse(BaseModel):
    id: int
    pantry_name: str
    neighborhood: str
    nta: str
    rating: int
    comment: str
    date: str
    sentiment: str
    sentiment_score: float
    categories: list[str]
    keywords: list[str]

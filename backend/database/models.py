"""
Pydantic models for API request/response validation.
"""

from pydantic import BaseModel
from typing import Optional, List


# ── Request Models ─────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    collected_symptoms: Optional[List[str]] = None
    history: Optional[List[dict]] = None


class BookRequest(BaseModel):
    clinic_name: str
    doctor: str


# ── Response Models ────────────────────────────────────────

class IntakeResult(BaseModel):
    symptoms: list[str]
    duration: str | None = None
    pain_level: str | None = None


class TriageResult(BaseModel):
    urgency: str  # HIGH, MEDIUM, LOW
    specialist: str
    timeframe: str
    explanation: str


class ClinicInfo(BaseModel):
    id: int
    name: str
    doctor: str
    specialist: str
    distance: float
    rating: float
    female_doctor: bool
    safety_score: int
    address: str
    lat: float = 0.0
    lng: float = 0.0


class ChatResponse(BaseModel):
    is_complete: bool
    intake: Optional[IntakeResult] = None
    triage: Optional[TriageResult] = None
    clinics: Optional[list[ClinicInfo]] = None
    ai_message: str


class AppointmentInfo(BaseModel):
    id: int
    clinic_name: str
    doctor: str
    time: str
    status: str
    created_at: str


class BookResponse(BaseModel):
    appointment: AppointmentInfo
    followup: dict
    message: str


class FollowupResponse(BaseModel):
    appointment_id: int
    followup_date: str
    message: str
    questions: list[str]

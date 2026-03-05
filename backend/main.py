"""
MediMap AI — FastAPI Backend

Multi-agent healthcare navigation API.
Agents: Intake → Triage → Referral → Appointment → Follow-up

Each API call logs the agent pipeline execution for traceability.
"""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.database.db import init_db
from backend.database.models import (
    ChatRequest,
    ChatResponse,
    BookRequest,
    BookResponse,
    IntakeResult,
    TriageResult,
    ClinicInfo,
    AppointmentInfo,
    FollowupResponse,
)
from backend.agents.intake_agent import extract_symptoms, generate_followup_question
from backend.agents.triage_agent import assess_urgency
from backend.agents.referral_agent import find_clinics
from backend.agents.followup_agent import get_followup_status
from backend.services.booking_service import create_booking, get_all_bookings
from backend.services.clinic_service import get_clinic_by_name


# ── Logging ────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)-5s │ %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("medimap")


# ── App Setup ──────────────────────────────────────────────

app = FastAPI(
    title="MediMap AI",
    description="AI-powered healthcare navigator for women",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    """Initialize database on startup."""
    init_db()
    logger.info("MediMap AI backend started — database initialized")


# ── Chat Endpoint ──────────────────────────────────────────

@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    Process a user's symptom message through the agent pipeline:
    1. Intake Agent — extract symptoms
    2. Triage Agent — assess urgency
    3. Referral Agent — find clinics
    """
    message = request.message.strip()

    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    logger.info("─── Agent Pipeline Start ───────────────────────")
    logger.info(f"User message: \"{message}\"")

    # ── Agent 1: Intake ────────────────────────────────────
    logger.info("[Agent 1] Intake Agent → extracting symptoms...")
    intake_data = extract_symptoms(message, history_symptoms=request.collected_symptoms)
    logger.info(f"[Agent 1] Result: symptoms={intake_data['symptoms']}, "
                f"duration={intake_data['duration']}, pain_level={intake_data['pain_level']}")

    # Check if we have enough symptoms for ML
    followup_q = generate_followup_question(intake_data['symptoms'])
    
    if followup_q:
        logger.info(f"[Agent 1] Asking follow-up question: {followup_q}")
        return ChatResponse(
            is_complete=False,
            intake=IntakeResult(**intake_data),
            triage=None,
            clinics=[],
            ai_message=followup_q,
        )

    # ── Agent 2: Triage ────────────────────────────────────
    logger.info("[Agent 2] Triage Agent → assessing urgency (ML-based)...")
    triage_data = assess_urgency(intake_data)
    logger.info(f"[Agent 2] Result: urgency={triage_data['urgency']}, "
                f"specialist={triage_data['specialist']}, timeframe={triage_data['timeframe']}")

    # ── Agent 3: Referral ──────────────────────────────────
    logger.info(f"[Agent 3] Referral Agent → finding {triage_data['specialist']} clinics...")
    clinics_data = find_clinics(triage_data["specialist"])
    logger.info(f"[Agent 3] Result: {len(clinics_data)} clinics found")

    # Build clinic info objects
    clinic_infos = [
        ClinicInfo(
            id=c["id"],
            name=c["name"],
            doctor=c["doctor"],
            specialist=c["specialist"],
            distance=c["distance"],
            rating=c["rating"],
            female_doctor=c["female_doctor"],
            safety_score=c["safety_score"],
            address=c["address"],
            lat=c.get("lat", 0.0),
            lng=c.get("lng", 0.0),
        )
        for c in clinics_data
    ]

    # Build AI response message
    symptoms_str = ", ".join(intake_data["symptoms"])
    urgency_label = triage_data["urgency"]
    specialist = triage_data["specialist"]

    ai_message = (
        f"Based on your symptoms ({symptoms_str}), I've assessed this as "
        f"**{urgency_label} urgency**. I recommend seeing a **{specialist}** "
        f"{triage_data['timeframe'].lower()}. "
        f"I've found {len(clinic_infos)} nearby clinics for you."
    )

    logger.info(f"─── Agent Pipeline Complete ── {urgency_label} → {specialist} ──")

    return ChatResponse(
        is_complete=True,
        intake=IntakeResult(**intake_data),
        triage=TriageResult(**triage_data),
        clinics=clinic_infos,
        ai_message=ai_message,
    )


# ── Booking Endpoint ───────────────────────────────────────

@app.post("/api/book", response_model=BookResponse)
def book(request: BookRequest):
    """Book an appointment at a clinic."""
    logger.info(f"[Agent 4] Appointment Agent → booking at {request.clinic_name} with {request.doctor}")
    result = create_booking(request.clinic_name, request.doctor)
    logger.info(f"[Agent 4] Appointment #{result['appointment']['id']} confirmed: {result['appointment']['time']}")

    logger.info(f"[Agent 5] Follow-up Agent → scheduling follow-up")
    logger.info(f"[Agent 5] Follow-up scheduled: {result['followup']['followup_date']}")

    return BookResponse(
        appointment=AppointmentInfo(**result["appointment"]),
        followup=result["followup"],
        message=result["message"],
    )


# ── Appointments Endpoint ─────────────────────────────────

@app.get("/api/appointments")
def appointments():
    """Get all booked appointments."""
    return get_all_bookings()


# ── Follow-up Endpoint ────────────────────────────────────

@app.get("/api/followup/{appointment_id}", response_model=FollowupResponse)
def followup(appointment_id: int):
    """Get follow-up information for an appointment."""
    result = get_followup_status(appointment_id)

    if result["status"] == "not_found":
        raise HTTPException(status_code=404, detail="Appointment not found")

    return FollowupResponse(
        appointment_id=result["appointment_id"],
        followup_date=result.get("followup_date", "Not scheduled"),
        message=result["message"],
        questions=result.get("questions", []),
    )


# ── Health Check ───────────────────────────────────────────

@app.get("/api/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "MediMap AI"}

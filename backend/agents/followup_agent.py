"""
Follow-up Agent — Schedules recovery check-ins after appointments.

For the prototype, this simulates follow-up scheduling and generates
appropriate follow-up messages based on the original symptoms.
"""

from datetime import datetime, timedelta
from backend.database.db import update_appointment_followup, get_appointment_by_id


def schedule_followup(appointment_id: int) -> dict:
    """
    Schedule a follow-up check for an appointment.

    Creates a follow-up 3 days after the appointment for recovery monitoring.

    Args:
        appointment_id: The ID of the appointment to follow up on

    Returns:
        dict with follow-up details
    """
    followup_date = (datetime.now() + timedelta(days=3)).strftime("%B %d, %Y")

    # Update the appointment record
    update_appointment_followup(appointment_id, followup_date)

    return {
        "appointment_id": appointment_id,
        "followup_date": followup_date,
        "message": "How are your symptoms today? We'd like to check on your recovery.",
        "questions": [
            "How are your symptoms today?",
            "Have you noticed any improvement since your visit?",
            "Are you experiencing any new symptoms?",
            "Have you been following the prescribed treatment?",
        ],
    }


def get_followup_status(appointment_id: int) -> dict:
    """
    Get the follow-up status for an appointment.

    Args:
        appointment_id: The appointment ID

    Returns:
        dict with follow-up information
    """
    appointment = get_appointment_by_id(appointment_id)

    if not appointment:
        return {
            "appointment_id": appointment_id,
            "status": "not_found",
            "message": "Appointment not found.",
        }

    if appointment.get("followup_scheduled"):
        return {
            "appointment_id": appointment_id,
            "status": "scheduled",
            "followup_date": appointment.get("followup_date"),
            "message": "Your follow-up is scheduled. We'll check on your recovery.",
            "questions": [
                "How are your symptoms today?",
                "Have you noticed any improvement since your visit?",
                "Are you experiencing any new symptoms?",
                "Have you been following the prescribed treatment?",
            ],
        }

    return {
        "appointment_id": appointment_id,
        "status": "pending",
        "message": "No follow-up has been scheduled yet.",
    }

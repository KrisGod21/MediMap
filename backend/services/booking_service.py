"""
Booking Service — Wraps the appointment agent for the API layer.
"""

from backend.agents.appointment_agent import book_appointment, list_appointments, get_appointment
from backend.agents.followup_agent import schedule_followup


def create_booking(clinic_name: str, doctor: str) -> dict:
    """
    Create a new booking and schedule a follow-up.

    Args:
        clinic_name: Name of the clinic
        doctor: Name of the doctor

    Returns:
        dict with appointment details, follow-up info, and confirmation message
    """
    # Book the appointment
    result = book_appointment(clinic_name, doctor)
    appointment = result["appointment"]

    # Schedule a follow-up
    followup = schedule_followup(appointment["id"])

    return {
        "appointment": appointment,
        "followup": {
            "followup_date": followup["followup_date"],
            "message": followup["message"],
        },
        "message": result["message"],
    }


def get_all_bookings() -> list[dict]:
    """Get all bookings."""
    return list_appointments()


def get_booking(appointment_id: int) -> dict | None:
    """Get a specific booking."""
    return get_appointment(appointment_id)

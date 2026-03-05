"""
Appointment Agent — Creates and manages appointment bookings.

Uses SQLite via the database module for persistence.
"""

from datetime import datetime, timedelta
from backend.database.db import create_appointment, get_all_appointments, get_appointment_by_id


def _generate_appointment_time() -> str:
    """Generate a realistic appointment time (tomorrow at the next available slot)."""
    now = datetime.now()
    # Schedule for tomorrow
    tomorrow = now + timedelta(days=1)
    # Pick a reasonable time slot
    hour = 10 if now.hour < 12 else 14
    appointment_dt = tomorrow.replace(hour=hour, minute=30, second=0, microsecond=0)
    return appointment_dt.strftime("%B %d, %Y — %I:%M %p")


def book_appointment(clinic_name: str, doctor: str) -> dict:
    """
    Book an appointment at the specified clinic.

    Args:
        clinic_name: Name of the clinic
        doctor: Name of the doctor

    Returns:
        dict with appointment details and confirmation message
    """
    appointment_time = _generate_appointment_time()
    appointment = create_appointment(clinic_name, doctor, appointment_time)

    return {
        "appointment": appointment,
        "message": f"Appointment confirmed with {doctor} at {clinic_name} on {appointment_time}.",
    }


def list_appointments() -> list[dict]:
    """Get all booked appointments."""
    return get_all_appointments()


def get_appointment(appointment_id: int) -> dict | None:
    """Get a specific appointment by ID."""
    return get_appointment_by_id(appointment_id)

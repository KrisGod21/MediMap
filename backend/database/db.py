"""
Database setup and connection management for MediMap AI.
Uses SQLite for appointment storage.
"""

import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "medimap.db")


def get_connection() -> sqlite3.Connection:
    """Get a SQLite database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize the database with required tables."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clinic_name TEXT NOT NULL,
            doctor TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'confirmed',
            created_at TEXT NOT NULL,
            followup_scheduled INTEGER NOT NULL DEFAULT 0,
            followup_date TEXT
        )
    """)

    conn.commit()
    conn.close()


def create_appointment(clinic_name: str, doctor: str, appointment_time: str) -> dict:
    """Create a new appointment record."""
    conn = get_connection()
    cursor = conn.cursor()

    created_at = datetime.now().isoformat()

    cursor.execute(
        """
        INSERT INTO appointments (clinic_name, doctor, time, status, created_at)
        VALUES (?, ?, ?, 'confirmed', ?)
        """,
        (clinic_name, doctor, appointment_time, created_at),
    )

    appointment_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": appointment_id,
        "clinic_name": clinic_name,
        "doctor": doctor,
        "time": appointment_time,
        "status": "confirmed",
        "created_at": created_at,
    }


def get_all_appointments() -> list[dict]:
    """Get all appointments."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_appointment_by_id(appointment_id: int) -> dict | None:
    """Get a single appointment by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments WHERE id = ?", (appointment_id,))
    row = cursor.fetchone()
    conn.close()

    return dict(row) if row else None


def update_appointment_followup(appointment_id: int, followup_date: str) -> bool:
    """Update an appointment with follow-up information."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE appointments
        SET followup_scheduled = 1, followup_date = ?
        WHERE id = ?
        """,
        (followup_date, appointment_id),
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()

    return affected > 0

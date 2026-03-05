"""
Clinic Service — Loads and queries clinic data.
"""

import json
import os

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "clinics.json")


def load_all_clinics() -> list[dict]:
    """Load all clinics from the JSON dataset."""
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_clinic_by_id(clinic_id: int) -> dict | None:
    """Get a specific clinic by its ID."""
    clinics = load_all_clinics()
    for clinic in clinics:
        if clinic["id"] == clinic_id:
            return clinic
    return None


def get_clinic_by_name(name: str) -> dict | None:
    """Get a specific clinic by name (case-insensitive partial match)."""
    clinics = load_all_clinics()
    name_lower = name.lower()
    for clinic in clinics:
        if name_lower in clinic["name"].lower():
            return clinic
    return None

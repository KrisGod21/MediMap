"""
Referral Agent — Finds relevant clinics based on specialist requirement.

Loads clinic data from local JSON, filters by specialist, and sorts by
distance, safety score, and rating.
"""

import json
import os

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "clinics.json")


def _load_clinics() -> list[dict]:
    """Load clinic data from JSON file."""
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def find_clinics(specialist: str, limit: int = 5) -> list[dict]:
    """
    Find clinics matching the required specialist.

    Filters by specialist type, then sorts by:
      1. Distance (ascending)
      2. Safety score (descending)
      3. Rating (descending)

    Args:
        specialist: The type of specialist needed (e.g., "Gynecologist")
        limit: Maximum number of clinics to return (default 5)

    Returns:
        List of clinic dicts sorted by relevance.
    """
    all_clinics = _load_clinics()

    # Filter by specialist
    matching = [c for c in all_clinics if c["specialist"].lower() == specialist.lower()]

    # If we have fewer than 2 matches, also include general physicians as fallback
    if len(matching) < 2 and specialist.lower() != "general physician":
        general = [c for c in all_clinics if c["specialist"].lower() == "general physician"]
        matching.extend(general)

    # Sort: safety_score DESC, distance ASC, rating DESC
    matching.sort(key=lambda c: (-c["safety_score"], c["distance"], -c["rating"]))

    return matching[:limit]

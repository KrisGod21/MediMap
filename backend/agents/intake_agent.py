"""
Intake Agent — Extracts structured medical data from user messages.

Uses keyword-based NLP (regex + dictionaries) for symptom extraction.
No LLM API keys required.
"""

import re

# ── Symptom Dictionary ─────────────────────────────────────
# Maps keywords/phrases to normalized symptom names
SYMPTOM_KEYWORDS: dict[str, list[str]] = {
    "heavy bleeding": ["heavy bleeding", "heavy period", "excessive bleeding", "blood clots", "menorrhagia", "heavy menstrual"],
    "irregular bleeding": ["irregular bleeding", "spotting", "breakthrough bleeding", "irregular periods", "missed period"],
    "cramps": ["cramps", "cramping", "menstrual cramps", "abdominal cramps", "period cramps", "period pain"],
    "severe cramps": ["severe cramps", "intense cramps", "extreme cramps", "unbearable cramps", "severe pain in abdomen"],
    "dizziness": ["dizziness", "dizzy", "lightheaded", "light headed", "feeling faint", "vertigo", "wobbly"],
    "nausea": ["nausea", "nauseous", "feeling sick", "queasy", "want to vomit", "vomiting", "throwing up"],
    "headache": ["headache", "head ache", "head pain", "migraine", "throbbing head"],
    "fatigue": ["fatigue", "tired", "exhaustion", "exhausted", "lethargy", "no energy", "feeling weak", "weakness"],
    "anxiety": ["anxiety", "anxious", "nervous", "worry", "worried", "panic", "panic attack", "restless"],
    "depression": ["depression", "depressed", "sad", "hopeless", "feeling down", "low mood"],
    "insomnia": ["insomnia", "can't sleep", "cannot sleep", "trouble sleeping", "sleepless", "sleep problems"],
    "fever": ["fever", "high temperature", "feverish", "chills"],
    "breast pain": ["breast pain", "breast tenderness", "sore breasts", "breast lump"],
    "pelvic pain": ["pelvic pain", "lower abdominal pain", "pain in pelvis", "uterine pain"],
    "back pain": ["back pain", "backache", "lower back pain"],
    "bloating": ["bloating", "bloated", "swollen abdomen", "abdominal swelling"],
    "mood swings": ["mood swings", "mood changes", "irritable", "irritability", "emotional"],
    "hot flashes": ["hot flashes", "hot flushes", "night sweats", "sweating"],
    "weight gain": ["weight gain", "gaining weight", "putting on weight"],
    "weight loss": ["weight loss", "losing weight", "unexplained weight loss"],
    "hair loss": ["hair loss", "hair falling", "thinning hair", "alopecia"],
    "acne": ["acne", "pimples", "breakouts", "skin breakout"],
    "vaginal discharge": ["discharge", "vaginal discharge", "unusual discharge"],
    "painful urination": ["painful urination", "burning urination", "uti", "urinary tract infection"],
    "shortness of breath": ["shortness of breath", "breathless", "difficulty breathing", "can't breathe"],
    "chest pain": ["chest pain", "chest tightness"],
    "rash": ["rash", "skin rash", "itchy skin", "hives"],
}

# ── Duration Patterns ──────────────────────────────────────
DURATION_PATTERNS = [
    r"(?:for|since|past|last)\s+(\d+)\s+(days?|weeks?|months?|hours?|years?)",
    r"(\d+)\s+(days?|weeks?|months?)\s+(?:ago|now|long)",
    r"(?:started|began|happening)\s+(\d+)\s+(days?|weeks?|months?)\s+ago",
    r"(?:since|from)\s+(yesterday|last\s+week|last\s+month|this\s+morning)",
]

# ── Pain Level Patterns ────────────────────────────────────
PAIN_LEVEL_MAP = {
    "mild": "3",
    "moderate": "5",
    "severe": "7",
    "extreme": "9",
    "unbearable": "10",
    "intense": "8",
    "slight": "2",
    "terrible": "8",
    "worst": "10",
    "excruciating": "10",
}


def extract_symptoms(user_message: str, history_symptoms: list[str] = None) -> dict:
    """
    Extract structured medical data from a user's natural language message.
    Merges with previously collected symptoms for multi-turn conversations.

    Returns:
        dict with keys: symptoms (list), duration (str|None), pain_level (str|None)
    """
    if history_symptoms is None:
        history_symptoms = []

    message_lower = user_message.lower().strip()

    # ── Extract symptoms ───────────────────────────────────
    found_symptoms: list[str] = list(set(history_symptoms)) # Start with history
    
    for symptom_name, keywords in SYMPTOM_KEYWORDS.items():
        for keyword in keywords:
            if keyword in message_lower:
                if symptom_name not in found_symptoms:
                    # Check for "severe cramps" vs "cramps" specificity
                    if symptom_name == "cramps" and "severe cramps" in found_symptoms:
                        continue
                    if symptom_name == "severe cramps" and "cramps" in found_symptoms:
                        found_symptoms.remove("cramps")
                    found_symptoms.append(symptom_name)
                break

    # ── Extract duration ───────────────────────────────────
    duration = None
    for pattern in DURATION_PATTERNS:
        match = re.search(pattern, message_lower)
        if match:
            groups = match.groups()
            if len(groups) == 2:
                duration = f"{groups[0]} {groups[1]}"
            elif len(groups) == 1:
                duration = groups[0]
            break

    # ── Extract pain level ─────────────────────────────────
    pain_level = None

    # Check for numeric pain level: "pain level 7", "7/10 pain"
    numeric_match = re.search(r"(?:pain\s*(?:level|scale|score)?)\s*(?:of\s*)?(\d{1,2})(?:\s*/\s*10)?", message_lower)
    if not numeric_match:
        numeric_match = re.search(r"(\d{1,2})\s*/\s*10\s*(?:pain)?", message_lower)

    if numeric_match:
        pain_level = numeric_match.group(1)
    else:
        # Check for descriptive pain levels
        for descriptor, level in PAIN_LEVEL_MAP.items():
            if descriptor in message_lower:
                pain_level = level
                break

    return {
        "symptoms": found_symptoms,
        "duration": duration,
        "pain_level": pain_level,
    }


def generate_followup_question(collected_symptoms: list[str]) -> str | None:
    """
    If the collected symptoms are insufficient for a confident ML prediction,
    generate a follow-up question to ask the user.
    Returns None if enough symptoms are collected.
    """
    # If they've only provided 1 symptom, ask for more context
    if len(collected_symptoms) == 0:
        return "I didn't quite catch those symptoms. Could you describe what you're experiencing in a bit more detail (e.g., cramps, nausea, bleeding)?"
    elif len(collected_symptoms) < 2:
        symptom = collected_symptoms[0]
        if symptom in ["heavy bleeding", "irregular bleeding"]:
            return f"I understand you're experiencing {symptom}. Do you also have any pain, cramps, or dizziness?"
        elif symptom in ["cramps", "severe cramps", "pelvic pain"]:
            return f"You mentioned {symptom}. Is there any unusual bleeding, nausea, or fever?"
        else:
            return f"You mentioned {symptom}. Are there any other symptoms you're noticing along with it?"
    
    # If 2 or more symptoms, assume we have enough to run the ML triage
    return None

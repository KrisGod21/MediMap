"""
Triage Agent — Determines urgency and required specialist using ML.
"""

import os
import joblib
import pandas as pd
import numpy as np

# ── Urgency Levels ─────────────────────────────────────────
HIGH = "HIGH"
MEDIUM = "MEDIUM"
LOW = "LOW"

# Try loading the trained ML model pipeline
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
COLUMNS_PATH = os.path.join(BASE_DIR, "model_columns.pkl")
LABELS_PATH = os.path.join(BASE_DIR, "model_labels.pkl")

ml_pipeline = None
model_columns = None
model_labels = None

try:
    if os.path.exists(MODEL_PATH) and os.path.exists(COLUMNS_PATH) and os.path.exists(LABELS_PATH):
        ml_pipeline = joblib.load(MODEL_PATH)
        model_columns = joblib.load(COLUMNS_PATH)
        model_labels = joblib.load(LABELS_PATH)
except Exception as e:
    print(f"Failed to load ML model: {e}")

# Map anonymous service labels to our domain
SERVICE_MAP = {
    "service_a": ("Gynecologist", HIGH, "Within 2 hours", "ML predicted critical gynecological care."),
    "service_b": ("General Physician", LOW, "Within 1 week", "ML predicted routine evaluation."),
    "service_c": ("Gynecologist", MEDIUM, "Within 24 hours", "ML predicted specialized female care."),
    "service_d": ("Dermatologist", LOW, "Within 1 week", "ML predicted skin-related evaluation."),
    "service_e": ("Mental Health Specialist", MEDIUM, "Within 48 hours", "ML predicted behavioral consultation."),
    "service_f": ("General Physician", MEDIUM, "Within 24 hours", "ML predicted acute general care."),
    "service_g": ("Cardiologist", HIGH, "Immediately", "ML predicted cardiac symptoms."),
}

def assess_urgency(intake_data: dict) -> dict:
    """
    Determine urgency level and recommended specialist based on ML prediction.
    """
    symptoms = intake_data.get("symptoms", [])
    pain_level = intake_data.get("pain_level")

    if not symptoms:
        return {
            "urgency": LOW,
            "specialist": "General Physician",
            "timeframe": "Within 1 week",
            "explanation": "No specific symptoms were identified. A general health checkup is recommended.",
        }

    # Escalate urgency if pain level is high
    pain_escalation = False
    if pain_level and pain_level.isdigit() and int(pain_level) >= 7:
        pain_escalation = True

    # ── ML Inference ──
    if ml_pipeline and model_columns and model_labels:
        # Create a zeroed feature vector
        vector = {col: 0.0 for col in model_columns}
        
        # Since the dataset features are anonymized (n_0000, etc.), we map symptoms 
        # to features deterministically by hashing the string to an index
        # This simulates real feature extraction for the prototype
        for symptom in symptoms:
            hash_idx = hash(symptom) % len(model_columns)
            target_col = model_columns[hash_idx]
            vector[target_col] = 1.0
            
        # Add pain level if present
        if pain_escalation:
            pain_idx = hash("pain") % len(model_columns)
            vector[model_columns[pain_idx]] = float(pain_level)
            
        df = pd.DataFrame([vector])
        
        # Predict
        try:
            prediction = ml_pipeline.predict(df)[0] # Array of 0s and 1s for the multi-labels
            
            # Find the first positive label
            predicted_label = None
            for i, val in enumerate(prediction):
                if val == 1:
                    predicted_label = model_labels[i]
                    break
            
            if predicted_label and predicted_label in SERVICE_MAP:
                specialist, urgency, timeframe, explanation = SERVICE_MAP[predicted_label]
                
                # Apply pain escalation overrides
                if pain_escalation and urgency == LOW:
                    urgency = MEDIUM
                    timeframe = "Within 24 hours"
                    explanation += " Elevated due to high pain level reported."
                elif pain_escalation and urgency == MEDIUM:
                    urgency = HIGH
                    timeframe = "Within 4 hours"
                    explanation += " Escalated due to high pain level reported."
                    
                return {
                    "urgency": urgency,
                    "specialist": specialist,
                    "timeframe": timeframe,
                    "explanation": explanation
                }
        except Exception as e:
            print(f"ML Prediction failed: {e}")

    # Fallback if ML fails or returns no positive predictions
    urgency = MEDIUM if pain_escalation else LOW
    return {
        "urgency": urgency,
        "specialist": "General Physician",
        "timeframe": "Within 24 hours" if pain_escalation else "Within 1 week",
        "explanation": "ML prediction uncertain. A general consultation is recommended.",
    }

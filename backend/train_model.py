import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
import joblib
import os
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("ml_trainer")

def train_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    train_data_path = os.path.join(base_dir, "train Data.csv")
    train_labels_path = os.path.join(base_dir, "train labels.csv")
    model_output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.pkl")
    columns_output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model_columns.pkl")

    logger.info("Loading datasets...")
    # Load data
    try:
        X_df = pd.read_csv(train_data_path, low_memory=False)
        y_df = pd.read_csv(train_labels_path, low_memory=False)
    except Exception as e:
        logger.error(f"Failed to load dataset: {e}")
        return

    # Ensure alignment on 'id' if possible, or assume index alignment if they match
    if 'id' in X_df.columns and 'id' in y_df.columns:
        logger.info("Merging on 'id'...")
        merged = pd.merge(X_df, y_df, on='id', how='inner')
        X_df = merged[X_df.columns]
        y_df = merged[y_df.columns]
    
    # Drop non-feature columns
    features_to_drop = ['id', 'release']
    X = X_df.drop(columns=[col for col in features_to_drop if col in X_df.columns])
    
    # Just select numeric columns for simplicity in this prototype
    # to avoid complex high-cardinality OHE explosion
    X = X.select_dtypes(include=[np.number])
    
    # Ensure y only has label columns
    y = y_df.drop(columns=['id'], errors='ignore')

    logger.info(f"Training data shape: {X.shape}")
    logger.info(f"Labels shape: {y.shape}")

    # Build Pipeline: Impute NaNs -> Random Forest
    logger.info("Building model pipeline...")
    rf = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1, max_depth=10)
    multi_target_rf = MultiOutputClassifier(rf, n_jobs=-1)
    
    pipeline = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value=0)),
        ('classifier', multi_target_rf)
    ])

    logger.info("Training model (this may take a moment)...")
    pipeline.fit(X, y)

    logger.info(f"Saving model to {model_output_path}")
    joblib.dump(pipeline, model_output_path)
    
    # Save the feature column names to map text inputs later
    joblib.dump(X.columns.tolist(), columns_output_path)
    
    # Save target label names
    label_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model_labels.pkl")
    joblib.dump(y.columns.tolist(), label_path)

    logger.info("Training complete!")

if __name__ == "__main__":
    train_model()

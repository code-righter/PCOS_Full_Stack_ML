import joblib
import pandas as pd

MODEL_PATH = "pcos_model.joblib"
THRESHOLD = 0.4  # tuned for higher PCOS recall

bundle = joblib.load(MODEL_PATH)
model = bundle["model"]
FEATURES = bundle["features"]

FEATURE_MAPPING = {
    "hair_growth": "hair growth(Y/N)",
    "skin_darkening": "Skin darkening (Y/N)",
    "weight_gain": "Weight gain(Y/N)",
    "fast_food": "Fast food (Y/N)",
    "cycle_length": "Cycle length(days)",
    "cycle_irregular": "Cycle(R/I)",
    "bmi": "BMI",
    "weight_kg": "Weight (Kg)",
    "hip_inch": "Hip(inch)"
}


def predict_pcos(data: dict):
    # Map API keys → training feature names
    mapped_data = {
        FEATURE_MAPPING[k]: v for k, v in data.items()
    }

    df = pd.DataFrame([mapped_data])

    # Ensure correct column order
    df = df.reindex(columns=FEATURES, fill_value=0)

    prob = model.predict_proba(df)[0][1]
    pred = int(prob >= THRESHOLD)

    return pred, round(float(prob), 4)


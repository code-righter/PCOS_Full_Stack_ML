from fastapi import FastAPI
from app.schema import PCOSInput, PCOSOutput
from app.model import predict_pcos

app = FastAPI(
    title="PCOS Prediction API",
    description="PCOS Classification using ML",
    version="1.0.0"
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/predict", response_model=PCOSOutput)
def predict(input_data: PCOSInput):
    pred, confidence = predict_pcos(input_data.dict())

    return {
        "pcos_prediction": pred,
        "confidence_score": confidence,
        "model version" : "v1.1.2"
    }

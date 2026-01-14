from pydantic import BaseModel, Field

class PCOSInput(BaseModel):
    hair_growth: int = Field(..., ge=0, le=1)
    skin_darkening: int = Field(..., ge=0, le=1)
    weight_gain: int = Field(..., ge=0, le=1)
    fast_food: int = Field(..., ge=0, le=1)
    cycle_length: int = Field(..., gt=0)
    cycle_irregular: int = Field(..., ge=0, le=1)
    bmi: float = Field(..., gt=0)
    weight_kg: float = Field(..., gt=0)
    hip_inch: float = Field(..., gt=0)

class PCOSOutput(BaseModel):
    pcos_prediction: int
    confidence_score: float

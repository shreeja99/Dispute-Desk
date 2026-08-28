from fastapi import FastAPI
from app.services.evidence_engine import evidence_engine
from app.services.decision_engine import decision_engine
from app.services.evaluation_service import evaluation_service
from app.data.synthetic_generator import generate_dataset
from app.routers import disputes

app = FastAPI(title="Dispute-Desk API")

app.include_router(disputes.router)


@app.get("/")
def root():
    return {"status": "Dispute-Desk backend is running"}


@app.get("/synthetic-dataset")
def get_synthetic_dataset(count: int = 20):
    return generate_dataset(count)


@app.get("/evidence-assessment/{network}/{reason_code}")
def test_evidence_assessment(network: str, reason_code: str, available: str = ""):
    available_list = available.split(",") if available else []
    return evidence_engine.assess(network, reason_code, available_list)


@app.get("/decision/{network}/{reason_code}")
def test_decision(network: str, reason_code: str, amount: float, available: str = ""):
    available_list = available.split(",") if available else []
    return decision_engine.decide(network, reason_code, available_list, amount)


@app.get("/evaluate")
def run_evaluation(count: int = 100):
    return evaluation_service.run_batch_evaluation(count)
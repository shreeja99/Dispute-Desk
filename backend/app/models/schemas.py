from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class EvidenceItem(BaseModel):
    evidence_type: str
    is_available: bool
    file_reference: Optional[str] = None


class Dispute(BaseModel):
    id: Optional[str] = None
    transaction_id: str
    reason_code: str
    amount: float
    currency: str = "INR"
    deadline: datetime
    status: str = "open"


class DisputeCreate(BaseModel):
    transaction_id: str
    network: str
    reason_code: str
    amount: float
    deadline: datetime
    evidence: List[EvidenceItem]


class EvidenceAssessment(BaseModel):
    dispute_id: str
    required_evidence: List[str]
    available_evidence: List[str]
    missing_evidence: List[str]
    completeness_score: float  # 0-100
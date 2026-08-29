from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from app.db import supabase
from app.services.decision_engine import decision_engine
from app.services.audit_service import audit_service
from app.services.llm_service import llm_service
from app.models.schemas import DisputeCreate
from app.auth import get_current_user

router = APIRouter(prefix="/disputes", tags=["disputes"])


def get_optional_user(authorization: str = Header(None)) -> Optional[str]:
    """
    Same as get_current_user, but returns None instead of raising an
    error when no token is present -- this lets 'Continue as guest'
    work for the demo, while still attaching real user_ids when a
    merchant is actually signed in.
    """
    if not authorization:
        return None
    try:
        return get_current_user(authorization)
    except HTTPException:
        return None


@router.post("/")
def create_dispute(dispute: DisputeCreate, user_id: Optional[str] = None):
    insert_result = supabase.table("disputes").insert({
        "transaction_id": dispute.transaction_id,
        "network": dispute.network,
        "reason_code": dispute.reason_code,
        "amount": dispute.amount,
        "deadline": dispute.deadline.isoformat(),
        "user_id": user_id,
    }).execute()

    if not insert_result.data:
        raise HTTPException(status_code=500, detail="Failed to create dispute")

    dispute_row = insert_result.data[0]
    dispute_id = dispute_row["id"]

    audit_service.log(dispute_id, "dispute_created", {
        "transaction_id": dispute.transaction_id,
        "network": dispute.network,
        "reason_code": dispute.reason_code,
        "amount": dispute.amount,
    })

    available_evidence = [e.evidence_type for e in dispute.evidence if e.is_available]
    for item in dispute.evidence:
        supabase.table("evidence_records").insert({
            "dispute_id": dispute_id,
            "evidence_type": item.evidence_type,
            "is_available": item.is_available,
            "file_reference": item.file_reference,
        }).execute()

    audit_service.log(dispute_id, "evidence_recorded", {
        "available_evidence": available_evidence
    })

    decision_result = decision_engine.decide(
        network=dispute.network,
        reason_code=dispute.reason_code,
        available_evidence=available_evidence,
        amount=dispute.amount,
    )

    audit_service.log(dispute_id, "verdict_computed", decision_result)

    status_map = {"FIGHT": "fighting", "DROP": "dropped", "HUMAN_REVIEW": "review"}
    supabase.table("disputes").update({
        "status": status_map.get(decision_result["verdict"], "open")
    }).eq("id", dispute_id).execute()

    drafted_letter = None
    if decision_result["verdict"] == "FIGHT":
        drafted_letter = llm_service.draft_reply({
            "title": decision_result["evidence_assessment"]["title"],
            "reason_code": dispute.reason_code,
            "network": dispute.network,
            "available_evidence": decision_result["evidence_assessment"]["available_evidence"],
            "amount": dispute.amount,
        })
        audit_service.log(dispute_id, "letter_drafted", {
            "letter_length_words": len(drafted_letter.split())
        })

    return {
        "dispute_id": dispute_id,
        "decision": decision_result,
        "drafted_letter": drafted_letter,
    }

@router.get("/")
def list_disputes(user_id: Optional[str] = None, status: Optional[str] = None):
    """
    Lists disputes for the dashboard. Pass user_id to see one merchant's
    disputes; omit it to see all (useful for the demo/guest view).
    Optionally filter by status: fighting / dropped / review / open.
    """
    query = supabase.table("disputes").select("*")

    if user_id:
        query = query.eq("user_id", user_id)
    if status:
        query = query.eq("status", status)

    result = query.order("created_at", desc=True).execute()
    return result.data


@router.get("/{dispute_id}")
def get_dispute(dispute_id: str):
    """
    Full detail for one dispute -- record, evidence, and latest verdict
    reasoning (from the audit trail's verdict_computed entry).
    """
    dispute_result = supabase.table("disputes").select("*").eq("id", dispute_id).single().execute()
    if not dispute_result.data:
        raise HTTPException(status_code=404, detail="Dispute not found")

    evidence_result = supabase.table("evidence_records").select("*").eq("dispute_id", dispute_id).execute()

    audit_trail = audit_service.get_trail(dispute_id)
    verdict_entry = next((e for e in audit_trail if e["step"] == "verdict_computed"), None)
    letter_entry = next((e for e in audit_trail if e["step"] == "letter_drafted"), None)

    return {
        "dispute": dispute_result.data,
        "evidence": evidence_result.data,
        "decision": verdict_entry["detail"] if verdict_entry else None,
        "letter_drafted": letter_entry is not None,
    }

@router.get("/{dispute_id}/audit-trail")
def get_audit_trail(dispute_id: str):
    trail = audit_service.get_trail(dispute_id)
    if not trail:
        raise HTTPException(status_code=404, detail="No audit trail found for this dispute")
    return trail
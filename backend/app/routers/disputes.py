from fastapi import APIRouter, HTTPException
from app.db import supabase
from app.services.decision_engine import decision_engine
from app.services.audit_service import audit_service
from app.services.llm_service import llm_service
from app.models.schemas import DisputeCreate

router = APIRouter(prefix="/disputes", tags=["disputes"])


@router.post("/")
def create_dispute(dispute: DisputeCreate):
    """
    Creates a real dispute record in the DB, then immediately runs it
    through the Evidence Engine + Decision Engine, logs every step to
    the audit trail, and drafts a reply letter via LLM only if the
    verdict is FIGHT.
    """
    # 1. Insert the dispute record
    insert_result = supabase.table("disputes").insert({
        "transaction_id": dispute.transaction_id,
        "network": dispute.network,
        "reason_code": dispute.reason_code,
        "amount": dispute.amount,
        "deadline": dispute.deadline.isoformat(),
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

    # 2. Insert evidence records
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

    # 3. Run the Decision Engine
    decision_result = decision_engine.decide(
        network=dispute.network,
        reason_code=dispute.reason_code,
        available_evidence=available_evidence,
        amount=dispute.amount,
    )

    audit_service.log(dispute_id, "verdict_computed", decision_result)

    # 4. Update dispute status based on verdict
    status_map = {"FIGHT": "fighting", "DROP": "dropped", "HUMAN_REVIEW": "review"}
    supabase.table("disputes").update({
        "status": status_map.get(decision_result["verdict"], "open")
    }).eq("id", dispute_id).execute()

    # 5. If verdict is FIGHT, draft the reply letter via LLM
    #    (grounded strictly in the confirmed available evidence)
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


@router.get("/{dispute_id}/audit-trail")
def get_audit_trail(dispute_id: str):
    trail = audit_service.get_trail(dispute_id)
    if not trail:
        raise HTTPException(status_code=404, detail="No audit trail found for this dispute")
    return trail
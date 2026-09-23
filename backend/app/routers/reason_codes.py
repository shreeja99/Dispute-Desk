from fastapi import APIRouter, HTTPException
from app.db import supabase, safe_execute

router = APIRouter(prefix="/reason-codes", tags=["reason-codes"])


@router.get("/")
def list_reason_codes():
    """
    Returns every real reason code we have, across all networks, so the
    frontend can build its network/reason dropdowns from real data instead
    of a hardcoded, potentially mismatched list.
    """
    query = supabase.table("reason_code_config").select("network, reason_code, title, suggested_evidence")
    try:
        result = safe_execute(query)
        return result.data
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Reason-code data is temporarily unavailable.",
        )
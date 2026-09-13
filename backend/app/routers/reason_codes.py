from fastapi import APIRouter
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
    result = safe_execute(query)
    return result.data
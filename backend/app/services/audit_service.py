from app.db import supabase
from datetime import datetime


class AuditService:
    """
    Logs every decision step to the audit_log table.
    Nothing here is optional or skippable -- every decision made by the
    system must produce a traceable record.
    """

    def log(self, dispute_id: str, step: str, detail: dict):
        entry = {
            "dispute_id": dispute_id,
            "step": step,
            "detail": detail,
        }
        supabase.table("audit_log").insert(entry).execute()

    def get_trail(self, dispute_id: str) -> list:
        result = supabase.table("audit_log") \
            .select("*") \
            .eq("dispute_id", dispute_id) \
            .order("created_at") \
            .execute()
        return result.data


audit_service = AuditService()
from app.db import supabase


class EvidenceEngine:
    """
    Deterministic, data-driven. All reason codes and suggested evidence
    documents are real, sourced from Razorpay's published dispute
    documentation (stored in Supabase, not hardcoded in this file).
    """

    def _get_reason_config(self, network: str, reason_code: str) -> dict:
        result = supabase.table("reason_code_config") \
            .select("*") \
            .eq("network", network) \
            .eq("reason_code", reason_code) \
            .single() \
            .execute()

        if not result.data:
            raise ValueError(f"No config found for {network} {reason_code}")
        return result.data

    def assess(self, network: str, reason_code: str, available_evidence: list) -> dict:
        config = self._get_reason_config(network, reason_code)

        suggested_set = set(config["suggested_evidence"])
        available_set = set(available_evidence)

        present = suggested_set & available_set
        missing = suggested_set - available_set

        completeness_score = round(
            (len(present) / len(suggested_set)) * 100 if suggested_set else 0, 2
        )

        return {
            "network": network,
            "reason_code": reason_code,
            "title": config["title"],
            "suggested_evidence": sorted(suggested_set),
            "available_evidence": sorted(available_set & suggested_set),
            "missing_evidence": sorted(missing),
            "completeness_score": completeness_score,
        }


evidence_engine = EvidenceEngine()
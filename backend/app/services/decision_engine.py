from app.db import supabase
from app.services.evidence_engine import evidence_engine


class DecisionEngine:
    """
    Deterministic decision layer. Takes the Evidence Engine's completeness
    score plus policy thresholds (from DB, not hardcoded) and produces
    one of three verdicts: FIGHT, DROP, or HUMAN_REVIEW.

    This is the core explainability requirement: the money-affecting
    decision is made by transparent rules, not an LLM.
    """

    def _get_active_policy(self) -> dict:
        result = supabase.table("decision_policy") \
            .select("*") \
            .eq("is_active", True) \
            .single() \
            .execute()

        if not result.data:
            raise ValueError("No active decision policy found")
        return result.data

    def decide(self, network: str, reason_code: str, available_evidence: list, amount: float) -> dict:
        evidence_result = evidence_engine.assess(network, reason_code, available_evidence)
        policy = self._get_active_policy()

        score = evidence_result["completeness_score"]

        # High-value disputes always go to human review, regardless of score.
        if amount >= policy["min_amount_for_auto_decision"]:
            verdict = "HUMAN_REVIEW"
            reason = f"Amount ₹{amount} meets/exceeds the ₹{policy['min_amount_for_auto_decision']} auto-review threshold, regardless of evidence score."
        elif score >= policy["fight_threshold"]:
            verdict = "FIGHT"
            reason = f"Evidence completeness ({score}%) meets the fight threshold ({policy['fight_threshold']}%)."
        elif score < policy["drop_threshold"]:
            verdict = "DROP"
            reason = f"Evidence completeness ({score}%) is below the drop threshold ({policy['drop_threshold']}%). Contesting is unlikely to succeed."
        else:
            verdict = "HUMAN_REVIEW"
            reason = f"Evidence completeness ({score}%) falls in the uncertain zone between {policy['drop_threshold']}% and {policy['fight_threshold']}%."

        return {
            "verdict": verdict,
            "reason": reason,
            "evidence_assessment": evidence_result,
            "amount": amount,
            "policy_used": policy["policy_name"],
        }


decision_engine = DecisionEngine()
from app.data.synthetic_generator import generate_dataset
from app.services.decision_engine import decision_engine


class EvaluationService:
    """
    Runs the Decision Engine against the synthetic labeled dataset and
    computes honest metrics: accuracy, false-fight rate, false-drop rate.

    HUMAN_REVIEW verdicts are tracked separately -- they're a deliberate
    deferral, not a wrong answer, so they're not counted as "correct" or
    "incorrect." This matches the real design: the system is allowed to
    say "I'm not sure" instead of being forced into a binary guess.
    """

    def run_batch_evaluation(self, n: int = 100) -> dict:
        dataset = generate_dataset(n)

        results = {
            "total": n,
            "fight_correct": 0,
            "fight_incorrect": 0,   # false fight: predicted FIGHT, ground truth says should drop
            "drop_correct": 0,
            "drop_incorrect": 0,    # false drop: predicted DROP, ground truth says should fight
            "human_review_count": 0,
            "human_review_would_have_been_fight": 0,
            "human_review_would_have_been_drop": 0,
        }

        detailed_cases = []

        for case in dataset:
            decision = decision_engine.decide(
                network=case["network"],
                reason_code=case["reason_code"],
                available_evidence=case["available_evidence"],
                amount=case["amount"],
            )
            verdict = decision["verdict"]
            ground_truth = case["ground_truth_should_fight"]

            if verdict == "FIGHT":
                if ground_truth:
                    results["fight_correct"] += 1
                else:
                    results["fight_incorrect"] += 1
            elif verdict == "DROP":
                if not ground_truth:
                    results["drop_correct"] += 1
                else:
                    results["drop_incorrect"] += 1
            elif verdict == "HUMAN_REVIEW":
                results["human_review_count"] += 1
                if ground_truth:
                    results["human_review_would_have_been_fight"] += 1
                else:
                    results["human_review_would_have_been_drop"] += 1

            detailed_cases.append({
                "transaction_id": case["transaction_id"],
                "network": case["network"],
                "reason_code": case["reason_code"],
                "amount": case["amount"],
                "predicted_verdict": verdict,
                "ground_truth_should_fight": ground_truth,
                "completeness_score": decision["evidence_assessment"]["completeness_score"],
            })

        auto_decided = results["fight_correct"] + results["fight_incorrect"] + results["drop_correct"] + results["drop_incorrect"]
        correct = results["fight_correct"] + results["drop_correct"]

        summary = {
            "total_cases": n,
            "auto_decided_cases": auto_decided,
            "human_review_cases": results["human_review_count"],
            "coverage_pct": round((auto_decided / n) * 100, 2) if n else 0,
            "accuracy_on_auto_decided_pct": round((correct / auto_decided) * 100, 2) if auto_decided else 0,
            "false_fight_count": results["fight_incorrect"],
            "false_fight_rate_pct": round((results["fight_incorrect"] / auto_decided) * 100, 2) if auto_decided else 0,
            "false_drop_count": results["drop_incorrect"],
            "false_drop_rate_pct": round((results["drop_incorrect"] / auto_decided) * 100, 2) if auto_decided else 0,
            "raw_counts": results,
        }

        return {
            "summary": summary,
            "cases": detailed_cases,
        }


evaluation_service = EvaluationService()
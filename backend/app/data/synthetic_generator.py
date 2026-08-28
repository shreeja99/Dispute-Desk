import random
import uuid
from datetime import datetime, timedelta
from app.db import supabase

random.seed(42)  # reproducible dataset for evaluation


def _get_all_reason_configs() -> list:
    result = supabase.table("reason_code_config").select("*").execute()
    return result.data


def generate_synthetic_dispute(reason_configs: list) -> dict:
    config = random.choice(reason_configs)
    suggested = config["suggested_evidence"]

    # Randomly decide how much of the real suggested evidence is available
    # for this synthetic case -- simulates real-world variance since we
    # don't have access to real merchant evidence data.
    availability_rate = random.choice([0.9, 0.7, 0.5, 0.3, 0.1])
    available_evidence = [e for e in suggested if random.random() < availability_rate]

    amount = round(random.uniform(500, 75000), 2)
    deadline = datetime.now() + timedelta(days=random.randint(1, 10))

    completeness_ratio = (
        len(available_evidence) / len(suggested) if suggested else 1.0
    )
    ground_truth_should_fight = completeness_ratio >= 0.8

    return {
        "id": str(uuid.uuid4()),
        "transaction_id": f"txn_{uuid.uuid4().hex[:10]}",
        "network": config["network"],
        "reason_code": config["reason_code"],
        "title": config["title"],
        "amount": amount,
        "currency": "INR",
        "deadline": deadline.isoformat(),
        "available_evidence": available_evidence,
        "ground_truth_should_fight": ground_truth_should_fight,
    }


def generate_dataset(n: int = 100) -> list:
    reason_configs = _get_all_reason_configs()
    return [generate_synthetic_dispute(reason_configs) for _ in range(n)]
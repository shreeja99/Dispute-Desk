from app.db import supabase

DEFAULT_POLICY = {
    "policy_name": "default",
    "fight_threshold": 80,           # completeness >= 80 -> Fight
    "drop_threshold": 40,            # completeness < 40 -> Drop
    "min_amount_for_auto_decision": 50000,  # above ₹50,000 -> always Human Review
    "is_active": True,
}


def seed():
    supabase.table("decision_policy").upsert(
        DEFAULT_POLICY, on_conflict="policy_name"
    ).execute()
    print("Seeded default decision policy.")


if __name__ == "__main__":
    seed()
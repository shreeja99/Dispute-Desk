import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class LLMService:
    """
    LLM is used ONLY for drafting explanations and reply letters.
    It never makes the fight/drop/review decision -- that's the
    Decision Engine's job. The prompt is strictly constrained to
    reference only evidence the Evidence Engine confirmed exists.
    """

    def draft_reply(self, dispute_context: dict) -> str:
        title = dispute_context["title"]
        reason_code = dispute_context["reason_code"]
        network = dispute_context["network"]
        available_evidence = dispute_context["available_evidence"]
        amount = dispute_context["amount"]

        evidence_list = "\n".join(f"- {e}" for e in available_evidence)

        prompt = f"""You are drafting a dispute representment letter for a merchant contesting a chargeback.

Dispute details:
- Network: {network}
- Reason code: {reason_code} ({title})
- Amount: ₹{amount}

The ONLY evidence confirmed available for this case is listed below.
Do NOT reference, imply, or assume any evidence beyond this list.
Do NOT invent details about the transaction that are not given here.

Confirmed available evidence:
{evidence_list}

Write a formal, concise dispute representment letter (under 200 words) that a merchant could submit to contest this chargeback, referencing only the evidence listed above. If the evidence feels insufficient for a strong case, still write the letter using only what's available -- do not add anything not listed."""

        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=400,
        )

        return response.choices[0].message.content


llm_service = LLMService()
import os
import json
from groq import Groq
from app.db import supabase, safe_execute

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class VoiceExtractionService:
    """
    Converts a merchant's spoken description into structured dispute
    fields, over one or more conversational turns. If something
    important is missing or unclear, it asks one clarifying question
    instead of guessing. It never decides Fight/Drop/Review -- that
    stays the Decision Engine's job -- and never invents evidence the
    merchant didn't mention.
    """

    def _get_all_reason_configs(self) -> list:
        query = supabase.table("reason_code_config").select("*")
        result = safe_execute(query)
        return result.data

    def process_turn(self, conversation_history: list) -> dict:
        """
        conversation_history: list of {"role": "user"/"assistant", "content": str}
        representing everything said so far in this conversation.

        Returns either:
          {"status": "needs_more_info", "question": "..."}
        or:
          {"status": "complete", "network":..., "reason_code":..., "amount":...,
           "available_evidence":[...], "confidence_note": "..."}
        """
        reason_configs = self._get_all_reason_configs()

        reference_list = "\n".join(
            f"- network=\"{c['network']}\" reason_code=\"{c['reason_code']}\": {c['title']} "
            f"(evidence types: {', '.join(c['suggested_evidence'])})"
            for c in reason_configs
        )

        system_prompt = f"""You are helping a merchant log a payment dispute by talking to them.

Real reason codes you must pick from (never invent one):
{reference_list}

Your job each turn:
1. Look at the full conversation so far.
2. If you don't yet know the network, reason code, amount, or at least one piece of evidence, ask ONE short, natural, spoken-style clarifying question -- not a form-like list of questions.
3. Once you have enough to proceed, stop asking and return the final structured result.
4. Never invent evidence the merchant didn't mention. Never guess amounts.
5. reason_code must be ONLY the code itself (e.g. "1064" or "13.1"), never combined with the network name.

Respond with ONLY a JSON object in one of these two shapes:

If more info is needed:
{{"status": "needs_more_info", "question": "<one short spoken question>"}}

If you have enough:
{{"status": "complete", "network": "...", "reason_code": "...", "amount": <number>, "available_evidence": ["..."], "confidence_note": "<one short sentence flagging anything assumed>"}}
"""

        messages = [{"role": "system", "content": system_prompt}] + conversation_history

        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=messages,
            temperature=0.2,
            max_tokens=400,
            response_format={"type": "json_object"},
        )

        return json.loads(response.choices[0].message.content)


voice_extraction_service = VoiceExtractionService()
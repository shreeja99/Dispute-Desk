import type { Dispute, EvidenceItem, Verdict } from "./disputes";

// Browser requests go to this app's same-origin API routes, which proxy the
// external service and avoid browser cross-origin failures.
export const API_BASE_URL = "/api";

export type CreateDisputeInput = {
  transaction_id: string;
  network: string;
  reason_code: string;
  amount: number;
  deadline: string;
  evidence: string[];
};

export type VoiceComplete = {
  status: "complete";
  network: string;
  reason_code: string;
  amount: number;
  available_evidence: string[];
  confidence_note?: string;
};

export type VoiceNeedsMoreInfo = { status: "needs_more_info"; question: string };
export type VoiceResponse = VoiceComplete | VoiceNeedsMoreInfo;

const reasonLabels: Record<string, string> = {
  "1064": "Item never arrived",
  "10.4": "I did not make this payment",
  "4853": "I cancelled but was still charged",
  "1065": "I was charged twice",
  "1060": "I was promised a refund and never got it",
  "1061": "The service I paid for never happened",
};

const evidenceLabels: Record<string, string> = {
  "Proof of delivery": "Delivery confirmation",
  "Proof of service/product delivery": "Delivery confirmation",
  "Shipping carrier tracking": "Courier tracking record",
  "Order confirmation": "Order details",
  "Customer communication log": "Messages with the customer",
  "Customer interaction showcasing product/service related enquiries": "Messages with the customer",
  "Refund policy acceptance": "Customer agreed to your refund policy",
  "Terms & Conditions showcasing refund & fulfillment policies": "Customer agreed to your refund policy",
  "Device / IP match at checkout": "Customer's device matched at checkout",
  "3DS authentication record": "Bank's one-time password check",
  "AVS / CVV match": "Card details matched at payment",
  "Prior undisputed transactions": "Earlier orders from the same customer",
  "Subscription agreement": "Signed subscription terms",
  "Cancellation request record": "The customer's cancellation request",
  "Cancellation policy acceptance": "Customer agreed to your cancellation policy",
  "Service usage after renewal": "Proof they kept using the service",
  "Refund attempt record": "Record of a refund you tried to send",
  "Billing descriptor screenshot": "How the charge appeared on their statement",
  "Authorisation records (both charges)": "Payment records for both charges",
  "Settlement report": "Bank settlement report",
  "Refund initiation record": "Record of the refund you started",
  "Bank reference number": "Bank reference number for the refund",
  "Service delivery record": "Proof the service was delivered",
  "Booking confirmation": "Booking confirmation",
  "Cancellation notice sent to customer": "Cancellation notice you sent",
  "Terms acceptance": "Customer agreed to your terms",
};

function messageFromError(error: unknown) {
  return error instanceof Error ? error.message : "The connected account could not be reached.";
}

async function apiFetch(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `The request failed (${response.status}).`);
  }
  return response;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asVerdict(value: unknown): Verdict {
  if (value === "FIGHT" || value === "DROP" || value === "HUMAN_REVIEW") return value;
  if (value === "fight" || value === "fighting" || value === "won") return "FIGHT";
  if (value === "drop" || value === "dropped" || value === "lost") return "DROP";
  return "HUMAN_REVIEW";
}

function normalizeEvidence(items: unknown): EvidenceItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (typeof item === "string") return { label: item, present: true };
    const value = asRecord(item);
    const result: EvidenceItem = {
      label: String(value["label"] ?? value["name"] ?? value["evidence_type"] ?? "Proof item"),
      present: Boolean(value["present"] ?? value["available"] ?? value["is_available"] ?? true),
    };
    const note = value["note"] ?? value["file_reference"];
    if (typeof note === "string" && note) result.note = note;
    return result;
  });
}

function buildDraftLetter(dispute: Dispute) {
  const availableProof = dispute.evidence
    .filter((item) => item.present)
    .map((item) => evidenceLabels[item.label] ?? item.label)
    .join(", ");

  return `To the reviewing officer,\n\nWe are contesting dispute ${dispute.id} raised against transaction ${dispute.txnId} for ₹${dispute.amount.toLocaleString("en-IN")} under reason code ${dispute.reasonCode} (${dispute.reasonLabel}).\n\nOur records include the following supporting proof: ${availableProof || "the transaction records attached to this response"}. We request that the bank review these records and resolve the dispute in the merchant's favour.\n\nRegards,\nDispute Operations`;
}

export function normalizeDispute(value: unknown, index = 0): Dispute {
  const container = asRecord(value);
  const record = asRecord(container["dispute"]);
  const source = Object.keys(record).length ? record : container;
  const decision = asRecord(container["decision"] ?? source["decision"]);
  const assessment = asRecord(decision["evidence_assessment"]);

  const evidence = normalizeEvidence(
    container["evidence"] ?? source["evidence"] ?? assessment["suggested_evidence"],
  );
  const amount = Number(source["amount"] ?? source["amount_minor"] ?? 0);
  const deadline = String(
    source["deadline"] ?? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  );
  const verdict = asVerdict(
    decision["verdict"] ?? source["verdict"] ?? source["decision"] ?? source["status"],
  );
  const id = String(source["id"] ?? source["dispute_id"] ?? `remote_${index}`);
  const present = evidence.filter((entry) => entry.present).length;
  const completenessScore = Number(
    assessment["completeness_score"] ?? source["completeness"] ?? Number.NaN,
  );
  const networkValue = String(source["network"] ?? "UPI");
  const network = ["UPI", "Visa", "Mastercard", "RuPay", "NetBanking"].includes(networkValue)
    ? (networkValue as Dispute["network"])
    : "UPI";
  const reasonCode = String(source["reason_code"] ?? source["reasonCode"] ?? "");

  const result: Dispute = {
    id,
    txnId: String(source["transaction_id"] ?? source["txn_id"] ?? "transaction"),
    network,
    reasonCode,
    reasonLabel: String(
      source["reason_label"] ??
        source["reasonLabel"] ??
        reasonLabels[reasonCode] ??
        assessment["title"] ??
        "Payment dispute",
    ),
    amount,
    currency: "INR",
    daysToDeadline: Math.max(
      0,
      Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000),
    ),
    deadline,
    createdAt: String(source["created_at"] ?? new Date().toISOString()),
    verdict,
    completeness: Number.isFinite(completenessScore)
      ? Math.round(completenessScore)
      : evidence.length
        ? Math.round((present / evidence.length) * 100)
        : 0,
    reasoning: String(
      decision["reason"] ??
        source["reasoning"] ??
        source["explanation"] ??
        "We checked the information available for this dispute.",
    ),
    evidence,
  };

  const letter = container["letter"] ?? source["letter"];
  if (typeof letter === "string") result.letter = letter;
  if (!result.letter && (container["letter_drafted"] === true || source["letter_drafted"] === true)) {
    result.letter = buildDraftLetter(result);
  }
  return result;
}

function accountQuery(userId?: string) {
  return userId ? `?user_id=${encodeURIComponent(userId)}` : "";
}

export async function fetchDisputes(userId?: string) {
  const response = await apiFetch(`/disputes/${accountQuery(userId)}`);
  const payload = (await response.json()) as unknown;
  const rows = Array.isArray(payload)
    ? payload
    : ((asRecord(payload)["disputes"] as unknown[]) ?? []);
  return rows.map((item, index) => normalizeDispute(item, index));
}

export async function fetchDispute(id: string) {
  const response = await apiFetch(`/disputes/${encodeURIComponent(id)}`);
  return normalizeDispute(await response.json());
}

function backendDeadline(deadline: string) {
  return deadline.includes("T") ? deadline : `${deadline}T23:59:00`;
}

export async function createDispute(input: CreateDisputeInput, userId?: string) {
  const response = await apiFetch(`/disputes/${accountQuery(userId)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      transaction_id: input.transaction_id,
      network: input.network,
      reason_code: input.reason_code,
      amount: input.amount,
      deadline: backendDeadline(input.deadline),
      evidence: input.evidence.map((item) => ({
        evidence_type: item,
        is_available: true,
      })),
    }),
  });
  return normalizeDispute(await response.json());
}

export async function transcribeVoice(audio: Blob) {
  const body = new FormData();
  body.append("audio", audio, "dispute-recording.webm");
  const response = await apiFetch("/voice/transcribe", { method: "POST", body });
  const payload = (await response.json()) as { text?: string };
  if (!payload.text) throw new Error("We could not hear any words in that recording.");
  return payload.text;
}

export async function converseVoice(history: { role: "user" | "assistant"; content: string }[]) {
  const body = new URLSearchParams({ conversation_history: JSON.stringify(history) });
  const response = await apiFetch("/voice/converse", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  return (await response.json()) as VoiceResponse;
}

export { evidenceLabels, reasonLabels, messageFromError };

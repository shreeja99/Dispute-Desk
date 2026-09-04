import { disputes, type Dispute, type Verdict } from "./disputes";

/** Plain-language sentence for what the customer told their bank. */
export const customerSays: Record<string, string> = {
  dsp_001: "Item never arrived",
  dsp_002: "I didn't make this payment",
  dsp_003: "I cancelled but was still charged",
  dsp_004: "I was charged twice for the same thing",
  dsp_005: "I was promised a refund and never got it",
  dsp_006: "The service I paid for never happened",
};

/** Everyday names for the proof items, so nobody has to decode jargon. */
export const plainEvidence: Record<string, string> = {
  "Proof of delivery": "Delivery confirmation",
  "Shipping carrier tracking": "Courier tracking record",
  "Order confirmation": "Order details",
  "Customer communication log": "Messages with the customer",
  "Refund policy acceptance": "Customer agreed to your refund policy",
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

export function plainLabel(label: string) {
  return plainEvidence[label] ?? label;
}

/** Why a missing proof matters, in one sentence. */
export const whyItMatters: Record<string, string> = {
  "Device / IP match at checkout":
    "It links the person who paid to the customer's own phone or computer.",
  "3DS authentication record":
    "It shows the bank asked for a one-time password, which usually moves the risk away from you.",
  "AVS / CVV match": "It shows the card details were entered correctly by the real cardholder.",
  "Proof of delivery": "Without it, there is no way to show the customer received anything.",
  "Customer communication log":
    "Messages often show the customer was happy, or knew what they were buying.",
  "Service usage after renewal": "It shows they kept using what they say they cancelled.",
  "Refund attempt record": "It shows you already tried to make things right.",
  "Bank reference number": "It proves the refund actually left your account and reached theirs.",
  "Settlement report": "It confirms the money movement on the bank's own records.",
  "Service delivery record": "It shows the service actually took place.",
};

export function whyMissingMatters(label: string) {
  return (
    whyItMatters[label] ??
    "Banks usually look for this, so having it would make your case stronger."
  );
}

export type PlainStep = { title: string; date: string };

export function plainSteps(d: Dispute): PlainStep[] {
  const day = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const created = day(d.createdAt);
  const steps: PlainStep[] = [
    { title: "Dispute received from the bank", date: created },
    { title: "Checked your proof", date: created },
    {
      title:
        d.verdict === "FIGHT"
          ? "Decision: Fight this one"
          : d.verdict === "DROP"
            ? "Decision: Let this one go"
            : "Decision: Needs a person to look",
      date: created,
    },
  ];
  if (d.verdict === "FIGHT") steps.push({ title: "Draft reply letter written", date: created });
  return steps;
}

export const verdictWord: Record<Verdict, string> = {
  FIGHT: "Fight",
  HUMAN_REVIEW: "Needs review",
  DROP: "Drop",
};

export const verdictOneLiner: Record<Verdict, string> = {
  FIGHT: "You have strong proof, so we recommend contesting this.",
  HUMAN_REVIEW: "This one isn't clear-cut, so someone should take a look before deciding.",
  DROP: "The proof is thin, so contesting this is unlikely to work.",
};

export const openDisputes = disputes;

export function needsAttention() {
  return disputes.filter((d) => d.verdict === "HUMAN_REVIEW" || d.daysToDeadline < 2);
}

export type ResolvedCase = {
  id: string;
  customerSays: string;
  amount: number;
  network: string;
  action: "Fought" | "Dropped";
  outcome: "Won" | "Lost" | "Closed";
  closedOn: string;
};

export const history: ResolvedCase[] = [
  { id: "dsp_h01", customerSays: "Item never arrived", amount: 3200, network: "UPI", action: "Fought", outcome: "Won", closedOn: "12 Aug 2026" },
  { id: "dsp_h02", customerSays: "I didn't make this payment", amount: 9800, network: "Visa", action: "Dropped", outcome: "Closed", closedOn: "9 Aug 2026" },
  { id: "dsp_h03", customerSays: "I was charged twice", amount: 1499, network: "RuPay", action: "Fought", outcome: "Won", closedOn: "5 Aug 2026" },
  { id: "dsp_h04", customerSays: "The item was damaged", amount: 6750, network: "Mastercard", action: "Fought", outcome: "Lost", closedOn: "1 Aug 2026" },
  { id: "dsp_h05", customerSays: "I cancelled but was still charged", amount: 2199, network: "Mastercard", action: "Dropped", outcome: "Closed", closedOn: "28 Jul 2026" },
];

export type Verdict = "FIGHT" | "HUMAN_REVIEW" | "DROP";

export type EvidenceItem = {
  label: string;
  present: boolean;
  note?: string;
};

export type Dispute = {
  id: string;
  txnId: string;
  network: "UPI" | "Visa" | "Mastercard" | "RuPay" | "NetBanking";
  reasonCode: string;
  reasonLabel: string;
  amount: number;
  currency: "INR";
  daysToDeadline: number;
  deadline: string;
  createdAt: string;
  verdict: Verdict;
  completeness: number;
  reasoning: string;
  evidence: EvidenceItem[];
  letter?: string;
};

export const verdictLabel: Record<Verdict, string> = {
  FIGHT: "Fight this dispute",
  HUMAN_REVIEW: "Needs human review",
  DROP: "Drop this dispute",
};

export const verdictShort: Record<Verdict, string> = {
  FIGHT: "FIGHT",
  HUMAN_REVIEW: "HUMAN REVIEW",
  DROP: "DROP",
};

export function formatAmount(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}

export const disputes: Dispute[] = [
  {
    id: "dsp_001",
    txnId: "txn_9f88a21c7d40",
    network: "UPI",
    reasonCode: "1064",
    reasonLabel: "Goods Not Received",
    amount: 5000,
    currency: "INR",
    daysToDeadline: 6,
    deadline: "2026-09-02",
    createdAt: "2026-08-24T09:12:04Z",
    verdict: "FIGHT",
    completeness: 92,
    reasoning:
      "The courier confirmed delivery with a signature, and the address matches the one on the order. The customer also kept using their account after it arrived, which makes \"it never came\" hard to argue.",
    evidence: [
      { label: "Proof of delivery", present: true, note: "Signed, 2026-08-11" },
      { label: "Shipping carrier tracking", present: true, note: "BLR → PNQ, delivered" },
      { label: "Order confirmation", present: true },
      { label: "Customer communication log", present: true, note: "3 messages" },
      { label: "Refund policy acceptance", present: true },
      { label: "Device / IP match at checkout", present: false },
    ],
    letter:
      "To the reviewing officer,\n\nWe are contesting dispute dsp_001 raised against transaction txn_9f88a21c7d40 for ₹5,000 under reason code 1064 (Goods Not Received).\n\nThe order was shipped on 2026-08-09 and delivered on 2026-08-11 to the address supplied by the cardholder at checkout. Proof of delivery carries the recipient signature, and carrier tracking confirms the delivery scan at the destination pin code. Our support log shows three messages exchanged with the cardholder after delivery, none of which raised non-receipt.\n\nOn this basis we request that the dispute be resolved in the merchant's favour. Supporting documents are attached.\n\nRegards,\nDispute Operations",
  },
  {
    id: "dsp_002",
    txnId: "txn_31be07af9c22",
    network: "Visa",
    reasonCode: "10.4",
    reasonLabel: "Fraud — Card Absent",
    amount: 18499,
    currency: "INR",
    daysToDeadline: 1,
    deadline: "2026-08-28",
    createdAt: "2026-08-19T16:41:22Z",
    verdict: "DROP",
    completeness: 34,
    reasoning:
      "You don't have delivery proof, and the bank never sent the customer a one-time password for this payment. That means the bank will treat the loss as yours, so replying is unlikely to change anything and would cost you another fee.",
    evidence: [
      { label: "3DS authentication record", present: false },
      { label: "Proof of delivery", present: false },
      { label: "AVS / CVV match", present: false },
      { label: "Prior undisputed transactions", present: true, note: "1 in 14 months" },
      { label: "Customer communication log", present: false },
      { label: "Order confirmation", present: true },
    ],
  },
  {
    id: "dsp_003",
    txnId: "txn_c40d5518ba71",
    network: "Mastercard",
    reasonCode: "4853",
    reasonLabel: "Cancelled Recurring",
    amount: 2399,
    currency: "INR",
    daysToDeadline: 9,
    deadline: "2026-09-05",
    createdAt: "2026-08-22T11:02:47Z",
    verdict: "HUMAN_REVIEW",
    completeness: 61,
    reasoning:
      "The customer asked to cancel one day before the renewal charge, but they emailed support instead of using the cancel button. Whether that counts depends on how your own policy is worded, so a person should read it and decide.",
    evidence: [
      { label: "Subscription agreement", present: true },
      { label: "Cancellation request record", present: true, note: "Email, 2026-08-21" },
      { label: "Cancellation policy acceptance", present: true },
      { label: "Service usage after renewal", present: false },
      { label: "Refund attempt record", present: false },
      { label: "Billing descriptor screenshot", present: true },
    ],
  },
  {
    id: "dsp_004",
    txnId: "txn_7a1e93cc0f58",
    network: "RuPay",
    reasonCode: "1065",
    reasonLabel: "Duplicate Processing",
    amount: 899,
    currency: "INR",
    daysToDeadline: 3,
    deadline: "2026-08-30",
    createdAt: "2026-08-21T08:20:10Z",
    verdict: "FIGHT",
    completeness: 88,
    reasoning:
      "The two charges are for two different orders placed 41 minutes apart, each with its own order number and items. The bank's own records show two separate payments, not one payment taken twice.",
    evidence: [
      { label: "Authorisation records (both charges)", present: true },
      { label: "Order confirmation", present: true, note: "2 distinct orders" },
      { label: "Settlement report", present: true },
      { label: "Proof of delivery", present: true },
      { label: "Customer communication log", present: false },
      { label: "Refund policy acceptance", present: true },
    ],
    letter:
      "To the reviewing officer,\n\nWe are contesting dispute dsp_004 raised against transaction txn_7a1e93cc0f58 for ₹899 under reason code 1065 (Duplicate Processing).\n\nThe cardholder was charged twice on 2026-08-14, but the charges correspond to two separate orders placed 41 minutes apart, each with its own order ID, item list and authorisation code. Attached settlement records show two distinct authorisations rather than a duplicated capture of a single order.\n\nWe therefore request that the dispute be resolved in the merchant's favour.\n\nRegards,\nDispute Operations",
  },
  {
    id: "dsp_005",
    txnId: "txn_5db2f6e81a33",
    network: "NetBanking",
    reasonCode: "1060",
    reasonLabel: "Credit Not Processed",
    amount: 12750,
    currency: "INR",
    daysToDeadline: 12,
    deadline: "2026-09-08",
    createdAt: "2026-08-25T13:55:31Z",
    verdict: "HUMAN_REVIEW",
    completeness: 55,
    reasoning:
      "You started a refund on 18 August, but the bank reference number is missing from your records, so right now there is no way to show the money actually reached the customer. Find that reference before deciding.",
    evidence: [
      { label: "Refund initiation record", present: true, note: "2026-08-18" },
      { label: "Bank reference number", present: false },
      { label: "Refund policy acceptance", present: true },
      { label: "Customer communication log", present: true, note: "1 message" },
      { label: "Order confirmation", present: true },
      { label: "Settlement report", present: false },
    ],
  },
  {
    id: "dsp_006",
    txnId: "txn_e2c7aa4b9910",
    network: "UPI",
    reasonCode: "1061",
    reasonLabel: "Services Not Rendered",
    amount: 34000,
    currency: "INR",
    daysToDeadline: 2,
    deadline: "2026-08-29",
    createdAt: "2026-08-20T07:09:58Z",
    verdict: "DROP",
    completeness: 41,
    reasoning:
      "The service was cancelled by your side and nothing was offered instead, so the customer's complaint is accurate. Replying would cost you the fee and almost certainly not change the result.",
    evidence: [
      { label: "Service delivery record", present: false },
      { label: "Booking confirmation", present: true },
      { label: "Cancellation notice sent to customer", present: true },
      { label: "Refund attempt record", present: false },
      { label: "Customer communication log", present: true, note: "5 messages" },
      { label: "Terms acceptance", present: true },
    ],
  },
];

export function getDispute(id: string) {
  return disputes.find((d) => d.id === id);
}

export type AuditEvent = {
  step: "dispute_created" | "evidence_recorded" | "verdict_computed" | "letter_drafted";
  disputeId: string;
  timestamp: string;
  detail: Record<string, unknown>;
};

export const auditTrail: AuditEvent[] = [
  {
    step: "dispute_created",
    disputeId: "dsp_001",
    timestamp: "2026-08-24T09:12:04Z",
    detail: {
      dispute_id: "dsp_001",
      txn_id: "txn_9f88a21c7d40",
      network: "UPI",
      reason_code: "1064",
      amount_minor: 500000,
      currency: "INR",
      source: "network_webhook",
    },
  },
  {
    step: "evidence_recorded",
    disputeId: "dsp_001",
    timestamp: "2026-08-24T09:14:47Z",
    detail: {
      dispute_id: "dsp_001",
      items_present: 5,
      items_required: 6,
      missing: ["device_ip_match"],
      completeness: 0.92,
    },
  },
  {
    step: "verdict_computed",
    disputeId: "dsp_001",
    timestamp: "2026-08-24T09:14:49Z",
    detail: {
      dispute_id: "dsp_001",
      verdict: "FIGHT",
      completeness: 0.92,
      rules_fired: ["pod_signed", "address_match", "post_delivery_activity"],
      engine_version: "1.4.0",
    },
  },
  {
    step: "letter_drafted",
    disputeId: "dsp_001",
    timestamp: "2026-08-24T09:14:52Z",
    detail: {
      dispute_id: "dsp_001",
      template: "goods_not_received_v3",
      characters: 812,
      attachments: ["pod.pdf", "tracking.pdf", "order.pdf"],
    },
  },
  {
    step: "dispute_created",
    disputeId: "dsp_002",
    timestamp: "2026-08-19T16:41:22Z",
    detail: {
      dispute_id: "dsp_002",
      txn_id: "txn_31be07af9c22",
      network: "Visa",
      reason_code: "10.4",
      amount_minor: 1849900,
      currency: "INR",
      source: "network_webhook",
    },
  },
  {
    step: "evidence_recorded",
    disputeId: "dsp_002",
    timestamp: "2026-08-19T16:45:03Z",
    detail: {
      dispute_id: "dsp_002",
      items_present: 2,
      items_required: 6,
      missing: ["three_ds_record", "proof_of_delivery", "avs_cvv_match", "comms_log"],
      completeness: 0.34,
    },
  },
  {
    step: "verdict_computed",
    disputeId: "dsp_002",
    timestamp: "2026-08-19T16:45:05Z",
    detail: {
      dispute_id: "dsp_002",
      verdict: "DROP",
      completeness: 0.34,
      rules_fired: ["no_3ds_liability_shift", "no_delivery_evidence"],
      engine_version: "1.4.0",
    },
  },
  {
    step: "dispute_created",
    disputeId: "dsp_003",
    timestamp: "2026-08-22T11:02:47Z",
    detail: {
      dispute_id: "dsp_003",
      txn_id: "txn_c40d5518ba71",
      network: "Mastercard",
      reason_code: "4853",
      amount_minor: 239900,
      currency: "INR",
      source: "manual_entry",
    },
  },
  {
    step: "verdict_computed",
    disputeId: "dsp_003",
    timestamp: "2026-08-22T11:06:12Z",
    detail: {
      dispute_id: "dsp_003",
      verdict: "HUMAN_REVIEW",
      completeness: 0.61,
      rules_fired: ["cancellation_channel_ambiguous"],
      engine_version: "1.4.0",
    },
  },
];

export type EvalCase = {
  id: string;
  network: string;
  reasonCode: string;
  amount: number;
  predicted: Verdict;
  truth: Verdict;
  completeness: number;
};

export const evalCases: EvalCase[] = [
  { id: "syn_001", network: "UPI", reasonCode: "1064", amount: 5000, predicted: "FIGHT", truth: "FIGHT", completeness: 92 },
  { id: "syn_002", network: "Visa", reasonCode: "10.4", amount: 18499, predicted: "DROP", truth: "DROP", completeness: 34 },
  { id: "syn_003", network: "Mastercard", reasonCode: "4853", amount: 2399, predicted: "HUMAN_REVIEW", truth: "FIGHT", completeness: 61 },
  { id: "syn_004", network: "RuPay", reasonCode: "1065", amount: 899, predicted: "FIGHT", truth: "FIGHT", completeness: 88 },
  { id: "syn_005", network: "UPI", reasonCode: "1061", amount: 34000, predicted: "DROP", truth: "DROP", completeness: 41 },
  { id: "syn_006", network: "Visa", reasonCode: "13.1", amount: 7600, predicted: "FIGHT", truth: "DROP", completeness: 70 },
  { id: "syn_007", network: "NetBanking", reasonCode: "1060", amount: 12750, predicted: "HUMAN_REVIEW", truth: "HUMAN_REVIEW", completeness: 55 },
  { id: "syn_008", network: "Mastercard", reasonCode: "4837", amount: 24500, predicted: "DROP", truth: "FIGHT", completeness: 38 },
  { id: "syn_009", network: "UPI", reasonCode: "1064", amount: 1500, predicted: "FIGHT", truth: "FIGHT", completeness: 84 },
  { id: "syn_010", network: "RuPay", reasonCode: "1062", amount: 4300, predicted: "HUMAN_REVIEW", truth: "HUMAN_REVIEW", completeness: 58 },
  { id: "syn_011", network: "Visa", reasonCode: "12.5", amount: 980, predicted: "FIGHT", truth: "FIGHT", completeness: 90 },
  { id: "syn_012", network: "UPI", reasonCode: "1061", amount: 15600, predicted: "DROP", truth: "DROP", completeness: 44 },
];

export const glossary = {
  dispute:
    "A customer told their bank they want this payment reversed.",
  reasonCode:
    "The official reason the bank gave for this dispute — like a category label.",
  evidence:
    "Proof you can show the bank that the sale was legitimate — like delivery confirmation or your invoice.",
  completeness:
    "How much of the proof you actually have, out of everything the bank usually wants to see.",
  fight:
    "You have strong enough proof — we recommend contesting this dispute.",
  drop:
    "The proof is too weak — contesting is unlikely to work, so we recommend letting it go.",
  review:
    "This case is unclear or high-value — a person should look at it before deciding.",
  auditTrail:
    "A full history of every step this system took to reach its decision, in order.",
  network: "Which payment system was used for this transaction.",
  deadline:
    "The date by which you must respond, or you automatically lose the dispute.",
  draftedReply:
    "A first-draft letter to send to the bank, written using only the proof you actually have.",
} as const;

export type GlossaryKey = keyof typeof glossary;

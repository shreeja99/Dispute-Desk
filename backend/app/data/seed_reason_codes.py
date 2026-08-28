from app.db import supabase

# Source: https://razorpay.com/docs/payments/disputes/submit-evidence/
# All reason codes, descriptions, and suggested evidence documents below
# are taken directly from Razorpay's published dispute documentation.

SEED_DATA = [
    # ---------------- UPI ----------------
    {
        "network": "UPI", "reason_code": "1061",
        "title": "Credit Not Processed",
        "description": "The business failed to process the credit after the customer cancelled or returned the goods or services.",
        "suggested_evidence": [
            "Proof of refund generation",
            "Bank statement showing refund amount matching the payment amount",
            "Customer communication showing refund confirmation",
            "Refund policies",
        ],
    },
    {
        "network": "UPI", "reason_code": "1062",
        "title": "Goods/Services Not As Described",
        "description": "The business delivered a product or service that significantly differed from what they advertised or described.",
        "suggested_evidence": [
            "Product description/image screenshots",
            "Proof of product/service delivery",
            "Customer communication showcasing dissatisfaction",
            "Return policies",
        ],
    },
    {
        "network": "UPI", "reason_code": "1064",
        "title": "Goods/Services Not Received",
        "description": "The business failed to deliver the product or service to the customer despite receiving payment for the purchase.",
        "suggested_evidence": [
            "Proof of service/product delivery",
            "Customer interaction showcasing product/service related enquiries",
            "Terms & Conditions showcasing refund & fulfillment policies",
        ],
    },

    # ---------------- Visa ----------------
    {
        "network": "Visa", "reason_code": "13.1",
        "title": "Merchandise/Services Not Received",
        "description": "The customer paid for the order but did not receive the product/service because the business failed to deliver the goods/service.",
        "suggested_evidence": [
            "Delivery confirmation with signature",
            "Tracking information",
            "Service completion records",
            "Digital delivery logs",
            "Customer acknowledgement",
        ],
    },
    {
        "network": "Visa", "reason_code": "13.2",
        "title": "Cancelled Recurring Transaction",
        "description": "The business charged the customer for the subscription in a subsequent billing cycle, despite the customer having already cancelled the recurring billing.",
        "suggested_evidence": [
            "Cancellation policy",
            "No cancellation request received",
            "Continued usage logs",
            "Terms of service",
            "Cancellation window proof",
        ],
    },
    {
        "network": "Visa", "reason_code": "13.3",
        "title": "Not as Described or Defective",
        "description": "The customer received a damaged or defective item (or a service of poor quality), as the product significantly differed from the description.",
        "suggested_evidence": [
            "Product description/images",
            "Quality control records",
            "No return received",
            "Customer did not contact for resolution",
            "Terms and conditions",
        ],
    },
    {
        "network": "Visa", "reason_code": "13.4",
        "title": "Counterfeit Merchandise",
        "description": "The business delivered fake or counterfeit goods to the customer; the product was an imitation or unauthorised reproduction of a branded item.",
        "suggested_evidence": [
            "Authenticity certificates",
            "Supplier verification",
            "Brand authorisation",
            "Product source documentation",
            "Quality guarantees",
        ],
    },
    {
        "network": "Visa", "reason_code": "13.5",
        "title": "Misrepresentation",
        "description": "The business misrepresented the terms of the sale by making false claims about the product's features or the sales conditions.",
        "suggested_evidence": [
            "Accurate marketing materials",
            "Clear terms display",
            "Customer acknowledgement",
            "No misleading claims proof",
            "Contract terms",
        ],
    },
    {
        "network": "Visa", "reason_code": "13.6",
        "title": "Credit Not Processed",
        "description": "The business failed to process the promised refund or credit to the customer's account.",
        "suggested_evidence": [
            "Refund processing proof",
            "Credit timestamp",
            "Return not received",
            "Refund policy compliance",
            "Transaction reversal records",
        ],
    },
    {
        "network": "Visa", "reason_code": "13.7",
        "title": "Cancelled Merchandise/Services",
        "description": "The business charged the customer for the order even though the customer had cancelled it before shipment or service delivery.",
        "suggested_evidence": [
            "No cancellation received",
            "Cancellation policy terms",
            "Order already processed/shipped",
            "Cancellation window missed",
            "Terms agreement",
        ],
    },
    {
        "network": "Visa", "reason_code": "13.8",
        "title": "Original Credit Transaction Not Accepted",
        "description": "The card network rejected the Original Credit Transaction (OCT) that the business submitted for the refund or payout.",
        "suggested_evidence": [
            "Valid account verification",
            "Compliance with OCT rules",
            "Alternative refund method",
            "Transaction approval records",
        ],
    },

    # ---------------- Mastercard ----------------
    {
        "network": "Mastercard", "reason_code": "4841",
        "title": "Cancelled Recurring or Digital Goods Transaction",
        "description": "The business charged the customer for the subscription or digital goods despite the customer having already cancelled the recurring billing or service.",
        "suggested_evidence": [
            "Cancellation policy",
            "No cancellation received",
            "Service usage after date",
            "Terms of service",
            "Digital access logs",
        ],
    },
    {
        "network": "Mastercard", "reason_code": "4850",
        "title": "Installment Billing Dispute",
        "description": "The business violated the agreed terms or payment schedule of the instalment plan.",
        "suggested_evidence": [
            "Installment agreement",
            "Payment schedule",
            "Terms compliance",
            "Customer consent",
            "Billing records",
        ],
    },
    {
        "network": "Mastercard", "reason_code": "4853",
        "title": "Cardholder Dispute",
        "description": "This general dispute covers quality issues where the customer did not receive the goods or service, or the product was defective or misrepresented.",
        "suggested_evidence": [
            "Delivery proof",
            "Quality records",
            "Product description",
            "Return policy",
            "Customer communication",
        ],
    },
    {
        "network": "Mastercard", "reason_code": "4854",
        "title": "Cardholder Dispute - Not Elsewhere Classified (NEC)",
        "description": "The dispute is valid, but the details do not fit any of the specific reason code categories.",
        "suggested_evidence": [
            "General proof of valid transaction",
            "Delivery/service proof",
            "Authorisation records",
            "Customer agreement",
        ],
    },

    # ---------------- RuPay ----------------
    {
        "network": "Rupay", "reason_code": "1061",
        "title": "Credit Not Processed",
        "description": "The business failed to process the credit after the customer cancelled or returned the goods and services.",
        "suggested_evidence": [
            "Proof of refund generation",
            "Bank statement showing refund amount matching the payment amount",
            "Customer communication showing refund confirmation",
            "Refund policies",
        ],
    },
    {
        "network": "Rupay", "reason_code": "1062",
        "title": "Goods/Services Not As Described",
        "description": "The business delivered goods or services that significantly differed from the description or were defective.",
        "suggested_evidence": [
            "Product description/image screenshots",
            "Proof of product delivery",
            "Customer communication showcasing dissatisfaction",
            "Return policies",
        ],
    },
    {
        "network": "Rupay", "reason_code": "1064",
        "title": "Goods/Services Not Received",
        "description": "The business failed to provide or deliver the goods or services that the customer purchased.",
        "suggested_evidence": [
            "Proof of service/product delivery",
            "Customer interaction showcasing product/service related enquiries",
            "Terms & Conditions showcasing refund & fulfillment policies",
        ],
    },
    {
        "network": "Rupay", "reason_code": "1101",
        "title": "Illegible Fulfilment",
        "description": "The business submitted illegible documents in response to the retrieval request.",
        "suggested_evidence": [
            "Proof of service/product delivery",
            "Customer interaction showcasing product/service related enquiries",
            "Terms & Conditions showcasing refund & fulfillment policies",
        ],
    },
    {
        "network": "Rupay", "reason_code": "1102",
        "title": "Retrieval Request Not Fulfilled",
        "description": "The acquiring partner failed to fulfil the retrieval request within the timeframe or responded with a non-fulfillment message.",
        "suggested_evidence": [
            "Proof of service/product delivery",
            "Customer interaction showcasing product/service related enquiries",
            "Terms & Conditions showcasing refund & fulfillment policies",
        ],
    },
    {
        "network": "Rupay", "reason_code": "1103",
        "title": "Invalid Fulfilment",
        "description": "The business submitted invalid documents in response to the retrieval request.",
        "suggested_evidence": [
            "Proof of service/product delivery",
            "Customer interaction showcasing product/service related enquiries",
            "Terms & Conditions showcasing refund & fulfillment policies",
        ],
    },

    # ---------------- American Express ----------------
    {
        "network": "Amex", "reason_code": "C02",
        "title": "Credit Not Processed",
        "description": "The business failed to process the promised credit or refund to the customer's account.",
        "suggested_evidence": [
            "Credit issuance proof",
            "Refund date/amount",
            "Return not received",
            "Policy compliance",
            "Processing confirmation",
        ],
    },
    {
        "network": "Amex", "reason_code": "C04",
        "title": "Goods/Services Returned or Refused",
        "description": "Customer returned product or refused service. Goods were sent back or service was rejected but no refund issued.",
        "suggested_evidence": [
            "Return not received",
            "Refusal not documented",
            "Restocking completed",
            "Return policy terms",
            "Delivery confirmation",
        ],
    },
    {
        "network": "Amex", "reason_code": "C05",
        "title": "Goods/Services Cancelled",
        "description": "The customer returned the product or refused the service, but the business failed to issue the corresponding refund.",
        "suggested_evidence": [
            "No cancellation received",
            "Cancellation policy",
            "Already shipped/provided",
            "Cancellation deadline passed",
            "Terms proof",
        ],
    },
    {
        "network": "Amex", "reason_code": "C08",
        "title": "Goods/Services Not Received",
        "description": "The business failed to deliver the product or service to the customer, despite having already received payment for the purchase.",
        "suggested_evidence": [
            "Delivery confirmation",
            "Tracking proof",
            "Service completion",
            "Digital delivery logs",
            "Customer signature",
        ],
    },
    {
        "network": "Amex", "reason_code": "C14",
        "title": "Paid by Other Means",
        "description": "The business charged the American Express card despite the customer having already settled the transaction using a different payment method.",
        "suggested_evidence": [
            "Single payment proof",
            "No alternative payment",
            "Payment reconciliation",
            "Customer communication",
            "Order records",
        ],
    },
    {
        "network": "Amex", "reason_code": "C18",
        "title": "No Show",
        "description": "The business charged the customer a no-show fee after the customer failed to appear for the hotel or rental car reservation.",
        "suggested_evidence": [
            "No-show policy disclosure",
            "Cancellation window",
            "Policy agreement",
            "Reservation confirmation",
            "Terms acceptance",
        ],
    },
    {
        "network": "Amex", "reason_code": "C28",
        "title": "Cancellation of Recurring Goods/Services",
        "description": "The business continued the recurring billing and charged the customer for the subscription, despite the customer having cancelled the service.",
        "suggested_evidence": [
            "No cancellation received",
            "Cancellation policy",
            "Continued usage",
            "Service access logs",
            "Terms of service",
        ],
    },
    {
        "network": "Amex", "reason_code": "C31",
        "title": "Goods/Services Not As Described",
        "description": "Quality/description issues. Product or service significantly different from what was advertised or described.",
        "suggested_evidence": [
            "Accurate description",
            "Photos/specifications",
            "Quality standards met",
            "No complaint received",
            "Terms compliance",
        ],
    },
    {
        "network": "Amex", "reason_code": "C32",
        "title": "Goods/Services Damaged or Defective",
        "description": "The business delivered a product or service that significantly differed from what they advertised or described.",
        "suggested_evidence": [
            "Quality control records",
            "No damage claim",
            "Shipping insurance",
            "Packaging adequacy",
            "No return received",
        ],
    },
    {
        "network": "Amex", "reason_code": "M01",
        "title": "Chargeback Authorisation",
        "description": "The business previously agreed to the chargeback and authorised the reversal of this transaction.",
        "suggested_evidence": [
            "No prior agreement",
            "Chargeback authorisation invalid",
            "Documentation of dispute",
            "No consent given",
        ],
    },
    {
        "network": "Amex", "reason_code": "M10",
        "title": "Vehicle Rental – Capital Damages",
        "description": "The customer is disputing the damage charges that the rental company applied to the vehicle.",
        "suggested_evidence": [
            "Damage documentation",
            "Pre-rental inspection",
            "Photos with timestamp",
            "Rental agreement",
            "Insurance coverage",
        ],
    },
    {
        "network": "Amex", "reason_code": "M49",
        "title": "Vehicle Rental – Theft or Loss of Use",
        "description": "The rental company charged the customer for the theft or loss of use of the hired vehicle.",
        "suggested_evidence": [
            "Police report",
            "Theft documentation",
            "Contract terms",
            "Insurance claims",
            "Loss mitigation efforts",
        ],
    },

    # ---------------- Razorpay-native codes ----------------
    {
        "network": "Razorpay", "reason_code": "RZP06",
        "title": "Business Not Responding",
        "description": "The business has failed to respond to the customer's queries following the transaction.",
        "suggested_evidence": [
            "Proof of service/goods delivery to the customer's address within committed timeline",
            "Invoicing details showing transaction amount and date-time",
            "Customer communications over email (not WhatsApp)",
        ],
    },
    {
        "network": "Razorpay", "reason_code": "RZP05",
        "title": "Account Debited but No Confirmation",
        "description": "The customer's account was debited, but the system failed to send confirmation of the transaction.",
        "suggested_evidence": [
            "Service/product invoice in case payment was captured successfully",
            "Internal logs proving payment failed and no money was credited, hence no service/goods provided",
            "Customer interaction showcasing product/service related enquiries",
            "Terms & Conditions showcasing refund & fulfillment policies",
        ],
    },
    {
        "network": "Razorpay", "reason_code": "RZP01",
        "title": "Goods/Services Not Provided",
        "description": "The customer paid for the order, but the business never provided the goods or services.",
        "suggested_evidence": [
            "Proof of service/product delivery",
            "Customer interaction showcasing product/service related enquiries",
            "Terms & Conditions showcasing refund & fulfillment policies",
        ],
    },
    {
        "network": "Razorpay", "reason_code": "RZP04",
        "title": "Refund Not Processed",
        "description": "The business promised a refund but did not process the credit to the customer's account.",
        "suggested_evidence": [
            "Proof of refund generation",
            "Bank statement showing refund amount matching the payment amount",
            "Customer communication showing refund confirmation",
            "Refund policies",
        ],
    },
    {
        "network": "Razorpay", "reason_code": "RZP00",
        "title": "Not Available",
        "description": "This dispute does not fit into any of the existing, specific categories.",
        "suggested_evidence": [
            "Proof of service/goods delivery to the customer's address within committed timeline",
            "Invoicing details showing transaction amount and date-time",
            "Customer communications over email (not WhatsApp)",
            "Refund details in case a successful refund was already generated to the customer",
        ],
    },
]


def seed():
    for entry in SEED_DATA:
        supabase.table("reason_code_config").upsert(
            entry, on_conflict="network,reason_code"
        ).execute()
    print(f"Seeded {len(SEED_DATA)} real Razorpay dispute reason codes.")


if __name__ == "__main__":
    seed()
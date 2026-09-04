import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X, Copy, ArrowLeft, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { InfoTooltip } from "@/components/InfoTooltip";
import { verdictBg, verdictText, verdictSoft } from "@/components/VerdictStrip";
import { getDispute, formatAmount, type Dispute } from "@/lib/disputes";
import { fetchDispute } from "@/lib/dispute-api";
import type { GlossaryKey } from "@/lib/glossary";
import {
  customerSays,
  plainLabel,
  plainSteps,
  verdictWord,
  verdictOneLiner,
  whyMissingMatters,
} from "@/lib/plain";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/disputes/$disputeId")({
  head: () => ({
    meta: [
      { title: "Dispute details · Dispute-Desk" },
      {
        name: "description",
        content:
          "What this customer told their bank, the proof you have, what we recommend doing, and the draft reply letter.",
      },
      { property: "og:title", content: "Dispute details · Dispute-Desk" },
      {
        property: "og:description",
        content:
          "What this customer told their bank, the proof you have, what we recommend doing, and the draft reply letter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ params }) => getDispute(params.disputeId) ?? null,
  component: DisputeDetails,
});

const verdictTerm: Record<"FIGHT" | "HUMAN_REVIEW" | "DROP", GlossaryKey> = {
  FIGHT: "fight",
  HUMAN_REVIEW: "review",
  DROP: "drop",
};

function DisputeDetails() {
  const initialDispute = Route.useLoaderData();
  const { disputeId } = Route.useParams();
  const [d, setD] = useState<Dispute | null>(initialDispute);
  const [loadFailed, setLoadFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [openWhy, setOpenWhy] = useState<string | null>(null);

  useEffect(() => {
    if (initialDispute) return;
    let active = true;
    void fetchDispute(disputeId)
      .then((remote) => {
        if (active) setD(remote);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, [disputeId, initialDispute]);

  if (!d) {
    return (
      <AppShell title="Dispute details">
        <div className="surface-card px-6 py-14 text-center">
          <p className="text-[16px] font-semibold">
            {loadFailed ? "We couldn't find this dispute" : "Loading this dispute…"}
          </p>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {loadFailed
              ? "It may have been closed, or the connected account may be unavailable."
              : "Getting the latest information from your connected account."}
          </p>
          <Link to="/dashboard" className="mt-5 inline-flex text-[14px] font-medium text-primary">
            Back to my disputes
          </Link>
        </div>
      </AppShell>
    );
  }

  const have = d.evidence.filter((e) => e.present).length;
  const urgent = d.daysToDeadline < 2;

  return (
    <AppShell title="Dispute details">
      <Link
        to="/dashboard"
        className="mb-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-primary hover:text-primary-dark"
      >
        <ArrowLeft className="size-4" /> Back to my disputes
      </Link>

      <section className="surface-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className={cn("verdict-dot size-4 rounded-full", verdictBg[d.verdict])} aria-hidden />
          <span className={cn("text-[24px] font-bold tracking-tight", verdictText[d.verdict])}>
            {verdictWord[d.verdict]}
          </span>
          <InfoTooltip term={verdictTerm[d.verdict]} />
          <span className="data-mono ml-auto text-[18px] font-medium">{formatAmount(d.amount)}</span>
        </div>

        <p className="mt-3 text-[15px] leading-relaxed">{verdictOneLiner[d.verdict]}</p>

        <div className={cn("mt-4 rounded-md p-4 text-[14px] leading-relaxed", verdictSoft[d.verdict])}>
          {d.reasoning}
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-3 border-t border-border pt-4 text-[14px] sm:grid-cols-3">
          <div>
            <dt className="text-[13px] text-muted-foreground">Customer says</dt>
            <dd className="mt-0.5 font-medium">“{customerSays[d.id] ?? d.reasonLabel}”</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              Paid with
              <InfoTooltip term="network" />
            </dt>
            <dd className="data-mono mt-0.5">
              {d.network} · bank reason {d.reasonCode}
              <InfoTooltip term="reasonCode" className="ml-1.5" />
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              Respond by
              <InfoTooltip term="deadline" />
            </dt>
            <dd className="mt-0.5">
              <span className="data-mono">
                {new Date(d.deadline).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>{" "}
              <span className={cn(urgent ? "font-semibold text-danger" : "text-muted-foreground")}>
                ({d.daysToDeadline} {d.daysToDeadline === 1 ? "day" : "days"} left)
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="surface-card mt-4 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-[18px] font-semibold tracking-tight">
            What proof do I have?
            <InfoTooltip term="evidence" />
          </h2>
          <span className="text-[14px] text-muted-foreground">
            {have} of {d.evidence.length} items
            <InfoTooltip term="completeness" className="ml-1.5" />
          </span>
        </div>

        <ul className="mt-3">
          {d.evidence.map((item) => (
            <li key={item.label} className="border-b border-border py-3 last:border-b-0">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                    item.present
                      ? "bg-success-soft text-success"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {item.present ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[14px]",
                      item.present ? "font-medium" : "text-muted-foreground",
                    )}
                  >
                    {plainLabel(item.label)}
                  </p>
                  {item.present && item.note ? (
                    <p className="data-mono text-muted-foreground">{item.note}</p>
                  ) : null}
                  {!item.present ? (
                    <>
                      <button
                        onClick={() => setOpenWhy(openWhy === item.label ? null : item.label)}
                        className="mt-0.5 text-[13px] font-medium text-primary hover:text-primary-dark"
                      >
                        Missing — why this matters
                      </button>
                      {openWhy === item.label ? (
                        <p className="mt-1 max-w-lg rounded-md bg-secondary p-3 text-[13px] leading-relaxed text-muted-foreground">
                          {whyMissingMatters(item.label)}
                        </p>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-card mt-4 p-6">
        {d.verdict === "FIGHT" && d.letter ? (
          <>
            <h2 className="flex items-center gap-1.5 text-[18px] font-semibold tracking-tight">
              Your draft reply
              <InfoTooltip term="draftedReply" />
            </h2>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Read it, change anything that doesn't sound like you, then send it to your bank.
            </p>
            <pre className="mt-4 whitespace-pre-wrap rounded-md bg-secondary p-5 font-sans text-[14px] leading-relaxed">
              {d.letter}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(d.letter ?? "");
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              <Copy className="size-4" />
              {copied ? "Copied to your clipboard" : "Copy Reply Letter"}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-[18px] font-semibold tracking-tight">
              {d.verdict === "DROP"
                ? "We don't recommend fighting this one"
                : "We'd like a person to decide this one"}
            </h2>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
              Here's why: {d.reasoning}
            </p>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
              {d.verdict === "DROP"
                ? "Letting this one go isn't a failure — it saves you the time and the fee of a reply that probably wouldn't change the outcome."
                : "If you know something we don't — a message from the customer, a receipt — add it and the recommendation may change."}
            </p>
          </>
        )}
      </section>

      <section className="mt-4">
        <button
          onClick={() => setShowSteps((s) => !s)}
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-primary hover:text-primary-dark"
        >
          <ChevronDown className={cn("size-4 transition-transform", showSteps && "rotate-180")} />
          See what we checked
        </button>
        <InfoTooltip term="auditTrail" className="ml-2" />

        {showSteps ? (
          <ol className="surface-card mt-3 p-6">
            {plainSteps(d).map((s, i, arr) => (
              <li key={s.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-border" />
                  {i < arr.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
                </div>
                <div className="pb-4 last:pb-0">
                  <p className="text-[14px] font-medium">{s.title}</p>
                  <p className="text-[13px] text-muted-foreground">{s.date}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : null}
      </section>
    </AppShell>
  );
}

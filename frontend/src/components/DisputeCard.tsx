import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { verdictBg, verdictText } from "@/components/VerdictStrip";
import { formatAmount, type Dispute } from "@/lib/disputes";
import { verdictWord } from "@/lib/plain";
import type { GlossaryKey } from "@/lib/glossary";
import { cn } from "@/lib/utils";

const verdictTerm: Record<Dispute["verdict"], GlossaryKey> = {
  FIGHT: "fight",
  HUMAN_REVIEW: "review",
  DROP: "drop",
};

export function DisputeCard({ d }: { d: Dispute }) {
  const have = d.evidence.filter((e) => e.present).length;

  return (
    <article className="surface-card p-5 transition-shadow duration-150 hover:shadow-lift">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={cn("verdict-dot size-3 rounded-full", verdictBg[d.verdict])} aria-hidden />
        <span className={cn("text-[16px] font-bold tracking-tight", verdictText[d.verdict])}>
          {verdictWord[d.verdict]}
        </span>
        <InfoTooltip term={verdictTerm[d.verdict]} />
        <span className="data-mono ml-auto text-[16px] font-medium">{formatAmount(d.amount)}</span>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[15px] font-medium">
        {d.reasonLabel}
        <InfoTooltip term="reasonCode" />
      </p>

      <details className="mt-3 text-[13px] text-muted-foreground">
        <summary className="cursor-pointer select-none font-medium text-foreground">More context</summary>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>{d.network} · bank reason {d.reasonCode}</span>
          <span className="flex items-center gap-1.5">
            {have} of {d.evidence.length} proofs
            <InfoTooltip term="evidence" />
          </span>
        </div>
      </details>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-3 border-t border-border pt-4">
          <span className={cn("flex items-center gap-1.5 text-[14px]", d.daysToDeadline < 2 && "font-semibold text-danger")}>
          {d.daysToDeadline} {d.daysToDeadline === 1 ? "day" : "days"} left
          <InfoTooltip term="deadline" />
        </span>

        <Link
          to="/disputes/$disputeId"
          params={{ disputeId: d.id }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          View details <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

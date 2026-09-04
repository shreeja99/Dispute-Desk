import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { DisputeCard } from "@/components/DisputeCard";
import { InfoTooltip } from "@/components/InfoTooltip";
import { needsAttention } from "@/lib/plain";

export const Route = createFileRoute("/attention")({
  head: () => ({
    meta: [
      { title: "Needs My Attention · Dispute-Desk" },
      {
        name: "description",
        content:
          "A short to-do list: the disputes that need a decision from you, or where the deadline is almost here.",
      },
      { property: "og:title", content: "Needs My Attention · Dispute-Desk" },
      {
        property: "og:description",
        content:
          "A short to-do list: the disputes that need a decision from you, or where the deadline is almost here.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AttentionPage,
});

function AttentionPage() {
  const rows = needsAttention().sort((a, b) => a.daysToDeadline - b.daysToDeadline);

  return (
    <AppShell
      title="Needs My Attention"
      intro={
        <p>
          Only two kinds of cases show up here: ones we couldn't decide on our own, and ones where
          the deadline
          <InfoTooltip term="deadline" className="mx-1" />
          is less than two days away. Everything else can wait.
        </p>
      }
    >
      <div className="flex flex-col gap-4">
        {rows.map((d) => (
          <DisputeCard key={d.id} d={d} />
        ))}

        {rows.length === 0 ? (
          <div className="surface-card px-6 py-14 text-center">
            <p className="text-[16px] font-semibold">Nothing needs you right now</p>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Come back when a new dispute arrives, or open My Disputes to review the rest.
            </p>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

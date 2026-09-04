import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { InfoTooltip } from "@/components/InfoTooltip";
import { formatAmount } from "@/lib/disputes";
import { history } from "@/lib/plain";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History · Dispute-Desk" },
      {
        name: "description",
        content:
          "Every dispute you have already handled, whether you contested it or let it go, and how it ended.",
      },
      { property: "og:title", content: "History · Dispute-Desk" },
      {
        property: "og:description",
        content:
          "Every dispute you have already handled, whether you contested it or let it go, and how it ended.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <AppShell
      title="History"
      intro={
        <p>
          Cases that are finished. Nothing here needs action — it's just a record of what happened
          and what you did about each payment your customer asked their bank to reverse
          <InfoTooltip term="dispute" className="mx-1" />.
        </p>
      }
    >
      <div className="surface-card overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 font-medium text-muted-foreground">Customer said</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  Paid with
                  <InfoTooltip term="network" />
                </span>
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Amount</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">What you did</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Result</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Closed</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="border-b border-border last:border-b-0">
                <td className="px-5 py-4">“{h.customerSays}”</td>
                <td className="data-mono px-5 py-4">{h.network}</td>
                <td className="data-mono px-5 py-4">{formatAmount(h.amount)}</td>
                <td className="px-5 py-4">{h.action}</td>
                <td
                  className={cn(
                    "px-5 py-4 font-medium",
                    h.outcome === "Won" && "text-success",
                    h.outcome === "Lost" && "text-danger",
                    h.outcome === "Closed" && "text-muted-foreground",
                  )}
                >
                  {h.outcome === "Won"
                    ? "You kept the money"
                    : h.outcome === "Lost"
                      ? "Money returned to customer"
                      : "Let it go"}
                </td>
                <td className="data-mono px-5 py-4 text-muted-foreground">{h.closedOn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

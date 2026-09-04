import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DisputeCard } from "@/components/DisputeCard";
import { InfoTooltip } from "@/components/InfoTooltip";
import { disputes as demoDisputes, type Dispute, type Verdict } from "@/lib/disputes";
import { fetchDisputes } from "@/lib/dispute-api";
import { restoreSupabaseSessionFromUrl, supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Disputes · Dispute-Desk" },
      { name: "description", content: "See your payment disputes and what we recommend doing about each one." },
      { property: "og:title", content: "My Disputes · Dispute-Desk" },
      { property: "og:description", content: "See your payment disputes and what we recommend doing about each one." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const filters: { value: Verdict | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" }, { value: "FIGHT", label: "Fight" }, { value: "DROP", label: "Drop" }, { value: "HUMAN_REVIEW", label: "Needs review" },
];

function DashboardPage() {
  const [filter, setFilter] = useState<Verdict | "ALL">("ALL");
  const [rows, setRows] = useState<Dispute[]>(demoDisputes);
  const [sourceNote, setSourceNote] = useState("Demo data");

  useEffect(() => {
    let active = true;
    void restoreSupabaseSessionFromUrl().catch(() => null).then(() => supabase.auth.getSession()).then(({ data }) => {
      if (data.session) window.localStorage.removeItem("dispute-desk-demo");
      return fetchDisputes(data.session?.user.id);
    }).then((remote) => {
      if (active && remote.length) {
        setRows(remote);
        setSourceNote("Connected account");
      }
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const visible = rows.filter((d) => filter === "ALL" || d.verdict === filter).sort((a, b) => a.daysToDeadline - b.daysToDeadline);
  return (
    <AppShell title="My Disputes" intro={<p>Payment reversals <InfoTooltip term="dispute" className="mx-1" /> <span className="text-foreground">· {sourceNote}</span></p>}>
      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => <button key={f.value} onClick={() => setFilter(f.value)} className={cn("rounded-full border px-4 py-2 text-[14px] font-medium transition-colors", filter === f.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground")}>{f.label}</button>)}
      </div>
      <div className="flex flex-col gap-4">
        {visible.map((d) => <DisputeCard key={d.id} d={d} />)}
        {!visible.length && <div className="surface-card px-6 py-14 text-center"><p className="text-[16px] font-semibold">No disputes match this filter</p><p className="mt-1 text-[14px] text-muted-foreground">Try All disputes.</p></div>}
      </div>
    </AppShell>
  );
}
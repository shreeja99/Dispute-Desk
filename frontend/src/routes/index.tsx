import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, FileText, MessageCircle, SearchCheck } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dispute-Desk · Payment disputes made clear" },
      {
        name: "description",
        content:
          "See your payment disputes and know what to do about each one, in plain English.",
      },
      { property: "og:title", content: "Dispute-Desk · Payment disputes made clear" },
      {
        property: "og:description",
        content:
          "See your payment disputes and know what to do about each one, in plain English.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const steps = [
  { icon: SearchCheck, title: "Review the dispute", body: "See the case and proof you have." },
  { icon: Check, title: "Get a clear verdict", body: "Fight, Drop, or Needs Review." },
  { icon: FileText, title: "Start with a draft", body: "Edit the response before sending." },
  { icon: MessageCircle, title: "Make the final call", body: "You stay in control." },
];

const trustPoints = [
  "Confidence-scored verdict engine",
  "Reason-code evidence matrix",
  "Voice and text intake pipeline",
];

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const checkReturningUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (active && (data.session || window.localStorage.getItem("dispute-desk-demo"))) {
        navigate({ to: "/dashboard", replace: true });
      }
    };
    void checkReturningUser();
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-lift">
        <div className="mx-auto flex min-h-[72px] max-w-[1180px] items-center px-6">
          <Link to="/" className="flex items-center gap-2" aria-label="Go to Dispute-Desk home">
            <img src="/Dispute-Desk.png" alt="Dispute-Desk logo" className="size-8 rounded-md object-cover shadow-sm" />
            <span className="text-[15px] font-semibold tracking-tight">Dispute-Desk</span>
          </Link>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-foreground">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hero-video absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-foreground/55" aria-hidden="true" />
        <div className="relative z-10 mx-auto grid w-full max-w-5xl items-center gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div className="text-primary-foreground">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">For small business owners</p>
          <h1 className="mt-4 max-w-xl text-[42px] font-bold leading-[1.1] tracking-tight md:text-[56px]">Dispute-Desk</h1>
          <p className="mt-4 max-w-lg text-[20px] font-medium leading-snug">Payment disputes, made clear.</p>
          <Button asChild size="lg" className="mt-8 h-12 px-6 text-[15px]">
            <Link to="/sign-in">Get Started <ArrowRight className="size-4" /></Link>
          </Button>
          </div>
        <div className="surface-card bg-card/95 p-6 shadow-lift md:p-8">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">One clear view</p>
          <p className="mt-3 text-[22px] font-semibold tracking-tight">Know what to do next.</p>
          <div className="mt-6 flex flex-col gap-4 text-[14px]">
            <p className="flex gap-3"><span className="mt-0.5 size-2.5 shrink-0 rounded-full bg-success" /><span>See the verdict.</span></p>
            <p className="flex gap-3"><span className="mt-0.5 size-2.5 shrink-0 rounded-full bg-warning" /><span>Check the evidence.</span></p>
            <p className="flex gap-3"><span className="mt-0.5 size-2.5 shrink-0 rounded-full bg-danger" /><span>Choose your response.</span></p>
          </div>
        </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-border bg-card px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">How it works</p>
          <h2 className="mt-3 text-[30px] font-bold tracking-tight">Four simple steps.</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-4">
            {steps.map(({ icon: Icon, title, body }, index) => (
              <div key={title} className="relative">
                <span className="flex size-10 items-center justify-center rounded-md bg-accent text-primary"><Icon className="size-5 stroke-[2.25]" /></span>
                <p className="mt-4 text-[15px] font-semibold">{index + 1}. {title}</p>
                <p className="mt-1 text-[14px] text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="homepage-trust px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary-dark">Why it is different</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {trustPoints.map((point) => <div key={point} className="surface-card bg-card/90 p-5 text-[15px] font-semibold shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lift">{point}</div>)}
          </div>
        </div>
      </section>

      <section className="homepage-cta border-t border-primary-dark px-6 py-16 text-center text-primary-foreground md:py-20">
        <h2 className="text-[30px] font-bold tracking-tight">Ready to make disputes clear?</h2>
        <Button asChild size="lg" className="mt-7 h-12 px-6 text-[15px]">
          <Link to="/sign-in">Get Started <ArrowRight className="size-4" /></Link>
        </Button>
      </section>
    </main>
  );
}

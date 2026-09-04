import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Chrome } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sign-in")({
  head: () => ({ meta: [
    { title: "Sign in · Dispute-Desk" },
    { name: "description", content: "Sign in to view and manage your payment disputes." },
    { property: "og:title", content: "Sign in · Dispute-Desk" },
    { property: "og:description", content: "Sign in to view and manage your payment disputes." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => { if (active && data.session) navigate({ to: "/dashboard", replace: true }); });
    return () => { active = false; };
  }, [navigate]);

  const signIn = async () => {
    setLoading(true); setError("");
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    if (signInError) setError(signInError.message);
    setLoading(false);
  };

  const guest = () => { window.localStorage.setItem("dispute-desk-demo", "true"); void navigate({ to: "/dashboard" }); };
  return <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12"><div className="w-full max-w-md"><Link to="/" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back</Link><section className="surface-card mt-8 p-7 md:p-9"><img src="/Dispute-Desk.png" alt="Dispute-Desk logo" className="size-10 rounded-md object-cover shadow-sm" /><h1 className="mt-7 text-[28px] font-bold tracking-tight">Sign in to Dispute-Desk</h1><p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">See your disputes in one clear place. You can also look around the demo without an account.</p><Button onClick={signIn} disabled={loading} size="lg" className="mt-8 h-12 w-full text-[15px]"><Chrome className="size-4" />{loading ? "Opening Google…" : "Sign in with Google"}</Button>{error && <p role="alert" className="mt-4 text-[13px] text-danger">{error}</p>}<button onClick={guest} className="mx-auto mt-6 flex items-center gap-1 text-[14px] font-medium text-primary hover:underline">Continue as guest (demo) <ArrowRight className="size-4" /></button></section></div></main>;
}
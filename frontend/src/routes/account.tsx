import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LogOut, Mail, ShieldCheck, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { restoreSupabaseSessionFromUrl, supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account · Dispute-Desk" },
      { name: "description", content: "View your Dispute-Desk account details." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [authError, setAuthError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [demoSession, setDemoSession] = useState(false);

  useEffect(() => {
    let active = true;
    const applyUser = (nextUser: User | null) => {
      setUser(nextUser);
      setEmail(nextUser?.email ?? "");
      setName(nextUser?.user_metadata?.full_name ?? nextUser?.user_metadata?.name ?? "");
      setProvider(nextUser?.app_metadata?.provider ?? (nextUser ? "Email" : ""));
    };

    void restoreSupabaseSessionFromUrl().catch((error: unknown) => {
      if (active) setAuthError(error instanceof Error ? error.message : "Could not restore the sign-in session.");
      return null;
    }).then(() => supabase.auth.getSession()).then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthError(error.message);
      applyUser(data.session?.user ?? null);
      if (data.session) {
        window.localStorage.removeItem("dispute-desk-demo");
      } else {
        setDemoSession(window.localStorage.getItem("dispute-desk-demo") === "true");
      }
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        applyUser(session?.user ?? null);
        if (session) {
          window.localStorage.removeItem("dispute-desk-demo");
          setDemoSession(false);
        }
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const logOut = async () => {
    setLoggingOut(true);
    window.localStorage.removeItem("dispute-desk-demo");
    await supabase.auth.signOut();
    await navigate({ to: "/", replace: true });
  };

  const isGuest = !user && demoSession;

  return (
    <AppShell title="My Account" intro={<p>Profile and session</p>}>
      <Link to="/dashboard" className="mb-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-primary">
        <ArrowLeft className="size-4" /> Back to my disputes
      </Link>
      <section className="surface-card overflow-hidden">
        <div className="flex items-center gap-4 border-b border-border bg-secondary/60 p-6 md:p-8">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
            <UserCircle className="size-8" />
          </div>
          <div>
            <h2 className="text-[20px] font-bold tracking-tight">{loading ? "Loading account..." : name || (isGuest ? "Guest account" : "No active account")}</h2>
            <p className="mt-1 text-[14px] text-muted-foreground">{loading ? "Checking session" : isGuest ? "Demo session" : "Sign in to view profile"}</p>
            {authError && <p className="mt-1 text-[13px] text-danger">{authError}</p>}
          </div>
        </div>
        <dl className="divide-y divide-border p-6 md:p-8">
          <div className="flex items-center gap-3 py-4 first:pt-0">
            <Mail className="size-5 text-muted-foreground" />
            <div>
              <dt className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Email</dt>
              <dd className="mt-1 text-[14px] font-medium">{loading ? "Loading..." : email || (isGuest ? "Guest demo - no email" : "No email available")}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3 py-4 last:pb-0">
            <ShieldCheck className="size-5 text-muted-foreground" />
            <div>
              <dt className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Sign-in method</dt>
              <dd className="mt-1 text-[14px] font-medium capitalize">{loading ? "Loading..." : provider || (isGuest ? "Guest demo" : "No active session")}</dd>
            </div>
          </div>
        </dl>
        <div className="flex flex-wrap gap-3 border-t border-border p-6 md:p-8">
          <Button variant="outline" onClick={() => void navigate({ to: "/dashboard" })}>My disputes</Button>
          <Button variant="outline" onClick={() => void logOut()} disabled={loggingOut}>
            <LogOut className="size-4" />
            {loggingOut ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </section>
    </AppShell>
  );
}

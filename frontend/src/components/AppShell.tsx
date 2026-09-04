import { Link, useNavigate } from "@tanstack/react-router";
import { Inbox, Bell, Archive, LogOut, Search, PlusCircle, UserCircle, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

const nav: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/dashboard", label: "My Disputes", icon: Inbox },
  { to: "/log-dispute", label: "Log a Dispute", icon: PlusCircle },
  { to: "/attention", label: "Needs My Attention", icon: Bell },
  { to: "/history", label: "History", icon: Archive },
];

export function AppShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const logOut = async () => {
    setLoggingOut(true);
    window.localStorage.removeItem("dispute-desk-demo");
    await supabase.auth.signOut();
    await navigate({ to: "/", replace: true });
    setLoggingOut(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card shadow-lift">
        <div className="mx-auto grid min-h-[72px] max-w-[1180px] grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2 md:gap-5 md:px-6">
          <Link to="/dashboard" className="flex shrink-0 items-center gap-2" aria-label="Go to My Disputes">
            <img src="/Dispute-Desk.png" alt="Dispute-Desk logo" className="size-8 rounded-md object-cover shadow-sm" />
            <span className="hidden text-[15px] font-semibold tracking-tight sm:inline">Dispute-Desk</span>
          </Link>
          <nav className="mx-auto flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-lg border border-border bg-background/70 p-1" aria-label="Main navigation">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/dashboard" }}
                className="relative flex shrink-0 items-center gap-2.5 rounded-md border-b-2 border-transparent px-2.5 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:border-primary-dark data-[status=active]:bg-primary data-[status=active]:font-semibold data-[status=active]:text-primary-foreground data-[status=active]:shadow-sm sm:px-3"
              >
                <Icon className="size-4 shrink-0 stroke-[2.25]" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-end gap-2">
            <div className="hidden shrink-0 items-center gap-2 rounded-md border border-border px-3 py-1.5 xl:flex">
              <Search className="size-4 text-muted-foreground" />
              <input placeholder="Search" aria-label="Search disputes" className="w-24 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open my account"
                  title="My account"
                  className="flex size-10 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent hover:text-primary"
                >
                  <UserCircle className="size-5 stroke-[2.25]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void navigate({ to: "/account" })}>
                  <UserCircle />
                  Account details
                </DropdownMenuItem>
                <DropdownMenuItem disabled={loggingOut} onSelect={() => void logOut()}>
                  <LogOut />
                  {loggingOut ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="border-t border-border bg-background/60">
          <div className="mx-auto max-w-[1180px] px-4 py-3 md:px-6">
            <h1 className="truncate text-[20px] font-bold tracking-tight">{title}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] px-4 py-8 md:px-6">
        {intro ? <div className="mb-6 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">{intro}</div> : null}
        {children}
      </main>
    </div>
  );
}

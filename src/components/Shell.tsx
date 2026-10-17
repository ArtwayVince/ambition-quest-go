import { Link, useLocation } from "@tanstack/react-router";
import { Compass, Gamepad2, Home, Target, User, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useStore, levelOf, XP_PER_LEVEL, type Role } from "@/lib/store";
import { naira } from "@/lib/data";

const NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/play", label: "Play", icon: Gamepad2 },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/readiness", label: "Ready", icon: ShieldCheck },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const { s, set } = useStore();
  const loc = useLocation();
  const lvl = levelOf(s.xp);
  const pct = ((s.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link to="/" className="font-display text-lg font-extrabold tracking-tight">
            JET<span className="text-primary">OFF</span>
          </Link>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className="rounded-full bg-secondary px-2 py-1" title="Practice currency for missions, not real money. No cash value and no withdrawals.">
              🎮 {naira(s.wallet)} <span className="hidden sm:inline">practice</span>
            </span>
            <span className="rounded-full bg-primary px-2 py-1 font-bold text-primary-foreground">Lv {lvl}</span>
            {s.user ? (
              <select
                aria-label="Switch demo role — this is not secure access control"
                value={s.role}
                onChange={(e) => set((p) => ({ ...p, role: e.target.value as Role }))}
                className="rounded-full border border-border bg-card px-2 py-1"
              >
                <option value="explorer">Explorer</option>
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <Link to="/auth" className="flex items-center gap-1 rounded-full border border-border px-2 py-1">
                <User className="h-3 w-3" /> Sign in
              </Link>
            )}
          </div>
        </div>
        <div className="h-1 bg-muted">
          <div className="h-full bg-sunset transition-all" style={{ width: `${pct}%` }} />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-3xl px-4 pb-6 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-3">
          <Link to="/bookings">My requests</Link>
          <Link to="/provider">Providers</Link>
          {s.role === "admin" && <Link to="/admin">Admin</Link>}
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/safety">Safety</Link>
        </div>
        <p className="mt-2">Your dream. Your journey. We stand with you until the end.</p>
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = loc.pathname.startsWith(to);
            return (
              <Link key={to} to={to} className={`flex flex-col items-center gap-1 py-3 text-xs ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card p-4 ${className}`}>{children}</div>;
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-xs text-foreground">⚠️ {children}</p>;
}

export function Btn({ children, onClick, variant = "primary", type = "button", disabled }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost"; type?: "button" | "submit"; disabled?: boolean }) {
  const cls = variant === "primary" ? "bg-sunset text-primary-foreground" : "border border-border bg-secondary text-secondary-foreground";
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:opacity-40 ${cls}`}>
      {children}
    </button>
  );
}

export const meta = (title: string, description: string) => ({
  meta: [
    { title: `${title} — JET OFF` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — JET OFF` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});

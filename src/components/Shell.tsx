import { Link, useLocation } from "@tanstack/react-router";
import {
  Compass,
  Gamepad2,
  Home,
  Target,
  User,
  ShieldCheck,
  Menu,
  LayoutDashboard,
  ClipboardList,
  Store,
  FilePlus2,
  Gavel,
  Map,
  FileText,
  Lock,
  LifeBuoy,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useStore, levelOf, XP_PER_LEVEL, type Role } from "@/lib/store";
import { naira } from "@/lib/data";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NavigationContext = createContext({ collapsed: false, toggle: () => {} });

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <NavigationContext.Provider
      value={{ collapsed, toggle: () => setCollapsed((value) => !value) }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

const NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/play", label: "Play", icon: Gamepad2 },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/readiness", label: "Ready", icon: ShieldCheck },
] as const;

type Item = {
  to: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
  also?: string[];
  hint?: string;
};
const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Overview",
    items: [
      { to: "/", label: "Welcome", icon: Home, exact: true },
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/goals", label: "Goals & savings", icon: Target },
    ],
  },
  {
    title: "Experiences",
    items: [
      { to: "/explore", label: "Explore experiences", icon: Compass, also: ["/experiences"] },
      { to: "/tour", label: "Resort tour", icon: Map, hint: "Pilot" },
      { to: "/bookings", label: "My requests", icon: ClipboardList },
      { to: "/readiness", label: "Readiness coach", icon: ShieldCheck },
    ],
  },
  { title: "Progress", items: [{ to: "/play", label: "Play · XP & missions", icon: Gamepad2 }] },
  {
    title: "Providers",
    items: [
      { to: "/provider", label: "Providers", icon: Store, exact: true },
      { to: "/provider/apply", label: "Provider application", icon: FilePlus2 },
      { to: "/admin", label: "Admin moderation", icon: Gavel, hint: "Demo" },
    ],
  },
  {
    title: "Policies",
    items: [
      { to: "/terms", label: "Terms", icon: FileText },
      { to: "/privacy", label: "Privacy", icon: Lock },
      { to: "/safety", label: "Safety", icon: LifeBuoy },
    ],
  },
];

const isActive = (path: string, it: Item) => {
  const match = (p: string) =>
    it.exact || p === "/" ? path === p || path === p + "/" : path === p || path.startsWith(p + "/");
  return match(it.to) || (it.also ?? []).some(match);
};

function NavList({
  path,
  onNavigate,
  collapsed = false,
}: {
  path: string;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  return (
    <nav aria-label="Main navigation" className="space-y-5">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <p
            className={
              collapsed
                ? "sr-only"
                : "px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
            }
          >
            {g.title}
          </p>
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const active = isActive(path, it);
              const Icon = it.icon;
              return (
                <li key={it.to}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={it.to}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        aria-label={it.label}
                        className={`flex h-10 items-center rounded-xl border-l-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${collapsed ? "justify-center px-0" : "gap-3 px-3"} ${active ? "border-primary bg-primary/15 font-semibold text-primary" : "border-transparent text-foreground hover:bg-secondary"}`}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span className={collapsed ? "sr-only" : "flex-1"}>{it.label}</span>
                        {it.hint && !collapsed && (
                          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {it.hint}
                          </span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">
                        {it.label}
                        {it.hint ? ` · ${it.hint}` : ""}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function NavigationMenu({ className = "" }: { className?: string }) {
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [loc.pathname]);
  return (
    <TooltipProvider>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation menu"
            className={className}
          >
            <Menu className="h-5 w-5" aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 overflow-y-auto p-4">
          <SheetHeader className="text-left">
            <SheetTitle className="font-display">
              JET<span className="text-primary">OFF</span>
            </SheetTitle>
            <SheetDescription className="text-xs">All areas of the prototype</SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <NavList path={loc.pathname} onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { s, set } = useStore();
  const loc = useLocation();
  const { collapsed, toggle } = useContext(NavigationContext);
  const lvl = levelOf(s.xp);
  const pct = ((s.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  return (
    <div
      className={`min-h-screen bg-background pb-24 text-foreground lg:pb-0 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}
    >
      <aside
        aria-label="Desktop sidebar"
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-card lg:flex ${collapsed ? "w-20" : "w-64"}`}
      >
        <div
          className={`flex items-center py-4 ${collapsed ? "flex-col gap-3 px-2" : "justify-between px-5"}`}
        >
          <Link
            to="/"
            aria-label="JET OFF Welcome"
            className="font-display text-lg font-extrabold tracking-tight"
          >
            {collapsed ? (
              <>
                J<span className="text-primary">O</span>
              </>
            ) : (
              <>
                JET<span className="text-primary">OFF</span>
              </>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls="desktop-navigation"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen aria-hidden /> : <PanelLeftClose aria-hidden />}
          </Button>
        </div>
        <div id="desktop-navigation" className="flex-1 overflow-y-auto px-2 pb-6">
          <TooltipProvider>
            <NavList path={loc.pathname} collapsed={collapsed} />
          </TooltipProvider>
        </div>
      </aside>
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <NavigationMenu className="-ml-1 rounded-lg hover:bg-secondary lg:hidden" />
          <Link to="/" className="font-display text-lg font-extrabold tracking-tight lg:hidden">
            JET<span className="text-primary">OFF</span>
          </Link>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span
              className="rounded-full bg-secondary px-2 py-1"
              title="Practice currency for missions, not real money. No cash value and no withdrawals."
            >
              🎮 {naira(s.wallet)} <span className="hidden sm:inline">practice</span>
            </span>
            <span className="rounded-full bg-primary px-2 py-1 font-bold text-primary-foreground">
              Lv {lvl}
            </span>
            {s.user ? (
              <select
                aria-label="Switch demo role — this is not secure access control"
                value={s.role}
                onChange={(e) => set((p) => ({ ...p, role: e.target.value as Role }))}
                className="rounded-full border border-border bg-card px-2 py-1"
              >
                <option value="explorer">Explorer</option>
                <option value="provider">Provider</option>
              </select>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1 rounded-full border border-border px-2 py-1"
              >
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
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active =
              loc.pathname.startsWith(to) ||
              (to === "/explore" && loc.pathname.startsWith("/experiences"));
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-3 text-xs ${active ? "text-primary" : "text-muted-foreground"}`}
              >
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
  return (
    <div className={`rounded-2xl border border-border bg-card p-4 ${className}`}>{children}</div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-xs text-foreground">
      ⚠️ {children}
    </p>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const cls =
    variant === "primary"
      ? "bg-sunset text-primary-foreground"
      : "border border-border bg-secondary text-secondary-foreground";
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:opacity-40 ${cls}`}
    >
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

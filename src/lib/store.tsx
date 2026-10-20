import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "explorer" | "provider" | "admin";
export type Attr = "Mindset" | "Presence" | "Discipline" | "Network";
export type Goal = { id: string; title: string; target: number; saved: number; log: { amt: number; at: string }[] };
export type Request = { id: string; expId: string; title: string; date: string; note: string; at: string };
export type ProviderApp = { id: string; business: string; category: string; contact: string; description: string; status: "pending" | "approved" | "rejected"; at: string };

export type State = {
  user: { name: string; email: string } | null;
  role: Role;
  xp: number;
  attrs: Record<Attr, number>;
  wallet: number;
  budgetCompleted: number[];
  goals: Goal[];
  /** Sequential, self-reported completed action indexes for each ambition. */
  goalSteps: Record<string, number[]>;
  requests: Request[];
  apps: ProviderApp[];
  missions: { m1: boolean; m2: boolean; m3: boolean; m3Option?: "A" | "B"; aspiration?: string; reflection?: string; photo?: string };
  stage: number;
  stageNotes: { stage: number; note: string; at: string }[];
  streak: number;
  lastDay?: string;
  dailyDone: string[];
  toured: string[];
  readiness: number;
  badges: string[];
};

const initial: State = {
  user: null, role: "explorer", xp: 0,
  attrs: { Mindset: 0, Presence: 0, Discipline: 0, Network: 0 },
  wallet: 100000, budgetCompleted: [], goals: [], goalSteps: {}, requests: [], apps: [],
  missions: { m1: false, m2: false, m3: false },
  stage: 0, stageNotes: [], streak: 0, dailyDone: [], toured: [], readiness: 0, badges: [],
};

export const XP_PER_LEVEL = 100;
export const STAGE_NOTE_MIN_LENGTH = 20;
export const shouldAwardScenarioXp = (completed: number[], scenarioIndex: number) =>
  !completed.includes(scenarioIndex);
export const isMeaningfulReflection = (note: string) =>
  note.trim().length >= STAGE_NOTE_MIN_LENGTH;
export const levelOf = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;

type Ctx = {
  s: State;
  set: (fn: (s: State) => State) => void;
  gain: (xp: number, attrs?: Partial<Record<Attr, number>>) => void;
  badge: (b: string) => void;
  reset: () => void;
};
const C = createContext<Ctx | null>(null);
const KEY = "jetoff-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setS({ ...initial, ...JSON.parse(raw) }); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(s)); }, [s, ready]);

  const set = (fn: (s: State) => State) => setS(fn);
  const badge = (b: string) => setS((p) => (p.badges.includes(b) ? p : { ...p, badges: [...p.badges, b] }));
  const gain = (xp: number, attrs: Partial<Record<Attr, number>> = {}) =>
    setS((p) => {
      const a = { ...p.attrs };
      (Object.keys(attrs) as Attr[]).forEach((k) => (a[k] += attrs[k] ?? 0));
      const nx = p.xp + xp;
      const leveled = levelOf(nx) > levelOf(p.xp);
      const badges = leveled && !p.badges.includes(`Level ${levelOf(nx)}`) ? [...p.badges, `Level ${levelOf(nx)}`] : p.badges;
      return { ...p, xp: nx, attrs: a, badges };
    });
  const reset = () => setS(initial);
  return <C.Provider value={{ s, set, gain, badge, reset }}>{children}</C.Provider>;
}

export function useStore() {
  const c = useContext(C);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}

export const today = () => new Date().toISOString().slice(0, 10);

/** Encouraging, non-punitive coaching for a saving entry. */
export function coach(saved: number, target: number, amt: number) {
  const pct = target ? (saved / target) * 100 : 0;
  if (amt <= 0) return "Every journey has pauses. Come back whenever you're ready.";
  if (saved <= 1000) return `₦${amt.toLocaleString()} is a genuine first step. Starting is the hardest part — you did it.`;
  if (pct < 10) return "Small, steady steps build the habit. Keep showing up.";
  if (pct < 50) return "Real progress. You're building discipline that lasts.";
  return "You're more than halfway on your record. Stay steady — and keep it realistic.";
}

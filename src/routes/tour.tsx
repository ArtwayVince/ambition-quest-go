import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Card, Btn, Notice, meta } from "@/components/Shell";
import { TOUR_STOPS } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/tour")({
  head: () => meta("Yuby Resort Tour", "Interactive walkthrough of the proposed pilot resort: gate, reception, facilities and protocols."),
  component: Tour,
});

function Tour() {
  const { s, set, gain } = useStore();
  const [mode, setMode] = useState<"walk" | "map">("walk");
  const [i, setI] = useState(0);
  const stop = TOUR_STOPS[i] ?? TOUR_STOPS[0]!;
  const checkedIn = s.toured.includes("reception");
  const locked = (id: string) => !checkedIn && TOUR_STOPS.findIndex((t) => t.id === id) > 3;

  const visit = (k: number) => {
    const t = TOUR_STOPS[k]; if (!t) return;
    if (locked(t.id)) return;
    setI(k);
    if (!s.toured.includes(t.id)) {
      set((p) => ({ ...p, toured: [...p.toured, t.id] }));
      gain(5, { Presence: 3 });
    }
  };

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Yuby Resort Tour</h1>
      <Notice>Demonstrator: Yuby Resort is a proposed pilot. Layout, photos, prices and policies are placeholders pending venue confirmation and approved materials.</Notice>
      <div className="mt-4 flex gap-2">
        <Btn variant={mode === "walk" ? "primary" : "ghost"} onClick={() => setMode("walk")}>Walkthrough</Btn>
        <Btn variant={mode === "map" ? "primary" : "ghost"} onClick={() => setMode("map")}>Interactive map</Btn>
      </div>

      {mode === "map" ? (
        <div className="relative mt-4 aspect-[4/3] rounded-2xl border border-border bg-secondary">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline points={TOUR_STOPS.slice(0, 4).map((t) => `${t.x},${t.y}`).join(" ")} fill="none" stroke="var(--primary)" strokeWidth="0.6" strokeDasharray="2 1" />
          </svg>
          {TOUR_STOPS.map((t, k) => (
            <button key={t.id} onClick={() => visit(k)} style={{ left: `${t.x}%`, top: `${t.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-[10px] font-semibold ${locked(t.id) ? "bg-muted text-muted-foreground" : s.toured.includes(t.id) ? "bg-success text-primary-foreground" : "bg-primary text-primary-foreground"}`}>
              {locked(t.id) ? "🔒 " : ""}{t.name}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">Stop {i + 1} of {TOUR_STOPS.length}</p>
      )}

      <Card className="mt-4">
        <h2 className="text-xl font-bold">{stop.name}</h2>
        <p className="mt-1 text-sm">{stop.info}</p>
        <p className="mt-2 text-sm"><b>Protocol:</b> {stop.protocol}</p>
        <p className="mt-2 text-xs text-muted-foreground">Verified facility price: pending verification</p>
        {stop.id === "reception" && !checkedIn && <p className="mt-2 text-sm text-primary">Visit reception to unlock the facilities.</p>}
        {mode === "walk" && (
          <div className="mt-3 flex gap-2">
            <Btn variant="ghost" disabled={i === 0} onClick={() => visit(i - 1)}>Back</Btn>
            <Btn disabled={i === TOUR_STOPS.length - 1 || locked(TOUR_STOPS[i + 1]?.id ?? "")} onClick={() => visit(i + 1)}>Next stop</Btn>
          </div>
        )}
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">Explored {s.toured.length}/{TOUR_STOPS.length} stops</p>
    </Shell>
  );
}

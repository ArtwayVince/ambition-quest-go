import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Card, Btn, meta } from "@/components/Shell";
import { READINESS } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/readiness")({
  head: () => meta("Readiness Coach", "Scenario-based checks to prepare you for a real visit."),
  component: Readiness,
});

function Readiness() {
  const { set, gain } = useStore();
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const done = i >= READINESS.length;
  const q = READINESS[Math.min(i, READINESS.length - 1)]!;
  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">JET OFF Readiness Coach</h1>
      {done ? (
        <Card className="mt-4">
          <p className="text-2xl font-bold">{score}/{READINESS.length}</p>
          <p className="text-sm text-muted-foreground">{score >= 3 ? "You're ready for the real visit." : "Good practice — try again to sharpen up. No penalties."}</p>
          <div className="mt-3"><Btn onClick={() => { setI(0); setScore(0); setPick(null); }}>Retake</Btn></div>
        </Card>
      ) : (
        <Card className="mt-4">
          <p className="text-xs text-muted-foreground">Scenario {i + 1}/{READINESS.length}</p>
          <p className="mt-1 font-semibold">{q.q}</p>
          <div className="mt-3 space-y-2">
            {q.opts.map((o, k) => (
              <button key={o} disabled={pick !== null} onClick={() => { setPick(k); if (k === q.correct) setScore(score + 1); }}
                className={`block w-full rounded-xl border px-3 py-2 text-left text-sm ${pick === null ? "border-border" : k === q.correct ? "border-success bg-success/20" : k === pick ? "border-destructive" : "border-border opacity-50"}`}>{o}</button>
            ))}
          </div>
          {pick !== null && (
            <div className="mt-3 text-sm">
              <p>💡 {q.tip}</p>
              <div className="mt-2"><Btn onClick={() => {
                const next = i + 1;
                if (next >= READINESS.length) { set((p) => ({ ...p, readiness: Math.max(p.readiness, score) })); gain(25, { Presence: 10 }); }
                setI(next); setPick(null);
              }}>Continue</Btn></div>
            </div>
          )}
        </Card>
      )}
    </Shell>
  );
}

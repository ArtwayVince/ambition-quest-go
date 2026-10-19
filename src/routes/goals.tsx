import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Shell, Card, Btn, Notice, meta } from "@/components/Shell";
import { useStore, coach } from "@/lib/store";
import { GOAL_TEMPLATES, naira } from "@/lib/data";

export const Route = createFileRoute("/goals")({
  head: () => meta("Your ambitions & savings", "Review your ambitions, track self-reported savings and choose practical next steps."),
  component: Goals,
});

function Goals() {
  const { s, set, gain } = useStore();
  const [amt, setAmt] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [custom, setCustom] = useState("");
  const [customTarget, setCustomTarget] = useState("1000000");

  const add = (id: string, title: string, target: number) => {
    if (s.goals.some((g) => g.id === id)) return;
    set((p) => ({ ...p, goals: [...p.goals, { id, title, target, saved: 0, log: [] }] }));
    gain(10, { Mindset: 5 });
  };
  const log = (id: string) => {
    const n = Math.floor(Number(amt[id]));
    if (!n || n < 1) { toast.error("Enter an amount of at least ₦1"); return; }
    const g = s.goals.find((x) => x.id === id)!;
    const saved = g.saved + n;
    set((p) => ({ ...p, goals: p.goals.map((x) => (x.id === id ? { ...x, saved, log: [...x.log, { amt: n, at: new Date().toISOString() }] } : x)) }));
    gain(10, { Discipline: 5 });
    setMsg((m) => ({ ...m, [id]: coach(saved, g.target, n) }));
    setAmt((a) => ({ ...a, [id]: "" }));
  };

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Your ambitions &amp; savings</h1>
      <Notice>Savings shown here are self-reported for your own tracking. JET OFF does not hold your money or guarantee outcomes.</Notice>

      {s.goals.map((g) => {
        const pct = Math.min(100, (g.saved / g.target) * 100);
        const tpl = GOAL_TEMPLATES.find((t) => t.id === g.id);
        return (
          <Card key={g.id} className="mt-4">
            <h2 className="font-bold">{g.title}</h2>
            <p className="text-sm text-muted-foreground">{naira(g.saved)} of {naira(g.target)} · {pct.toFixed(pct < 1 ? 2 : 0)}%</p>
            <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-sunset" style={{ width: `${Math.max(pct, g.saved ? 1 : 0)}%` }} /></div>
            {tpl && (
              <div className="mt-3">
                <p className="text-xs font-semibold">Milestones</p>
                <ul className="mt-1 space-y-2 text-sm">
                  {tpl.milestones.map((m) => {
                    const completed =
                      (m === "First ₦1,000 saved" && g.saved >= 1000) ||
                      (m === "Reach 25%" && g.saved >= g.target * 0.25) ||
                      (m === "Reach 50%" && g.saved >= g.target * 0.5);
                    const destination =
                      m === "Complete a resort visit" ? "/tour" :
                      m === "Learn charter basics" ? "/play" :
                      m === "Book" ? "/experiences/$id" :
                      /farm visit|shadow day|attend a class|workshop|resort/i.test(m) ? "/explore" :
                      /learn|research|business plan|skill|practise|apply|pick a skill|first sale/i.test(m) ? "/play" :
                      null;
                    const linkProps = m === "Book"
                      ? { to: "/experiences/$id" as const, params: { id: "yuby-day-visit" } }
                      : destination === "/tour"
                        ? { to: "/tour" as const }
                        : destination === "/play"
                          ? { to: "/play" as const }
                          : destination === "/explore"
                            ? { to: "/explore" as const }
                            : null;
                    return (
                      <li key={m} className="flex items-start gap-2">
                        <span aria-hidden="true" className={completed ? "font-bold text-success" : "text-muted-foreground"}>
                          {completed ? "✓" : "○"}
                        </span>
                        {linkProps ? (
                          <Link {...linkProps} className="underline decoration-dotted underline-offset-4 hover:text-primary">
                            {m}
                            <span className="sr-only"> — open related preparation</span>
                          </Link>
                        ) : (
                          <span className={completed ? "text-success" : "text-muted-foreground"}>{m}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {g.id === "jet" && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    The Yuby Resort Tour is preparation only. It does not count as completing an actual resort visit.
                  </p>
                )}
              </div>
            )}
            {tpl && <p className="mt-2 text-xs">Next: {tpl.actions[0]}</p>}
            <div className="mt-3 flex gap-2">
              <input inputMode="numeric" placeholder="e.g. 1000" value={amt[g.id] ?? ""} onChange={(e) => setAmt({ ...amt, [g.id]: e.target.value.replace(/\D/g, "") })} className="w-32 rounded-xl border border-input bg-background px-3 py-2" />
              <Btn onClick={() => log(g.id)}>Log saving</Btn>
            </div>
            {msg[g.id] && (
              <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <p className="text-sm text-success">💬 {msg[g.id]}</p>
                <div className="mt-3">
                  <p className="text-sm font-semibold">Your next steps</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Next practical milestone: {tpl?.actions[0] ?? "Choose one small action toward this ambition."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to="/dashboard"><Btn>View Dashboard &amp; XP</Btn></Link>
                    <Link to="/play"><Btn variant="ghost">Take a mission</Btn></Link>
                    <Link to="/explore"><Btn variant="ghost">Explore experiences</Btn></Link>
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      })}

      <h2 className="mt-8 text-xl font-bold">Suggested goals</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {GOAL_TEMPLATES.map((t) => (
          <Card key={t.id}>
            <p className="font-semibold">{t.title}</p>
            <p className="text-xs text-muted-foreground">Estimated target {naira(t.target)} (illustrative)</p>
            <div className="mt-2"><Btn variant="ghost" disabled={s.goals.some((g) => g.id === t.id)} onClick={() => add(t.id, t.title, t.target)}>{s.goals.some((g) => g.id === t.id) ? "Added" : "Choose"}</Btn></div>
          </Card>
        ))}
      </div>
      <Card className="mt-4">
        <p className="font-semibold">Add your own ambition</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Name what you want to make possible and choose an initial target in naira. This is your
          planning figure, not a quote or guarantee.
        </p>
        <div className="mt-3 space-y-3">
          <label className="block text-sm font-medium" htmlFor="custom-ambition">
            Your ambition
          </label>
          <input
            id="custom-ambition"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            maxLength={120}
            placeholder="e.g. Complete a professional course"
            className="w-full rounded-xl border border-input bg-background px-3 py-2"
          />
          <label className="block text-sm font-medium" htmlFor="custom-target">
            Initial target (₦)
          </label>
          <input
            id="custom-target"
            type="number"
            inputMode="numeric"
            min="1"
            step="1000"
            value={customTarget}
            onChange={(e) => setCustomTarget(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2"
          />
          <Btn
            onClick={() => {
              const title = custom.trim();
              const target = Number(customTarget);
              if (!title) {
                toast.error("Name the ambition you want to pursue");
                return;
              }
              if (!Number.isSafeInteger(target) || target < 1) {
                toast.error("Enter a whole-number target of at least ₦1");
                return;
              }
              add(`custom-${Date.now()}`, title, target);
              setCustom("");
              setCustomTarget("1000000");
              toast.success("Your ambition has been added");
            }}
          >
            Add ambition
          </Btn>
        </div>
      </Card>
    </Shell>
  );
}

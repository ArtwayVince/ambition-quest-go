import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Shell, Card, Btn, Notice, meta } from "@/components/Shell";
import { useStore, coach } from "@/lib/store";
import { GOAL_TEMPLATES, naira } from "@/lib/data";
import { journeyFor, milestoneIsComplete } from "@/lib/journeys";

export const Route = createFileRoute("/goals")({
  head: () => meta("Goals", "Choose a long-term ambition and track self-reported savings with encouraging coaching."),
  component: Goals,
});

function Goals() {
  const { s, set, gain } = useStore();
  const [amt, setAmt] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [savedNotice, setSavedNotice] = useState<Record<string, string>>({});
  const [custom, setCustom] = useState("");
  const [customTarget, setCustomTarget] = useState("1000000");

  const add = (id: string, title: string, target: number) => {
    if (s.goals.some((g) => g.id === id)) return;
    set((p) => ({ ...p, goals: [...p.goals, { id, title, target, saved: 0, log: [] }] }));
    gain(10, { Mindset: 5 });
  };
  const log = (id: string) => {
    const n = Number(amt[id]);
    if (!Number.isSafeInteger(n) || n < 1) {
      toast.error("Enter a whole-number amount of at least ₦1");
      return;
    }
    const g = s.goals.find((x) => x.id === id);
    if (!g) {
      toast.error("We couldn't find that ambition. Please refresh and try again.");
      return;
    }
    const saved = g.saved + n;
    if (!Number.isSafeInteger(saved)) {
      toast.error("That amount is too large to record safely");
      return;
    }
    set((p) => ({
      ...p,
      goals: p.goals.map((x) =>
        x.id === id
          ? { ...x, saved, log: [...x.log, { amt: n, at: new Date().toISOString() }] }
          : x,
      ),
    }));
    gain(10, { Discipline: 5 });
    setMsg((m) => ({ ...m, [id]: coach(saved, g.target, n) }));
    setSavedNotice((notices) => ({
      ...notices,
      [id]: `✔ Saving recorded: ₦${n.toLocaleString()}. Total saved: ₦${saved.toLocaleString()}.`,
    }));
    setAmt((a) => ({ ...a, [id]: "" }));
    toast.success("✔ Saving recorded");
  };

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Pursue a goal</h1>
      <Notice>Savings shown here are self-reported for your own tracking. JET OFF does not hold your money or guarantee outcomes.</Notice>

      {s.goals.map((g) => {
        const pct = Math.min(100, (g.saved / g.target) * 100);
        const journey = journeyFor(g.id);
        const activityRecords = s.goalActivityRecords[g.id] ?? {};
        const completedActivities = journey.activities.filter((activity) => Boolean(activityRecords[activity.id])).length;
        const legacyCount = (s.goalSteps[g.id] ?? []).length;
        return (
          <div id={`review-ambition-${g.id}`} className="scroll-mt-4">
          <Card className="mt-4">
            <h2 className="font-bold">{g.title}</h2>
            <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Ambition review</p>
              <p className="mt-1 text-sm">You have recorded {naira(g.saved)} toward your initial target of {naira(g.target)} ({pct.toFixed(pct < 1 ? 2 : 0)}%). This is a planning snapshot, not a guarantee that the ambition is within reach yet.</p>
              <p className="mt-2 text-sm">{completedActivities} of {journey.activities.length} guided activities recorded.</p>
              {legacyCount > 0 && <p className="mt-1 text-xs text-muted-foreground">{legacyCount} earlier starter-step record(s) preserved for review; they are not automatically treated as completed guided activities.</p>}
              <p className="mt-2 text-sm font-semibold">Next decision</p>
              <p className="text-sm text-muted-foreground">Review what has changed since your last action. Identify the next requirement, check any costs or risks, and decide on one practical step you can responsibly take next. Saving is only one possible part of preparation.</p>
              <Link to="/dashboard" hash={`meaningful-step-${g.id}`} className="mt-3 inline-flex text-sm font-semibold text-primary underline underline-offset-4">Return to this ambition’s action plan →</Link>
            </div>
            <p className="text-sm text-muted-foreground">{naira(g.saved)} of {naira(g.target)} · {pct.toFixed(pct < 1 ? 2 : 0)}%</p>
            <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-sunset" style={{ width: `${Math.max(pct, g.saved ? 1 : 0)}%` }} /></div>
            <div id={`journey-milestones-${g.id}`} className="mt-4 scroll-mt-4">
              <p className="text-sm font-semibold">Journey milestones</p>
              <p className="mt-1 text-xs text-muted-foreground">Each milestone is reached only when its related activity has a saved result.</p>
              <ul className="mt-2 space-y-2 text-sm">
                {journey.milestones.map((milestone) => {
                  const completed = milestoneIsComplete(milestone, activityRecords);
                  return (
                    <li key={milestone.id} className="flex items-start gap-2">
                      <span aria-hidden="true" className={completed ? "font-bold text-success" : "text-muted-foreground"}>{completed ? "✔" : "○"}</span>
                      <div>
                        <p className={completed ? "font-medium text-success" : "font-medium text-muted-foreground"}>{milestone.title}</p>
                        <p className="text-xs text-muted-foreground">{milestone.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-sm font-semibold">Activities in this journey</p>
              <div className="mt-2 space-y-2">
                {journey.activities.map((activity, index) => {
                  const record = activityRecords[activity.id];
                  return (
                    <div key={activity.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">{index + 1}. {activity.title}</p>
                        <span className={record ? "shrink-0 text-xs font-semibold text-success" : "shrink-0 text-xs text-muted-foreground"}>{record ? "Recorded ✓" : "Not yet recorded"}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{activity.guidance}</p>
                      {record && <p className="mt-2 whitespace-pre-wrap text-sm">Result: {record.result}</p>}
                      {!record && <Link to="/dashboard" hash={`activity-${g.id}-${activity.id}`} className="mt-2 inline-flex text-sm font-semibold text-primary underline underline-offset-4">Go to this activity →</Link>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold">Savings milestones</p>
              <p className="mt-1 text-xs text-muted-foreground">Savings are tracked separately from learning and preparation. The initial target is illustrative and should be reviewed against real costs.</p>
              <ul className="mt-2 space-y-2 text-sm">
                {[
                  { title: "Record your first ₦1,000", threshold: 1000 },
                  { title: "Reach 10% of the initial target", threshold: g.target * 0.1 },
                  { title: "Reach 25% of the initial target", threshold: g.target * 0.25 },
                  { title: "Reach 50% of the initial target", threshold: g.target * 0.5 },
                ].map((milestone) => {
                  const completed = g.saved >= milestone.threshold;
                  return <li key={milestone.title} className="flex items-start gap-2">
                    <span aria-hidden="true" className={completed ? "font-bold text-success" : "text-muted-foreground"}>{completed ? "✔" : "○"}</span>
                    <span className={completed ? "text-success" : "text-muted-foreground"}>{milestone.title}{milestone.threshold !== 1000 ? ` (\u20a6${Math.ceil(milestone.threshold).toLocaleString("en-NG")})` : ""}</span>
                  </li>;
                })}
              </ul>
            </div>
            <div className="mt-3">
              <Link
                to="/dashboard"
                hash={`meaningful-step-${g.id}`}
                className="inline-flex text-sm font-semibold text-primary underline underline-offset-4"
              >
                View this ambition’s action plan →
              </Link>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                inputMode="numeric"
                type="number"
                min="1"
                step="1"
                aria-label={`Amount saved toward ${g.title}`}
                placeholder="e.g. 1000"
                value={amt[g.id] ?? ""}
                onChange={(e) => setAmt((a) => ({ ...a, [g.id]: e.target.value.replace(/\D/g, "") }))}
                className="w-32 rounded-xl border border-input bg-background px-3 py-2"
              />
              <Btn onClick={() => log(g.id)}>Log saving</Btn>
            </div>
            {savedNotice[g.id] && (
              <p role="status" aria-live="polite" className="mt-2 rounded-lg border border-success/30 bg-success/5 p-3 text-sm font-semibold text-success">
                {savedNotice[g.id]}
              </p>
            )}
            {msg[g.id] && (
              <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <p className="text-sm text-success">💬 {msg[g.id]}</p>
                <div className="mt-3">
                  <p className="text-sm font-semibold">Your next steps</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your next meaningful step is available on the dashboard. Record it only after you have taken the action.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to="/dashboard" hash={`meaningful-step-${g.id}`}><Btn>View this action plan</Btn></Link>
                    <Link to="/play"><Btn variant="ghost">Take a mission</Btn></Link>
                    <Link to="/explore"><Btn variant="ghost">Explore experiences</Btn></Link>
                  </div>
                </div>
              </div>
            )}
          </Card>
          </div>
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

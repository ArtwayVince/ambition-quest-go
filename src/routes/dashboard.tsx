import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Shell, Card, Btn, meta } from "@/components/Shell";
import { useStore, levelOf, XP_PER_LEVEL, today, type Attr } from "@/lib/store";
import { PATH_STAGES, DAILY_CHALLENGES } from "@/lib/data";

export const Route = createFileRoute("/dashboard")({
  head: () => meta("Your journey", "Your ambition, current progress and the next meaningful step."),
  component: Dashboard,
});

const STREAK_BADGES = [3, 7, 30];

function Dashboard() {
  const { s, set, gain, badge } = useStore();
  const lvl = levelOf(s.xp);
  const into = s.xp % XP_PER_LEVEL;
  const doneToday = s.dailyDone.filter((d) => d.startsWith(today()));
  const daily = DAILY_CHALLENGES[new Date().getDate() % DAILY_CHALLENGES.length];
  const claimed = doneToday.length > 0;

  const completeDaily = () => {
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const streak = s.lastDay === y ? s.streak + 1 : s.lastDay === today() ? s.streak : 1;
    set((p) => ({ ...p, dailyDone: [...p.dailyDone, `${today()}|${daily}`], streak, lastDay: today() }));
    gain(20, { Discipline: 5 });
    STREAK_BADGES.forEach((n) => streak >= n && badge(`${n}-day streak`));
    toast.success(`Challenge done! Streak: ${streak} 🔥`);
  };

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">{s.user ? `Welcome, ${s.user.name}` : "Your journey"}</h1>
      {!s.user && <p className="text-sm text-muted-foreground"><Link to="/auth" className="text-primary underline">Create a profile</Link> to personalise.</p>}

      <Card className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Your ambition</p>
            <h2 className="mt-1 text-xl font-extrabold">{s.goals.length ? "The journey you are building" : "What do you want to make possible?"}</h2>
          </div>
          <Link to="/goals" className="shrink-0 text-sm font-semibold text-primary underline">{s.goals.length ? "View goals" : "Define a goal"}</Link>
        </div>
        {s.goals.length ? (
          <div className="mt-3 space-y-3">
            {s.goals.slice(0, 3).map((goal) => {
              const pct = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
              return <div key={goal.id} className="rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{goal.title}</p>
                  <span className="text-xs text-muted-foreground">{pct}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
                <p className="mt-2 text-xs text-muted-foreground">₦{goal.saved.toLocaleString()} recorded of ₦{goal.target.toLocaleString()} target</p>
              </div>;
            })}
            <p className="text-sm text-muted-foreground">Next step: review your goal, check what is within reach today, and choose one practical action. Your progress is more than a score.</p>
            <Link to="/goals"><Btn>Work on my ambition</Btn></Link>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-muted-foreground">Start with what matters to you. Describe the ambition, set a realistic target if money is involved, and see your starting point before choosing the next step.</p>
            <div className="mt-3"><Link to="/goals"><Btn>Define my ambition</Btn></Link></div>
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <div className="flex items-end justify-between">
          <div><p className="text-xs text-muted-foreground">Level</p><p className="font-display text-4xl font-extrabold text-primary">{lvl}</p></div>
          <p className="text-sm text-muted-foreground">{into}/{XP_PER_LEVEL} XP</p>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full bg-sunset transition-all duration-700" style={{ width: `${into}%` }} /></div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {(Object.keys(s.attrs) as Attr[]).map((a) => (
            <div key={a}>
              <div className="flex justify-between text-xs"><span>{a}</span><span>{s.attrs[a]}</span></div>
              <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, s.attrs[a])}%` }} /></div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <div className="flex items-center justify-between"><h2 className="font-bold">Daily challenge</h2><span className="text-sm">🔥 {s.streak} day streak</span></div>
        <p className="mt-2 text-sm">{daily}</p>
        <div className="mt-3"><Btn disabled={claimed} onClick={completeDaily}>{claimed ? "Done for today ✓" : "Mark complete (+20 XP)"}</Btn></div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-bold">Path to Jet Off</h2>
        <ol className="mt-3 grid grid-cols-5 gap-2 text-center text-[10px]">
          {PATH_STAGES.map((st, k) => (
            <li key={st} className={`rounded-lg p-2 ${k <= s.stage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <div className="font-bold">{k + 1}</div>{st}
            </li>
          ))}
        </ol>
        <div className="mt-3"><Btn variant="ghost" disabled={s.stage >= 9} onClick={() => { set((p) => ({ ...p, stage: p.stage + 1 })); gain(15, { Mindset: 5 }); }}>I've completed “{PATH_STAGES[s.stage]}”</Btn></div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-bold">Pilot missions</h2>
        {[["m1", "Mission 1 — The Aspiration"], ["m2", "Mission 2 — Know Before You Go"], ["m3", "Mission 3 — The Real Visit"]].map(([k, l]) => (
          <p key={k} className="mt-2 text-sm">{s.missions[k as "m1"] ? "✅" : "⬜"} {l}</p>
        ))}
        <div className="mt-3"><Link to="/play"><Btn>Continue missions</Btn></Link></div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-bold">Badges</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {s.badges.length ? s.badges.map((b) => <span key={b} className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">🏅 {b}</span>) : <p className="text-sm text-muted-foreground">Complete challenges to earn your first badge.</p>}
        </div>
      </Card>
    </Shell>
  );
}

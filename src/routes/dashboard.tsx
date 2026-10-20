import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Shell, Card, Btn, meta } from "@/components/Shell";
import {
  useStore,
  levelOf,
  XP_PER_LEVEL,
  today,
  isMeaningfulReflection,
  STAGE_NOTE_MIN_LENGTH,
  type Attr,
} from "@/lib/store";
import { PATH_STAGES, DAILY_CHALLENGES, READINESS } from "@/lib/data";
import { journeyFor, milestoneIsComplete } from "@/lib/journeys";

export const Route = createFileRoute("/dashboard")({
  head: () => meta("Your journey", "Your ambition, current progress and the next meaningful step."),
  component: Dashboard,
});

const STREAK_BADGES = [3, 7, 30];

function Dashboard() {
  const { s, set, gain, badge } = useStore();
  const [stageNote, setStageNote] = useState("");
  const [activityDrafts, setActivityDrafts] = useState<Record<string, string>>({});
  const activityActionInFlight = useRef(new Set<string>());
  const stageActionInFlight = useRef(false);
  const lvl = levelOf(s.xp);
  const into = s.xp % XP_PER_LEVEL;
  const doneToday = s.dailyDone.filter((d) => d.startsWith(today()));
  const daily = DAILY_CHALLENGES[new Date().getDate() % DAILY_CHALLENGES.length];
  const claimed = doneToday.length > 0;
  const journeyStages = PATH_STAGES.map((stage, index) =>
    index === PATH_STAGES.length - 1 && s.goals[0]?.id !== "jet" ? "Achieve" : stage,
  );

  useEffect(() => {
    stageActionInFlight.current = false;
  }, [s.stage]);

  const completeStage = () => {
    if (stageActionInFlight.current) return;
    if (!s.goals.length) {
      toast.error("Choose an ambition before recording journey progress");
      return;
    }
    if (!isMeaningfulReflection(stageNote)) {
      toast.error(
        `Write at least ${STAGE_NOTE_MIN_LENGTH} characters about what you did or learned`,
      );
      return;
    }
    if (s.stage >= PATH_STAGES.length - 1) return;
    if (s.stageNotes.some((entry) => entry.stage === s.stage)) {
      toast.error("This stage has already been recorded");
      return;
    }

    stageActionInFlight.current = true;
    const completedStage = s.stage;
    set((p) => ({
      ...p,
      stage: p.stage + 1,
      stageNotes: [
        ...p.stageNotes,
        { stage: completedStage, note: stageNote.trim(), at: new Date().toISOString() },
      ],
    }));
    gain(15, { Mindset: 5 });
    setStageNote("");
    toast.success("Reflection recorded. +15 XP");
  };

  const completeActivity = (goalId: string, activityId: string) => {
    const key = `${goalId}:${activityId}`;
    const result = (activityDrafts[key] ?? "").trim();
    if (result.length < 10) {
      toast.error("Record at least 10 characters about what you did or learned");
      return;
    }
    if (s.goalActivityRecords[goalId]?.[activityId]) {
      toast.error("This activity already has a recorded result");
      return;
    }
    if (activityActionInFlight.current.has(key)) return;
    activityActionInFlight.current.add(key);
    const record = { result, completedAt: new Date().toISOString() };
    set((p) => {
      if (p.goalActivityRecords[goalId]?.[activityId]) return p;
      return {
        ...p,
        goalActivityRecords: {
          ...p.goalActivityRecords,
          [goalId]: {
            ...(p.goalActivityRecords[goalId] ?? {}),
            [activityId]: record,
          },
        },
      };
    });
    gain(15, { Mindset: 5 });
    setActivityDrafts((drafts) => ({ ...drafts, [key]: "" }));
    toast.success("Activity result recorded. +15 XP");
  };

  const completeDaily = () => {
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const streak = s.lastDay === y ? s.streak + 1 : s.lastDay === today() ? s.streak : 1;
    set((p) => ({
      ...p,
      dailyDone: [...p.dailyDone, `${today()}|${daily}`],
      streak,
      lastDay: today(),
    }));
    gain(20, { Discipline: 5 });
    STREAK_BADGES.forEach((n) => streak >= n && badge(`${n}-day streak`));
    toast.success(`Challenge done! Streak: ${streak} 🔥`);
  };

  return (
    <Shell>
      <div className="mb-3">
        <Link to="/" className="text-sm font-semibold text-primary underline">
          ← Return to Welcome
        </Link>
      </div>
      <h1 className="text-3xl font-extrabold">
        {s.user ? `Welcome, ${s.user.name}` : "Your journey"}
      </h1>
      {!s.user && (
        <p className="text-sm text-muted-foreground">
          <Link to="/auth" className="text-primary underline">
            Create a profile
          </Link>{" "}
          to personalise.
        </p>
      )}

      <Card className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Your ambition
            </p>
            <h2 className="mt-1 text-xl font-extrabold">
              {s.goals.length
                ? "The journey you are building"
                : "What do you want to make possible?"}
            </h2>
          </div>
          <Link to="/goals" className="shrink-0 text-sm font-semibold text-primary underline">
            {s.goals.length ? "View goals" : "Define a goal"}
          </Link>
        </div>
        {s.goals.length ? (
          <div className="mt-3 space-y-3">
            {s.goals.map((goal) => {
              const pct =
                goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
              return (
                <Link
                  key={goal.id}
                  to="/goals"
                  aria-label={`Open ambition: ${goal.title} and its progress`}
                  className="block rounded-xl border border-border p-3 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{goal.title}</p>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    ₦{goal.saved.toLocaleString()} recorded of ₦{goal.target.toLocaleString()}{" "}
                    target
                  </p>
                  <p className="mt-2 text-xs font-semibold text-primary">Tap to view progress →</p>
                </Link>
              );
            })}
            <p className="text-sm text-muted-foreground">
              Next step: review your goal, check what is within reach today, and choose one
              practical action. Your progress is more than a score.
            </p>
            <Link to="/goals">
              <Btn>Work on my ambition</Btn>
            </Link>
            {s.goals.map((goal) => {
              const journey = journeyFor(goal.id);
              const records = s.goalActivityRecords[goal.id] ?? {};
              const completedCount = journey.activities.filter((activity) => Boolean(records[activity.id])).length;
              const legacyCount = (s.goalSteps[goal.id] ?? []).length;
              return (
                <div id={`meaningful-step-${goal.id}`} key={goal.id} className="mt-4 scroll-mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">Guided ambition journey</p>
                      <h3 className="mt-1 font-bold">{goal.title}</h3>
                    </div>
                    <span className="shrink-0 text-xs font-semibold">{completedCount}/{journey.activities.length} activities</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Choose any activity you are ready to do, including work you have already completed. Record a brief result so the milestone reflects what you learned or achieved.</p>
                  <div className="mt-3 space-y-3">
                    {journey.activities.map((activity, index) => {
                      const key = `${goal.id}:${activity.id}`;
                      const record = records[activity.id];
                      const milestone = journey.milestones.find((item) => item.id === activity.milestoneId);
                      return (
                        <section id={`activity-${goal.id}-${activity.id}`} key={activity.id} className="rounded-xl border border-border bg-background p-3">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 text-xs font-bold text-muted-foreground">{index + 1}.</span>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">{activity.title}</p>
                              <p className="mt-1 text-sm">{activity.guidance}</p>
                              <p className="mt-2 text-xs text-muted-foreground">Why it matters: {activity.why}</p>
                              {record ? (
                                <div className="mt-3 rounded-lg border border-success/30 bg-success/5 p-3">
                                  <p className="text-sm font-semibold text-success">✓ Result recorded</p>
                                  <p className="mt-1 whitespace-pre-wrap text-sm">{record.result}</p>
                                  <p className="mt-2 text-xs text-muted-foreground">Self-reported on {new Date(record.completedAt).toLocaleDateString()}</p>
                                  {milestone && <p className="mt-1 text-xs font-semibold text-success">Milestone reached: {milestone.title}</p>}
                                </div>
                              ) : (
                                <div className="mt-3 space-y-2">
                                  <label htmlFor={`result-${key}`} className="block text-sm font-semibold">Record your result</label>
                                  <textarea
                                    id={`result-${key}`}
                                    value={activityDrafts[key] ?? ""}
                                    onChange={(event) => setActivityDrafts((drafts) => ({ ...drafts, [key]: event.target.value }))}
                                    maxLength={500}
                                    rows={2}
                                    placeholder={activity.resultPrompt}
                                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                                  />
                                  <Btn onClick={() => completeActivity(goal.id, activity.id)}>Record activity result</Btn>
                                </div>
                              )}
                            </div>
                          </div>
                        </section>
                      );
                    })}
                  </div>
                  <div className="mt-4 rounded-xl border border-border bg-background p-3">
                    <h4 className="font-semibold">Milestones</h4>
                    <ul className="mt-2 space-y-2 text-sm">
                      {journey.milestones.map((milestone) => {
                        const completed = milestoneIsComplete(milestone, records);
                        return <li key={milestone.id} className="flex items-start gap-2">
                          <span aria-hidden="true" className={completed ? "font-bold text-success" : "text-muted-foreground"}>{completed ? "✔" : "○"}</span>
                          <span className={completed ? "text-success" : "text-muted-foreground"}>{milestone.title}</span>
                        </li>;
                      })}
                    </ul>
                  </div>
                  {legacyCount > 0 && (
                    <p className="mt-3 rounded-lg border border-border p-3 text-xs text-muted-foreground">
                      Earlier starter-step records preserved: {legacyCount}. They have not been automatically marked as guided activities because the old records did not include a result. Review the relevant activity above and record what you actually did.
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to="/goals" hash={`review-ambition-${goal.id}`}><Btn variant="ghost">Review ambition</Btn></Link>
                    <Link to="/goals" hash={`journey-milestones-${goal.id}`}><Btn variant="ghost">Review all milestones</Btn></Link>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">These are self-reported preparation milestones, not independent verification or proof that the ambition itself has been achieved.</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-muted-foreground">
              Start with what matters to you. Describe the ambition, set a realistic target if money
              is involved, and see your starting point before choosing the next step.
            </p>
            <div className="mt-3">
              <Link to="/goals">
                <Btn>Define my ambition</Btn>
              </Link>
            </div>
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Level</p>
            <p className="font-display text-4xl font-extrabold text-primary">{lvl}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {into}/{XP_PER_LEVEL} XP
          </p>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-sunset transition-all duration-700"
            style={{ width: `${into}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {(Object.keys(s.attrs) as Attr[]).map((a) => (
            <div key={a}>
              <div className="flex justify-between text-xs">
                <span>{a}</span>
                <span>{s.attrs[a]}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, s.attrs[a])}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold">Preparation readiness</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Practice check: {s.readiness}/{READINESS.length} scenarios answered correctly.
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-primary">
            {Math.round((s.readiness / READINESS.length) * 100)}%
          </span>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Preparation practice score"
          aria-valuemin={0}
          aria-valuemax={READINESS.length}
          aria-valuenow={s.readiness}
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(s.readiness / READINESS.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          This is a practice score, not proof of real-world readiness or provider confirmation.
        </p>
        <div className="mt-3">
          <Link to="/readiness">
            <Btn variant="ghost">Continue readiness practice</Btn>
          </Link>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Daily challenge</h2>
          <span className="text-sm">🔥 {s.streak} day streak</span>
        </div>
        <p className="mt-2 text-sm">{daily}</p>
        <div className="mt-3">
          <Btn disabled={claimed} onClick={completeDaily}>
            {claimed ? "Done for today ✓" : "Mark complete (+20 XP)"}
          </Btn>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-bold">Your journey path</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Move forward by recording what you actually did or learned at each stage.
        </p>
        <ol className="mt-3 grid grid-cols-5 gap-2 text-center text-[10px]">
          {journeyStages.map((stage, k) => (
            <li
              key={stage}
              className={`rounded-lg p-2 ${k <= s.stage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <div className="font-bold">{k + 1}</div>
              {stage}
            </li>
          ))}
        </ol>
        {s.stage < PATH_STAGES.length - 1 ? (
          <div className="mt-3 space-y-2">
            <label htmlFor="stage-reflection" className="block text-sm font-semibold">
              Reflection on “{journeyStages[s.stage]}”
            </label>
            <textarea
              id="stage-reflection"
              value={stageNote}
              onChange={(event) => setStageNote(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Describe the practical step you took or what you learned (at least 20 characters)."
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Self-reported prototype checkpoint—not independent proof of a visit or outcome.
            </p>
            <Btn
              disabled={!s.goals.length || !isMeaningfulReflection(stageNote)}
              onClick={completeStage}
            >
              Record reflection &amp; continue (+15 XP)
            </Btn>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            You have reached the final stage shown for this journey. Your real-world outcome still
            depends on your goal, circumstances and any provider requirements.
          </p>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="font-bold">Pilot missions</h2>
        {[
          ["m1", "Mission 1 — The Aspiration"],
          ["m2", "Mission 2 — Know Before You Go"],
          ["m3", "Mission 3 — The Real Visit"],
        ].map(([k, l]) => (
          <p key={k} className="mt-2 text-sm">
            {s.missions[k as "m1"] ? "✅" : "⬜"} {l}
          </p>
        ))}
        <div className="mt-3">
          <Link to="/play">
            <Btn>Continue missions</Btn>
          </Link>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-bold">Badges</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {s.badges.length ? (
            s.badges.map((b) => (
              <span
                key={b}
                className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground"
              >
                🏅 {b}
              </span>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete challenges to earn your first badge.
            </p>
          )}
        </div>
      </Card>
    </Shell>
  );
}

import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
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
  hasCompletedDailyChallenge,
  type Attr,
} from "@/lib/store";
import { journeyStagesForGoal, DAILY_CHALLENGES } from "@/lib/data";
import { GuidedJourneys } from "@/components/GuidedJourneys";
import { AIAmbitionCoach } from "@/components/AIAmbitionCoach";
import { journeyFor } from "@/lib/journeys";

export const Route = createFileRoute("/dashboard")({
  head: () => meta("Your journey", "Your ambition, current progress and the next meaningful step."),
  component: Dashboard,
});

const STREAK_BADGES = [3, 7, 30];

function Dashboard() {
  const { s, set, gain, badge } = useStore();
  const location = useLocation();
  const [stageNote, setStageNote] = useState("");
  const [journeyGoalId, setJourneyGoalId] = useState("");
  const stageActionInFlight = useRef(false);
  const dailyActionInFlight = useRef<string | null>(null);
  const lvl = levelOf(s.xp);
  const into = s.xp % XP_PER_LEVEL;
  const doneToday = s.dailyDone.filter((d) => d.startsWith(today()));
  const dailyIndex = new Date().getDate() % DAILY_CHALLENGES.length;
  const daily = DAILY_CHALLENGES[dailyIndex];
  const claimed = doneToday.length > 0;
  // Daily rewards require a real action recorded today, rather than a free-standing checkbox.
  const savingsRecordedToday = s.goals.some((goal) =>
    goal.log.some((entry) => entry.at.slice(0, 10) === today()),
  );
  const activityRecordedToday = Object.values(s.goalActivityRecords ?? {}).some((records) =>
    Object.values(records).some((record) => record.completedAt.slice(0, 10) === today()),
  );
  const reflectionRecordedToday = Object.values(s.journeyProgressByGoal ?? {}).some((progress) =>
    progress.notes.some((entry) => entry.at.slice(0, 10) === today()),
  );
  const dailyEvidence =
    [savingsRecordedToday, activityRecordedToday, reflectionRecordedToday][dailyIndex] ?? false;
  const dailyButtonLabel = claimed
    ? "Done for today ✓"
    : dailyEvidence
      ? "Claim reward (+20 XP)"
      : "Record the action first";
  const dailyStatus = claimed
    ? "Today's reward claimed"
    : dailyEvidence
      ? "Your action is recorded; reward ready"
      : "Waiting for today's action record";
  const dailyGoal = s.goals[0];
  const dailyJourney = dailyGoal
    ? (s.aiJourneys?.[dailyGoal.id] ?? journeyFor(dailyGoal.id, dailyGoal.title))
    : null;
  const dailyNextActivity = dailyGoal
    ? dailyJourney?.activities.find(
        (activity) => !s.goalActivityRecords[dailyGoal.id]?.[activity.id],
      )
    : undefined;
  const journeyGoal = s.goals.find((goal) => goal.id === journeyGoalId) ?? s.goals[0];
  const journeyProgress = journeyGoal
    ? (s.journeyProgressByGoal?.[journeyGoal.id] ?? { stage: 0, notes: [] })
    : { stage: 0, notes: [] };
  const journeyDefinition = journeyGoal
    ? journeyStagesForGoal(journeyGoal.id, journeyGoal.title)
    : { stages: [], prompts: [] };
  const journeyStages = journeyDefinition.stages;
  const journeyPrompts = journeyDefinition.prompts;

  useEffect(() => {
    stageActionInFlight.current = false;
  }, [journeyGoal?.id, journeyProgress.stage]);

  // Deep links from the welcome page can arrive before the guided journey has
  // finished rendering. Retry the anchor scroll after the dashboard paints.
  useEffect(() => {
    const hash = location.hash.replace(/^#/, "");
    if (!hash) return;

    const scrollToTarget = () => {
      const target = document.getElementById(decodeURIComponent(hash));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        window.clearTimeout(retryTimer);
      }
    };

    const retryTimer = window.setTimeout(scrollToTarget, 250);
    const frame = window.requestAnimationFrame(scrollToTarget);
    return () => {
      window.cancelAnimationFrame(frame);
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, [location.hash, s.aiJourneys, s.goalActivityRecords, s.goalNextActions]);

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
    if (!journeyGoal) {
      toast.error("Choose an ambition before recording journey progress");
      return;
    }
    if (journeyProgress.stage >= journeyStages.length - 1) return;
    if (journeyProgress.notes.some((entry) => entry.stage === journeyProgress.stage)) {
      toast.error("This stage has already been recorded");
      return;
    }

    stageActionInFlight.current = true;
    const goalId = journeyGoal.id;
    const completedStage = journeyProgress.stage;
    const reflection = {
      stage: completedStage,
      note: stageNote.trim(),
      at: new Date().toISOString(),
    };
    set((p) => {
      const current = p.journeyProgressByGoal?.[goalId] ?? { stage: 0, notes: [] };
      if (
        current.stage !== completedStage ||
        current.notes.some((entry) => entry.stage === completedStage)
      ) {
        return p;
      }
      return {
        ...p,
        journeyProgressByGoal: {
          ...(p.journeyProgressByGoal ?? {}),
          [goalId]: { stage: current.stage + 1, notes: [...current.notes, reflection] },
        },
      };
    });
    gain(15, { Mindset: 5 });
    setStageNote("");
    toast.success("Reflection recorded. +15 XP");
  };

  const completeDaily = () => {
    const date = today();
    if (
      claimed ||
      dailyActionInFlight.current === date ||
      hasCompletedDailyChallenge(s.dailyDone, date)
    ) {
      return;
    }
    dailyActionInFlight.current = date;
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const streak = s.lastDay === y ? s.streak + 1 : s.lastDay === today() ? s.streak : 1;
    set((p) => ({
      ...p,
      dailyDone: hasCompletedDailyChallenge(p.dailyDone, date)
        ? p.dailyDone
        : [...p.dailyDone, `${date}|${daily}`],
      streak: hasCompletedDailyChallenge(p.dailyDone, date) ? p.streak : streak,
      lastDay: hasCompletedDailyChallenge(p.dailyDone, date) ? p.lastDay : date,
    }));
    gain(20, { Discipline: 5 });
    STREAK_BADGES.forEach((n) => streak >= n && badge(`${n}-day streak`));
    toast.success(`Daily challenge complete — +20 XP earned! Streak: ${streak} 🔥`);
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
            <GuidedJourneys />
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

      <AIAmbitionCoach />

      {s.goals.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-bold">Ambition readiness overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            See your financial progress, practical preparation and practice score separately. These
            measures describe different parts of your journey; none alone guarantees an outcome.
          </p>
          <div className="mt-3 space-y-4">
            {s.goals.map((goal) => {
              const journey = s.aiJourneys?.[goal.id] ?? journeyFor(goal.id, goal.title);
              const records = s.goalActivityRecords[goal.id] ?? {};
              const completed = journey.activities.filter((activity) =>
                Boolean(records[activity.id]),
              ).length;
              const nextActivity = journey.activities.find((activity) => !records[activity.id]);
              const latestNextAction = (s.goalNextActions?.[goal.id] ?? [])
                .filter((action) => !action.archivedAt)
                .slice()
                .reverse()[0];
              const acceptedNextAction =
                latestNextAction?.status === "accepted" ? latestNextAction : undefined;
              const financialPct =
                goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
              return (
                <div key={goal.id} className="rounded-xl border border-border p-3">
                  <h3 className="font-semibold">{goal.title}</h3>
                  <div className="mt-3">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span>Financial progress</span>
                      <span className="font-semibold">{financialPct}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: financialPct + "%" }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ₦{goal.saved.toLocaleString()} recorded of ₦{goal.target.toLocaleString()}{" "}
                      target
                    </p>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-semibold">
                      Practical preparation: {completed}/{journey.activities.length} activities
                      recorded
                    </p>
                    {acceptedNextAction ? (
                      <>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Accepted next action: {acceptedNextAction.title}
                        </p>
                        <p className="mt-1 text-sm">{acceptedNextAction.recommendation}</p>
                        <Link
                          to="/dashboard"
                          hash={"activity-" + goal.id + "-" + acceptedNextAction.sourceActivityId}
                          className="mt-2 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Continue accepted action →
                        </Link>
                      </>
                    ) : nextActivity ? (
                      <>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Suggested next step: {nextActivity.title}
                        </p>
                        <Link
                          to="/dashboard"
                          hash={"activity-" + goal.id + "-" + nextActivity.id}
                          className="mt-2 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Start suggested activity →
                        </Link>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">
                        All guided activities have recorded results. Review your plan and verify any
                        outstanding real-world requirements.
                      </p>
                    )}
                  </div>
                  <div className="mt-3 rounded-lg bg-muted p-3">
                    <p className="text-sm font-semibold">
                      Readiness practice:{" "}
                      {s.readinessByGoal?.[goal.id] === undefined
                        ? "Not taken yet"
                        : `${s.readinessByGoal[goal.id]}/3 scenarios`}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      This score belongs to this ambition only. It is practice, not proof of
                      affordability, booking, or real-world readiness.
                    </p>
                    <Link
                      to="/readiness"
                      className="mt-2 inline-flex text-sm font-semibold text-primary underline underline-offset-4"
                    >
                      Practise for this ambition →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

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
        <h2 className="font-bold">Readiness practice</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Practise decisions for a specific ambition. Your results are tracked separately for each
          ambition and do not certify real-world readiness.
        </p>
        <div className="mt-3">
          <Link to="/readiness">
            <Btn variant="ghost">Choose an ambition to practise</Btn>
          </Link>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">Daily challenge</h2>
          <span className="text-sm">🔥 {s.streak} day streak</span>
        </div>
        <p className="mt-2 text-sm">{daily}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Earn XP by recording this action in your ambition journey first.
          Your confirmation alone is not enough.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {dailyIndex === 0 ? (
            <Link to="/goals">
              <Btn variant="ghost">Record savings →</Btn>
            </Link>
          ) : dailyIndex === 1 ? (
            dailyGoal && dailyNextActivity ? (
              <Link to="/dashboard" hash={"activity-" + dailyGoal.id + "-" + dailyNextActivity.id}>
                <Btn variant="ghost">Record an activity →</Btn>
              </Link>
            ) : (
              <Link to="/goals">
                <Btn variant="ghost">Review activities →</Btn>
              </Link>
            )
          ) : (
            <Link to="/dashboard" hash="journey-path">
              <Btn variant="ghost">Write a reflection →</Btn>
            </Link>
          )}
          <Btn disabled={claimed || !dailyEvidence} onClick={completeDaily}>
            {dailyButtonLabel}
          </Btn>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Total XP: {s.xp} · {dailyStatus}
        </p>
      </Card>

      <Card className="mt-4">
        <h2 id="journey-path" className="font-bold">Your journey path</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each ambition has its own stages and reflections. Progress here applies only to the
          selected ambition.
        </p>
        {s.goals.length > 0 && (
          <div className="mt-3">
            <label htmlFor="journey-ambition" className="block text-sm font-semibold">
              Ambition to track
            </label>
            <select
              id="journey-ambition"
              value={journeyGoal?.id ?? ""}
              onChange={(event) => {
                setJourneyGoalId(event.target.value);
                setStageNote("");
                stageActionInFlight.current = false;
              }}
              className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm"
            >
              {s.goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </div>
        )}
        {!journeyGoal ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Define an ambition to start its journey path.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm font-semibold">
              {journeyGoal.title} · Stage{" "}
              {Math.min(journeyProgress.stage + 1, journeyStages.length)} of {journeyStages.length}
            </p>
            <ol className="mt-3 grid grid-cols-5 gap-2 text-center text-[10px]">
              {journeyStages.map((stage, k) => (
                <li
                  key={stage}
                  className={`rounded-lg p-2 ${k <= journeyProgress.stage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  <div className="font-bold">{k + 1}</div>
                  {stage}
                </li>
              ))}
            </ol>
            {journeyProgress.stage < journeyStages.length - 1 ? (
              <div className="mt-3 space-y-2">
                <label htmlFor="stage-reflection" className="block text-sm font-semibold">
                  Reflection on “{journeyStages[journeyProgress.stage]}”
                </label>
                <textarea
                  id="stage-reflection"
                  value={stageNote}
                  onChange={(event) => setStageNote(event.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder={
                    journeyPrompts[journeyProgress.stage] ??
                    "Describe what you did or learned at this stage (at least 20 characters)."
                  }
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Self-reported prototype checkpoint—not independent proof of a visit or outcome.
                </p>
                <Btn
                  disabled={!journeyGoal || !isMeaningfulReflection(stageNote)}
                  onClick={completeStage}
                >
                  Record reflection &amp; continue (+15 XP)
                </Btn>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-muted-foreground">
                  You have reached the final stage shown for this ambition. Your real-world outcome
                  still depends on your circumstances and any provider requirements.
                </p>
                {journeyProgress.notes.length > 0 && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-semibold">Recorded reflections</p>
                    {journeyProgress.notes.map((entry) => (
                      <p key={entry.stage} className="mt-2 text-sm">
                        <span className="font-semibold">{journeyStages[entry.stage]}:</span>{" "}
                        {entry.note}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="font-bold">Ambition missions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Missions now follow real progress in your current ambition—not the old resort-only pilot
          chain.
        </p>
        {s.goals.length > 0 ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-semibold">{s.goals[0].title}</p>
            <p className="text-sm">
              {Object.keys(s.goalActivityRecords[s.goals[0].id] ?? {}).length > 0 ? "✅" : "⬜"}
              Record a result from one guided activity
            </p>
            <p className="text-sm">
              {s.readinessByGoal?.[s.goals[0].id] !== undefined ? "✅" : "⬜"}
              Complete readiness practice for this ambition
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Define an ambition to unlock missions connected to your own journey.
          </p>
        )}
        <div className="mt-3">
          <Link to="/play" hash="mission-board">
            <Btn>Open ambition mission board →</Btn>
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

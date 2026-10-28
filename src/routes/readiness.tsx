import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Shell, Card, Btn, meta } from "@/components/Shell";
import { useStore, shouldAwardReadinessXp, bestReadinessScore, type Goal } from "@/lib/store";
import { journeyFor, readinessFor } from "@/lib/journeys";
import { naira } from "@/lib/data";

export const Route = createFileRoute("/readiness")({
  head: () => meta("Readiness Practice", "Scenario-based practice for decisions relevant to your ambition."),
  component: Readiness,
});

function Readiness() {
  const { s, set, gain } = useStore();
  const location = useLocation();
  const requestedGoalId = typeof location.search.goal === "string" ? location.search.goal : "";
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const rewardActionInFlight = useRef<string | null>(null);
  const selectedGoal: Goal | undefined =
    s.goals.find((goal) => goal.id === (selectedGoalId || requestedGoalId)) ?? s.goals[0];
  const questions = readinessFor(selectedGoal?.id ?? "", selectedGoal?.title ?? "your ambition");
  const journey = selectedGoal
    ? (s.aiJourneys?.[selectedGoal.id] ?? journeyFor(selectedGoal.id, selectedGoal.title))
    : null;
  const activityRecords = selectedGoal ? (s.goalActivityRecords?.[selectedGoal.id] ?? {}) : {};
  const completedActivities = journey?.activities.filter((activity) => Boolean(activityRecords[activity.id])).length ?? 0;
  const totalActivities = journey?.activities.length ?? 0;
  const savedPercent = selectedGoal && selectedGoal.target > 0
    ? Math.min(100, Math.round((selectedGoal.saved / selectedGoal.target) * 100))
    : 0;
  const journeyProgress = selectedGoal ? (s.journeyProgressByGoal?.[selectedGoal.id] ?? { stage: 0, notes: [] }) : { stage: 0, notes: [] };
  const bestPracticeScore = selectedGoal ? s.readinessByGoal?.[selectedGoal.id] : s.readiness;
  const done = i >= questions.length;
  const q = questions[Math.min(i, questions.length - 1)]!;

  const chooseGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setI(0);
    setScore(0);
    setPick(null);
  };

  const retake = () => {
    setI(0);
    setScore(0);
    setPick(null);
  };

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Readiness Practice</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Practise decisions connected to the ambition you are pursuing. Your score is a learning aid,
        not certification or confirmation that an ambition is affordable, booked, or ready to happen.
      </p>

      {s.goals.length > 0 ? (
        <Card className="mt-4">
          <label htmlFor="readiness-ambition" className="block text-sm font-semibold">
            Practise for this ambition
          </label>
          <select
            id="readiness-ambition"
            value={selectedGoal?.id ?? ""}
            onChange={(event) => chooseGoal(event.target.value)}
            className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm"
          >
            {s.goals.map((goal) => (
              <option key={goal.id} value={goal.id}>{goal.title}</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-muted-foreground">
            Questions are selected for this ambition and its preparation journey. Change the ambition
            to practise a different set of decisions.
          </p>
        </Card>
      ) : (
        <Card className="mt-4">
          <p className="font-semibold">Start by defining an ambition</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The practice questions become more useful when they can refer to a real ambition. You can
            still practise general planning decisions below.
          </p>
        </Card>
      )}

      {selectedGoal && (
        <Card className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Preparation snapshot</p>
          <h2 className="mt-1 text-xl font-bold">{selectedGoal.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A practical view of what you have recorded so far. This is not a certification or an automatic verdict that you are ready.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Journey activities recorded</p>
              <p className="mt-1 text-lg font-bold">{completedActivities}/{totalActivities}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${totalActivities ? (completedActivities / totalActivities) * 100 : 0}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Based on results you have recorded for this ambition.</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Savings progress</p>
              <p className="mt-1 text-lg font-bold">{savedPercent}%</p>
              <p className="mt-1 text-sm">{naira(selectedGoal.saved)} of {naira(selectedGoal.target)}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${savedPercent}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Self-reported tracking only; this app does not hold or verify funds. Savings may not be relevant to every ambition.</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Journey reflections</p>
              <p className="mt-1 text-lg font-bold">{journeyProgress.notes.length} recorded</p>
              <p className="mt-1 text-xs text-muted-foreground">Reflections help capture what you did or learned, beyond quiz answers.</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Best practice score</p>
              <p className="mt-1 text-lg font-bold">{bestPracticeScore === undefined ? "Not taken yet" : `${bestPracticeScore}/${questions.length}`}</p>
              <p className="mt-1 text-xs text-muted-foreground">A learning indicator, not proof of affordability, skill, approval, booking, or completion.</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-secondary/60 p-3">
            <p className="text-sm font-semibold">What to do next</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {completedActivities < totalActivities
                ? "Continue the next unrecorded activity and capture what happened. Use the result to decide your next practical move."
                : journeyProgress.notes.length === 0
                  ? "Your listed activities are recorded. Add a meaningful reflection about what you learned, then review any remaining real-world requirements."
                  : "Review the evidence you have gathered, verify any outstanding requirements, and confirm costs or arrangements with appropriate sources before committing."}
            </p>
          </div>
        </Card>
      )}

      {done ? (
        <Card className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Practice result</p>
          <p className="mt-1 text-2xl font-bold">{score}/{questions.length}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {score >= 2
              ? "Good practice result. Review the remaining requirements for this ambition before making real-world commitments."
              : "Use the explanations to strengthen your planning, then try again. No penalties."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This score is for {selectedGoal?.title ?? "general ambition planning"} only. It does not
            replace financial checks, recorded activities, current requirements, professional advice,
            or provider confirmation.
          </p>
          <div className="mt-3"><Btn onClick={retake}>Retake practice</Btn></div>
        </Card>
      ) : (
        <Card className="mt-4">
          <p className="text-xs text-muted-foreground">Scenario {i + 1}/{questions.length}</p>
          <p className="mt-1 font-semibold">{q.q}</p>
          <div className="mt-3 space-y-2">
            {q.opts.map((option, k) => (
              <button
                key={option}
                disabled={pick !== null}
                onClick={() => {
                  setPick(k);
                  if (k === q.correct) setScore((current) => current + 1);
                }}
                className={`block w-full rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                  pick === null
                    ? "border-border hover:border-primary"
                    : k === q.correct
                      ? "border-success bg-success/20"
                      : k === pick
                        ? "border-destructive"
                        : "border-border opacity-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {pick !== null && (
            <div className="mt-3 text-sm">
              <p>💡 {q.tip}</p>
              <div className="mt-3">
                <Btn onClick={() => {
                  const next = i + 1;
                  if (next >= questions.length) {
                    const goalKey = selectedGoal?.id ?? "__general__";
                    const shouldReward = shouldAwardReadinessXp(s.readinessRewardedByGoal ?? {}, goalKey)
                      && rewardActionInFlight.current !== goalKey;
                    if (shouldReward) rewardActionInFlight.current = goalKey;
                    set((p) => {
                      const alreadyRewarded = !shouldAwardReadinessXp(p.readinessRewardedByGoal ?? {}, goalKey);
                      return {
                        ...p,
                        readiness: Math.max(p.readiness, score),
                        readinessByGoal: {
                          ...(p.readinessByGoal ?? {}),
                          [goalKey]: bestReadinessScore(p.readinessByGoal?.[goalKey], score),
                        },
                        readinessRewardedByGoal: alreadyRewarded
                          ? (p.readinessRewardedByGoal ?? {})
                          : { ...(p.readinessRewardedByGoal ?? {}), [goalKey]: true },
                      };
                    });
                    if (shouldReward) gain(25, { Presence: 10 });
                  }
                  setI(next);
                  setPick(null);
                }}>
                  {i + 1 >= questions.length ? "See my result" : "Next scenario"}
                </Btn>
              </div>
            </div>
          )}
        </Card>
      )}
    </Shell>
  );
}

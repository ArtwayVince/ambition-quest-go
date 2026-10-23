import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Shell, Card, Btn, meta } from "@/components/Shell";
import { useStore, shouldAwardReadinessXp, type Goal } from "@/lib/store";
import { readinessFor } from "@/lib/journeys";

export const Route = createFileRoute("/readiness")({
  head: () => meta("Readiness Practice", "Scenario-based practice for decisions relevant to your ambition."),
  component: Readiness,
});

function Readiness() {
  const { s, set, gain } = useStore();
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const rewardActionInFlight = useRef<string | null>(null);
  const selectedGoal: Goal | undefined =
    s.goals.find((goal) => goal.id === selectedGoalId) ?? s.goals[0];
  const questions = readinessFor(selectedGoal?.id ?? "", selectedGoal?.title ?? "your ambition");
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
                        readinessByGoal: { ...(p.readinessByGoal ?? {}), [goalKey]: score },
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

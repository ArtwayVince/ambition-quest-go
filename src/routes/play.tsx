import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Shell, Card, Btn, Notice, meta } from "@/components/Shell";
import { useStore, shouldAwardScenarioXp, type Attr } from "@/lib/store";
import { BUDGET_SCENARIOS, naira } from "@/lib/data";
import { journeyFor } from "@/lib/journeys";

export const Route = createFileRoute("/play")({
  head: () => meta("Play", "Budget trade-off simulator with ₦100,000 practice currency and the 3-step pilot mission chain."),
  component: Play,
});

function Play() {
  const { s, set, gain } = useStore();
  const [q, setQ] = useState(0);
  const [fb, setFb] = useState("");
  const decisionLocked = useRef(false);
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const scenarioIndex = q % BUDGET_SCENARIOS.length;
  const sc = BUDGET_SCENARIOS[scenarioIndex]!;
  const missionGoal = s.goals.find((goal) => goal.id === selectedGoalId) ?? s.goals[0];
  const missionJourney = missionGoal
    ? (s.aiJourneys?.[missionGoal.id] ?? journeyFor(missionGoal.id, missionGoal.title))
    : null;
  const missionRecords = missionGoal ? (s.goalActivityRecords[missionGoal.id] ?? {}) : {};
  const nextMissionActivity = missionJourney?.activities.find((activity) => !missionRecords[activity.id]);
  const missionActivityDone = Object.keys(missionRecords).length > 0;
  const missionReadinessDone = missionGoal ? s.readinessByGoal?.[missionGoal.id] !== undefined : false;

  useEffect(() => {
    decisionLocked.current = false;
  }, [fb, q]);

  const choose = (c: {
    label: string;
    cost: number;
    xp: Partial<Record<Attr, number>>;
    feedback: string;
  }) => {
    if (decisionLocked.current || fb) return;
    decisionLocked.current = true;
    if (c.cost > s.wallet) {
      setFb("Not enough practice currency — in real life, this is when people borrow. Consider waiting.");
      return;
    }

    const awardXp = shouldAwardScenarioXp(s.budgetCompleted, scenarioIndex);
    set((p) => ({
      ...p,
      wallet: p.wallet - c.cost,
      budgetCompleted: shouldAwardScenarioXp(p.budgetCompleted, scenarioIndex)
        ? [...p.budgetCompleted, scenarioIndex]
        : p.budgetCompleted,
    }));
    if (awardXp) gain(10, c.xp);
    const costText = c.cost ? ` (−${naira(c.cost)})` : "";
    const rewardText = awardXp
      ? " (+10 XP)"
      : " This scenario was already rewarded; no extra XP this time.";
    setFb(`${c.feedback}${costText}${rewardText}`);
  };

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Play</h1>
      <Notice>Practice currency for missions, not real money. No cash value; cannot be withdrawn.</Notice>

      <Card className="mt-4">
        <div className="flex justify-between"><h2 className="font-bold">Budget trade-off simulator</h2><span className="text-sm text-primary">{naira(s.wallet)}</span></div>
        <p className="mt-3">{sc.q}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          First completion rewards XP once per scenario. Repeating a scenario is still useful practice,
          but does not award XP again.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Scenarios rewarded: {s.budgetCompleted.length}/{BUDGET_SCENARIOS.length}
        </p>
        <div className="mt-3 flex gap-2">
          <Btn disabled={Boolean(fb)} onClick={() => choose(sc.a)}>
            {sc.a.label}{sc.a.cost ? ` (${naira(sc.a.cost)})` : ""}
          </Btn>
          <Btn variant="ghost" disabled={Boolean(fb)} onClick={() => choose(sc.b)}>
            {sc.b.label}
          </Btn>
        </div>
        {fb && (
          <div className="mt-3 rounded-xl bg-secondary p-3 text-sm">
            💡 {fb}
            <div className="mt-2"><Btn variant="ghost" onClick={() => { setFb(""); setQ(q + 1); }}>Next decision</Btn></div>
          </div>
        )}
        <button className="mt-3 text-xs text-muted-foreground underline" onClick={() => set((p) => ({ ...p, wallet: 100000 }))}>Restart with ₦100,000</button>
      </Card>

      <h2 id="mission-board" className="mt-8 scroll-mt-4 text-xl font-bold">Ambition mission board</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        These missions are based on progress already recorded in your current ambition. Completing the real action in the app updates the board automatically; there are no separate mission checkboxes.
      </p>
      {s.goals.length > 0 ? (
        <>
          <Card className="mt-3">
            <label htmlFor="mission-ambition" className="block text-sm font-semibold">Mission focus</label>
            <select
              id="mission-ambition"
              value={missionGoal?.id ?? ""}
              onChange={(event) => setSelectedGoalId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm"
            >
              {s.goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
            </select>
            <p className="mt-2 text-xs text-muted-foreground">Mission status is calculated separately for the ambition you select.</p>
          </Card>
          <Card className="mt-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">{missionGoal ? "🎯" : "1."}</span>
              <div className="flex-1">
                <h3 className="font-bold">{missionGoal?.title ?? "Choose an ambition"}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Mission 1 · Establish your direction</p>
                <p className="mt-2 text-sm">Your ambition is on record. Use its guided journey to turn it into practical steps.</p>
                <p className="mt-2 text-xs font-semibold text-success">Complete ✓</p>
                <div className="mt-3"><Link to="/goals"><Btn variant="ghost">Review ambition and savings →</Btn></Link></div>
              </div>
            </div>
          </Card>
          <Card className="mt-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">{missionActivityDone ? "✅" : "2."}</span>
              <div className="flex-1">
                <h3 className="font-bold">Record a practical result</h3>
                <p className="mt-1 text-sm text-muted-foreground">Mission 2 · Complete one guided activity and save what happened or what you learned.</p>
                <p className="mt-2 text-sm">{missionActivityDone ? `You have ${Object.keys(missionRecords).length} activity result(s) recorded for this ambition.` : "No guided activity result is recorded for this ambition yet."}</p>
                <p className="mt-2 text-xs font-semibold">{missionActivityDone ? "Complete ✓" : "In progress"}</p>
                {nextMissionActivity ? (
                  <div className="mt-3"><Link to="/dashboard" hash={"activity-" + missionGoal!.id + "-" + nextMissionActivity.id}><Btn>{missionActivityDone ? "Continue guided journey →" : "Start first activity →"}</Btn></Link></div>
                ) : (
                  <div className="mt-3"><Link to="/goals"><Btn variant="ghost">Review recorded activities →</Btn></Link></div>
                )}
              </div>
            </div>
          </Card>
          <Card className="mt-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">{missionReadinessDone ? "✅" : "3."}</span>
              <div className="flex-1">
                <h3 className="font-bold">Test your preparation</h3>
                <p className="mt-1 text-sm text-muted-foreground">Mission 3 · Practise decisions relevant to this ambition and review the explanations.</p>
                <p className="mt-2 text-sm">{missionReadinessDone ? `Practice result recorded: ${s.readinessByGoal?.[missionGoal!.id]}/${missionJourney?.activities.length ? 4 : 4}.` : "Readiness practice has not been completed for this ambition yet."}</p>
                <p className="mt-2 text-xs font-semibold">{missionReadinessDone ? "Complete ✓" : "In progress"}</p>
                <div className="mt-3"><Link to="/readiness"><Btn>{missionReadinessDone ? "Practise again" : "Start readiness practice →"}</Btn></Link></div>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card className="mt-3">
          <h3 className="font-bold">Mission 1 · Establish your direction</h3>
          <p className="mt-1 text-sm text-muted-foreground">Start by adding an ambition. Your mission board will then track guided activity results and readiness practice for that ambition.</p>
          <div className="mt-3"><Link to="/goals"><Btn>Define my ambition →</Btn></Link></div>
        </Card>
      )}
    </Shell>
  );
}

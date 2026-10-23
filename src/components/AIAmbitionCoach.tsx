import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Btn, Card } from "@/components/Shell";
import { useStore } from "@/lib/store";
import { journeyFor } from "@/lib/journeys";
import {
  clarifyAmbition,
  generateAmbitionJourney,
  type AIJourneyDraft,
  type ClarificationTurn,
} from "@/lib/ai-coach";
import type { GoalJourney } from "@/lib/journeys";

type ClarificationStatus = "idle" | "question" | "ready";

export function AIAmbitionCoach() {
  const { s, set } = useStore();
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [context, setContext] = useState("");
  const [draft, setDraft] = useState<AIJourneyDraft | null>(null);
  const [draftGoalId, setDraftGoalId] = useState("");
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<ClarificationTurn[]>([]);
  const [clarificationStatus, setClarificationStatus] = useState<ClarificationStatus>("idle");
  const [clarificationQuestion, setClarificationQuestion] = useState("");
  const [clarifiedBrief, setClarifiedBrief] = useState("");
  const [clarificationAnswer, setClarificationAnswer] = useState("");
  const [briefConfirmed, setBriefConfirmed] = useState(false);
  const [hydratedGoalId, setHydratedGoalId] = useState("");
  const selectedGoal = s.goals.find((goal) => goal.id === selectedGoalId) ?? s.goals[0];
  const [busyMessage, setBusyMessage] = useState("Understanding your ambition…");

  useEffect(() => {
    if (!busy || typeof window === "undefined") return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [busy]);

  useEffect(() => {
    const goalId = selectedGoal?.id;
    if (!goalId || typeof window === "undefined") return;
    setHydratedGoalId("");
    try {
      const saved = window.localStorage.getItem(`aqg-clarifier:${goalId}`);
      if (saved) {
        const session = JSON.parse(saved) as {
          context?: string;
          turns?: ClarificationTurn[];
          clarificationStatus?: ClarificationStatus;
          clarificationQuestion?: string;
          clarifiedBrief?: string;
          briefConfirmed?: boolean;
        };
        setContext(typeof session.context === "string" ? session.context : "");
        setTurns(Array.isArray(session.turns) ? session.turns : []);
        setClarificationStatus(session.clarificationStatus ?? "idle");
        setClarificationQuestion(session.clarificationQuestion ?? "");
        setClarifiedBrief(session.clarifiedBrief ?? "");
        setBriefConfirmed(session.briefConfirmed === true);
      } else {
        setContext("");
        setTurns([]);
        setClarificationStatus("idle");
        setClarificationQuestion("");
        setClarifiedBrief("");
        setBriefConfirmed(false);
      }
      setClarificationAnswer("");
      setDraft(null);
      setDraftGoalId("");
    } catch {
      setContext("");
      setTurns([]);
      setClarificationStatus("idle");
      setClarificationQuestion("");
      setClarifiedBrief("");
      setBriefConfirmed(false);
      setClarificationAnswer("");
    }
    setHydratedGoalId(goalId);
  }, [selectedGoal?.id]);

  useEffect(() => {
    if (!selectedGoal || hydratedGoalId !== selectedGoal.id || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(`aqg-clarifier:${selectedGoal.id}`, JSON.stringify({
        context,
        turns,
        clarificationStatus,
        clarificationQuestion,
        clarifiedBrief,
        briefConfirmed,
      }));
    } catch {
      // The clarification can still be used for this session if browser storage is unavailable.
    }
  }, [selectedGoal, hydratedGoalId, context, turns, clarificationStatus, clarificationQuestion, clarifiedBrief, briefConfirmed]);

  const startClarification = async (confirmIfReady = false) => {
    if (!selectedGoal) {
      toast.error("Define an ambition before continuing.");
      return;
    }
    setBusyMessage("Understanding your ambition…");
    setBusy(true);
    setDraft(null);
    try {
      const result = await clarifyAmbition({
        data: { title: selectedGoal.title, context: context.trim(), turns: [] },
      });
      setTurns(result.status === "question" ? [{ role: "assistant", content: result.question }] : []);
      setClarificationStatus(result.status);
      setClarificationQuestion(result.status === "question" ? result.question : "");
      setClarifiedBrief(result.status === "ready" ? result.clarifiedBrief : "");
      setBriefConfirmed(result.status === "ready" && confirmIfReady);
      setClarificationAnswer("");
      if (result.status === "ready" && confirmIfReady) {
        toast.success("The ambition is clear. You can now create your tailored journey.");
      } else {
        toast.success(result.status === "ready" ? "The ambition is clear enough to review." : "Let's make the ambition more specific.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't clarify this ambition. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitClarificationAnswer = async () => {
    if (!selectedGoal) return;
    const answer = clarificationAnswer.trim();
    if (answer.length < 2) {
      toast.error("Please add a little more detail so the coach can understand.");
      return;
    }
    const nextTurns: ClarificationTurn[] = [...turns, { role: "user", content: answer }];
    setBusyMessage("Checking your answer…");
    setBusy(true);
    setDraft(null);
    try {
      const result = await clarifyAmbition({
        data: { title: selectedGoal.title, context: context.trim(), turns: nextTurns },
      });
      const savedTurns = result.status === "question"
        ? [...nextTurns, { role: "assistant" as const, content: result.question }]
        : nextTurns;
      setTurns(savedTurns);
      setClarificationStatus(result.status);
      setClarificationQuestion(result.status === "question" ? result.question : "");
      setClarifiedBrief(result.status === "ready" ? result.clarifiedBrief : "");
      setBriefConfirmed(false);
      setClarificationAnswer("");
      toast.success(result.status === "ready" ? "The ambition is ready for your review." : "Thanks. Let's clarify one more detail.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't process that answer. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const askForCorrection = () => {
    const prompt = "What should I correct or add to this understanding?";
    setTurns((previous) => [...previous, { role: "assistant", content: prompt }]);
    setClarificationQuestion(prompt);
    setClarificationStatus("question");
    setClarificationAnswer("");
    setBriefConfirmed(false);
  };

  const generate = async () => {
    if (!selectedGoal || !briefConfirmed || !clarifiedBrief.trim()) {
      toast.error("Clarify and confirm what you want to achieve before generating a journey.");
      return;
    }
    setBusyMessage("Building your tailored journey…");
    setBusy(true);
    setDraft(null);
    try {
      const records = Object.values(s.goalActivityRecords[selectedGoal.id] ?? {})
        .slice(-5)
        .map((record) => record.result);
      const confirmedContext = [
        context.trim(),
        `Confirmed ambition brief: ${clarifiedBrief.trim()}`,
        "Use the confirmed brief as the user's intended outcome. Do not guess a different interpretation.",
      ].filter(Boolean).join("\n\n");
      const result = await generateAmbitionJourney({
        data: {
          title: selectedGoal.title,
          context: confirmedContext,
          completedActivityResults: records,
        },
      });
      setDraft(result);
      setDraftGoalId(selectedGoal.id);
      toast.success("A tailored journey has been generated. Review it before applying it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't generate a journey. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const applyJourney = async () => {
    if (!draft || !selectedGoal || draftGoalId !== selectedGoal.id || !briefConfirmed) return;
    setBusyMessage("Applying your tailored journey…");
    setBusy(true);
    // Yield briefly so the shared spinner/status panel can render before local plan updates.
    await new Promise<void>((resolve) => window.setTimeout(resolve, 50));
    try {
      const appliedAt = new Date().toISOString();
      const planId = Date.now().toString();
      const journey: GoalJourney = {
        planner: draft.planner,
        activities: draft.activities.map((activity, index) => ({
          id: `${selectedGoal.id}-ai-${planId}-${index + 1}`,
          title: activity.title,
          guidance: activity.guidance,
          why: activity.why,
          resultPrompt: activity.resultPrompt,
          milestoneId: `${selectedGoal.id}-ai-milestone-${planId}-${index + 1}`,
        })),
        milestones: draft.activities.map((activity, index) => ({
          id: `${selectedGoal.id}-ai-milestone-${planId}-${index + 1}`,
          title: activity.milestoneTitle,
          description: activity.milestoneDescription,
          activityId: `${selectedGoal.id}-ai-${planId}-${index + 1}`,
        })),
      };
      set((previous) => {
        const oldJourney = previous.aiJourneys?.[selectedGoal.id] ?? journeyFor(selectedGoal.id, selectedGoal.title);
        const oldRecords = previous.goalActivityRecords[selectedGoal.id] ?? {};
        const oldTitles = new Map(oldJourney.activities.map((activity) => [activity.id, activity.title]));
        const archived = Object.entries(oldRecords)
          .filter(([, record]) => typeof record.result === "string" && record.result.trim())
          .map(([activityId, record], index) => ({
            id: `${planId}-${index}-${activityId}`,
            planTitle: "Previous guided plan",
            activityTitle: oldTitles.get(activityId) ?? "Earlier guided activity",
            result: record.result,
            completedAt: record.completedAt,
            archivedAt: appliedAt,
          }));
        const goalActivityHistory = { ...(previous.goalActivityHistory ?? {}) };
        goalActivityHistory[selectedGoal.id] = [...(goalActivityHistory[selectedGoal.id] ?? []), ...archived];
        const goalActivityRecords = { ...previous.goalActivityRecords };
        delete goalActivityRecords[selectedGoal.id];
        const goalNextActions = { ...(previous.goalNextActions ?? {}) };
        goalNextActions[selectedGoal.id] = (goalNextActions[selectedGoal.id] ?? []).map((action) =>
          action.archivedAt ? action : { ...action, archivedAt: appliedAt },
        );
        return {
          ...previous,
          aiJourneys: { ...(previous.aiJourneys ?? {}), [selectedGoal.id]: journey },
          goalActivityRecords,
          goalActivityHistory,
          goalNextActions,
        };
      });
      setDraft(null);
      toast.success("New journey applied. Previous activity results are preserved for review.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mt-4 border-primary/30">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">AI ambition coach · Preview</p>
      <h2 className="mt-1 text-xl font-bold">Let's understand your ambition first</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us what you want to achieve. If the meaning is unclear, the coach will ask simple follow-up questions before creating a plan. You can correct its understanding before anything is applied.
      </p>

      {s.goals.length ? (
        <>
          <label htmlFor="ai-coach-goal" className="mt-4 block text-sm font-semibold">Choose an ambition</label>
          <select
            id="ai-coach-goal"
            value={selectedGoal?.id ?? ""}
            disabled={busy}
            onChange={(event) => {
              setSelectedGoalId(event.target.value);
              setDraft(null);
            }}
            className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm"
          >
            {s.goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
          </select>
          <label htmlFor="ai-coach-context" className="mt-3 block text-sm font-semibold">What should the coach know? (optional)</label>
          <textarea
            id="ai-coach-context"
            value={context}
            disabled={busy}
            onChange={(event) => setContext(event.target.value)}
            maxLength={1200}
            rows={3}
            placeholder="Your starting point, what you mean, constraints, skills, location, timeframe, or what you have already tried."
            className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">{context.length}/1200 characters. Avoid entering private or sensitive information.</p>

          {busy && (
            <div role="status" aria-live="polite" className="mt-3 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
              <span aria-hidden="true" className="mt-0.5 inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <div>
                <p className="text-sm font-semibold text-primary">{busyMessage}</p>
                <p className="mt-1 text-xs text-muted-foreground">Please keep this page open while the coach is working. You’ll see the result here when the request finishes.</p>
              </div>
            </div>
          )}

          {clarificationStatus === "idle" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn disabled={busy || !selectedGoal} onClick={() => startClarification(false)}>
                {busy ? "Understanding your ambition…" : "Clarify my ambition"}
              </Btn>
              <Btn disabled={busy || !selectedGoal} variant="ghost" onClick={() => startClarification(true)}>
                {busy ? "Sending to AI Coach…" : "Send to AI Coach"}
              </Btn>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {turns.length > 0 && (
                <div className="space-y-2">
                  {turns.map((turn, index) => (
                    <div key={index} className={turn.role === "assistant" ? "rounded-xl border border-primary/20 bg-primary/5 p-3" : "ml-4 rounded-xl border border-border p-3"}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{turn.role === "assistant" ? "Ambition coach" : "Your answer"}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{turn.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {clarificationStatus === "question" && (
                <div className="rounded-xl border border-primary/30 p-3">
                  <p className="font-semibold">Let's make sure we understand</p>
                  <p className="mt-1 text-sm text-muted-foreground">Answer in your own words. If this is still unclear, the coach will ask another focused question.</p>
                  <label htmlFor="ai-clarification-answer" className="mt-3 block text-sm font-semibold">Your answer</label>
                  <textarea
                    id="ai-clarification-answer"
                    value={clarificationAnswer}
                    onChange={(event) => setClarificationAnswer(event.target.value)}
                    maxLength={1200}
                    rows={3}
                    placeholder="Explain what you mean…"
                    className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  />
                  <Btn disabled={busy || clarificationAnswer.trim().length < 2} onClick={submitClarificationAnswer}>
                    {busy ? "Checking your answer…" : "Send answer"}
                  </Btn>
                </div>
              )}

              {clarificationStatus === "ready" && (
                <div className="rounded-xl border border-success/30 bg-success/5 p-3">
                  <p className="font-semibold">Is this what you mean?</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{clarifiedBrief}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Review this carefully. The journey will be based on this understanding.</p>
                  {!briefConfirmed ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Btn disabled={busy} onClick={() => setBriefConfirmed(true)}>Confirm understanding & continue</Btn>
                      <Btn disabled={busy} variant="ghost" onClick={askForCorrection}>Not quite — let me clarify</Btn>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-semibold text-success">Understanding confirmed.</p>
                      <div className="flex flex-wrap gap-2">
                        <Btn disabled={busy} onClick={generate}>{busy ? "Building your journey…" : "Create my tailored journey"}</Btn>
                        <Btn disabled={busy} variant="ghost" onClick={askForCorrection}>Change my answer</Btn>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm font-medium">Define your ambition first to begin the clarification process.</p>
      )}

      {draft && draftGoalId === selectedGoal?.id && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            <p className="font-semibold">Universal plan overview</p>
            <p className="mt-1 text-sm">{draft.summary}</p>
          </div>
          <section className="rounded-xl border border-border p-3">
            <h3 className="font-semibold">What this ambition requires</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {draft.planner.requirements.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </section>
          <section className="rounded-xl border border-border p-3">
            <h3 className="font-semibold">Resources to consider</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {draft.planner.resources.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </section>
          <section className="rounded-xl border border-border p-3">
            <h3 className="font-semibold">Unknowns to verify</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {draft.planner.uncertainties.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </section>
          <section className="rounded-xl border border-border p-3">
            <h3 className="font-semibold">Risks and safeguards</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {draft.planner.risks.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </section>
          <section className="rounded-xl border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Your next action</p>
            <p className="mt-1 text-sm">{draft.planner.firstAction}</p>
          </section>
          {draft.activities.map((activity, index) => (
            <section key={index} className="rounded-xl border border-border p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity {index + 1}</p>
              <h3 className="mt-1 font-semibold">{activity.title}</h3>
              <p className="mt-2 text-sm">{activity.guidance}</p>
              <p className="mt-2 text-xs text-muted-foreground">Why it matters: {activity.why}</p>
              <p className="mt-2 text-sm"><span className="font-semibold">Record your result:</span> {activity.resultPrompt}</p>
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-sm font-semibold">Milestone: {activity.milestoneTitle}</p>
                <p className="mt-1 text-xs text-muted-foreground">{activity.milestoneDescription}</p>
              </div>
            </section>
          ))}
          <p className="text-xs text-muted-foreground">
            Applying replaces the displayed activity plan for this ambition, but does not delete its existing self-reported records. AI-generated content is a suggestion, not verification of facts or outcomes.
          </p>
          <Btn disabled={busy} onClick={applyJourney}>{busy ? "Applying your journey…" : "Apply this journey"}</Btn>
        </div>
      )}
    </Card>
  );
}

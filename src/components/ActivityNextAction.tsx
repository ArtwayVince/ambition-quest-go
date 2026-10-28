import { useState } from "react";
import { toast } from "sonner";
import { Btn } from "@/components/Shell";
import { useStore, type GoalNextAction } from "@/lib/store";
import { journeyFor } from "@/lib/journeys";
import { recommendAmbitionNextAction } from "@/lib/ai-coach";

export function ActivityNextAction({ goalId, activityId }: { goalId: string; activityId: string }) {
  const { s, set } = useStore();
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState("");
  const [clarification, setClarification] = useState("");
  const [actionResult, setActionResult] = useState("");
  const goal = s.goals.find((item) => item.id === goalId);
  const journey = goal ? (s.aiJourneys?.[goalId] ?? journeyFor(goalId, goal.title)) : null;
  const activity = journey?.activities.find((item) => item.id === activityId);
  const record = s.goalActivityRecords[goalId]?.[activityId];
  const actions = (s.goalNextActions?.[goalId] ?? []).filter((item) => item.sourceActivityId === activityId && !item.archivedAt);
  const latest = actions[actions.length - 1];

  if (!goal || !activity || !record) return null;

  const requestSuggestion = async (answer = "", previous = latest?.recommendation ?? "", completedAction?: GoalNextAction) => {
    setBusy(true);
    try {
      const sourceIsActionFollowup = Boolean(completedAction) || Boolean(latest?.sourceActionId) || latest?.status === "completed";
      const sourceTitle = completedAction?.title ?? (latest?.status === "completed" ? latest.title : sourceIsActionFollowup ? latest!.sourceActivityTitle : activity.title);
      const sourceResult = completedAction?.result ?? (latest?.status === "completed" ? (latest.result ?? "") : sourceIsActionFollowup ? latest!.sourceResult : record.result);
      let ambitionBrief = "";
      try {
        const saved = window.localStorage.getItem(`aqg-clarifier:${goalId}`);
        if (saved) {
          const session = JSON.parse(saved) as { clarifiedBrief?: unknown; briefConfirmed?: unknown };
          if (session.briefConfirmed === true && typeof session.clarifiedBrief === "string") {
            ambitionBrief = session.clarifiedBrief.trim().slice(0, 1000);
          }
        }
      } catch {
        // Continue with the recorded activity and planner if browser storage is unavailable.
      }
      const draft = await recommendAmbitionNextAction({
        data: {
          title: goal.title,
          ambitionBrief,
          activityTitle: sourceTitle,
          activityGuidance: completedAction?.recommendation ?? (sourceIsActionFollowup ? latest!.recommendation : activity.guidance),
          result: sourceResult,
          planner: journey?.planner,
          previousSuggestion: previous,
          clarification: answer,
        },
      });
      const next: GoalNextAction = {
        id: `next-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sourceActivityId: activityId,
        sourceActionId: sourceIsActionFollowup ? (completedAction?.id ?? latest!.id) : undefined,
        sourceActivityTitle: sourceTitle,
        sourceResult,
        ...draft,
        status: "proposed",
        createdAt: new Date().toISOString(),
      };
      set((previousState) => ({
        ...previousState,
        goalNextActions: {
          ...(previousState.goalNextActions ?? {}),
          [goalId]: [...(previousState.goalNextActions?.[goalId] ?? []), next],
        },
      }));
      setClarification("");
      setRevision("");
      setActionResult("");
      toast.success("Next-step recommendation is ready. Review it before accepting.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message === "Failed to fetch" || error instanceof TypeError) {
        toast.error(
          "The AI request could not reach the app server. Your recorded result is safe. Refresh the app and try again; if it persists, the preview/server-function connection or server AI configuration needs attention.",
          { duration: 8000 },
        );
      } else {
        toast.error(message || "Couldn't generate a recommendation. Your result is safe; try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const updateLatest = (updates: Partial<GoalNextAction>) => {
    if (!latest) return;
    set((previousState) => ({
      ...previousState,
      goalNextActions: {
        ...(previousState.goalNextActions ?? {}),
        [goalId]: (previousState.goalNextActions?.[goalId] ?? []).map((item) =>
          item.id === latest.id ? { ...item, ...updates } : item,
        ),
      },
    }));
  };

  const accept = () => {
    if (!latest || latest.status !== "proposed") return;
    const proposedText = revision.trim() || latest.recommendation;
    updateLatest({ recommendation: proposedText, status: "accepted", acceptedAt: new Date().toISOString() });
    setRevision("");
    toast.success("Next action accepted and saved to your ambition.");
  };

  const completeAcceptedAction = () => {
    const result = actionResult.trim();
    if (!latest || latest.status !== "accepted") return;
    if (result.length < 10) {
      toast.error("Record at least 10 characters about what happened.");
      return;
    }
    const completedAction = { ...latest, status: "completed" as const, result, completedAt: new Date().toISOString() };
    updateLatest({ status: "completed", result, completedAt: completedAction.completedAt });
    setActionResult("");
    void requestSuggestion("", latest.recommendation, completedAction);
  };

  return (
    <div className="mt-3 rounded-lg border border-primary/25 bg-background p-3">
      {!latest ? (
        <>
          <p className="text-sm font-semibold">What should happen next?</p>
          <p className="mt-1 text-xs text-muted-foreground">Ask the AI Coach to interpret this result and suggest a practical next action. Nothing changes until you accept a suggestion.</p>
          <Btn disabled={busy} onClick={() => void requestSuggestion()}>{busy ? "Thinking through your result…" : "Get next-step recommendation"}</Btn>
        </>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {latest.status === "accepted" ? "Your accepted next action" : latest.status === "completed" ? "Action result recorded" : "AI next-step suggestion"}
          </p>
          <p className="mt-1 font-semibold">{latest.title}</p>
          <p className="mt-1 text-sm">{latest.recommendation}</p>
          <p className="mt-2 text-xs text-muted-foreground">{latest.rationale}</p>
          {latest.followUpQuestion && latest.category === "clarify" && latest.status === "proposed" && (
            <div className="mt-3 space-y-2">
              <label className="block text-sm font-semibold">One detail to clarify</label>
              <p className="text-sm">{latest.followUpQuestion}</p>
              <textarea value={clarification} onChange={(event) => setClarification(event.target.value)} maxLength={1000} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Add your answer…" />
              <Btn disabled={busy || clarification.trim().length < 2} onClick={() => void requestSuggestion(clarification.trim(), latest.recommendation)}>Use my answer</Btn>
            </div>
          )}
          {latest.status === "proposed" && (
            <div className="mt-3 space-y-2">
              <label className="block text-sm font-semibold">Revise the action (optional)</label>
              <textarea value={revision} onChange={(event) => setRevision(event.target.value)} maxLength={400} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Adjust the recommendation before accepting…" />
              <div className="flex flex-wrap gap-2">
                <Btn disabled={busy} onClick={accept}>Accept this action</Btn>
                <Btn variant="ghost" disabled={busy} onClick={() => void requestSuggestion("", latest.recommendation)}>Ask for another suggestion</Btn>
              </div>
            </div>
          )}
          {latest.status === "accepted" && (
            <div className="mt-3 space-y-2">
              <label className="block text-sm font-semibold">When you try this action, record what happened</label>
              <textarea value={actionResult} onChange={(event) => setActionResult(event.target.value)} maxLength={500} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="What did you do, find out, or learn? (at least 10 characters)" />
              <Btn disabled={busy || actionResult.trim().length < 10} onClick={completeAcceptedAction}>Record action result &amp; decide what comes next</Btn>
            </div>
          )}
          {latest.status === "completed" && (
            <div className="mt-2">
              <p className="text-sm text-success">✓ Result: {latest.result}</p>
              <Btn disabled={busy} variant="ghost" onClick={() => void requestSuggestion("", latest.recommendation)}>{busy ? "Thinking…" : "Get the next recommendation"}</Btn>
            </div>
          )}
        </>
      )}
      {busy && <p role="status" className="mt-2 text-xs text-muted-foreground">Your recorded result is saved. Please keep this page open while the AI responds.</p>}
    </div>
  );
}

import { useState } from "react";
import { toast } from "sonner";
import { Btn, Card } from "@/components/Shell";
import { useStore } from "@/lib/store";
import { generateAmbitionJourney, type AIJourneyDraft } from "@/lib/ai-coach";
import type { GoalJourney } from "@/lib/journeys";

export function AIAmbitionCoach() {
  const { s, set } = useStore();
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [context, setContext] = useState("");
  const [draft, setDraft] = useState<AIJourneyDraft | null>(null);
  const [draftGoalId, setDraftGoalId] = useState("");
  const [busy, setBusy] = useState(false);
  const selectedGoal = s.goals.find((goal) => goal.id === selectedGoalId) ?? s.goals[0];

  const generate = async () => {
    if (!selectedGoal) {
      toast.error("Define an ambition before generating a tailored journey.");
      return;
    }
    setBusy(true);
    setDraft(null);
    try {
      const records = Object.values(s.goalActivityRecords[selectedGoal.id] ?? {})
        .slice(-5)
        .map((record) => record.result);
      const result = await generateAmbitionJourney({
        data: {
          title: selectedGoal.title,
          context: context.trim(),
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

  const applyJourney = () => {
    if (!draft || !selectedGoal || draftGoalId !== selectedGoal.id) return;
    const journey: GoalJourney = {
      activities: draft.activities.map((activity, index) => ({
        id: `${selectedGoal.id}-ai-${index + 1}`,
        title: activity.title,
        guidance: activity.guidance,
        why: activity.why,
        resultPrompt: activity.resultPrompt,
        milestoneId: `${selectedGoal.id}-ai-milestone-${index + 1}`,
      })),
      milestones: draft.activities.map((activity, index) => ({
        id: `${selectedGoal.id}-ai-milestone-${index + 1}`,
        title: activity.milestoneTitle,
        description: activity.milestoneDescription,
        activityId: `${selectedGoal.id}-ai-${index + 1}`,
      })),
    };
    set((previous) => ({
      ...previous,
      aiJourneys: { ...(previous.aiJourneys ?? {}), [selectedGoal.id]: journey },
    }));
    setDraft(null);
    toast.success("AI journey applied. Your guided journey now uses these activities.");
  };

  return (
    <Card className="mt-4 border-primary/30">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">AI ambition coach · Preview</p>
      <h2 className="mt-1 text-xl font-bold">Create a journey around your actual ambition</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Generate new activities and milestones for an ambition, including unusual goals that don't fit a preset category.
        Review the suggestions before applying them. AI guidance can be mistaken and important facts must be verified.
      </p>

      {s.goals.length ? (
        <>
          <label htmlFor="ai-coach-goal" className="mt-4 block text-sm font-semibold">Choose an ambition</label>
          <select
            id="ai-coach-goal"
            value={selectedGoal?.id ?? ""}
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
            onChange={(event) => setContext(event.target.value)}
            maxLength={1200}
            rows={3}
            placeholder="Your starting point, constraints, skills, location, timeframe, or what you have already tried."
            className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">{context.length}/1200 characters. Avoid entering private or sensitive information.</p>
          <div className="mt-3">
            <Btn disabled={busy || !selectedGoal} onClick={generate}>
              {busy ? "Generating tailored journey…" : "Generate AI journey"}
            </Btn>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm font-medium">Define your ambition first to generate a useful journey.</p>
      )}

      {draft && draftGoalId === selectedGoal?.id && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            <p className="font-semibold">How this journey is tailored</p>
            <p className="mt-1 text-sm">{draft.summary}</p>
          </div>
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
            Applying replaces the displayed activity plan for this ambition, but does not delete its existing self-reported records.
            AI-generated content is a suggestion, not verification of facts or outcomes.
          </p>
          <Btn onClick={applyJourney}>Apply this journey</Btn>
        </div>
      )}
    </Card>
  );
}

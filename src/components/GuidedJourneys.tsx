import { useRef, useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { Btn } from "@/components/Shell";
import { useStore } from "@/lib/store";
import { journeyFor, milestoneIsComplete } from "@/lib/journeys";

export function GuidedJourneys() {
  const { s, set, gain } = useStore();
  const [activityDrafts, setActivityDrafts] = useState<Record<string, string>>({});
  const activityActionInFlight = useRef(new Set<string>());

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

  return (
    <>
      {s.goals.map((goal) => {
        const journey = journeyFor(goal.id, goal.title);
        const records = s.goalActivityRecords[goal.id] ?? {};
        const completedCount = journey.activities.filter((activity) =>
          Boolean(records[activity.id]),
        ).length;
        const legacyCount = (s.goalSteps[goal.id] ?? []).length;

        return (
          <div
            id={`meaningful-step-${goal.id}`}
            key={goal.id}
            className="mt-4 scroll-mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Guided ambition journey
                </p>
                <h3 className="mt-1 font-bold">{goal.title}</h3>
              </div>
              <span className="shrink-0 text-xs font-semibold">
                {completedCount}/{journey.activities.length} activities
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose any activity you are ready to do, including work you have already completed.
              Record a brief result so the milestone reflects what you learned or achieved.
            </p>
            <div className="mt-3 space-y-3">
              {journey.activities.map((activity, index) => {
                const key = `${goal.id}:${activity.id}`;
                const record = records[activity.id];
                const milestone = journey.milestones.find(
                  (item) => item.id === activity.milestoneId,
                );

                return (
                  <section
                    id={`activity-${goal.id}-${activity.id}`}
                    key={activity.id}
                    className="rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs font-bold text-muted-foreground">
                        {index + 1}.
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{activity.title}</p>
                        <p className="mt-1 text-sm">{activity.guidance}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Why it matters: {activity.why}
                        </p>
                        {record ? (
                          <div className="mt-3 rounded-lg border border-success/30 bg-success/5 p-3">
                            <p className="text-sm font-semibold text-success">✓ Result recorded</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm">{record.result}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              Self-reported on{" "}
                              {new Date(record.completedAt).toLocaleDateString()}
                            </p>
                            {milestone && (
                              <p className="mt-1 text-xs font-semibold text-success">
                                Milestone reached: {milestone.title}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="mt-3 space-y-2">
                            <label
                              htmlFor={`result-${key}`}
                              className="block text-sm font-semibold"
                            >
                              Record your result
                            </label>
                            <textarea
                              id={`result-${key}`}
                              value={activityDrafts[key] ?? ""}
                              onChange={(event) =>
                                setActivityDrafts((drafts) => ({
                                  ...drafts,
                                  [key]: event.target.value,
                                }))
                              }
                              maxLength={500}
                              rows={2}
                              placeholder={activity.resultPrompt}
                              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                            />
                            <Btn onClick={() => completeActivity(goal.id, activity.id)}>
                              Record activity result
                            </Btn>
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

                  return (
                    <li key={milestone.id} className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className={completed ? "font-bold text-success" : "text-muted-foreground"}
                      >
                        {completed ? "✔" : "○"}
                      </span>
                      <span className={completed ? "text-success" : "text-muted-foreground"}>
                        {milestone.title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            {legacyCount > 0 && (
              <p className="mt-3 rounded-lg border border-border p-3 text-xs text-muted-foreground">
                Earlier starter-step records preserved: {legacyCount}. They have not been
                automatically marked as guided activities because the old records did not include a
                result. Review the relevant activity above and record what you actually did.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/goals" hash={`review-ambition-${goal.id}`}>
                <Btn variant="ghost">Review ambition</Btn>
              </Link>
              <Link to="/goals" hash={`journey-milestones-${goal.id}`}>
                <Btn variant="ghost">Review all milestones</Btn>
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              These are self-reported preparation milestones, not independent verification or proof
              that the ambition itself has been achieved.
            </p>
          </div>
        );
      })}
    </>
  );
}

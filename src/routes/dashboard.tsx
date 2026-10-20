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
import { PATH_STAGES, DAILY_CHALLENGES, READINESS, GOAL_TEMPLATES } from "@/lib/data";

export const Route = createFileRoute("/dashboard")({
  head: () => meta("Your journey", "Your ambition, current progress and the next meaningful step."),
  component: Dashboard,
});

const STREAK_BADGES = [3, 7, 30];

type MeaningfulStep = { title: string; guidance: string };
const DEFAULT_STEPS: MeaningfulStep[] = [
  { title: "Identify what this ambition requires.", guidance: "Write down one thing you need to learn, obtain, arrange, or verify before this ambition becomes possible." },
  { title: "Choose one practical action for this week.", guidance: "Make the action specific and realistic for your time, responsibilities, and resources." },
  { title: "Review the resources and risks.", guidance: "Consider likely costs, time, skills, support, and risks before making commitments." },
];
const GOAL_STEPS: Record<string, MeaningfulStep[]> = {
  jet: [
    { title: "Learn what a private-jet charter includes.", guidance: "Find out how route, aircraft size, flight time, fees, and operating details affect the price. A headline price may not be the full cost." },
    { title: "Estimate the full cost of the journey you want.", guidance: "List the route, passengers, ground transport, timing, and other likely charges. Treat estimates as provisional until a legitimate provider confirms them." },
    { title: "Set a realistic preparation and savings plan.", guidance: "Protect essential expenses first, then decide what you can responsibly set aside and what information you still need." },
  ],
  house: [
    { title: "Learn the basics of property due diligence.", guidance: "Write down the title and ownership questions you must verify with qualified professionals before committing money." },
    { title: "Estimate the full cost of buying.", guidance: "Consider more than the advertised price: legal checks, documentation, taxes or fees, repairs, and other transaction costs." },
    { title: "Plan a safe next step with qualified advice.", guidance: "Identify a reputable property professional or lawyer to consult before making a payment or signing anything." },
  ],
  school: [
    { title: "Shortlist three suitable institutions.", guidance: "Choose institutions that offer your intended programme and verify their accreditation or official recognition." },
    { title: "Compare requirements, fees, and deadlines.", guidance: "Use official sources to record entry requirements, programme duration, application dates, and the full expected cost." },
    { title: "Build an application and funding plan.", guidance: "List the documents, preparation tasks, deadlines, and funding options you can realistically pursue." },
  ],
  agri: [
    { title: "Define the agricultural project and its market.", guidance: "Choose what you want to produce or do, who might buy it, and what local evidence supports the idea." },
    { title: "Estimate inputs and identify major risks.", guidance: "Consider land, inputs, labour, water, transport, storage, timing, and price changes before investing." },
    { title: "Learn from someone with relevant experience.", guidance: "Identify an experienced farmer or agricultural extension officer and prepare specific questions before spending." },
  ],
  biz: [
    { title: "Describe the customer problem you would solve.", guidance: "State who the customer is, what problem they have, and why your proposed offer could help." },
    { title: "Speak with three potential customers.", guidance: "Ask about their needs and current alternatives; record what you learn rather than assuming demand exists." },
    { title: "Plan a small, low-risk test.", guidance: "Estimate basic costs and test demand on a small scale before committing substantial money." },
  ],
  skill: [
    { title: "Choose a specific skill and outcome.", guidance: "Describe what you want to be able to do, not just the name of a course you might take." },
    { title: "Compare two credible ways to learn.", guidance: "Check the provider, cost, practical work, time commitment, and what you will be able to demonstrate." },
    { title: "Create a realistic practice routine.", guidance: "Set a weekly practice schedule and choose a small project that will show what you have learned." },
  ],
};


function Dashboard() {
  const { s, set, gain, badge } = useStore();
  const [stageNote, setStageNote] = useState("");
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
              const steps = GOAL_STEPS[goal.id] ?? DEFAULT_STEPS;
              const completed = s.goalSteps[goal.id] ?? [];
              const nextIndex = completed.length;
              const nextStep = steps[nextIndex];
              return (
                <div id={`meaningful-step-${goal.id}`} key={goal.id} className="mt-4 scroll-mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Meaningful steps · {goal.title}
                  </p>
                  {nextStep ? (
                    <>
                      <h3 className="mt-1 font-bold">Step {nextIndex + 1} of {steps.length}: {nextStep.title}</h3>
                      <p className="mt-2 text-sm">{nextStep.guidance}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Take the action in real life, then record it here. Completion is self-reported; it is not independent verification.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Btn onClick={() => {
                          set((p) => {
                            const prior = p.goalSteps[goal.id] ?? [];
                            if (prior.includes(nextIndex)) return p;
                            return { ...p, goalSteps: { ...p.goalSteps, [goal.id]: [...prior, nextIndex] } };
                          });
                          toast.success("Step recorded. Your next action is ready.");
                        }}>Mark step complete</Btn>
                        <Link to="/goals" hash={`review-ambition-${goal.id}`}><Btn variant="ghost">Review ambition</Btn></Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="mt-1 font-bold">You have completed this starter plan ✓</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Review what changed, update your target or assumptions, and decide on the next set of actions. This record does not mean the ambition itself has been achieved.
                      </p>
                      <div className="mt-3"><Link to="/goals"><Btn variant="ghost">Review ambition</Btn></Link></div>
                    </>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Starter actions recorded: {Math.min(completed.length, steps.length)}/{steps.length}
                  </p>
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

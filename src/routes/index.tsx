import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroAsset from "@/assets/hero.jpg.asset.json";
const hero = heroAsset.url;
import { Btn, meta, NavigationMenu } from "@/components/Shell";
import { useStore } from "@/lib/store";
import { journeyFor } from "@/lib/journeys";

export const Route = createFileRoute("/")({
  head: () =>
    meta(
      "Participate in the life you imagined.",
      "Turn ambition into practical action with game progress, real saving habits, personal development, participating businesses and real-world experiences.",
    ),
  component: Landing,
});

const SLIDES = [
  {
    tag: "Your ambition",
    title: "Imagine more. Begin where you are.",
    body: "Choose a meaningful life ambition — a home, an education, a farm, a business or an extraordinary experience — and turn it into practical next steps.",
    badge: "Your dream, your journey",
  },
  {
    tag: "Progress that matters",
    title: "Play the game. Build real-life discipline.",
    body: "Earn virtual XP as you learn and act, while tracking actual savings separately. Game rewards motivate your journey; they are not real money.",
    badge: "Virtual progress. Real action",
  },
  {
    tag: "Participate in the life you imagined",
    title: "Preparation can open the door to experience.",
    body: "Explore places, experiences and participating businesses that may help you take the next step — when your circumstances permit.",
    badge: "From preparation to participation",
  },
];

function Landing() {
  const [i, setI] = useState(0);
  const { s } = useStore();
  const activeGoal = s.goals[0];
  const journey = activeGoal
    ? (s.aiJourneys?.[activeGoal.id] ?? journeyFor(activeGoal.id, activeGoal.title))
    : null;
  const records = activeGoal ? (s.goalActivityRecords[activeGoal.id] ?? {}) : {};
  const nextActivity = journey?.activities.find((activity) => !records[activity.id]);
  const latestNextAction = activeGoal
    ? (s.goalNextActions?.[activeGoal.id] ?? [])
        .filter((action) => !action.archivedAt)
        .slice()
        .reverse()[0]
    : undefined;
  const acceptedNextAction = latestNextAction?.status === "accepted" ? latestNextAction : undefined;
  let meaningfulStepHash: string | undefined;
  let meaningfulStepDescription =
    "Define an ambition first, then get a practical next step tailored to your journey.";

  if (activeGoal) {
    if (acceptedNextAction) {
      meaningfulStepHash = `activity-${activeGoal.id}-${acceptedNextAction.sourceActivityId}`;
      meaningfulStepDescription = "Continue the next action you accepted for your ambition.";
    } else if (nextActivity) {
      meaningfulStepHash = `activity-${activeGoal.id}-${nextActivity.id}`;
      meaningfulStepDescription =
        "Go straight to the next activity in your guided ambition journey.";
    } else {
      meaningfulStepHash = `meaningful-step-${activeGoal.id}`;
      meaningfulStepDescription =
        "Review your completed activities and decide what needs attention next.";
    }
  }

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative h-[88vh] overflow-hidden">
        <div className="absolute left-4 top-4 z-20">
          <NavigationMenu className="h-11 w-11 border border-border bg-background/80 text-foreground backdrop-blur hover:bg-secondary" />
        </div>
        <img
          src={hero}
          alt="A visual invitation to imagine ambitions and the journeys that make them possible"
          width={1280}
          height={832}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-3xl flex-col justify-end px-5 pb-12">
          <p className="font-display text-2xl font-extrabold">
            JET<span className="text-primary">OFF</span>
          </p>
          <p className="mt-2 inline-flex w-fit rounded-full border border-primary/40 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            Your dream. Your journey. Your world.
          </p>
          {(() => {
            const sl = SLIDES[i]!;
            return (
              <div key={i} className="mt-6 animate-in fade-in slide-in-from-right-6 duration-500">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  {sl.badge}
                </span>
                <p className="mt-3 text-xs uppercase tracking-widest text-primary">{sl.tag}</p>
                <h1 className="mt-1 text-4xl font-extrabold leading-tight sm:text-5xl">
                  {sl.title}
                </h1>
                <p className="mt-2 max-w-md text-muted-foreground">{sl.body}</p>
              </div>
            );
          })()}
          <div className="mt-5 flex gap-2">
            {SLIDES.map((_, k) => (
              <button
                key={k}
                aria-label={`Slide ${k + 1}`}
                onClick={() => setI(k)}
                className={`h-1.5 rounded-full transition-all ${
                  k === i ? "w-8 bg-primary" : "w-3 bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth">
              <Btn>Start my journey</Btn>
            </Link>
            <Link to="/explore">
              <Btn variant="ghost">Explore experiences</Btn>
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-5 py-8">
        <h2 className="text-2xl font-extrabold">Participate in the life you imagined</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          JET OFF connects five parts of one journey: your ambition, a motivating game economy,
          real financial discipline, personal development, and opportunities to engage with
          participating businesses and real-world experiences. A private jet is only one possible
          dream — home ownership, farming, education, entrepreneurship and other ambitions belong
          here too.
        </p>
      </section>
      <section className="mx-auto grid max-w-3xl gap-4 px-5 pb-10 sm:grid-cols-3">
        {(
          [
            {
              title: "Define your ambition",
              description: "Describe what you want and where you are starting from.",
              to: "/goals",
              hash: undefined,
            },
            {
              title: "Take a meaningful step",
              description: meaningfulStepDescription,
              to: activeGoal ? "/dashboard" : "/goals",
              hash: meaningfulStepHash,
            },
            {
              title: "Meet the wider world",
              description: "Explore experiences and businesses that may become part of your journey.",
              to: "/explore",
              hash: undefined,
            },
          ] as const
        ).map(({ title, description, to, hash }) => (
          <Link
            key={title}
            to={to}
            hash={hash}
            className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary"
          >
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </section>
      <p className="px-5 pb-10 text-center text-xs text-muted-foreground">
        You don't need to be wealthy to begin. Progress starts with clarity and one achievable step.
        Savings are self-reported; practice currency is not real money. ·{" "}
        <Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link> ·{" "}
        <Link to="/safety">Safety</Link>
      </p>
    </div>
  );
}

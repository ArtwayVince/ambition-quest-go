import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import hero from "@/assets/hero.jpg";
import { Btn, meta } from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => meta("Your dream. Your journey.", "Discover real experiences, pursue long-term goals and grow through gamified missions — starting from ₦1,000."),
  component: Landing,
});

const SLIDES = [
  { tag: "Featured destination", title: "Yuby Resort — Pilot", body: "Tour the gate, reception and facilities before you ever arrive.", badge: "Proposed pilot" },
  { tag: "Milestone", title: "₦1,000 is a real start", body: "Track self-reported savings toward big ambitions — no judgement.", badge: "Goal engine" },
  { tag: "Pilot badge", title: "3 missions to Level Up", body: "Aspiration → Know Before You Go → The Real Visit.", badge: "Mission chain" },
];

function Landing() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative h-[88vh] overflow-hidden">
        <img src={hero} alt="Resort pool at sunset with a jet overhead" width={1280} height={832} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-3xl flex-col justify-end px-5 pb-12">
          <p className="font-display text-2xl font-extrabold">JET<span className="text-primary">OFF</span></p>
          <p className="mt-2 inline-flex w-fit rounded-full border border-primary/40 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">Ambition, in motion · proposed pilot</p>
          {(() => { const sl = SLIDES[i]!; return (<div key={i} className="mt-6 animate-in fade-in slide-in-from-right-6 duration-500">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">{sl.badge}</span>
            <p className="mt-3 text-xs uppercase tracking-widest text-primary">{sl.tag}</p>
            <h1 className="mt-1 text-4xl font-extrabold leading-tight sm:text-5xl">{sl.title}</h1>
            <p className="mt-2 max-w-md text-muted-foreground">{sl.body}</p>
          </div>); })()}
          <div className="mt-5 flex gap-2">
            {SLIDES.map((_, k) => (
              <button key={k} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-primary" : "w-3 bg-muted"}`} />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth"><Btn>Start my journey</Btn></Link>
            <Link to="/explore"><Btn variant="ghost">Explore experiences</Btn></Link>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-3xl gap-4 px-5 py-10 sm:grid-cols-3">
        {([
          ["Explore", "Real experiences from registered providers.", "/explore"],
          ["Play", "₦100,000 practice currency. Real-life lessons.", "/play"],
          ["Pursue a goal", "Milestones, coaching and next steps.", "/goals"],
        ] as const).map(([t, d, to]) => (
          <Link key={t} to={to} className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary">
            <h2 className="text-xl font-bold">{t}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </Link>
        ))}
      </section>
      <p className="px-5 pb-10 text-center text-xs text-muted-foreground">
        You don't need to be wealthy to begin. Savings are self-reported; practice currency is not real money. · <Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link> · <Link to="/safety">Safety</Link>
      </p>
    </div>
  );
}

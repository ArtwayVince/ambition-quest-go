import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Shell, Card, Btn, Notice, meta } from "@/components/Shell";
import { useStore, shouldAwardScenarioXp, type Attr } from "@/lib/store";
import { BUDGET_SCENARIOS, naira } from "@/lib/data";

export const Route = createFileRoute("/play")({
  head: () => meta("Play", "Budget trade-off simulator with ₦100,000 practice currency and the 3-step pilot mission chain."),
  component: Play,
});

function Play() {
  const { s, set, gain, badge } = useStore();
  const [q, setQ] = useState(0);
  const [fb, setFb] = useState("");
  const decisionLocked = useRef(false);
  const [asp, setAsp] = useState(s.missions.aspiration ?? "");
  const [refl, setRefl] = useState("");
  const [opt, setOpt] = useState<"A" | "B">("B");
  const [photo, setPhoto] = useState<string>();
  const scenarioIndex = q % BUDGET_SCENARIOS.length;
  const sc = BUDGET_SCENARIOS[scenarioIndex]!;

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

  const m = s.missions;
  const finishM3 = () => {
    if (!refl.trim() || !photo) { toast.error("Add a photo and a short reflection"); return; }
    set((p) => ({ ...p, missions: { ...p.missions, m3: true, m3Option: opt, reflection: refl, photo } }));
    gain(100, { Presence: 20, Network: 10, Mindset: 10 }); // guaranteed level-up
    badge("Pilot Graduate");
    toast.success("Level Up! Mission chain complete 🎉");
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

      <h2 className="mt-8 text-xl font-bold">Pilot mission chain</h2>
      <Card className="mt-3">
        <h3 className="font-bold">{m.m1 ? "✅" : "1."} The Aspiration</h3>
        <p className="text-sm text-muted-foreground">In one sentence, what experience or goal do you aspire to?</p>
        <textarea disabled={m.m1} maxLength={280} value={asp} onChange={(e) => setAsp(e.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2" />
        {!m.m1 && <Btn onClick={() => { if (!asp.trim()) return; set((p) => ({ ...p, missions: { ...p.missions, m1: true, aspiration: asp } })); gain(30, { Mindset: 15 }); }}>Commit</Btn>}
      </Card>

      <Card className={`mt-3 ${!m.m1 ? "opacity-50" : ""}`}>
        <h3 className="font-bold">{m.m2 ? "✅" : "2."} Know Before You Go</h3>
        <p className="text-sm text-muted-foreground">Explore the resort tour through reception and pass the readiness check (3+/4).</p>
        <p className="mt-2 text-xs">Tour stops: {s.toured.length}/4 required · Readiness best: {s.readiness}/4</p>
        <div className="mt-2 flex gap-2">
          <Link to="/tour"><Btn variant="ghost">Open tour</Btn></Link>
          <Link to="/readiness"><Btn variant="ghost">Readiness coach</Btn></Link>
          {!m.m2 && <Btn disabled={!m.m1 || s.toured.length < 4 || s.readiness < 3} onClick={() => { set((p) => ({ ...p, missions: { ...p.missions, m2: true } })); gain(40, { Presence: 10, Discipline: 5 }); }}>Complete</Btn>}
        </div>
      </Card>

      <Card className={`mt-3 ${!m.m2 ? "opacity-50" : ""}`}>
        <h3 className="font-bold">{m.m3 ? "✅" : "3."} The Real Visit</h3>
        {m.m3 ? (
          <div className="mt-2 text-sm">
            {m.photo && <img src={m.photo} alt="Your visit" className="mb-2 max-h-48 rounded-xl" />}
            <p>Option {m.m3Option}: “{m.reflection}”</p>
          </div>
        ) : (
          <fieldset disabled={!m.m2} className="mt-2 space-y-2 text-sm">
            <label className="flex gap-2"><input type="radio" checked={opt === "A"} onChange={() => setOpt("A")} /> Option A — request a resort visit (see Explore)</label>
            <label className="flex gap-2"><input type="radio" checked={opt === "B"} onChange={() => setOpt("B")} /> Option B — free alternative (a public park, library or local business visit)</label>
            <input type="file" accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0]; if (!f) return;
              if (f.size > 3e6) { toast.error("Image must be under 3MB"); return; }
              const r = new FileReader(); r.onload = () => setPhoto(r.result as string); r.readAsDataURL(f);
            }} />
            {photo && <img src={photo} alt="Preview" className="max-h-32 rounded-xl" />}
            <textarea maxLength={500} placeholder="What did you learn?" value={refl} onChange={(e) => setRefl(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2" />
            <Btn onClick={finishM3}>Submit & Level Up</Btn>
          </fieldset>
        )}
      </Card>
    </Shell>
  );
}

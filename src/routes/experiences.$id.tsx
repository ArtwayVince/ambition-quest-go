import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Shell, Card, Btn, Notice, meta } from "@/components/Shell";
import { EXPERIENCES } from "@/lib/data";
import { useStore, isValidPreferredDate, localDateString } from "@/lib/store";

export const Route = createFileRoute("/experiences/$id")({
  loader: ({ params }) => {
    const e = EXPERIENCES.find((x) => x.id === params.id);
    if (!e) throw notFound();
    return e;
  },
  head: ({ loaderData }) => (loaderData ? meta(loaderData.title, loaderData.summary) : { meta: [{ title: "Unavailable — JET OFF" }, { name: "robots", content: "noindex" }] }),
  notFoundComponent: () => <Shell><p>Experience not found. <Link to="/explore" className="text-primary">Back</Link></p></Shell>,
  component: Detail,
});

function Detail() {
  const e = Route.useLoaderData();
  const { s, set, gain } = useStore();
  const [goalId, setGoalId] = useState(s.goals[0]?.id ?? "");
  const selectedGoal = s.goals.find((goal) => goal.id === goalId);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  return (
    <Shell>
      <Link to="/explore" className="text-sm text-muted-foreground">← Explore</Link>
      <p className="mt-3 text-xs uppercase text-primary">{e.category}</p>
      <h1 className="text-3xl font-extrabold">{e.title}</h1>
      <p className="text-sm text-muted-foreground">{e.provider} · {e.location}</p>
      <Card className="mt-4 space-y-2 text-sm">
        <p>{e.summary}</p>
        <p><b>Price:</b> {e.price}</p>
        {e.dressCode && <p><b>Dress code:</b> {e.dressCode}</p>}
        <ul className="list-disc pl-5">{e.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
      </Card>
      <Card className="mt-4">
        <h2 className="font-bold">Request verified details</h2>
        {s.goals.length > 0 && <div className="mt-2"><label htmlFor="experience-goal" className="mb-1 block text-sm font-medium">Which ambition is this experience for?</label><select id="experience-goal" value={goalId} onChange={(x) => setGoalId(x.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2"><option value="">Not linked to an ambition</option>{s.goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}</select><p className="mt-1 text-xs text-muted-foreground">This helps you keep the request connected to your journey. It does not send information to the provider.</p></div>}
        <div className="mt-2 space-y-2">
          <input type="date" min={localDateString()} value={date} onChange={(x) => setDate(x.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2" />
          <textarea maxLength={500} placeholder="Questions for the provider (optional)" value={note} onChange={(x) => setNote(x.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2" />
          <Btn onClick={() => {
            if (!isValidPreferredDate(date)) { toast.error("Choose today or a future preferred date"); return; }
            set((p) => ({ ...p, requests: [...p.requests, { id: crypto.randomUUID(), expId: e.id, title: e.title, date, note, at: new Date().toISOString(), ...(selectedGoal ? { goalId: selectedGoal.id, goalTitle: selectedGoal.title } : {}) }] }));
            gain(10, { Network: 5 });
            toast.success("Request saved on this device. No provider has been notified.");
          }}>Send request</Btn>
        </div>
        <div className="mt-3"><Notice>This request is saved only in this browser for the prototype. No provider is notified, no availability is confirmed, and no booking or payment is made.</Notice></div>
      </Card>
    </Shell>
  );
}

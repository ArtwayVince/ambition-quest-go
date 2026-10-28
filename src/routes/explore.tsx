import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Card, Notice, meta } from "@/components/Shell";
import { CATEGORIES, EXPERIENCES, type Category } from "@/lib/data";

export const Route = createFileRoute("/explore")({
  head: () => meta("Explore", "Browse experiences and venues across interests, independently of your current ambition."),
  component: Explore,
});

function Explore() {
  const [cat, setCat] = useState<Category | "All">("All");
  const list = EXPERIENCES.filter((e) => cat === "All" || e.category === cat);

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Explore</h1>
      <Link to="/tour" className="mt-4 block rounded-2xl bg-sunset p-5 text-primary-foreground">
        <p className="text-xs font-bold uppercase">Pilot demonstrator</p>
        <p className="font-display text-2xl font-extrabold">Yuby Resort Tour →</p>
        <p className="text-sm">Gate, reception protocols, dress codes & facilities.</p>
      </Link>

      <p className="mt-3 text-sm text-muted-foreground">Browse venues and experiences for recreation, curiosity or new interests. For experiences selected specifically to support an ambition, return to <Link to="/goals" className="font-semibold text-primary underline">Pursue a goal</Link>.</p>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full border px-3 py-1 text-xs ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{c}</button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((e) => (
          <Link key={e.id} to="/experiences/$id" params={{ id: e.id }}>
            <Card className="h-full transition hover:border-primary">
              <p className="text-[10px] uppercase tracking-wider text-primary">{e.category}</p>
              <p className="mt-1 font-bold">{e.title}</p>
              <p className="text-xs text-muted-foreground">{e.provider}</p>
              <p className="mt-2 text-sm">{e.summary}</p>
              <p className="mt-2 text-xs">{e.verified ? "✅ Verified provider" : "⏳ Verification pending"} · {e.price}</p>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-4"><Notice>Listings are placeholders until providers are registered and details verified. Nothing here is invented as fact.</Notice></div>
    </Shell>
  );
}

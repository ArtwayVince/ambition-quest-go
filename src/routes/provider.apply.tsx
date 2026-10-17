import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Shell, Btn, Notice, meta } from "@/components/Shell";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/data";

export const Route = createFileRoute("/provider/apply")({
  head: () => meta("Provider application", "Submit your business for verification and listing on JET OFF."),
  component: Apply,
});

const schema = z.object({
  business: z.string().trim().min(2).max(100),
  category: z.string().min(1),
  contact: z.string().trim().email().max(255),
  description: z.string().trim().min(10).max(1000),
});

function Apply() {
  const { set } = useStore();
  const nav = useNavigate();
  const [f, setF] = useState({ business: "", category: CATEGORIES[0], contact: "", description: "" });
  const field = "w-full rounded-xl border border-input bg-card px-3 py-2";
  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Apply as a provider</h1>
      <form className="mt-4 space-y-3" onSubmit={(e) => {
        e.preventDefault();
        const r = schema.safeParse(f);
        if (!r.success) { const iss = r.error.issues[0]; toast.error(`${iss?.path[0] ?? "form"}: ${iss?.message ?? "invalid"}`); return; }
        set((p) => ({ ...p, apps: [...p.apps, { ...r.data, id: crypto.randomUUID(), status: "pending", at: new Date().toISOString() }] }));
        toast.success("Application submitted for review");
        nav({ to: "/provider" });
      }}>
        <input className={field} placeholder="Business name" value={f.business} onChange={(e) => setF({ ...f, business: e.target.value })} />
        <select className={field} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as typeof f.category })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <input className={field} type="email" placeholder="Contact email" value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} />
        <textarea className={field} rows={4} placeholder="What do you offer? Prices, hours, requirements…" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <Btn type="submit">Submit application</Btn>
      </form>
      <div className="mt-4"><Notice>Your application is saved in this browser's prototype queue. In a production launch, listings must remain unpublished until JET OFF verifies identity, business permissions, safety information, availability and prices.</Notice></div>
    </Shell>
  );
}

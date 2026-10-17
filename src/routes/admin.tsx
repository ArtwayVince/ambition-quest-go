import { createFileRoute } from "@tanstack/react-router";
import { Shell, Card, Btn, Notice, meta } from "@/components/Shell";
import { useStore, type ProviderApp } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => meta("Admin moderation", "Review and moderate provider applications."),
  component: Admin,
});

function Admin() {
  const { s, set } = useStore();
  if (s.role !== "admin") return <Shell><Notice>Switch to the Admin role in the header to moderate applications.</Notice></Shell>;
  const mod = (id: string, status: ProviderApp["status"]) => set((p) => ({ ...p, apps: p.apps.map((a) => (a.id === id ? { ...a, status } : a)) }));
  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Moderation</h1>
      <p className="mt-2 text-sm text-muted-foreground">Prototype moderation queue. Approval/rejection is stored in this browser only and does not independently verify a business or publish a live listing.</p>
      {s.apps.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No applications to review.</p>}
      {s.apps.map((a) => (
        <Card key={a.id} className="mt-3">
          <p className="font-bold">{a.business} <span className="text-xs capitalize text-muted-foreground">· {a.status}</span></p>
          <p className="text-xs text-muted-foreground">{a.category} · {a.contact}</p>
          <p className="mt-1 text-sm">{a.description}</p>
          <div className="mt-2 flex gap-2">
            <Btn onClick={() => mod(a.id, "approved")}>Approve</Btn>
            <Btn variant="ghost" onClick={() => mod(a.id, "rejected")}>Reject</Btn>
          </div>
        </Card>
      ))}
      <p className="mt-6 text-xs text-muted-foreground">Requests from users: {s.requests.length} · Explorer level XP: {s.xp}</p>
    </Shell>
  );
}

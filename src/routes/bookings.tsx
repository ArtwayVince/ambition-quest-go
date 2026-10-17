import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Card, Btn, Notice, meta } from "@/components/Shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/bookings")({
  head: () => meta("My requests", "Your requests for verified details from providers."),
  component: Bookings,
});

function Bookings() {
  const { s, set } = useStore();
  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">My requests</h1>
      <Notice>Request for verified details only, not a booking. Providers confirm availability and price directly.</Notice>
      {s.requests.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No requests yet. <Link to="/explore" className="text-primary">Explore experiences</Link></p>}
      {s.requests.map((r) => (
        <Card key={r.id} className="mt-3">
          <p className="font-bold">{r.title}</p>
          <p className="text-xs text-muted-foreground">Preferred {r.date} · status: awaiting provider</p>
          {r.note && <p className="mt-1 text-sm">{r.note}</p>}
          <div className="mt-2"><Btn variant="ghost" onClick={() => set((p) => ({ ...p, requests: p.requests.filter((x) => x.id !== r.id) }))}>Withdraw</Btn></div>
        </Card>
      ))}
    </Shell>
  );
}

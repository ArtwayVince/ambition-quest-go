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
      <Notice>These requests are saved only in this browser for the prototype. No provider has been notified. Availability, price and any booking must be confirmed directly with the provider.</Notice>
      {s.requests.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No requests yet. <Link to="/explore" className="text-primary">Explore experiences</Link></p>}
      {s.requests.map((r) => (
        <Card key={r.id} className="mt-3">
          <p className="font-bold">{r.title}</p>
          <p className="text-xs text-muted-foreground">Preferred {r.date} · saved locally · provider not notified</p>
          {r.note && <p className="mt-1 text-sm">{r.note}</p>}
          <div className="mt-2"><Btn variant="ghost" onClick={() => set((p) => ({ ...p, requests: p.requests.filter((x) => x.id !== r.id) }))}>Withdraw</Btn></div>
        </Card>
      ))}
    </Shell>
  );
}

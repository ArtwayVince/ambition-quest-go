import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Shell, Card, Btn, meta } from "@/components/Shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/provider")({
  head: () => meta("Providers", "Register your venue, workshop or service with JET OFF."),
  component: Provider,
});

function Provider() {
  const { s } = useStore();
  const loc = useLocation();
  if (loc.pathname !== "/provider") return <Outlet />;
  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">For providers</h1>
      <p className="mt-2 text-sm text-muted-foreground">Gain venue exposure, enquiries and measurable engagement from prepared, motivated visitors.</p>
      <div className="mt-4 flex flex-wrap gap-2"><Link to="/provider/apply"><Btn>Apply to list</Btn></Link><Link to="/provider/requests"><Btn variant="outline">Open request inbox</Btn></Link></div>
      <h2 className="mt-6 font-bold">Your applications</h2>
      {s.apps.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
      {s.apps.map((a) => (
        <Card key={a.id} className="mt-2">
          <p className="font-semibold">{a.business}</p>
          <p className="text-xs capitalize text-muted-foreground">{a.category} · {a.status}</p>
        </Card>
      ))}
    </Shell>
  );
}

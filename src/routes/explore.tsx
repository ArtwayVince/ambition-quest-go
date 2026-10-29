import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell, Card, Notice, meta } from "@/components/Shell";
import { CATEGORIES, EXPERIENCES, type Category } from "@/lib/data";

export const Route = createFileRoute("/explore")({
  head: () => meta("Explore", "Discover venues and activities by interest, with clear information about what is and is not yet verified."),
  component: Explore,
});

function Explore() {
  const [cat, setCat] = useState<Category | "All">("All");
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXPERIENCES.filter((e) => {
      const categoryMatch = cat === "All" || e.category === cat;
      const searchMatch = !q || [e.title, e.provider, e.summary, e.location, e.category]
        .some((value) => value.toLowerCase().includes(q));
      return categoryMatch && searchMatch;
    });
  }, [cat, query]);

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Explore</h1>
      <p className="mt-2 text-sm text-muted-foreground">Discover places to visit and things to try, whether or not they are connected to one of your ambitions. Browse first; check the details before making plans.</p>

      <Link to="/tour" className="mt-4 block rounded-2xl bg-sunset p-5 text-primary-foreground">
        <p className="text-xs font-bold uppercase">Interactive pilot demonstration</p>
        <p className="font-display text-2xl font-extrabold">Yuby Resort Tour →</p>
        <p className="text-sm">Preview a proposed visit, including the gate, reception and facilities.</p>
      </Link>

      <div className="mt-5">
        <label htmlFor="explore-search" className="mb-1 block text-sm font-semibold">Find an experience or interest</label>
        <input
          id="explore-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try resort, photography, farming…"
          className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm"
        />
      </div>

      <h2 className="mt-5 text-sm font-bold">Browse by interest</h2>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={`shrink-0 rounded-full border px-3 py-2 text-xs ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>{c}</button>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">Showing {list.length} of {EXPERIENCES.length} listings. All current listings are proposals, not confirmed bookings.</p>

      {list.length > 0 ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {list.map((e) => (
            <Link key={e.id} to="/experiences/$id" params={{ id: e.id }} className="block">
              <Card className="h-full transition hover:border-primary">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{e.category}</p>
                  <span className="rounded-full border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground">{e.verified ? "Provider verified" : "Proposed · unverified"}</span>
                </div>
                <p className="mt-2 font-bold">{e.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{e.provider}</p>
                <p className="mt-2 text-sm">{e.summary}</p>
                <div className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                  <p><b className="text-foreground">Location:</b> {e.location}</p>
                  <p><b className="text-foreground">Price:</b> {e.price}</p>
                </div>
                <p className="mt-3 text-sm font-semibold text-primary">View experience details →</p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="mt-3">
          <p className="font-bold">No matching listings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another search or choose “All” to see every current proposal.</p>
          <button onClick={() => { setQuery(""); setCat("All"); }} className="mt-3 text-sm font-semibold text-primary underline">Clear search and filters</button>
        </Card>
      )}

      <div className="mt-4">
        <Notice>Transparency note: these are prototype listings. Provider registration, venue details, prices, availability and policies have not yet been confirmed. Opening a listing or saving a request does not contact a provider or create a booking.</Notice>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Looking for an experience that supports a specific ambition? Visit <Link to="/goals" className="font-semibold text-primary underline">Pursue a goal</Link> to see the ambition-matched options separately.</p>
    </Shell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, Card, Notice, meta } from "@/components/Shell";

type Venue = {
  id: string;
  slug: string;
  name: string;
  description: string;
  location: string;
  address: string;
};
type VenueExperience = {
  id: string;
  title: string;
  summary: string;
  category: string;
  location_details: string;
  price_label: string;
  requirements: string[];
};

function normalizeSupabaseUrl(value: string | undefined) {
  return value?.trim().replace(/\/+$/, "").replace(/\.supabase\.com(?=\/|$)/i, ".supabase.co");
}

export const Route = createFileRoute("/venues/$slug")({
  head: () => meta("Venue", "Venue details, experiences and visitor information."),
  component: VenueProfile,
});

function VenueProfile() {
  const { slug } = Route.useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [experiences, setExperiences] = useState<VenueExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const base = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL as string | undefined);
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!base || !key) {
      setError("Venue listings are not connected yet.");
      setLoading(false);
      return;
    }
    let active = true;
    async function load() {
      try {
        const response = await fetch(
          base + "/rest/v1/venues?select=id,slug,name,description,location,address&slug=eq." +
            encodeURIComponent(slug) + "&status=eq.approved&limit=1",
          { headers: { apikey: key! } },
        );
        if (!response.ok) throw new Error("Could not load this venue.");
        const rows = (await response.json()) as Venue[];
        const selected = rows[0];
        if (!selected) throw new Error("This venue is not published or could not be found.");
        const experienceResponse = await fetch(
          base + "/rest/v1/venue_experiences?select=id,title,summary,category,location_details,price_label,requirements&venue_id=eq." +
            encodeURIComponent(selected.id) + "&status=eq.approved&order=sort_order.asc",
          { headers: { apikey: key! } },
        );
        if (!experienceResponse.ok) throw new Error("Venue details loaded, but its experiences could not be retrieved.");
        const items = (await experienceResponse.json()) as VenueExperience[];
        if (!active) return;
        setVenue(selected);
        setExperiences(items ?? []);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Unable to load venue.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [slug]);

  if (loading) return <Shell><p className="text-sm text-muted-foreground">Loading venue…</p></Shell>;
  if (!venue) return <Shell><h1 className="text-2xl font-bold">Venue unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{error || "This venue is not published."}</p></Shell>;

  return (
    <Shell>
      <a href="/explore" className="text-sm text-muted-foreground">← Explore</a>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-primary">Venue</p>
      <h1 className="mt-1 text-3xl font-extrabold">{venue.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{venue.description || "Venue information will be added by its provider."}</p>
      <Card className="mt-4 space-y-2">
        <h2 className="font-bold">Visitor information</h2>
        <p className="text-sm"><b>Location:</b> {venue.location || "To be confirmed"}</p>
        {venue.address && <p className="text-sm"><b>Address:</b> {venue.address}</p>}
        <a href={"/tour?venue=" + encodeURIComponent(venue.slug)} className="inline-flex rounded-xl border border-border px-4 py-2 text-sm font-semibold">
          Take virtual tour →
        </a>
      </Card>
      <section className="mt-5">
        <h2 className="text-xl font-bold">Experiences at {venue.name}</h2>
        {experiences.length ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {experiences.map((item) => (
              <Card key={item.id} className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">{item.category}</p>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.summary}</p>
                {item.location_details && <p className="text-xs text-muted-foreground">{item.location_details}</p>}
                <p className="border-t border-border pt-2 text-xs"><b>Price:</b> {item.price_label}</p>
                {item.requirements?.length > 0 && (
                  <ul className="list-disc pl-5 text-xs text-muted-foreground">
                    {item.requirements.map((requirement, index) => <li key={index}>{requirement}</li>)}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-3">
            <p className="font-semibold">No approved experiences listed yet</p>
            <p className="mt-1 text-sm text-muted-foreground">The venue provider can add activities and submit them for review.</p>
          </Card>
        )}
      </section>
      <div className="mt-4">
        <Notice>Venue details and experiences are shown only after publication approval. Availability, prices, access rules and provider contact must still be confirmed before making plans. Viewing this page or taking the virtual tour does not create a booking or record physical attendance.</Notice>
      </div>
    </Shell>
  );
}

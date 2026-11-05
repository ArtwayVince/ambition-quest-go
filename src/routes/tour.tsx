import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, Card, Btn, Notice, meta } from "@/components/Shell";
import { TOUR_STOPS } from "@/lib/data";

function normalizeSupabaseUrl(value: string | undefined) {
  return value
    ?.trim()
    .replace(/\/+$/, "")
    .replace(/\.supabase\.com(?=\/|$)/i, ".supabase.co");
}

export const Route = createFileRoute("/tour")({
  validateSearch: (search: Record<string, unknown>) => ({
    venue: typeof search.venue === "string" ? search.venue : "yuby-resort",
  }),
  head: () =>
    meta(
      "Venue Tour",
      "Interactive visual walkthrough of a venue, with facility galleries and approved media.",
    ),
  component: Tour,
});

type TourMedia = { type: "image" | "video"; url: string; caption: string };
type DynamicStop = { id: string; name: string; info: string; protocol: string; x: number; y: number };
type OnlineMediaRow = {
  stop_id: string;
  media_type: "image" | "video";
  public_url: string;
  caption: string;
  sort_order: number;
};

function Tour() {
  const { venue: venueSlug } = Route.useSearch();
  const [venueName, setVenueName] = useState(venueSlug === "yuby-resort" ? "Yuby Resort" : "Venue");
  const [venueNotFound, setVenueNotFound] = useState(false);
  const [exploredStops, setExploredStops] = useState<string[]>([]);
  const [mode, setMode] = useState<"walk" | "map">("walk");
  const [i, setI] = useState(0);
  const [onlineMedia, setOnlineMedia] = useState<Record<string, TourMedia[]>>({});
  const [dynamicStops, setDynamicStops] = useState<DynamicStop[]>([]);
  const allStops = venueSlug === "yuby-resort" ? [...TOUR_STOPS, ...dynamicStops] : dynamicStops;
  const [mediaLoading, setMediaLoading] = useState(false);
  useEffect(() => {
    const base = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL as string | undefined);
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!base || !key) return;
    let active = true;
    setMediaLoading(true);
    setVenueNotFound(false);
    setDynamicStops([]);
    setOnlineMedia({});

    async function loadVenueTour() {
      let venueId: string | null = null;
      let resolvedName = venueSlug === "yuby-resort" ? "Yuby Resort" : "Venue";
      try {
        const venueResponse = await fetch(
          base + "/rest/v1/venues?select=id,name,slug&slug=eq." +
            encodeURIComponent(venueSlug) + "&status=eq.approved&limit=1",
          { headers: { apikey: key! } },
        );
        if (venueResponse.ok) {
          const venues = (await venueResponse.json()) as Array<{id:string;name:string;slug:string}>;
          if (venues[0]) {
            venueId = venues[0].id;
            resolvedName = venues[0].name;
          } else if (venueSlug !== "yuby-resort") {
            if (active) setVenueNotFound(true);
            return;
          }
        } else if (venueSlug !== "yuby-resort") {
          if (active) setVenueNotFound(true);
          return;
        }

        if (active) setVenueName(resolvedName);
        const stopQuery = venueId
          ? "/rest/v1/venue_tour_stops?select=id,name,info,protocol&venue_id=eq." +
            encodeURIComponent(venueId) + "&status=eq.approved&order=created_at.asc"
          : "/rest/v1/venue_tour_stops?select=id,name,info,protocol&venue_name=ilike.*Yuby*Resort*&status=eq.approved&order=created_at.asc";
        const stopResponse = await fetch(base + stopQuery, { headers: { apikey: key! } });
        if (stopResponse.ok) {
          const rows = (await stopResponse.json()) as Array<{id:string;name:string;info:string;protocol:string}>;
          if (active) setDynamicStops(rows.map((row, index) => ({
            ...row,
            x: 10 + ((index * 23) % 80),
            y: 15 + ((index * 31) % 70),
          })));
        }

        const mediaQuery = venueId
          ? "/rest/v1/venue_media?select=stop_id,media_type,public_url,caption,sort_order&venue_id=eq." +
            encodeURIComponent(venueId) + "&status=eq.approved&order=sort_order.asc"
          : "/rest/v1/venue_media?select=stop_id,media_type,public_url,caption,sort_order&venue_name=ilike.*Yuby*Resort*&status=eq.approved&order=sort_order.asc";
        const mediaResponse = await fetch(base + mediaQuery, { headers: { apikey: key! } });
        if (!mediaResponse.ok) throw new Error("Unable to load approved venue media");
        const rows = (await mediaResponse.json()) as OnlineMediaRow[];
        const signedRows = await Promise.all(rows.map(async (row) => {
          const objectPath = row.public_url.split("/").map(encodeURIComponent).join("/");
          const response = await fetch(
            base + "/storage/v1/object/sign/jetoff-venue-media/" + objectPath,
            {
              method: "POST",
              headers: { apikey: key!, "Content-Type": "application/json" },
              body: JSON.stringify({ expiresIn: 3600 }),
            },
          );
          if (!response.ok) throw new Error("Unable to sign approved media");
          const result = (await response.json()) as { signedURL: string };
          const signedPath = result.signedURL.startsWith("/") ? result.signedURL : `/${result.signedURL}`;
          const url = result.signedURL.startsWith("http") ? result.signedURL : `${base}/storage/v1${signedPath}`;
          return { ...row, public_url: url };
        }));
        if (!active) return;
        const grouped: Record<string, TourMedia[]> = {};
        for (const row of signedRows) {
          (grouped[row.stop_id] ??= []).push({
            type: row.media_type,
            url: row.public_url,
            caption: row.caption,
          });
        }
        setOnlineMedia(grouped);
      } catch {
        // Keep the static Yuby pilot tour available if the service is unavailable.
      } finally {
        if (active) setMediaLoading(false);
      }
    }

    void loadVenueTour();
    return () => { active = false; };
  }, [venueSlug]);
  const stop = allStops[i] ?? allStops[0]!;
  const media = stop ? onlineMedia[stop.id] ?? (stop as typeof stop & { media?: TourMedia[] }).media ?? [] : [];

  const visit = (k: number) => {
    const t = allStops[k];
    if (!t) return;
    setI(k);
    setExploredStops((previous) => previous.includes(t.id) ? previous : [...previous, t.id]);
  };

  if (venueNotFound) {
    return <Shell><h1 className="text-2xl font-bold">Venue not available</h1><p className="mt-2 text-sm text-muted-foreground">This venue is not published yet, or its listing could not be found.</p></Shell>;
  }
  if (!stop) {
    return <Shell><h1 className="text-3xl font-extrabold">{venueName} Tour</h1><p className="mt-2 text-sm text-muted-foreground">This venue does not have any approved tour stops yet. Its provider can add stops and submit them for review.</p>{mediaLoading && <p className="mt-2 text-sm">Loading venue tour…</p>}</Shell>;
  }

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">{venueName} Tour</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose any point on the walkthrough or map to preview the place and view its photo/video
        gallery when venue media is available. This is a virtual preview, not a recorded physical visit.
      </p>
      <div className="mt-3">
        <Notice>
          Demonstrator: Yuby Resort is a proposed pilot. The route diagram is illustrative, not a
          measured site plan. Facility details and media must be confirmed or approved by the venue
          before being presented as an accurate preview.
        </Notice>
      </div>
      <div className="mt-4 flex gap-2">
        <Btn variant={mode === "walk" ? "primary" : "ghost"} onClick={() => setMode("walk")}>
          Walkthrough
        </Btn>
        <Btn variant={mode === "map" ? "primary" : "ghost"} onClick={() => setMode("map")}>
          Interactive map
        </Btn>
      </div>

      {mode === "map" ? (
        <div className="relative mt-4 aspect-[4/3] rounded-2xl border border-border bg-secondary">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline
              points={allStops.slice(0, 4)
                .map((t) => `${t.x},${t.y}`)
                .join(" ")}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="0.6"
              strokeDasharray="2 1"
            />
          </svg>
          {allStops.map((t, k) => (
            <button
              key={t.id}
              onClick={() => visit(k)}
              style={{ left: `${t.x}%`, top: `${t.y}%` }}
              aria-label={`View ${t.name}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-background px-2 py-1 text-[10px] font-semibold shadow-sm ${i === k ? "bg-foreground text-background ring-2 ring-primary" : exploredStops.includes(t.id) ? "bg-success text-primary-foreground" : "bg-primary text-primary-foreground"}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Stop {i + 1} of {allStops.length}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {allStops.map((t, k) => (
              <button
                key={t.id}
                onClick={() => visit(k)}
                className={`rounded-xl border p-3 text-left text-sm ${i === k ? "border-primary bg-primary/10 font-semibold" : "border-border"}`}
              >
                <span className="block text-xs text-muted-foreground">Stop {k + 1}</span>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Card className="mt-4 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">{stop.name}</p>
        <h2 className="text-xl font-bold">Explore this place</h2>
        <p className="text-sm">{stop.info}</p>
        <p className="text-sm">
          <b>Visitor guidance:</b> {stop.protocol}
        </p>
        <p className="text-xs text-muted-foreground">
          Verified facility price: pending verification
        </p>
        {media.length > 0 ? (
          <section className="pt-3" aria-label={`${stop.name} photos and videos`}>
            <h3 className="font-bold">Photos & videos</h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {media.map((item, index) => (
                <figure
                  key={item.url + index}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  {item.type === "video" ? (
                    <video
                      className="aspect-video w-full bg-black object-cover"
                      controls
                      preload="metadata"
                      playsInline
                      src={item.url}
                    >
                      Your browser does not support embedded video.
                    </video>
                  ) : (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open photo: ${item.caption}`}
                    >
                      <img
                        src={item.url}
                        alt={item.caption || stop.name}
                        loading="lazy"
                        className="aspect-video w-full object-cover"
                      />
                    </a>
                  )}
                  {item.caption && (
                    <figcaption className="p-2 text-xs text-muted-foreground">
                      {item.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-border p-4">
            <h3 className="font-bold">Photos & videos for {stop.name}</h3>
            {mediaLoading && (
              <p className="mt-1 text-sm text-muted-foreground">Checking approved venue media…</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              The gallery is ready, but venue-specific photos and video clips have not yet been
              added. We are leaving this clearly marked rather than showing unrelated stock media as
              if it belonged to this venue.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Planned media: real photographs of this area and short clips that accurately show the venue.
            </p>
          </div>
        )}
        {mode === "walk" && (
          <div className="flex gap-2 pt-2">
            <Btn variant="ghost" disabled={i === 0} onClick={() => visit(i - 1)}>
              Back
            </Btn>
            <Btn
              disabled={i === allStops.length - 1}
              onClick={() => visit(i + 1)}
            >
              Next stop
            </Btn>
          </div>
        )}
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Previewed {exploredStops.length}/{allStops.length} stops · preview activity earns no visit or attendance rewards
      </p>
    </Shell>
  );
}

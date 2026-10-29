import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, Card, Btn, Notice, meta } from "@/components/Shell";
import { useStore, type ProviderApp } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => meta("Admin moderation", "Review provider applications and venue media."),
  component: Admin,
});
type ReviewMedia = {
  id: string;
  venue_name: string;
  stop_id: string;
  media_type: "image" | "video";
  public_url: string;
  caption: string;
  status: string;
};

function Admin() {
  const { s, set } = useStore();
  const [media, setMedia] = useState<ReviewMedia[]>([]);
  const [mediaMessage, setMediaMessage] = useState("");
  const [mediaBusy, setMediaBusy] = useState(false);
  const [token, setToken] = useState("");
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("jetoff_vendor_session");
      if (raw) setToken((JSON.parse(raw) as { access_token?: string }).access_token ?? "");
    } catch {
      /* ignore invalid session */
    }
  }, []);
  useEffect(() => {
    const base = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (s.role !== "admin" || !base || !key || !token) return;
    fetch(
      base +
        "/rest/v1/venue_media?select=id,venue_name,stop_id,media_type,public_url,caption,status&status=eq.pending&order=created_at.asc",
      { headers: { apikey: key, Authorization: "Bearer " + token } },
    )
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then(async (rows: ReviewMedia[]) => {
        const signedRows = await Promise.all(
          rows.map(async (row) => {
            const objectPath = row.public_url
              .split("/")
              .map(encodeURIComponent)
              .join("/");
            const response = await fetch(
              base + "/storage/v1/object/sign/jetoff-venue-media/" + objectPath,
              {
                method: "POST",
                headers: {
                  apikey: key,
                  Authorization: "Bearer " + token,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ expiresIn: 3600 }),
              },
            );
            if (!response.ok) throw new Error(await response.text());
            const result = (await response.json()) as { signedURL: string };
            const url = result.signedURL.startsWith("http")
              ? result.signedURL
              : base +
                "/storage/v1" +
                (result.signedURL.startsWith("/") ? result.signedURL : "/" + result.signedURL);
            return { ...row, public_url: url };
          }),
        );
        setMedia(signedRows);
      })
      .catch((e) =>
        setMediaMessage(
          "Could not load the online media queue. Check Supabase admin role and SQL policies. " +
            (e instanceof Error ? e.message : ""),
        ),
      );
  }, [s.role, token]);
  async function moderateMedia(item: ReviewMedia, status: "approved" | "rejected") {
    const base = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!base || !key || !token) {
      setMediaMessage(
        "Sign in through Venue Media Manager with an authorised admin account first.",
      );
      return;
    }
    setMediaBusy(true);
    setMediaMessage("");
    try {
      const response = await fetch(
        base + "/rest/v1/venue_media?id=eq." + encodeURIComponent(item.id),
        {
          method: "PATCH",
          headers: {
            apikey: key,
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ status }),
        },
      );
      if (!response.ok) throw new Error(await response.text());
      setMedia((old) => old.filter((m) => m.id !== item.id));
      setMediaMessage("Media marked " + status + ".");
    } catch (e) {
      setMediaMessage(e instanceof Error ? e.message : "Moderation failed.");
    } finally {
      setMediaBusy(false);
    }
  }
  if (s.role !== "admin")
    return (
      <Shell>
        <Notice>Switch to the Admin role in the header to moderate applications.</Notice>
      </Shell>
    );
  const mod = (id: string, status: ProviderApp["status"]) =>
    set((p) => ({ ...p, apps: p.apps.map((a) => (a.id === id ? { ...a, status } : a)) }));
  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Moderation</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Provider applications below are prototype records stored in this browser. Online media
        moderation uses the configured Supabase project.
      </p>
      {s.apps.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">No provider applications to review.</p>
      )}
      {s.apps.map((a) => (
        <Card key={a.id} className="mt-3">
          <p className="font-bold">
            {a.business}{" "}
            <span className="text-xs capitalize text-muted-foreground">· {a.status}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {a.category} · {a.contact}
          </p>
          <p className="mt-1 text-sm">{a.description}</p>
          <div className="mt-2 flex gap-2">
            <Btn onClick={() => mod(a.id, "approved")}>Approve</Btn>
            <Btn variant="ghost" onClick={() => mod(a.id, "rejected")}>
              Reject
            </Btn>
          </div>
        </Card>
      ))}
      <section className="mt-8">
        <h2 className="text-2xl font-bold">Venue media review</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm each item genuinely shows the selected venue and location and is authorised for
          publication.
        </p>
        {mediaMessage && (
          <p
            role="status"
            className="mt-3 rounded-lg border border-border bg-secondary p-3 text-sm"
          >
            {mediaMessage}
          </p>
        )}
        {!token && (
          <div className="mt-3">
            <Notice>
              Sign in through the Venue Media Manager using an authorised admin account. That
              account must have app_metadata.role set to admin in Supabase.
            </Notice>
          </div>
        )}
        {media.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No online pending uploads loaded.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {media.map((m) => (
              <Card key={m.id} className="space-y-2">
                {m.media_type === "video" ? (
                  <video
                    controls
                    preload="metadata"
                    className="aspect-video w-full rounded-lg bg-black"
                    src={m.public_url}
                  />
                ) : (
                  <img
                    loading="lazy"
                    className="aspect-video w-full rounded-lg object-cover"
                    src={m.public_url}
                    alt={m.caption}
                  />
                )}
                <p className="font-bold">
                  {m.venue_name} · {m.stop_id}
                </p>
                <p className="text-sm text-muted-foreground">{m.caption}</p>
                <div className="flex gap-2">
                  <Btn disabled={mediaBusy} onClick={() => void moderateMedia(m, "approved")}>
                    Approve
                  </Btn>
                  <Btn
                    disabled={mediaBusy}
                    variant="ghost"
                    onClick={() => void moderateMedia(m, "rejected")}
                  >
                    Reject
                  </Btn>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
      <p className="mt-6 text-xs text-muted-foreground">
        Requests from users: {s.requests.length} · Explorer level XP: {s.xp}
      </p>
    </Shell>
  );
}

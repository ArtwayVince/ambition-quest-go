import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell, Card, Btn, Notice, meta } from "@/components/Shell";
import { TOUR_STOPS } from "@/lib/data";

function normalizeSupabaseUrl(value: string | undefined) {
  return value
    ?.trim()
    .replace(/\/+$/, "")
    .replace(/\.supabase\.com(?=\/|$)/i, ".supabase.co");
}

export const Route = createFileRoute("/provider/media")({
  head: () => meta("Venue media manager", "Upload venue photos and videos."),
  component: VendorMedia,
});
type Session = {
  access_token: string;
  refresh_token?: string;
  user: { id: string; email?: string };
};
type MediaRow = {
  id: string;
  venue_name: string;
  stop_id: string;
  media_type: "image" | "video";
  public_url: string;
  caption: string;
  status: string;
  created_at: string;
  object_path: string;
};
const base = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL as string | undefined);
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const configured = Boolean(base && anon);

function VendorMedia() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [venue, setVenue] = useState("Yuby Resort");
  const [stopId, setStopId] = useState("gate");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<MediaRow[]>([]);
  const [customStops, setCustomStops] = useState<Array<{id:string;name:string;info:string;protocol:string;status:string}>>([]);
  const [pointName, setPointName] = useState("");
  const [pointInfo, setPointInfo] = useState("");
  const [pointProtocol, setPointProtocol] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const field = "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground";

  useEffect(() => {
    const saved = sessionStorage.getItem("jetoff_vendor_session");
    if (saved)
      try {
        setSession(JSON.parse(saved) as Session);
      } catch {
        sessionStorage.removeItem("jetoff_vendor_session");
      }
  }, []);

  async function api(path: string, init: RequestInit = {}, token?: string) {
    if (!base || !anon)
      throw new Error(
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and run supabase/venue-media-setup.sql.",
      );
    const response = await fetch(base + path, {
      ...init,
      headers: {
        apikey: anon,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(typeof init.body === "string" ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
    const text = await response.text();
    if (!response.ok) {
      let detail = text;
      try {
        const j = JSON.parse(text);
        detail = j.msg || j.message || j.error_description || text;
      } catch {
        /* use text */
      }
      throw new Error(detail || `Request failed (${response.status})`);
    }
    return text ? JSON.parse(text) : null;
  }

  async function authenticate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const endpoint =
        authMode === "signup" ? "/auth/v1/signup" : "/auth/v1/token?grant_type=password";
      const result = (await api(endpoint, {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      })) as Session;
      if (!result.access_token) {
        setMessage("Check your email for a confirmation link, then sign in.");
        return;
      }
      setSession(result);
      sessionStorage.setItem("jetoff_vendor_session", JSON.stringify(result));
      toast.success(authMode === "signup" ? "Vendor account created" : "Signed in");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  async function signedUrl(objectPath: string, token: string) {
    const result = (await api(
      `/storage/v1/object/sign/jetoff-venue-media/${objectPath.split("/").map(encodeURIComponent).join("/")}`,
      { method: "POST", body: JSON.stringify({ expiresIn: 3600 }) },
      token,
    )) as { signedURL: string };
    if (result.signedURL.startsWith("http")) return result.signedURL;
    return `${base}/storage/v1${result.signedURL.startsWith("/") ? result.signedURL : "/" + result.signedURL}`;
  }

  async function load(current: Session) {
    try {
      const rows = (await api(
        `/rest/v1/venue_media?select=id,venue_name,stop_id,media_type,public_url,caption,status,created_at&user_id=eq.${current.user.id}&order=created_at.desc`,
        {},
        current.access_token,
      )) as MediaRow[];
      const withUrls = await Promise.all(
        (rows ?? []).map(async (row) => ({
          ...row,
          object_path: row.public_url,
          public_url: await signedUrl(row.public_url, current.access_token),
        })),
      );
      setItems(withUrls);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not load uploads.");
    }
  }
  async function loadCustomStops(current: Session) {
    try {
      const rows = (await api("/rest/v1/venue_tour_stops?select=id,name,info,protocol,status&user_id=eq." + current.user.id + "&order=created_at.desc", {}, current.access_token)) as Array<{id:string;name:string;info:string;protocol:string;status:string}>;
      setCustomStops(rows ?? []);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not load tour points."); }
  }
  useEffect(() => {
    if (session) { void load(session); void loadCustomStops(session); }
  }, [session?.access_token]);

  async function addTourPoint(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setBusy(true); setMessage("");
    try {
      await api("/rest/v1/venue_tour_stops", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ id: "custom-" + crypto.randomUUID(), user_id: session.user.id, venue_name: venue.trim(), name: pointName.trim(), info: pointInfo.trim(), protocol: pointProtocol.trim(), status: "pending" }) }, session.access_token);
      setPointName(""); setPointInfo(""); setPointProtocol("");
      setMessage("Tour point submitted for review. It will appear in the visitor tour after approval.");
      await loadCustomStops(session);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not add tour point."); }
    finally { setBusy(false); }
  }

  async function editTourPoint(point: {id:string;name:string;info:string;protocol:string}) {
    if (!session) return;
    const name = window.prompt("Tour point name", point.name);
    if (name === null || !name.trim()) return;
    const info = window.prompt("Description", point.info);
    if (info === null || !info.trim()) return;
    const protocol = window.prompt("Visitor guidance", point.protocol);
    if (protocol === null) return;
    setBusy(true);
    try {
      await api("/rest/v1/venue_tour_stops?id=eq." + encodeURIComponent(point.id), { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ name: name.trim(), info: info.trim(), protocol: protocol.trim(), status: "pending" }) }, session.access_token);
      await loadCustomStops(session);
      setMessage("Changes saved and submitted for review. The public tour will use the revised point after approval.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not update tour point."); }
    finally { setBusy(false); }
  }
  async function deleteTourPoint(point: {id:string;name:string}) {
    if (!session || !window.confirm("Delete tour point " + point.name + "?")) return;
    if (items.some((item) => item.stop_id === point.id)) { setMessage("Delete this point’s media first."); return; }
    setBusy(true);
    try {
      await api("/rest/v1/venue_tour_stops?id=eq." + encodeURIComponent(point.id), { method: "DELETE" }, session.access_token);
      setCustomStops((old) => old.filter((item) => item.id !== point.id)); setMessage("Tour point deleted.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not delete tour point."); }
    finally { setBusy(false); }
  }

  async function deleteMedia(item: MediaRow) {
    if (!session || !window.confirm("Permanently delete this " + item.media_type + "?")) return;
    setBusy(true); setMessage("");
    try {
      await api("/rest/v1/venue_media?id=eq." + encodeURIComponent(item.id), { method: "DELETE" }, session.access_token);
      await api("/storage/v1/object/jetoff-venue-media/" + item.object_path.split("/").map(encodeURIComponent).join("/"), { method: "DELETE" }, session.access_token);
      setItems((old) => old.filter((entry) => entry.id !== item.id)); setMessage("Media deleted.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not delete media."); await load(session); }
    finally { setBusy(false); }
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !files.length) return;
    if (files.length > 10) {
      setMessage("Choose no more than 10 files at a time.");
      return;
    }
    const tooLarge = files.find((f) => f.size > 100 * 1024 * 1024);
    if (tooLarge) {
      setMessage(`${tooLarge.name} exceeds the 100 MB limit.`);
      return;
    }
    setBusy(true);
    setMessage("");
    let count = 0;
    try {
      for (const file of files) {
        const video = file.type.startsWith("video/");
        if (!video && !file.type.startsWith("image/"))
          throw new Error(`${file.name} is not an image or video.`);
        const name = file.name
          .normalize("NFKD")
          .replace(/[^a-zA-Z0-9._-]/g, "-")
          .slice(-100);
        const object = `${session.user.id}/${Date.now()}-${crypto.randomUUID()}-${name}`;
        const path = object.split("/").map(encodeURIComponent).join("/");
        await api(
          `/storage/v1/object/jetoff-venue-media/${path}`,
          {
            method: "POST",
            headers: { "Content-Type": file.type, "x-upsert": "false" },
            body: file,
          },
          session.access_token,
        );
        // Store the object path, not a public URL. The bucket is private.
        const objectPath = object;
        await api(
          "/rest/v1/venue_media",
          {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({
              user_id: session.user.id,
              venue_name: venue.trim(),
              stop_id: stopId,
              media_type: video ? "video" : "image",
              public_url: objectPath,
              caption:
                caption.trim() ||
                `${TOUR_STOPS.find((s) => s.id === stopId)?.name ?? stopId} at ${venue.trim()}`,
              status: "pending",
            }),
          },
          session.access_token,
        );
        count++;
      }
      setFiles([]);
      setCaption("");
      const input = document.getElementById("venue-files") as HTMLInputElement | null;
      if (input) input.value = "";
      setMessage(
        `${count} file(s) uploaded online and submitted for review. They will appear in the public tour only after approval.`,
      );
      toast.success("Media submitted for review");
      await load(session);
    } catch (e) {
      setMessage(
        `${count} file(s) uploaded before the error. ${e instanceof Error ? e.message : "Please retry."}`,
      );
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    try {
      if (session) await api("/auth/v1/logout", { method: "POST" }, session.access_token);
    } catch {
      /* local sign-out */
    }
    sessionStorage.removeItem("jetoff_vendor_session");
    setSession(null);
    setItems([]);
  }

  return (
    <Shell>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            Partner workspace
          </p>
          <h1 className="mt-1 text-3xl font-extrabold">Venue media manager</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Upload real venue photos and videos. Select the exact location each file shows, so it
            appears in the right gallery.
          </p>
        </div>
        {session && (
          <Btn variant="outline" onClick={() => void signOut()}>
            Sign out
          </Btn>
        )}
      </div>
      {!configured && (
        <div className="mt-4">
          <Notice>
            Online storage needs Supabase configuration. Set VITE_SUPABASE_URL and
            VITE_SUPABASE_ANON_KEY, then run supabase/venue-media-setup.sql. The app will not
            pretend uploads are online before this is configured.
          </Notice>
        </div>
      )}
      {message && (
        <p role="status" className="mt-4 rounded-xl border border-border bg-secondary p-3 text-sm">
          {message}
        </p>
      )}
      {!session ? (
        <Card className="mt-5">
          <h2 className="text-xl font-bold">
            {authMode === "signup" ? "Create vendor account" : "Vendor sign in"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use a business email. You may need to confirm your email before signing in.
          </p>
          <form className="mt-4 space-y-3" onSubmit={(e) => void authenticate(e)}>
            <label className="block space-y-1 text-sm">
              Email
              <input
                className={field}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block space-y-1 text-sm">
              Password
              <input
                className={field}
                type="password"
                required
                minLength={8}
                autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <Btn type="submit" disabled={busy || !configured}>
              {busy ? "Please wait…" : authMode === "signup" ? "Create account" : "Sign in"}
            </Btn>
          </form>
          <button
            className="mt-3 text-sm font-semibold text-primary underline"
            onClick={() => {
              setAuthMode(authMode === "signup" ? "signin" : "signup");
              setMessage("");
            }}
          >
            {authMode === "signup"
              ? "Already registered? Sign in"
              : "New vendor? Create an account"}
          </button>
        </Card>
      ) : (
        <>
          <Card className="mt-5 space-y-3">
            <h2 className="text-xl font-bold">Upload photos or videos</h2>
            <p className="text-sm text-muted-foreground">
              Signed in as {session.user.email ?? "vendor"}. All selected files are assigned to the
              same location.
            </p>
            <form className="space-y-4" onSubmit={(e) => void upload(e)}>
              <label className="block space-y-1 text-sm">
                Venue name
                <input
                  className={field}
                  required
                  maxLength={120}
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </label>
              <label className="block space-y-1 text-sm">
                Which location does this show?
                <select
                  className={field}
                  value={stopId}
                  onChange={(e) => setStopId(e.target.value)}
                >
                  {[...TOUR_STOPS, ...customStops].map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-muted-foreground">
                  Selected location: <b>{TOUR_STOPS.find((s) => s.id === stopId)?.name}</b>
                </span>
              </label>
              <label className="block space-y-1 text-sm">
                Caption (optional)
                <input
                  className={field}
                  maxLength={240}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Customer parking beside reception"
                />
              </label>
              <label className="block space-y-1 text-sm">
                Select photos/videos
                <input
                  id="venue-files"
                  className={field}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                />
                <span className="text-xs text-muted-foreground">
                  Up to 10 files at once, 100 MB per file. Selected: {files.length}.
                </span>
              </label>
              {files.length > 0 && (
                <ul className="list-disc pl-5 text-xs text-muted-foreground">
                  {files.map((f) => (
                    <li key={f.name + f.size}>
                      {f.name} · {(f.size / 1024 / 1024).toFixed(1)} MB
                    </li>
                  ))}
                </ul>
              )}
              <Btn type="submit" disabled={busy || !files.length}>
                {busy ? "Uploading…" : "Upload and submit for review"}
              </Btn>
            </form>
          </Card>
          <Card className="mt-5 space-y-3">
            <h2 className="text-xl font-bold">Add a new tour point</h2>
            <p className="text-sm text-muted-foreground">New points are reviewed before visitors can see them.</p>
            <form className="space-y-3" onSubmit={(e) => void addTourPoint(e)}>
              <label className="block space-y-1 text-sm">Point name<input className={field} required maxLength={100} value={pointName} onChange={(e) => setPointName(e.target.value)} /></label>
              <label className="block space-y-1 text-sm">Description<textarea className={field} required maxLength={1000} rows={3} value={pointInfo} onChange={(e) => setPointInfo(e.target.value)} /></label>
              <label className="block space-y-1 text-sm">Visitor guidance<textarea className={field} maxLength={1000} rows={2} value={pointProtocol} onChange={(e) => setPointProtocol(e.target.value)} /></label>
              <Btn type="submit" disabled={busy || !pointName.trim() || !pointInfo.trim()}>{busy ? "Saving…" : "Add point for review"}</Btn>
            </form>
            {customStops.map((point) => <div key={point.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"><div><p className="font-semibold">{point.name}</p><p className="text-xs text-muted-foreground capitalize">{point.status} review</p></div><div className="flex gap-1"><Btn variant="ghost" disabled={busy} onClick={() => void editTourPoint(point)}>Edit</Btn><Btn variant="ghost" disabled={busy} onClick={() => void deleteTourPoint(point)}>Delete</Btn></div></div>)}
          </Card>
          <h2 className="mt-6 text-xl font-bold">Your submissions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pending media is private to your account. Only approved media appears in the visitor
            tour.
          </p>
          {items.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No uploads yet.</p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {items.map((m) => (
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
                  <p className="font-semibold">
                    {m.venue_name} · {TOUR_STOPS.find((s) => s.id === m.stop_id)?.name ?? m.stop_id}
                  </p>
                  <p className="text-sm text-muted-foreground">{m.caption}</p>
                  <p className="text-xs font-bold uppercase">
                    {m.status === "approved"
                      ? "Approved"
                      : m.status === "rejected"
                        ? "Needs changes"
                        : "Pending review"}
                  </p>
                  <Btn variant="ghost" disabled={busy} onClick={() => void deleteMedia(m)}>Delete this {m.media_type}</Btn>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      <div className="mt-6">
        <Notice>
          Upload only media you own or are authorised to publish. Avoid identifiable guests without
          permission and private/security-sensitive details. Venue media must be reviewed before it
          is shown publicly.
        </Notice>
      </div>
    </Shell>
  );
}

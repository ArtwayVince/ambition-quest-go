import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Shell, Card, Btn, Notice, meta } from "@/components/Shell";
import { useStore, type Request } from "@/lib/store";

export const Route = createFileRoute("/provider/requests")({
  head: () => meta("Provider request inbox", "Review and respond to experience enquiries in the local prototype."),
  component: ProviderRequests,
});

function ProviderRequests() {
  const { s, set } = useStore();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const respond = (request: Request, status: NonNullable<Request["providerStatus"]>) => {
    const response = (drafts[request.id] ?? request.providerResponse ?? "").trim();
    if (!response) {
      toast.error("Write a short response before updating this request.");
      return;
    }
    set((p) => ({
      ...p,
      requests: p.requests.map((item) => item.id === request.id
        ? { ...item, providerResponse: response, providerStatus: status, providerRespondedAt: new Date().toISOString() }
        : item),
    }));
    toast.success("Prototype response saved in this browser.");
  };

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Provider request inbox</h1>
      <p className="mt-2 text-sm text-muted-foreground">A demonstration of how a provider could review an enquiry and record a response.</p>
      <div className="mt-4"><Notice>This is a local prototype inbox. It only shows requests stored in this same browser; it is not connected to real providers or other users. Responses here are simulations, not messages sent to customers.</Notice></div>
      {s.requests.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No locally saved experience requests yet. Create one from Explore to try this workflow.</p>}
      {s.requests.map((request) => (
        <Card key={request.id} className="mt-3 space-y-3">
          <div>
            <p className="font-bold">{request.title}</p>
            <p className="text-xs text-muted-foreground">Preferred date: {request.date} · enquiry saved {new Date(request.at).toLocaleDateString()}</p>
            {request.goalTitle && <p className="mt-1 text-sm"><b>Linked ambition:</b> {request.goalTitle}</p>}
            {request.note && <p className="mt-2 text-sm"><b>Customer question:</b> {request.note}</p>}
          </div>
          <div>
            <label htmlFor={`response-${request.id}`} className="mb-1 block text-sm font-medium">Draft provider response</label>
            <textarea id={`response-${request.id}`} maxLength={1000} rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Example: We will need to check availability and confirm the price with you." value={drafts[request.id] ?? request.providerResponse ?? ""} onChange={(event) => setDrafts((p) => ({ ...p, [request.id]: event.target.value }))} />
          </div>
          {request.providerStatus && <p className="text-sm"><b>Saved prototype status:</b> {request.providerStatus} {request.providerRespondedAt ? `· ${new Date(request.providerRespondedAt).toLocaleString()}` : ""}</p>}
          <div className="flex flex-wrap gap-2">
            <Btn onClick={() => respond(request, "responded")}>Save response</Btn>
            <Btn variant="outline" onClick={() => respond(request, "confirmed")}>Record confirmation</Btn>
            <Btn variant="ghost" onClick={() => respond(request, "unavailable")}>Mark unavailable</Btn>
          </div>
        </Card>
      ))}
    </Shell>
  );
}

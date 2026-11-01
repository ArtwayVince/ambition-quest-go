import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Shell, Card, Btn, Notice, meta } from "@/components/Shell";
import {
  useStore,
  hasParticipationRecordForRequest,
  isValidParticipationDate,
  localDateString,
  type ParticipationRecord,
  type Request,
} from "@/lib/store";

export const Route = createFileRoute("/bookings")({
  head: () => meta("My requests", "Your experience enquiries and personal participation records."),
  component: Bookings,
});

type ParticipationDraft = {
  activity: string;
  attendedOn: string;
  reflection: string;
};

function Bookings() {
  const { s, set } = useStore();
  const [drafts, setDrafts] = useState<Record<string, ParticipationDraft>>({});

  const draftFor = (requestId: string): ParticipationDraft =>
    drafts[requestId] ?? { activity: "", attendedOn: localDateString(), reflection: "" };

  const updateDraft = (requestId: string, field: keyof ParticipationDraft, value: string) => {
    setDrafts((previous) => ({
      ...previous,
      [requestId]: { ...draftFor(requestId), [field]: value },
    }));
  };

  const saveParticipationRecord = (request: Request) => {
    const draft = draftFor(request.id);
    if (!draft.activity.trim()) {
      toast.error("Describe the activity you actually took part in.");
      return;
    }
    if (!isValidParticipationDate(draft.attendedOn)) {
      toast.error("Choose today or an earlier date for an experience that has already happened.");
      return;
    }
    if (hasParticipationRecordForRequest(s.participationRecords, request.id)) {
      toast.error("A participation record already exists for this request.");
      return;
    }

    const record: ParticipationRecord = {
      id: crypto.randomUUID(),
      requestId: request.id,
      expId: request.expId,
      title: request.title,
      activity: draft.activity.trim(),
      attendedOn: draft.attendedOn,
      reflection: draft.reflection.trim(),
      recordedAt: new Date().toISOString(),
      status: "self_reported",
    };
    set((previous) => ({
      ...previous,
      participationRecords: [...previous.participationRecords, record],
    }));
    toast.success(
      "Your self-reported experience record has been saved on this device. No attendance verification or reward was issued.",
    );
    setDrafts((previous) => ({
      ...previous,
      [request.id]: { activity: "", attendedOn: localDateString(), reflection: "" },
    }));
  };

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">My requests & experiences</h1>
      <Notice>
        Enquiries and participation records are saved only in this browser. No provider has been
        notified. A personal record is your own account of what happened; it is not proof of
        attendance, a confirmed booking, or eligibility for XP or rewards.
      </Notice>

      <h2 className="mt-5 text-xl font-bold">Experience enquiries</h2>
      {s.requests.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          No requests yet.{" "}
          <Link to="/explore" className="text-primary">
            Explore experiences
          </Link>
        </p>
      )}
      {s.requests.map((request) => {
        const record = s.participationRecords.find((item) => item.requestId === request.id);
        const draft = draftFor(request.id);
        return (
          <Card key={request.id} className="mt-3 space-y-3">
            <div>
              <p className="font-bold">{request.title}</p>
              <p className="text-xs text-muted-foreground">
                Preferred {request.date} · saved locally · provider not notified
              </p>
              {request.goalTitle && (
                <p className="mt-1 text-sm">
                  <b>Linked ambition:</b> {request.goalTitle}
                </p>
              )}
              {request.providerStatus && (
                <div className="mt-2 rounded-lg border p-3">
                  <p className="text-sm font-semibold">
                    Prototype provider response:{" "}
                    {request.providerStatus === "confirmed"
                      ? "Confirmation recorded (not a real booking)"
                      : request.providerStatus === "unavailable"
                        ? "Marked unavailable in prototype"
                        : "Response recorded in prototype"}
                  </p>
                  {request.providerResponse && (
                    <p className="mt-1 text-sm">{request.providerResponse}</p>
                  )}
                </div>
              )}
              {request.note && <p className="mt-1 text-sm">{request.note}</p>}
            </div>

            {record ? (
              <div className="rounded-xl border border-border bg-secondary/40 p-3">
                <p className="text-sm font-bold">Your experience record · Self-reported</p>
                <p className="mt-1 text-sm">{record.activity}</p>
                <p className="text-xs text-muted-foreground">Attended on {record.attendedOn}</p>
                {record.reflection && <p className="mt-2 text-sm">{record.reflection}</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                  Not independently verified. No XP or reward was awarded.
                </p>
              </div>
            ) : (
              <div className="space-y-2 rounded-xl border border-border p-3">
                <h3 className="font-semibold">Record an experience</h3>
                <p className="text-xs text-muted-foreground">
                  Use this only after you have actually attended or taken part. This entry is a
                  personal reflection, not an attendance check-in.
                </p>
                <label className="block space-y-1 text-sm">
                  What did you take part in?
                  <input
                    className="w-full rounded-xl border border-input bg-background px-3 py-2"
                    maxLength={120}
                    value={draft.activity}
                    onChange={(event) => updateDraft(request.id, "activity", event.target.value)}
                    placeholder="e.g. supervised horse riding"
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  Date attended
                  <input
                    className="w-full rounded-xl border border-input bg-background px-3 py-2"
                    type="date"
                    max={localDateString()}
                    value={draft.attendedOn}
                    onChange={(event) => updateDraft(request.id, "attendedOn", event.target.value)}
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  What did you learn or experience? (optional)
                  <textarea
                    className="w-full rounded-xl border border-input bg-background px-3 py-2"
                    maxLength={600}
                    rows={3}
                    value={draft.reflection}
                    onChange={(event) => updateDraft(request.id, "reflection", event.target.value)}
                    placeholder="Record a useful detail, outcome or reflection."
                  />
                </label>
                <Btn onClick={() => saveParticipationRecord(request)}>
                  Save personal experience record
                </Btn>
              </div>
            )}

            <div>
              <Btn
                variant="ghost"
                onClick={() =>
                  set((previous) => ({
                    ...previous,
                    requests: previous.requests.filter((item) => item.id !== request.id),
                  }))
                }
              >
                Withdraw enquiry
              </Btn>
            </div>
          </Card>
        );
      })}

      <h2 className="mt-6 text-xl font-bold">My experience history</h2>
      {s.participationRecords.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Your personal experience history will appear here after you record an activity you
          attended.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {s.participationRecords.map((record) => (
            <Card key={record.id} className="space-y-1">
              <p className="font-semibold">{record.title}</p>
              <p className="text-sm">{record.activity}</p>
              <p className="text-xs text-muted-foreground">
                {record.attendedOn} · Self-reported · Not independently verified
              </p>
              {record.reflection && <p className="text-sm">{record.reflection}</p>}
            </Card>
          ))}
        </div>
      )}
    </Shell>
  );
}

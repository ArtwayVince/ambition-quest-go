import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Card, Notice, meta } from "@/components/Shell";
import { EXPERIENCES } from "@/lib/data";

export const Route = createFileRoute("/venues/yuby-resort")({
  head: () => meta("Yuby Resort", "Venue overview and proposed activities at Yuby Resort."),
  component: YubyResort,
});

function YubyResort() {
  const activities = EXPERIENCES.filter((experience) =>
    experience.provider.startsWith("Yuby Resort"),
  );

  return (
    <Shell>
      <Link to="/explore" className="text-sm text-muted-foreground">
        ← Explore
      </Link>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-primary">
        Featured venue · proposed pilot
      </p>
      <h1 className="mt-1 text-3xl font-extrabold">Yuby Resort</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        A venue overview for discovering activities before deciding whether to make an enquiry.
      </p>

      <Card className="mt-4 space-y-2">
        <h2 className="font-bold">About this venue</h2>
        <p className="text-sm">
          The pilot listing brings together the resort tour and activities currently identified for
          exploration: horse riding, swimming, karaoke and barbecue.
        </p>
        <p className="text-sm">
          Use the virtual tour to preview the proposed arrival route, reception and facility stops.
          The tour is a visual walkthrough, not an attendance record or a booking.
        </p>
        <Link
          to="/tour"
          className="inline-flex rounded-xl border border-border px-4 py-2 text-sm font-semibold"
        >
          Take the Yuby Resort virtual tour →
        </Link>
      </Card>

      <div className="mt-5">
        <h2 className="text-xl font-bold">Experiences at Yuby Resort</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose an activity to see its description, preparation notes and enquiry form.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {activities.map((activity) => (
            <Link
              key={activity.id}
              to="/experiences/$id"
              params={{ id: activity.id }}
              className="block"
            >
              <Card className="h-full transition hover:border-primary">
                <p className="font-bold">{activity.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{activity.summary}</p>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">{activity.price}</span>
                  <span className="text-sm font-semibold text-primary">View details →</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Notice>
          Yuby Resort is a proposed pilot listing. Provider approval, exact location, facility
          access, prices, availability, safety rules and venue policies have not yet been
          independently confirmed. An enquiry is saved on this device only; it does not contact the
          resort or create a booking.
        </Notice>
      </div>
    </Shell>
  );
}

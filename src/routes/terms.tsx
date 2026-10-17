import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/Legal";
import { meta } from "@/components/Shell";
export const Route = createFileRoute("/terms")({
  head: () => meta("Terms of Use", "JET OFF Terms of Use."),
  component: () => <Legal title="Terms of Use" points={["Practice currency for missions, not real money. It has no cash value and cannot be withdrawn.", "Experience requests are requests for verified details only, not bookings.", "Savings figures are self-reported; JET OFF does not hold funds or guarantee outcomes.", "Providers are responsible for their own prices, availability and policies."]} />,
});

import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/Legal";
import { meta } from "@/components/Shell";
export const Route = createFileRoute("/privacy")({
  head: () => meta("Privacy", "JET OFF Privacy."),
  component: () => <Legal title="Privacy" points={["In this demonstrator, your profile, goals and photos are stored on your device only.", "We never sell personal data.", "You can reset all progress at any time from your profile."]} />,
});

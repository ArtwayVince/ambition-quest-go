import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/Legal";
import { meta } from "@/components/Shell";
export const Route = createFileRoute("/safety")({
  head: () => meta("Safety", "JET OFF Safety."),
  component: () => <Legal title="Safety" points={["Always follow venue reception and security procedures.", "Visit only verified providers; never pay outside approved channels.", "Tell someone where you are going for any real visit.", "Under-18s should be accompanied by a guardian."]} />,
});

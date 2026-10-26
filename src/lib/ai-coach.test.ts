import { describe, expect, it } from "vitest";
import { buildNextActionPrompt } from "@/lib/ai-coach";

describe("next-action coaching prompt", () => {
  const baseInput = {
    title: "Provide a security outlet",
    activityTitle: "Explore the intended service",
    result: "I spoke with two people who may use the service.",
  };

  it("uses a confirmed ambition brief as the primary intent", () => {
    const prompt = buildNextActionPrompt({
      ...baseInput,
      ambitionBrief: "Create a safe place where young people can report security concerns and get appropriate guidance.",
    });

    expect(prompt).toContain(
      "Confirmed ambition brief (the player-approved meaning; use this as the primary intent): Create a safe place where young people can report security concerns and get appropriate guidance.",
    );
    expect(prompt).toContain("Do not force an unfamiliar ambition into a predefined category");
  });

  it("clearly falls back when no confirmed brief is available", () => {
    const prompt = buildNextActionPrompt(baseInput);

    expect(prompt).toContain("No saved confirmed brief available");
    expect(prompt).toContain("I spoke with two people who may use the service.");
  });

  it("does not substitute the confirmed meaning with a generic ambition template", () => {
    const brief = "Set up a confidential reporting and referral service for local security concerns.";
    const prompt = buildNextActionPrompt({ ...baseInput, ambitionBrief: brief });

    expect(prompt).toContain(brief);
    expect(prompt).toContain("replace the user’s stated intent with a generic goal template");
  });
});

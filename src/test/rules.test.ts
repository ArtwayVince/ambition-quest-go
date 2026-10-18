import { describe, it, expect } from "vitest";
import {
  coach,
  levelOf,
  isMeaningfulReflection,
  STAGE_NOTE_MIN_LENGTH,
} from "@/lib/store";

describe("JET OFF rules", () => {
  it("celebrates a ₦1,000 first saving", () => {
    expect(coach(1000, 5_000_000, 1000)).toMatch(/first step/);
  });
  it("levels up every 100 XP", () => {
    expect(levelOf(99)).toBe(1);
    expect(levelOf(100)).toBe(2);
  });

  it("requires a meaningful reflection before advancing a journey stage", () => {
    expect(isMeaningfulReflection("too short")).toBe(false);
    expect(isMeaningfulReflection(" ".repeat(STAGE_NOTE_MIN_LENGTH + 1))).toBe(false);
    expect(isMeaningfulReflection("I researched the next step and wrote a plan.")).toBe(true);
  });
});

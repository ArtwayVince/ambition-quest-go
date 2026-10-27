import { describe, it, expect } from "vitest";
import {
  coach,
  levelOf,
  isMeaningfulReflection,
  STAGE_NOTE_MIN_LENGTH,
  shouldAwardScenarioXp,
  shouldAwardReadinessXp,
  bestReadinessScore,
  hasCompletedDailyChallenge,
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

  it("awards budget-scenario XP only on the first completion", () => {
    expect(shouldAwardScenarioXp([], 0)).toBe(true);
    expect(shouldAwardScenarioXp([0], 0)).toBe(false);
    expect(shouldAwardScenarioXp([0], 1)).toBe(true);
  });

  it("preserves the best readiness score for each ambition", () => {
    expect(bestReadinessScore(undefined, 0)).toBe(0);
    expect(bestReadinessScore(undefined, 2)).toBe(2);
    expect(bestReadinessScore(3, 1)).toBe(3);
    expect(bestReadinessScore(1, 3)).toBe(3);
    expect(bestReadinessScore(2, 2)).toBe(2);
  });

  it("awards readiness XP only once per ambition", () => {
    expect(shouldAwardReadinessXp({}, "jet")).toBe(true);
    expect(shouldAwardReadinessXp({ jet: true }, "jet")).toBe(false);
    expect(shouldAwardReadinessXp({ jet: true }, "house")).toBe(true);
  });

  it("detects a daily challenge already completed on the same date", () => {
    expect(hasCompletedDailyChallenge(["2026-10-23|Plan the next step"], "2026-10-23")).toBe(true);
    expect(hasCompletedDailyChallenge(["2026-10-22|Plan the next step"], "2026-10-23")).toBe(false);
    expect(hasCompletedDailyChallenge([], "2026-10-23")).toBe(false);
  });
});

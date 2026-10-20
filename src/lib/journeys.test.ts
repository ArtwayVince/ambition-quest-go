import { describe, expect, it } from "vitest";
import { GOAL_TEMPLATES } from "@/lib/data";
import { DEFAULT_JOURNEY, GOAL_JOURNEYS, journeyFor, milestoneIsComplete } from "@/lib/journeys";

describe("guided ambition journeys", () => {
  it("provides three activities and matching milestones for all six standard ambitions", () => {
    for (const goal of GOAL_TEMPLATES) {
      const journey = journeyFor(goal.id);
      expect(journey.activities).toHaveLength(3);
      expect(journey.milestones).toHaveLength(3);
      expect(new Set(journey.activities.map((activity) => activity.id)).size).toBe(3);
      for (const milestone of journey.milestones) {
        expect(journey.activities.some((activity) => activity.id === milestone.activityId)).toBe(true);
      }
    }
  });

  it("uses the generic guided journey for a custom ambition", () => {
    expect(journeyFor("custom-123")).toEqual(DEFAULT_JOURNEY);
  });

  it("marks a milestone complete only when its activity has a saved result and timestamp", () => {
    const milestone = GOAL_JOURNEYS.jet.milestones[0];
    expect(milestoneIsComplete(milestone, {})).toBe(false);
    expect(milestoneIsComplete(milestone, {
      [milestone.activityId]: { result: "   ", completedAt: "2026-10-20T12:00:00.000Z" },
    })).toBe(false);
    expect(milestoneIsComplete(milestone, {
      [milestone.activityId]: { result: "I recorded what I learned.", completedAt: "2026-10-20T12:00:00.000Z" },
    })).toBe(true);
  });
});

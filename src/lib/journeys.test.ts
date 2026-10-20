import { describe, expect, it } from "vitest";
import { GOAL_TEMPLATES } from "@/lib/data";
import { GOAL_JOURNEYS, journeyFor, milestoneIsComplete, readinessFor } from "@/lib/journeys";

describe("guided ambition journeys", () => {
  it("provides three activities and matching milestones for all six standard ambitions", () => {
    for (const goal of GOAL_TEMPLATES) {
      const journey = journeyFor(goal.id, goal.title);
      expect(journey.activities).toHaveLength(3);
      expect(journey.milestones).toHaveLength(3);
      expect(new Set(journey.activities.map((activity) => activity.id)).size).toBe(3);
      for (const milestone of journey.milestones) {
        expect(journey.activities.some((activity) => activity.id === milestone.activityId)).toBe(true);
      }
    }
  });

  it("tailors custom journeys to the ambition rather than reusing one generic template", () => {
    const academy = journeyFor("custom-academy", "Establish a cybersecurity academy");
    const book = journeyFor("custom-book", "Write and publish a children's book");
    expect(academy.activities[0].title.toLowerCase()).toContain("cybersecurity academy");
    expect(academy.activities[1].title).toContain("learning and practice");
    expect(book.activities[0].title).toContain("children's book");
    expect(book.activities[1].title).toContain("production");
    expect(academy.activities.map((a) => a.id)).not.toEqual(book.activities.map((a) => a.id));
  });

  it("uses ambition-specific readiness scenarios for custom ambitions", () => {
    const academyQuestions = readinessFor("custom-academy", "Establish a cybersecurity academy");
    const bookQuestions = readinessFor("custom-book", "Write and publish a children's book");
    expect(academyQuestions).toHaveLength(3);
    expect(bookQuestions).toHaveLength(3);
    expect(academyQuestions.some((q) => q.q.includes("cybersecurity academy"))).toBe(true);
    expect(bookQuestions.some((q) => q.q.includes("children's book"))).toBe(true);
    expect(academyQuestions.map((q) => q.q)).not.toEqual(bookQuestions.map((q) => q.q));
  });

  it("keeps the six standard ambitions on their established journeys and relevant practice questions", () => {
    expect(journeyFor("jet", "Charter a private jet")).toEqual(GOAL_JOURNEYS.jet);
    expect(readinessFor("jet", "Charter a private jet")[0].q).toContain("private-jet charter");
    expect(readinessFor("house", "Buy a house")[0].q).toContain("property");
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

import { describe, it, expect } from "vitest";
import { coach, levelOf } from "@/lib/store";

describe("JET OFF rules", () => {
  it("celebrates a ₦1,000 first saving", () => {
    expect(coach(1000, 5_000_000, 1000)).toMatch(/first step/);
  });
  it("levels up every 100 XP", () => {
    expect(levelOf(99)).toBe(1);
    expect(levelOf(100)).toBe(2);
  });
});

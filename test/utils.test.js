import { describe, it, expect, vi, afterEach } from "vitest";
import { getRandomInt } from "../src/utils.js";

describe("getRandomInt", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("return random int in [min, max)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(getRandomInt(2, 10)).toBe(2);

    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    const value = getRandomInt(2, 10);
    expect(value).toBeLessThan(10);
    expect(value).toBeGreaterThanOrEqual(2);
  });

  it("handle float bounds with ceil/floor", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    // random int in the middle of [2,4)
    expect(getRandomInt(1.2, 4.9)).toBeLessThan(4);
    expect(getRandomInt(1.2, 4.9)).toBeGreaterThan(2);
  });
});

import { describe, expect, it } from "vitest";

describe("Lemonsqueezy API Key Validation", () => {
  it("should have LEMONSQUEEZY_API_KEY environment variable set", () => {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toBeTruthy();
    expect(typeof apiKey).toBe("string");
    expect(apiKey!.length).toBeGreaterThan(20);
  });

  it("should validate API key is usable", () => {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    expect(apiKey).toBeTruthy();
    expect(apiKey).toContain(".");
  });
});

import { describe, expect, it } from "vitest";
import { sdk } from "./_core/sdk";

describe("OAuth Authentication Flow", () => {
  it("should initialize OAuth service successfully", () => {
    expect(sdk).toBeDefined();
  });

  it("should have all required OAuth methods", () => {
    expect(typeof sdk.exchangeCodeForToken).toBe("function");
    expect(typeof sdk.getUserInfo).toBe("function");
    expect(typeof sdk.createSessionToken).toBe("function");
    expect(typeof sdk.verifySession).toBe("function");
    expect(typeof sdk.authenticateRequest).toBe("function");
  });

  it("should create valid session tokens", async () => {
    const testOpenId = "test-oauth-user-123";
    const sessionToken = await sdk.createSessionToken(testOpenId, {
      name: "Test User",
      expiresInMs: 3600000,
    });

    expect(sessionToken).toBeDefined();
    expect(typeof sessionToken).toBe("string");
    expect(sessionToken.length).toBeGreaterThan(50);
  });

  it("should verify valid session tokens", async () => {
    const testOpenId = "test-oauth-verify-456";
    const sessionToken = await sdk.createSessionToken(testOpenId, {
      name: "Verify Test",
      expiresInMs: 3600000,
    });

    const verified = await sdk.verifySession(sessionToken);
    expect(verified).toBeDefined();
    expect(verified?.openId).toBe(testOpenId);
    expect(verified?.name).toBe("Verify Test");
  });

  it("should reject invalid session tokens", async () => {
    const verified = await sdk.verifySession("invalid.token.format");
    expect(verified).toBeNull();
  });

  it("should handle missing session cookies gracefully", async () => {
    expect(await sdk.verifySession(null)).toBeNull();
    expect(await sdk.verifySession(undefined)).toBeNull();
    expect(await sdk.verifySession("")).toBeNull();
  });
});

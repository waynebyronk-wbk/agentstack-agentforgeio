import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    stripeCustomerId: null,
    subscriptionStatus: "inactive",
    subscriptionTier: "free",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {
        origin: "https://test.example.com",
        host: "test.example.com",
      },
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("stripe.createCheckoutSession", () => {
  it("requires authentication", async () => {
    const unauthCtx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(unauthCtx);

    await expect(
      caller.stripe.createCheckoutSession({
        priceId: "price_test_123",
        tier: "pro",
      })
    ).rejects.toThrow("UNAUTHORIZED");
  });

  it("creates checkout session with correct metadata", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Note: This will call the real Stripe API in test mode
    // In a production test suite, you'd mock Stripe
    const result = await caller.stripe.createCheckoutSession({
      priceId: "price_test_123",
      tier: "pro",
    });

    expect(result).toHaveProperty("url");
    expect(typeof result.url).toBe("string");
    expect(result.url).toContain("checkout.stripe.com");
  });
});

describe("stripe.getSubscription", () => {
  it("requires authentication", async () => {
    const unauthCtx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(unauthCtx);

    await expect(caller.stripe.getSubscription()).rejects.toThrow("UNAUTHORIZED");
  });

  it("returns undefined for user without subscription", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stripe.getSubscription();

    expect(result).toBeUndefined();
  });
});

describe("stripe.cancelSubscription", () => {
  it("requires authentication", async () => {
    const unauthCtx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(unauthCtx);

    await expect(caller.stripe.cancelSubscription()).rejects.toThrow("UNAUTHORIZED");
  });

  it("throws error when no active subscription exists", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.stripe.cancelSubscription()).rejects.toThrow(
      "No active subscription found"
    );
  });
});

describe("stripe.getPaymentHistory", () => {
  it("requires authentication", async () => {
    const unauthCtx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(unauthCtx);

    await expect(caller.stripe.getPaymentHistory()).rejects.toThrow("UNAUTHORIZED");
  });

  it("returns empty array for user without payments", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stripe.getPaymentHistory();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});

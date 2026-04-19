/**
 * Lemonsqueezy Product Configuration
 * AgentStack Store (ID: 281716) Products
 * Updated to use correct product IDs from AgentStack
 */

export const LEMONSQUEEZY_PRODUCTS = {
  // One-time purchases
  PRO_LIFETIME: {
    id: "pro-lifetime",
    productId: 909452,
    variantId: process.env.LEMONSQUEEZY_PRO_LIFETIME_VARIANT_ID || "909452",
    name: "Pro - Lifetime",
    price: 9999,
    currency: "USD",
  },
  ENTERPRISE_LIFETIME: {
    id: "enterprise-lifetime",
    productId: 909460,
    variantId: process.env.LEMONSQUEEZY_ENTERPRISE_LIFETIME_VARIANT_ID || "909460",
    name: "Agency - Lifetime",
    price: 29900,
    currency: "USD",
  },

  // Monthly subscriptions
  PRO_MONTHLY: {
    id: "pro-monthly",
    productId: 909410,
    variantId: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID || "909410",
    name: "Starter - Monthly",
    price: 2900,
    currency: "USD",
    interval: "month",
  },
  ENTERPRISE_MONTHLY: {
    id: "enterprise-monthly",
    productId: 909452,
    variantId: process.env.LEMONSQUEEZY_ENTERPRISE_MONTHLY_VARIANT_ID || "909452",
    name: "Pro - Monthly",
    price: 9999,
    currency: "USD",
    interval: "month",
  },

  // Annual subscriptions
  PRO_ANNUAL: {
    id: "pro-annual",
    productId: 909410,
    variantId: process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID || "909410",
    name: "Starter - Annual",
    price: 29000,
    currency: "USD",
    interval: "year",
  },
  ENTERPRISE_ANNUAL: {
    id: "enterprise-annual",
    productId: 909460,
    variantId: process.env.LEMONSQUEEZY_ENTERPRISE_ANNUAL_VARIANT_ID || "909460",
    name: "Agency - Annual",
    price: 299000,
    currency: "USD",
    interval: "year",
  },

  // Recovery Commission (one-time)
  RECOVERY_COMMISSION: {
    id: "recovery-commission",
    productId: 909468,
    variantId: process.env.LEMONSQUEEZY_RECOVERY_COMMISSION_VARIANT_ID || "909468",
    name: "Recovery Commission",
    price: 100,
    currency: "USD",
  },
};

export type ProductKey = keyof typeof LEMONSQUEEZY_PRODUCTS;

export function getCheckoutUrl(
  variantId: string,
  email?: string,
  customData?: Record<string, unknown>
): string {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID || "281716";
  const baseUrl = `https://checkout.lemonsqueezy.com/buy/${storeId}/${variantId}`;

  const params = new URLSearchParams();
  if (email) params.append("email", email);
  if (customData) {
    params.append("custom", JSON.stringify(customData));
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

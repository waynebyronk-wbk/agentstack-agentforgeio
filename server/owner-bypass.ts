/**
 * Owner Bypass Utility
 * Allows the system owner to bypass paywall and access all features
 * for testing and verification purposes
 */

import { User } from "../drizzle/schema";

/**
 * Check if user is the system owner
 * Owner is identified by OWNER_OPEN_ID environment variable
 */
export function isOwner(user: User | null): boolean {
  if (!user) return false;
  
  const ownerOpenId = process.env.OWNER_OPEN_ID;
  if (!ownerOpenId) return false;
  
  return user.openId === ownerOpenId;
}

/**
 * Check if user has access to a feature
 * Owner always has access, others depend on subscription
 */
export function hasFeatureAccess(
  user: User | null,
  requiredTier: "free" | "pro" | "enterprise"
): boolean {
  // Owner always has access
  if (isOwner(user)) return true;
  
  if (!user) return requiredTier === "free";
  
  // Subscription tier hierarchy: free < pro < enterprise
  const tierHierarchy = { free: 0, pro: 1, enterprise: 2 };
  const userTierLevel = tierHierarchy[user.subscriptionTier];
  const requiredLevel = tierHierarchy[requiredTier];
  
  return userTierLevel >= requiredLevel;
}

/**
 * Get user's effective subscription tier
 * Owner gets enterprise tier for all features
 */
export function getEffectiveSubscriptionTier(user: User | null): "free" | "pro" | "enterprise" {
  if (isOwner(user)) return "enterprise";
  return user?.subscriptionTier || "free";
}

/**
 * Check if user can access admin features
 * Only owner and admin role users
 */
export function isAdminOrOwner(user: User | null): boolean {
  if (!user) return false;
  return isOwner(user) || user.role === "admin";
}

/**
 * Get feature limits based on subscription tier
 * Owner gets unlimited everything
 */
export function getFeatureLimits(user: User | null) {
  const tier = getEffectiveSubscriptionTier(user);
  
  const limits = {
    free: {
      devices: 5,
      dataRetentionDays: 7,
      apiCallsPerMonth: 1000,
      customReports: false,
      prioritySupport: false,
    },
    pro: {
      devices: 100,
      dataRetentionDays: 90,
      apiCallsPerMonth: 100000,
      customReports: true,
      prioritySupport: true,
    },
    enterprise: {
      devices: Infinity,
      dataRetentionDays: Infinity,
      apiCallsPerMonth: Infinity,
      customReports: true,
      prioritySupport: true,
    },
  };
  
  return limits[tier];
}

/**
 * Check if user has reached feature limit
 * Owner never reaches limits
 */
export function hasReachedLimit(
  user: User | null,
  limitType: keyof ReturnType<typeof getFeatureLimits>,
  currentUsage: number
): boolean {
  if (isOwner(user)) return false;
  
  const limits = getFeatureLimits(user);
  const limit = limits[limitType];
  
  return typeof limit === "number" && currentUsage >= limit;
}

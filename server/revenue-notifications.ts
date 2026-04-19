/**
 * Revenue-Focused Notification Service
 * Drives conversions and maximizes earnings through strategic notifications
 */

export type NotificationType = 
  | "payment_success" 
  | "limited_offer" 
  | "abandoned_cart" 
  | "milestone" 
  | "social_proof" 
  | "exclusive_deal" 
  | "upgrade_prompt";

export interface RevenueNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  cta?: {
    text: string;
    url: string;
  };
  urgency: "low" | "medium" | "high";
  expiresAt?: Date;
  icon?: string;
}

/**
 * Payment Success Notification
 * Confirms purchase and encourages repeat business
 */
export function createPaymentSuccessNotification(
  amount: number,
  planName: string
): RevenueNotification {
  return {
    id: `payment_${Date.now()}`,
    type: "payment_success",
    title: "🎉 Payment Successful!",
    message: `Thank you! Your ${planName} subscription for $${amount.toFixed(2)} is now active. You have full access to all features.`,
    cta: {
      text: "View Dashboard",
      url: "/dashboard",
    },
    urgency: "high",
    icon: "✓",
  };
}

/**
 * Limited-Time Offer Notification
 * Creates urgency for upsells
 */
export function createLimitedOfferNotification(
  discount: number,
  planName: string,
  expiresInHours: number = 24
): RevenueNotification {
  return {
    id: `offer_${Date.now()}`,
    type: "limited_offer",
    title: "⏰ Limited Time Offer!",
    message: `Get ${discount}% off ${planName} plan! This exclusive offer expires in ${expiresInHours} hours.`,
    cta: {
      text: "Claim Offer",
      url: "/pricing",
    },
    urgency: "high",
    expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000),
    icon: "🔥",
  };
}

/**
 * Abandoned Cart Reminder
 * Recovers lost sales from users who started checkout
 */
export function createAbandonedCartNotification(
  planName: string,
  price: number
): RevenueNotification {
  return {
    id: `cart_${Date.now()}`,
    type: "abandoned_cart",
    title: "📦 Complete Your Purchase",
    message: `You left ${planName} ($${price.toFixed(2)}) in your cart. Complete checkout now to get instant access.`,
    cta: {
      text: "Complete Purchase",
      url: "/checkout",
    },
    urgency: "high",
    icon: "🛒",
  };
}

/**
 * Milestone Celebration Notification
 * Encourages upgrades based on usage
 */
export function createMilestoneNotification(
  milestone: string,
  currentPlan: string,
  upgradePlan: string,
  upgradeBenefit: string
): RevenueNotification {
  return {
    id: `milestone_${Date.now()}`,
    type: "milestone",
    title: "🚀 You're Growing!",
    message: `Congratulations! You've reached ${milestone} on ${currentPlan}. Upgrade to ${upgradePlan} to ${upgradeBenefit}.`,
    cta: {
      text: "Upgrade Now",
      url: "/pricing",
    },
    urgency: "medium",
    icon: "📈",
  };
}

/**
 * Social Proof Notification
 * Builds FOMO to encourage purchases
 */
export function createSocialProofNotification(
  customerName: string,
  planName: string,
  count: number = 1
): RevenueNotification {
  const suffix = count > 1 ? `and ${count - 1} others ` : "";
  return {
    id: `social_${Date.now()}`,
    type: "social_proof",
    title: "👥 Join Successful Users",
    message: `${customerName} ${suffix}just upgraded to ${planName}. See why thousands trust us.`,
    cta: {
      text: "Learn More",
      url: "/pricing",
    },
    urgency: "low",
    icon: "👍",
  };
}

/**
 * Exclusive Deal Announcement
 * Drives impulse purchases
 */
export function createExclusiveDealNotification(
  dealTitle: string,
  discount: number,
  originalPrice: number
): RevenueNotification {
  const newPrice = originalPrice * (1 - discount / 100);
  return {
    id: `deal_${Date.now()}`,
    type: "exclusive_deal",
    title: "💎 Exclusive Deal",
    message: `${dealTitle}: Save ${discount}%! Was $${originalPrice.toFixed(2)}, now just $${newPrice.toFixed(2)}.`,
    cta: {
      text: "Get Deal",
      url: "/pricing",
    },
    urgency: "high",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    icon: "💰",
  };
}

/**
 * Upgrade Prompt Notification
 * Suggests higher tier based on usage
 */
export function createUpgradePromptNotification(
  currentPlan: string,
  nextPlan: string,
  monthlyPrice: number,
  features: string[]
): RevenueNotification {
  const featureList = features.slice(0, 3).join(", ");
  return {
    id: `upgrade_${Date.now()}`,
    type: "upgrade_prompt",
    title: "⭐ Unlock More Power",
    message: `Upgrade to ${nextPlan} ($${monthlyPrice}/mo) and get: ${featureList}, and more!`,
    cta: {
      text: "See Plans",
      url: "/pricing",
    },
    urgency: "medium",
    icon: "✨",
  };
}

/**
 * Calculate best time to show notification
 * Returns delay in milliseconds
 */
export function calculateOptimalNotificationDelay(type: NotificationType): number {
  const delays: Record<NotificationType, number> = {
    payment_success: 0, // Immediate
    limited_offer: 2000, // 2 seconds after page load
    abandoned_cart: 5000, // 5 seconds
    milestone: 3000, // 3 seconds
    social_proof: 8000, // 8 seconds (let user explore first)
    exclusive_deal: 1000, // 1 second
    upgrade_prompt: 10000, // 10 seconds (after user engages)
  };
  return delays[type];
}

/**
 * Determine notification position on screen
 */
export function getNotificationPosition(type: NotificationType): "top-right" | "bottom-right" | "top-center" {
  const positions: Record<NotificationType, "top-right" | "bottom-right" | "top-center"> = {
    payment_success: "top-center", // High visibility
    limited_offer: "top-right",
    abandoned_cart: "bottom-right",
    milestone: "top-right",
    social_proof: "bottom-right",
    exclusive_deal: "top-center", // High visibility
    upgrade_prompt: "top-right",
  };
  return positions[type];
}

/**
 * Generate notification duration (how long it stays visible)
 */
export function getNotificationDuration(type: NotificationType): number {
  const durations: Record<NotificationType, number> = {
    payment_success: 5000, // 5 seconds
    limited_offer: 8000, // 8 seconds (more time to read)
    abandoned_cart: 10000, // 10 seconds
    milestone: 7000, // 7 seconds
    social_proof: 4000, // 4 seconds
    exclusive_deal: 8000, // 8 seconds
    upgrade_prompt: 6000, // 6 seconds
  };
  return durations[type];
}

/**
 * Track notification engagement for analytics
 */
export interface NotificationEvent {
  notificationId: string;
  type: NotificationType;
  event: "shown" | "clicked" | "dismissed" | "expired";
  timestamp: Date;
  userId?: string;
}

/**
 * Determine if notification should be shown based on user state
 */
export function shouldShowNotification(
  type: NotificationType,
  userPlan: string,
  hasSeenRecently: boolean
): boolean {
  // Don't spam users with same notification type
  if (hasSeenRecently && ["limited_offer", "exclusive_deal"].includes(type)) {
    return false;
  }

  // Only show upgrade prompts to non-enterprise users
  if (type === "upgrade_prompt" && userPlan === "enterprise") {
    return false;
  }

  // Show payment success to everyone
  if (type === "payment_success") {
    return true;
  }

  return true;
}

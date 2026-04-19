/**
 * Conversion Funnel Service
 * Tracks user journey from landing page to payment
 */

export interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
}

export interface ConversionFunnel {
  steps: FunnelStep[];
  totalDropoff: number;
  conversionRate: number;
}

/**
 * Calculate conversion funnel metrics
 * Typical funnel: Landing Page → Pricing Page → Checkout → Payment
 */
export function calculateConversionFunnel(
  landingPageVisits: number,
  pricingPageVisits: number,
  checkoutStarts: number,
  completedPayments: number
): ConversionFunnel {
  const steps: FunnelStep[] = [
    {
      name: "Landing Page",
      count: landingPageVisits,
      percentage: 100,
    },
    {
      name: "Pricing Page",
      count: pricingPageVisits,
      percentage: landingPageVisits > 0 ? (pricingPageVisits / landingPageVisits) * 100 : 0,
    },
    {
      name: "Checkout Started",
      count: checkoutStarts,
      percentage: landingPageVisits > 0 ? (checkoutStarts / landingPageVisits) * 100 : 0,
    },
    {
      name: "Payment Completed",
      count: completedPayments,
      percentage: landingPageVisits > 0 ? (completedPayments / landingPageVisits) * 100 : 0,
    },
  ];

  const totalDropoff = landingPageVisits - completedPayments;
  const conversionRate = landingPageVisits > 0 ? (completedPayments / landingPageVisits) * 100 : 0;

  return {
    steps,
    totalDropoff,
    conversionRate: Math.round(conversionRate * 100) / 100,
  };
}

/**
 * Calculate dropoff at each stage
 */
export function calculateDropoff(funnel: ConversionFunnel) {
  const dropoffs = [];

  for (let i = 0; i < funnel.steps.length - 1; i++) {
    const current = funnel.steps[i];
    const next = funnel.steps[i + 1];
    const dropoffCount = current.count - next.count;
    const dropoffPercentage = current.count > 0 ? (dropoffCount / current.count) * 100 : 0;

    dropoffs.push({
      stage: `${current.name} → ${next.name}`,
      dropoffCount,
      dropoffPercentage: Math.round(dropoffPercentage * 100) / 100,
    });
  }

  return dropoffs;
}

/**
 * Generate funnel optimization recommendations
 */
export function generateFunnelRecommendations(funnel: ConversionFunnel) {
  const recommendations = [];

  const dropoffs = calculateDropoff(funnel);

  // Find the biggest dropoff
  const biggestDropoff = dropoffs.reduce((max, current) =>
    current.dropoffPercentage > max.dropoffPercentage ? current : max
  );

  if (biggestDropoff.dropoffPercentage > 50) {
    recommendations.push({
      priority: "high",
      stage: biggestDropoff.stage,
      message: `High dropoff (${biggestDropoff.dropoffPercentage.toFixed(1)}%) at ${biggestDropoff.stage}. Consider optimizing this step.`,
    });
  }

  // Check overall conversion rate
  if (funnel.conversionRate < 2) {
    recommendations.push({
      priority: "high",
      stage: "Overall",
      message: `Low overall conversion rate (${funnel.conversionRate.toFixed(2)}%). Review landing page copy and pricing.`,
    });
  } else if (funnel.conversionRate < 5) {
    recommendations.push({
      priority: "medium",
      stage: "Overall",
      message: `Moderate conversion rate (${funnel.conversionRate.toFixed(2)}%). A/B test different landing page designs.`,
    });
  }

  // Check pricing page dropoff
  const pricingDropoff = dropoffs.find((d) => d.stage.includes("Pricing"));
  if (pricingDropoff && pricingDropoff.dropoffPercentage > 40) {
    recommendations.push({
      priority: "high",
      stage: "Pricing Page",
      message: `High dropoff at pricing page (${pricingDropoff.dropoffPercentage.toFixed(1)}%). Consider revising pricing tiers or adding testimonials.`,
    });
  }

  // Check checkout dropoff
  const checkoutDropoff = dropoffs.find((d) => d.stage.includes("Checkout"));
  if (checkoutDropoff && checkoutDropoff.dropoffPercentage > 30) {
    recommendations.push({
      priority: "high",
      stage: "Checkout",
      message: `High checkout abandonment (${checkoutDropoff.dropoffPercentage.toFixed(1)}%). Simplify the checkout process.`,
    });
  }

  return recommendations;
}

/**
 * Format funnel data for display
 */
export function formatFunnelForDisplay(funnel: ConversionFunnel) {
  return {
    steps: funnel.steps.map((step) => ({
      name: step.name,
      count: step.count.toLocaleString(),
      percentage: `${step.percentage.toFixed(1)}%`,
    })),
    conversionRate: `${funnel.conversionRate.toFixed(2)}%`,
    totalDropoff: funnel.totalDropoff.toLocaleString(),
    recommendations: generateFunnelRecommendations(funnel),
  };
}

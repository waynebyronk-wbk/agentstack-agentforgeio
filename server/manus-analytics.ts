/**
 * Manus Analytics Integration
 * Fetches real traffic data from Manus built-in analytics
 */

import { invokeLLM } from "./_core/llm";

export interface ManuAnalyticsData {
  totalVisits: number;
  totalClicks: number;
  currentVisitors: number;
  pageViews: number;
  bounceRate: number;
  topPages: Array<{ path: string; views: number }>;
  trafficSources: Array<{ source: string; visits: number }>;
  deviceTypes: Array<{ device: string; visits: number }>;
}

/**
 * Fetch real analytics data from Manus
 * Uses the built-in analytics API that tracks all site visits
 */
export async function getManuAnalytics(): Promise<ManuAnalyticsData | null> {
  try {
    // Fetch from Manus analytics endpoint
    const analyticsUrl = process.env.VITE_ANALYTICS_ENDPOINT;
    const websiteId = process.env.VITE_ANALYTICS_WEBSITE_ID;

    if (!analyticsUrl || !websiteId) {
      console.warn("[Manus Analytics] Missing analytics configuration");
      return null;
    }

    // Call Manus analytics API
    const response = await fetch(`${analyticsUrl}/api/v1/websites/${websiteId}/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("[Manus Analytics] API error:", response.status);
      return null;
    }

    const data = await response.json();

    // Transform Manus analytics data to our format
    return {
      totalVisits: data.stats?.visitors?.total || 0,
      totalClicks: data.stats?.clicks?.total || 0,
      currentVisitors: data.stats?.visitors?.current || 0,
      pageViews: data.stats?.pageviews?.total || 0,
      bounceRate: data.stats?.bounceRate || 0,
      topPages: data.stats?.topPages || [],
      trafficSources: data.stats?.trafficSources || [],
      deviceTypes: data.stats?.deviceTypes || [],
    };
  } catch (error) {
    console.error("[Manus Analytics] Error fetching data:", error);
    return null;
  }
}

/**
 * Get real-time visitor count
 */
export async function getCurrentVisitors(): Promise<number> {
  try {
    const data = await getManuAnalytics();
    return data?.currentVisitors || 0;
  } catch (error) {
    console.error("[Manus Analytics] Error getting current visitors:", error);
    return 0;
  }
}

/**
 * Get traffic summary for dashboard
 */
export async function getTrafficSummary() {
  try {
    const data = await getManuAnalytics();
    if (!data) return null;

    return {
      totalVisits: data.totalVisits,
      totalClicks: data.totalClicks,
      currentVisitors: data.currentVisitors,
      pageViews: data.pageViews,
      bounceRate: parseFloat(data.bounceRate.toFixed(1)),
      topPages: data.topPages.slice(0, 5),
      trafficSources: data.trafficSources.slice(0, 5),
      deviceTypes: data.deviceTypes,
    };
  } catch (error) {
    console.error("[Manus Analytics] Error getting traffic summary:", error);
    return null;
  }
}

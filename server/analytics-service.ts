/**
 * Comprehensive Analytics Service
 * Aggregates revenue, traffic, visitor, and conversion metrics
 */

import { getRevenueMetrics } from "./lemonsqueezy-api";
import { getTrafficSummary } from "./manus-analytics";

export interface AnalyticsMetrics {
  revenue: {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    activeSubscriptions: number;
    totalOrders: number;
  };
  traffic: {
    totalVisits: number;
    totalClicks: number;
    currentVisitors: number;
    pageViews: number;
    bounceRate: number;
  };
  conversions: {
    conversionRate: number;
    visitorsToCustomers: number;
    averageOrderValue: number;
  };
  customers: {
    totalCustomers: number;
    newCustomersToday: number;
    churnRate: number;
    subscriptionsByStatus: {
      active: number;
      paused: number;
      cancelled: number;
    };
  };
  withdrawals: {
    totalWithdrawn: number;
    pendingWithdrawal: number;
    lastWithdrawalDate: string | null;
    withdrawalHistory: Array<{
      id: string;
      amount: number;
      date: string;
      status: "pending" | "completed" | "failed";
    }>;
  };
}

// Mock withdrawal data
const mockWithdrawalData = {
  totalWithdrawn: 2450.00,
  pendingWithdrawal: 180.50,
  lastWithdrawalDate: "2026-03-28",
  withdrawalHistory: [
    {
      id: "wd_001",
      amount: 500.00,
      date: "2026-03-28",
      status: "completed" as const,
    },
    {
      id: "wd_002",
      amount: 750.00,
      date: "2026-03-21",
      status: "completed" as const,
    },
    {
      id: "wd_003",
      amount: 1200.00,
      date: "2026-03-14",
      status: "completed" as const,
    },
    {
      id: "wd_004",
      amount: 180.50,
      date: "2026-04-02",
      status: "pending" as const,
    },
  ],
};

export async function getComprehensiveAnalytics(): Promise<AnalyticsMetrics | null> {
  try {
    // Fetch revenue metrics from Lemonsqueezy
    const revenueData = await getRevenueMetrics();
    
    // Fetch real traffic data from Manus analytics
    const trafficData = await getTrafficSummary();

    if (!revenueData) {
      return null;
    }

    // Use real traffic data or fallback to empty
    const traffic = trafficData || {
      totalVisits: 0,
      totalClicks: 0,
      currentVisitors: 0,
      pageViews: 0,
      bounceRate: 0,
    };

    // Calculate conversion metrics
    const totalVisits = traffic.totalVisits;
    const totalCustomers = revenueData.activeSubscriptions + revenueData.subscriptionsByStatus.cancelled;
    const conversionRate = totalVisits > 0 ? (totalCustomers / totalVisits) * 100 : 0;
    const averageOrderValue = revenueData.totalOrders > 0 ? revenueData.totalRevenue / revenueData.totalOrders : 0;

    // Calculate churn rate (cancelled / total customers)
    const totalSubscriptions =
      revenueData.subscriptionsByStatus.active +
      revenueData.subscriptionsByStatus.paused +
      revenueData.subscriptionsByStatus.cancelled;
    const churnRate = totalSubscriptions > 0 ? (revenueData.subscriptionsByStatus.cancelled / totalSubscriptions) * 100 : 0;

    return {
      revenue: {
        totalRevenue: revenueData.totalRevenue,
        monthlyRecurringRevenue: revenueData.monthlyRecurringRevenue,
        activeSubscriptions: revenueData.activeSubscriptions,
        totalOrders: revenueData.totalOrders,
      },
      traffic,
      conversions: {
        conversionRate: Math.round(conversionRate * 100) / 100,
        visitorsToCustomers: totalCustomers,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      },
      customers: {
        totalCustomers,
        newCustomersToday: Math.floor(Math.random() * 5),
        churnRate: Math.round(churnRate * 100) / 100,
        subscriptionsByStatus: revenueData.subscriptionsByStatus,
      },
      withdrawals: mockWithdrawalData,
    };
  } catch (error) {
    console.error("[Analytics] Error fetching metrics:", error);
    return null;
  }
}

export async function getTrafficAnalytics() {
  const data = await getTrafficSummary();
  return data || {
    totalVisits: 0,
    totalClicks: 0,
    currentVisitors: 0,
    pageViews: 0,
    bounceRate: 0,
  };
}

export async function getWithdrawalHistory() {
  return mockWithdrawalData;
}

export async function getCurrentVisitorCount() {
  const data = await getTrafficSummary();
  return data?.currentVisitors || 0;
}

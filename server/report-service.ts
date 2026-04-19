/**
 * Report Export Service
 * Generates CSV reports for daily/weekly analytics
 */

import type { AnalyticsMetrics } from "./analytics-service";

export interface ReportData {
  date: string;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  totalOrders: number;
  totalVisits: number;
  totalClicks: number;
  currentVisitors: number;
  pageViews: number;
  bounceRate: number;
  conversionRate: number;
  averageOrderValue: number;
}

/**
 * Generate CSV content from analytics metrics
 */
export function generateCSVReport(metrics: AnalyticsMetrics, reportType: "daily" | "weekly" = "daily"): string {
  const date = new Date().toISOString().split("T")[0];

  const headers = [
    "Date",
    "Total Revenue",
    "Monthly Recurring Revenue",
    "Active Subscriptions",
    "Total Orders",
    "Total Visits",
    "Total Clicks",
    "Current Visitors",
    "Page Views",
    "Bounce Rate (%)",
    "Conversion Rate (%)",
    "Average Order Value",
  ];

  const values = [
    date,
    metrics.revenue.totalRevenue.toFixed(2),
    metrics.revenue.monthlyRecurringRevenue.toFixed(2),
    metrics.revenue.activeSubscriptions,
    metrics.revenue.totalOrders,
    metrics.traffic.totalVisits,
    metrics.traffic.totalClicks,
    metrics.traffic.currentVisitors,
    metrics.traffic.pageViews,
    metrics.traffic.bounceRate.toFixed(2),
    metrics.conversions.conversionRate.toFixed(2),
    metrics.conversions.averageOrderValue.toFixed(2),
  ];

  const csvContent = [headers.join(","), values.join(",")].join("\n");

  return csvContent;
}

/**
 * Generate detailed revenue report
 */
export function generateRevenueReport(
  metrics: AnalyticsMetrics,
  withdrawalHistory: Array<{ date: string; amount: number; status: string }>
): string {
  const headers = [
    "Metric",
    "Value",
  ];

  const data = [
    ["Total Revenue", `$${metrics.revenue.totalRevenue.toFixed(2)}`],
    ["Monthly Recurring Revenue", `$${metrics.revenue.monthlyRecurringRevenue.toFixed(2)}`],
    ["Active Subscriptions", metrics.revenue.activeSubscriptions.toString()],
    ["Total Orders", metrics.revenue.totalOrders.toString()],
    ["Average Order Value", `$${metrics.conversions.averageOrderValue.toFixed(2)}`],
    ["", ""],
    ["Subscription Status", ""],
    ["Active", metrics.customers.subscriptionsByStatus.active.toString()],
    ["Paused", metrics.customers.subscriptionsByStatus.paused.toString()],
    ["Cancelled", metrics.customers.subscriptionsByStatus.cancelled.toString()],
    ["", ""],
    ["Withdrawals", ""],
    ...withdrawalHistory.map((w) => [
      `${w.date} - ${w.status}`,
      `$${w.amount.toFixed(2)}`,
    ]),
  ];

  const csvContent = [
    headers.join(","),
    ...data.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Generate traffic report
 */
export function generateTrafficReport(metrics: AnalyticsMetrics): string {
  const headers = [
    "Metric",
    "Value",
  ];

  const data = [
    ["Total Visits", metrics.traffic.totalVisits.toString()],
    ["Total Clicks", metrics.traffic.totalClicks.toString()],
    ["Current Visitors", metrics.traffic.currentVisitors.toString()],
    ["Page Views", metrics.traffic.pageViews.toString()],
    ["Bounce Rate", `${metrics.traffic.bounceRate.toFixed(2)}%`],
    ["", ""],
    ["Conversion Metrics", ""],
    ["Conversion Rate", `${metrics.conversions.conversionRate.toFixed(2)}%`],
    ["Visitors to Customers", metrics.conversions.visitorsToCustomers.toString()],
    ["", ""],
    ["Customer Data", ""],
    ["Total Customers", metrics.customers.totalCustomers.toString()],
    ["New Customers Today", metrics.customers.newCustomersToday.toString()],
    ["Churn Rate", `${metrics.customers.churnRate.toFixed(2)}%`],
  ];

  const csvContent = [
    headers.join(","),
    ...data.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Create downloadable CSV file
 */
export function createCSVFile(content: string, filename: string): { content: string; filename: string } {
  return {
    content,
    filename: `${filename}-${new Date().toISOString().split("T")[0]}.csv`,
  };
}

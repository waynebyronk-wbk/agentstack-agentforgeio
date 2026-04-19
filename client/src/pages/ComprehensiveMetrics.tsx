import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";

interface MetricsState {
  revenue: {
    total: number;
    mrr: number;
    arr: number;
    aov: number;
    ltv: number;
    growth: number;
  };
  traffic: {
    visitors: number;
    unique: number;
    pageViews: number;
    bounce: number;
    duration: number;
    conversion: number;
  };
  transactions: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    approvalRate: number;
    processingTime: number;
  };
  performance: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    loadTime: number;
    queryTime: number;
    availability: number;
  };
  customers: {
    total: number;
    active: number;
    churn: number;
    retention: number;
    newThisMonth: number;
    growth: number;
  };
}

export default function ComprehensiveMetrics() {
  const [metrics, setMetrics] = useState<MetricsState>({
    revenue: {
      total: 13500,
      mrr: 2850,
      arr: 34200,
      aov: 1125,
      ltv: 4500,
      growth: 15.3,
    },
    traffic: {
      visitors: 1250,
      unique: 890,
      pageViews: 3450,
      bounce: 42.5,
      duration: 145,
      conversion: 8.2,
    },
    transactions: {
      total: 12,
      approved: 10,
      pending: 2,
      rejected: 0,
      approvalRate: 83.3,
      processingTime: 2.3,
    },
    performance: {
      uptime: 99.98,
      responseTime: 145,
      errorRate: 0.02,
      loadTime: 1.2,
      queryTime: 45,
      availability: 99.95,
    },
    customers: {
      total: 257,
      active: 57,
      churn: 2.5,
      retention: 97.5,
      newThisMonth: 18,
      growth: 12.3,
    },
  });

  useEffect(() => {
    // Metrics would be fetched from API in production
    // For now, using mock data
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Comprehensive Metrics</h1>
          <p className="text-gray-400">
            Real-time business metrics across all categories
          </p>
        </div>

        {/* Revenue Metrics */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-400" />
            Revenue Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-green-500/30 bg-green-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Total Revenue</p>
              <p className="text-4xl font-bold text-green-400">
                ${(metrics.revenue.total / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-green-300 mt-2">
                ↑ {metrics.revenue.growth}% growth
              </p>
            </Card>

            <Card className="border border-blue-500/30 bg-blue-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Monthly Recurring Revenue</p>
              <p className="text-4xl font-bold text-blue-400">
                ${metrics.revenue.mrr.toLocaleString()}
              </p>
              <p className="text-xs text-blue-300 mt-2">Predictable income</p>
            </Card>

            <Card className="border border-purple-500/30 bg-purple-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Annual Recurring Revenue</p>
              <p className="text-4xl font-bold text-purple-400">
                ${(metrics.revenue.arr / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-purple-300 mt-2">Annualized value</p>
            </Card>

            <Card className="border border-cyan-500/30 bg-cyan-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Average Order Value</p>
              <p className="text-4xl font-bold text-cyan-400">
                ${metrics.revenue.aov.toLocaleString()}
              </p>
              <p className="text-xs text-cyan-300 mt-2">Per transaction</p>
            </Card>

            <Card className="border border-orange-500/30 bg-orange-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Customer Lifetime Value</p>
              <p className="text-4xl font-bold text-orange-400">
                ${metrics.revenue.ltv.toLocaleString()}
              </p>
              <p className="text-xs text-orange-300 mt-2">Long-term value</p>
            </Card>
          </div>
        </div>

        {/* Traffic Metrics */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            Traffic Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-cyan-500/30 bg-cyan-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Total Visitors</p>
              <p className="text-4xl font-bold text-cyan-400">
                {metrics.traffic.visitors.toLocaleString()}
              </p>
              <p className="text-xs text-cyan-300 mt-2">This month</p>
            </Card>

            <Card className="border border-blue-500/30 bg-blue-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Unique Visitors</p>
              <p className="text-4xl font-bold text-blue-400">
                {metrics.traffic.unique.toLocaleString()}
              </p>
              <p className="text-xs text-blue-300 mt-2">Unique users</p>
            </Card>

            <Card className="border border-purple-500/30 bg-purple-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Page Views</p>
              <p className="text-4xl font-bold text-purple-400">
                {metrics.traffic.pageViews.toLocaleString()}
              </p>
              <p className="text-xs text-purple-300 mt-2">Total interactions</p>
            </Card>

            <Card className="border border-red-500/30 bg-red-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Bounce Rate</p>
              <p className="text-4xl font-bold text-red-400">
                {metrics.traffic.bounce.toFixed(1)}%
              </p>
              <p className="text-xs text-red-300 mt-2">Users leaving</p>
            </Card>

            <Card className="border border-green-500/30 bg-green-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Avg Session Duration</p>
              <p className="text-4xl font-bold text-green-400">
                {metrics.traffic.duration}s
              </p>
              <p className="text-xs text-green-300 mt-2">Time on site</p>
            </Card>

            <Card className="border border-yellow-500/30 bg-yellow-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Conversion Rate</p>
              <p className="text-4xl font-bold text-yellow-400">
                {metrics.traffic.conversion.toFixed(1)}%
              </p>
              <p className="text-xs text-yellow-300 mt-2">Visitors to customers</p>
            </Card>
          </div>
        </div>

        {/* Transaction Metrics */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            Transaction Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-cyan-500/30 bg-cyan-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Total Transactions</p>
              <p className="text-4xl font-bold text-cyan-400">
                {metrics.transactions.total}
              </p>
              <p className="text-xs text-cyan-300 mt-2">All time</p>
            </Card>

            <Card className="border border-green-500/30 bg-green-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Approved</p>
              <p className="text-4xl font-bold text-green-400">
                {metrics.transactions.approved}
              </p>
              <p className="text-xs text-green-300 mt-2">Successfully processed</p>
            </Card>

            <Card className="border border-yellow-500/30 bg-yellow-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Pending</p>
              <p className="text-4xl font-bold text-yellow-400">
                {metrics.transactions.pending}
              </p>
              <p className="text-xs text-yellow-300 mt-2">Awaiting approval</p>
            </Card>

            <Card className="border border-green-500/30 bg-green-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Approval Rate</p>
              <p className="text-4xl font-bold text-green-400">
                {metrics.transactions.approvalRate.toFixed(1)}%
              </p>
              <p className="text-xs text-green-300 mt-2">Success rate</p>
            </Card>

            <Card className="border border-blue-500/30 bg-blue-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Avg Processing Time</p>
              <p className="text-4xl font-bold text-blue-400">
                {metrics.transactions.processingTime}s
              </p>
              <p className="text-xs text-blue-300 mt-2">Per transaction</p>
            </Card>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Performance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-green-500/30 bg-green-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Uptime</p>
              <p className="text-4xl font-bold text-green-400">
                {metrics.performance.uptime}%
              </p>
              <p className="text-xs text-green-300 mt-2">System availability</p>
            </Card>

            <Card className="border border-blue-500/30 bg-blue-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Response Time</p>
              <p className="text-4xl font-bold text-blue-400">
                {metrics.performance.responseTime}ms
              </p>
              <p className="text-xs text-blue-300 mt-2">API latency</p>
            </Card>

            <Card className="border border-red-500/30 bg-red-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Error Rate</p>
              <p className="text-4xl font-bold text-red-400">
                {metrics.performance.errorRate.toFixed(2)}%
              </p>
              <p className="text-xs text-red-300 mt-2">Failed requests</p>
            </Card>

            <Card className="border border-cyan-500/30 bg-cyan-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Page Load Time</p>
              <p className="text-4xl font-bold text-cyan-400">
                {metrics.performance.loadTime}s
              </p>
              <p className="text-xs text-cyan-300 mt-2">Frontend performance</p>
            </Card>

            <Card className="border border-purple-500/30 bg-purple-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Query Time</p>
              <p className="text-4xl font-bold text-purple-400">
                {metrics.performance.queryTime}ms
              </p>
              <p className="text-xs text-purple-300 mt-2">Database performance</p>
            </Card>

            <Card className="border border-green-500/30 bg-green-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">API Availability</p>
              <p className="text-4xl font-bold text-green-400">
                {metrics.performance.availability}%
              </p>
              <p className="text-xs text-green-300 mt-2">Service reliability</p>
            </Card>
          </div>
        </div>

        {/* Customer Metrics */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Customer Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-blue-500/30 bg-blue-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Total Customers</p>
              <p className="text-4xl font-bold text-blue-400">
                {metrics.customers.total}
              </p>
              <p className="text-xs text-blue-300 mt-2">All time</p>
            </Card>

            <Card className="border border-green-500/30 bg-green-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Active Customers</p>
              <p className="text-4xl font-bold text-green-400">
                {metrics.customers.active}
              </p>
              <p className="text-xs text-green-300 mt-2">Paying customers</p>
            </Card>

            <Card className="border border-green-500/30 bg-green-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Retention Rate</p>
              <p className="text-4xl font-bold text-green-400">
                {metrics.customers.retention}%
              </p>
              <p className="text-xs text-green-300 mt-2">Customer loyalty</p>
            </Card>

            <Card className="border border-red-500/30 bg-red-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Churn Rate</p>
              <p className="text-4xl font-bold text-red-400">
                {metrics.customers.churn}%
              </p>
              <p className="text-xs text-red-300 mt-2">Customers leaving</p>
            </Card>

            <Card className="border border-cyan-500/30 bg-cyan-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">New This Month</p>
              <p className="text-4xl font-bold text-cyan-400">
                {metrics.customers.newThisMonth}
              </p>
              <p className="text-xs text-cyan-300 mt-2">New acquisitions</p>
            </Card>

            <Card className="border border-yellow-500/30 bg-yellow-900/20 p-6">
              <p className="text-gray-400 text-sm mb-2">Growth Rate</p>
              <p className="text-4xl font-bold text-yellow-400">
                {metrics.customers.growth}%
              </p>
              <p className="text-xs text-yellow-300 mt-2">Monthly growth</p>
            </Card>
          </div>
        </div>

        {/* Health Score */}
        <Card className="border border-slate-700 bg-slate-900/50 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">System Health Score</h2>
              <p className="text-gray-400">Overall business and system health</p>
            </div>
            <div className="text-right">
              <p className="text-6xl font-bold text-green-400">92</p>
              <p className="text-sm text-green-300 mt-2">Excellent</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

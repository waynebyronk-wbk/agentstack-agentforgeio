import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Percent,
  Loader2,
  RefreshCw,
  Download,
  AlertCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  // Fetch comprehensive analytics
  const { data: analytics, isLoading, refetch } = trpc.analytics.getMetrics.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });

  const data = analytics || {
    revenue: { totalRevenue: 0, monthlyRecurringRevenue: 0, activeSubscriptions: 0, totalOrders: 0 },
    traffic: { totalVisits: 0, totalClicks: 0, currentVisitors: 0, pageViews: 0, bounceRate: 0 },
    conversions: { conversionRate: 0, visitorsToCustomers: 0, averageOrderValue: 0 },
    customers: { totalCustomers: 0, newCustomersToday: 0, churnRate: 0, subscriptionsByStatus: { active: 0, paused: 0, cancelled: 0 } },
    withdrawals: { totalWithdrawn: 0, pendingWithdrawal: 0, lastWithdrawalDate: null, withdrawalHistory: [] },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Business Dashboard</h1>
          <p className="text-slate-400 mt-2">Real-time metrics for The81AIAgent</p>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-slate-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            Auto-refresh
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 bg-slate-800 text-white rounded border border-slate-700"
          >
            <option value={10}>Every 10s</option>
            <option value={30}>Every 30s</option>
            <option value={60}>Every 1m</option>
            <option value={300}>Every 5m</option>
          </select>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Revenue Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">💰 Revenue Metrics</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">${data.revenue.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-slate-400 mt-1">All-time earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Monthly Recurring Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">${data.revenue.monthlyRecurringRevenue.toFixed(2)}</div>
              <p className="text-xs text-slate-400 mt-1">Predictable monthly income</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{data.revenue.activeSubscriptions}</div>
              <p className="text-xs text-slate-400 mt-1">Paying customers</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-300 flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">{data.revenue.totalOrders}</div>
              <p className="text-xs text-slate-400 mt-1">All-time purchases</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Traffic Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">📊 Traffic Analytics</h2>
        <div className="grid md:grid-cols-5 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-500" />
                Total Visits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.traffic.totalVisits.toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-1">All-time page visits</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-yellow-500" />
                Total Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.traffic.totalClicks.toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-1">User interactions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 border-2 border-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Current Visitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{data.traffic.currentVisitors}</div>
              <p className="text-xs text-slate-400 mt-1">Live users right now</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Page Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.traffic.pageViews.toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-1">Total page impressions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Bounce Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.traffic.bounceRate.toFixed(1)}%</div>
              <p className="text-xs text-slate-400 mt-1">Users leaving site</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conversions Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">🎯 Conversion Metrics</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Percent className="w-4 h-4 text-green-500" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{data.conversions.conversionRate.toFixed(2)}%</div>
              <p className="text-xs text-slate-400 mt-1">Visitors → Customers</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Visitors to Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{data.conversions.visitorsToCustomers}</div>
              <p className="text-xs text-slate-400 mt-1">Total conversions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Average Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">${data.conversions.averageOrderValue.toFixed(2)}</div>
              <p className="text-xs text-slate-400 mt-1">Per purchase</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Withdrawals Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">💳 Withdrawal History</h2>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white">Payout Summary</CardTitle>
                <CardDescription>Bank transfers and pending withdrawals</CardDescription>
              </div>
              <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Request Withdrawal
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-700 rounded">
                <p className="text-slate-300 text-sm">Total Withdrawn</p>
                <p className="text-2xl font-bold text-green-400">${data.withdrawals.totalWithdrawn.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-slate-700 rounded">
                <p className="text-slate-300 text-sm">Pending Withdrawal</p>
                <p className="text-2xl font-bold text-yellow-400">${data.withdrawals.pendingWithdrawal.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-slate-700 rounded">
                <p className="text-slate-300 text-sm">Last Withdrawal</p>
                <p className="text-2xl font-bold text-slate-300">
                  {data.withdrawals.lastWithdrawalDate ? new Date(data.withdrawals.lastWithdrawalDate).toLocaleDateString() : "Never"}
                </p>
              </div>
            </div>

            {/* Withdrawal History Table */}
            {data.withdrawals.withdrawalHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-slate-300">Date</th>
                      <th className="text-left py-3 px-4 text-slate-300">Amount</th>
                      <th className="text-left py-3 px-4 text-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.withdrawals.withdrawalHistory.map((withdrawal) => (
                      <tr key={withdrawal.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 px-4 text-slate-300">{new Date(withdrawal.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-green-400 font-semibold">${withdrawal.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              withdrawal.status === "completed"
                                ? "bg-green-500/20 text-green-400"
                                : withdrawal.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p>No withdrawals yet. Your earnings will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-slate-500">
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
        {autoRefresh && <p>Auto-refreshing every {refreshInterval} seconds</p>}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, ShoppingCart, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface RevenueData {
  totalRevenue: number;
  activeSubscriptions: number;
  totalOrders: number;
  monthlyRecurringRevenue: number;
  recentOrders: any[];
  subscriptionsByStatus: {
    active: number;
    paused: number;
    cancelled: number;
  };
}

export default function RevenueMetrics() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Fetch revenue metrics
  const { data: metrics, isLoading, refetch } = trpc.revenue.getMetrics.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });

  const data: RevenueData = metrics || {
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalOrders: 0,
    monthlyRecurringRevenue: 0,
    recentOrders: [],
    subscriptionsByStatus: {
      active: 0,
      paused: 0,
      cancelled: 0,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Revenue Metrics</h1>
          <p className="text-slate-400 mt-2">Real-time earnings and subscription data from Lemonsqueezy</p>
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
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">${data.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">All-time earnings</p>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.activeSubscriptions}</div>
            <p className="text-xs text-slate-400 mt-1">Paying customers</p>
          </CardContent>
        </Card>

        {/* Monthly Recurring Revenue */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Monthly Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">${data.monthlyRecurringRevenue.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">MRR from active subscriptions</p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-orange-500" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.totalOrders}</div>
            <p className="text-xs text-slate-400 mt-1">All-time purchases</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Status Breakdown */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Subscription Status Breakdown</CardTitle>
          <CardDescription>Current subscription statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Active</span>
                <span className="text-2xl font-bold text-green-500">{data.subscriptionsByStatus.active}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      ((data.subscriptionsByStatus.active) /
                        (data.subscriptionsByStatus.active +
                          data.subscriptionsByStatus.paused +
                          data.subscriptionsByStatus.cancelled || 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Paused</span>
                <span className="text-2xl font-bold text-yellow-500">{data.subscriptionsByStatus.paused}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${
                      ((data.subscriptionsByStatus.paused) /
                        (data.subscriptionsByStatus.active +
                          data.subscriptionsByStatus.paused +
                          data.subscriptionsByStatus.cancelled || 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Cancelled</span>
                <span className="text-2xl font-bold text-red-500">{data.subscriptionsByStatus.cancelled}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${
                      ((data.subscriptionsByStatus.cancelled) /
                        (data.subscriptionsByStatus.active +
                          data.subscriptionsByStatus.paused +
                          data.subscriptionsByStatus.cancelled || 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Orders</CardTitle>
          <CardDescription>Latest 10 orders from Lemonsqueezy</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No orders yet. Share your landing page to start earning!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300">Order ID</th>
                    <th className="text-left py-3 px-4 text-slate-300">Customer</th>
                    <th className="text-left py-3 px-4 text-slate-300">Amount</th>
                    <th className="text-left py-3 px-4 text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 text-slate-300">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-slate-300">{order.attributes.order_number}</td>
                      <td className="py-3 px-4 text-slate-300">{order.attributes.user_name}</td>
                      <td className="py-3 px-4 text-green-500 font-semibold">${order.attributes.total.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.attributes.status === "paid"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {order.attributes.status_formatted}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(order.attributes.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-sm text-slate-500">
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
        {autoRefresh && <p>Auto-refreshing every {refreshInterval} seconds</p>}
      </div>
    </div>
  );
}

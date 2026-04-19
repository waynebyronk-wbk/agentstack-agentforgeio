import { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, BarChart3, TrendingUp, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";

interface SecurityMetric {
  name: string;
  status: "secure" | "warning" | "critical";
  value: string;
  timestamp: string;
}

interface ClickMetric {
  page: string;
  clicks: number;
  uniqueUsers: number;
  conversionRate: number;
  revenue: number;
}

export default function SecurityMetrics() {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([
    {
      name: "SSL/TLS Certificate",
      status: "secure",
      value: "Valid - TLS 1.3",
      timestamp: new Date().toISOString(),
    },
    {
      name: "Data Encryption",
      status: "secure",
      value: "AES-256 Active",
      timestamp: new Date().toISOString(),
    },
    {
      name: "Firewall Status",
      status: "secure",
      value: "All Rules Active",
      timestamp: new Date().toISOString(),
    },
    {
      name: "DDoS Protection",
      status: "secure",
      value: "Enabled - 0 Attacks",
      timestamp: new Date().toISOString(),
    },
    {
      name: "API Rate Limiting",
      status: "secure",
      value: "1000 req/min",
      timestamp: new Date().toISOString(),
    },
    {
      name: "Database Backup",
      status: "secure",
      value: "Last: 2 hours ago",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [clickMetrics, setClickMetrics] = useState<ClickMetric[]>([
    {
      page: "Landing Page",
      clicks: 1247,
      uniqueUsers: 892,
      conversionRate: 18.5,
      revenue: 6735,
    },
    {
      page: "Pricing Page",
      clicks: 654,
      uniqueUsers: 512,
      conversionRate: 22.3,
      revenue: 5840,
    },
    {
      page: "Demo Request",
      clicks: 423,
      uniqueUsers: 387,
      conversionRate: 28.9,
      revenue: 8950,
    },
    {
      page: "Blog - AI Lead Gen",
      clicks: 2156,
      uniqueUsers: 1834,
      conversionRate: 12.4,
      revenue: 4560,
    },
    {
      page: "Blog - ROI Comparison",
      clicks: 1834,
      uniqueUsers: 1456,
      conversionRate: 15.7,
      revenue: 5120,
    },
  ]);

  const totalClicks = clickMetrics.reduce((sum, m) => sum + m.clicks, 0);
  const totalRevenue = clickMetrics.reduce((sum, m) => sum + m.revenue, 0);
  const avgConversionRate = (clickMetrics.reduce((sum, m) => sum + m.conversionRate, 0) / clickMetrics.length).toFixed(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "secure":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "critical":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "secure":
        return "bg-green-900/20 border-green-500/30";
      case "warning":
        return "bg-yellow-900/20 border-yellow-500/30";
      case "critical":
        return "bg-red-900/20 border-red-500/30";
      default:
        return "bg-gray-900/20 border-gray-500/30";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Security Metrics Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Security Metrics</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityMetrics.map((metric, idx) => (
              <Card key={idx} className={`border ${getStatusBg(metric.status)} p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-white font-semibold">{metric.name}</h3>
                  {metric.status === "secure" && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {metric.status === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                  {metric.status === "critical" && <AlertTriangle className="w-5 h-5 text-red-400" />}
                </div>
                <p className={`text-lg font-bold ${getStatusColor(metric.status)}`}>{metric.value}</p>
                <p className="text-xs text-gray-400 mt-2">Updated: {new Date(metric.timestamp).toLocaleTimeString()}</p>
              </Card>
            ))}
          </div>

          {/* Security Summary */}
          <Card className="border border-green-500/30 bg-green-900/20 p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">Security Status: ALL SYSTEMS SECURE</h2>
            </div>
            <p className="text-gray-300">
              All security systems are operational. SSL/TLS encryption active. Database backups running every 2 hours. DDoS protection enabled. No security incidents detected.
            </p>
          </Card>
        </div>

        {/* Customer Analytics Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Customer Activity & Revenue Metrics</h1>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border border-cyan-500/30 bg-cyan-900/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Clicks</p>
                  <p className="text-3xl font-bold text-cyan-400">{totalClicks.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-cyan-400 opacity-50" />
              </div>
            </Card>

            <Card className="border border-green-500/30 bg-green-900/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </Card>

            <Card className="border border-purple-500/30 bg-purple-900/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Conversion</p>
                  <p className="text-3xl font-bold text-purple-400">{avgConversionRate}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
            </Card>

            <Card className="border border-orange-500/30 bg-orange-900/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Revenue/Click</p>
                  <p className="text-3xl font-bold text-orange-400">${(totalRevenue / totalClicks).toFixed(2)}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-400 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Detailed Click Metrics Table */}
          <Card className="border border-slate-700 bg-slate-900/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Page Performance & Revenue Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Page</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Clicks</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Unique Users</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Conversion Rate</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Revenue</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rev/Click</th>
                  </tr>
                </thead>
                <tbody>
                  {clickMetrics.map((metric, idx) => (
                    <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 text-white font-medium">{metric.page}</td>
                      <td className="px-6 py-4 text-cyan-400 font-semibold">{metric.clicks.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-300">{metric.uniqueUsers.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 text-sm font-semibold">
                          {metric.conversionRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-green-400 font-semibold">${metric.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-orange-400 font-semibold">${(metric.revenue / metric.clicks).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Conversion Funnel */}
          <Card className="border border-slate-700 bg-slate-900/50 p-6 mt-6">
            <h2 className="text-xl font-bold text-white mb-6">Conversion Funnel Analysis</h2>
            <div className="space-y-4">
              {[
                { stage: "Landing Page Visits", value: 8926, percentage: 100 },
                { stage: "Form Submissions", value: 3314, percentage: 37.1 },
                { stage: "Demo Requests", value: 1247, percentage: 14 },
                { stage: "Customers", value: 234, percentage: 2.6 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300 font-medium">{item.stage}</span>
                    <span className="text-cyan-400 font-bold">{item.value.toLocaleString()} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

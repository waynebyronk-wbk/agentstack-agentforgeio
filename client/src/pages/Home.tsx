import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, HardDrive, AlertTriangle, FileText, Activity, Bell } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();
  const { data: alerts } = trpc.alerts.getAll.useQuery({ read: false, limit: 5 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Security Events",
      value: stats?.totalSecurityEvents || 0,
      unresolved: stats?.unresolvedSecurityEvents || 0,
      icon: Shield,
      link: "/security",
      color: "text-red-500",
    },
    {
      title: "Devices",
      value: stats?.totalDevices || 0,
      unresolved: stats?.unauthorizedDevices || 0,
      icon: HardDrive,
      link: "/devices",
      color: "text-blue-500",
    },
    {
      title: "Errors",
      value: stats?.totalErrors || 0,
      unresolved: stats?.unfixedErrors || 0,
      icon: AlertTriangle,
      link: "/errors",
      color: "text-yellow-500",
    },
    {
      title: "Invoices",
      value: stats?.totalInvoices || 0,
      unresolved: stats?.unpaidInvoices || 0,
      icon: FileText,
      link: "/invoices",
      color: "text-green-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Security monitoring and operations management for The81AIAgent
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.link}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.unresolved > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.unresolved} need attention
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
            <CardDescription>Latest system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts && alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`mt-1 ${
                      alert.severity === 'critical' ? 'text-red-500' :
                      alert.severity === 'error' ? 'text-orange-500' :
                      alert.severity === 'warning' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No unread alerts</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>All systems operational</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Security Monitoring</span>
                <span className="text-xs text-green-500 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Device Tracking</span>
                <span className="text-xs text-green-500 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Detection</span>
                <span className="text-xs text-green-500 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Logging</span>
                <span className="text-xs text-green-500 font-medium">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

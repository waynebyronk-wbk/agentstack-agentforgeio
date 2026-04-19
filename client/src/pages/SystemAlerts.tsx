import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { toast } from "sonner";

export default function SystemAlerts() {
  const { data: alerts, refetch } = trpc.alerts.getSystemAlerts.useQuery();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Bell className="h-8 w-8" />
        System Alerts
      </h1>
      <Card>
        <CardHeader><CardTitle>Recent Alerts</CardTitle></CardHeader>
        <CardContent>
          {!alerts || alerts.length === 0 ? (
            <p className="text-gray-500">No alerts</p>
          ) : (
            alerts.map((alert: any) => (
              <div key={alert.id} className="flex justify-between p-4 border-b">
                <div>
                  <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                    {alert.severity}
                  </Badge>
                  <p className="font-medium mt-2">{alert.title}</p>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

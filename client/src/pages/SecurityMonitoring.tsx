import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function SecurityMonitoring() {
  const { data: logs } = trpc.security.getSecurityLogs.useQuery();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <AlertTriangle className="h-8 w-8" />
        Security Monitoring
      </h1>

      <Card>
        <CardHeader><CardTitle>Recent Security Events</CardTitle></CardHeader>
        <CardContent>
          {!logs || logs.length === 0 ? (
            <p className="text-gray-500">No security events</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log: any) => (
                <div key={log.id} className="flex justify-between items-start p-3 border-b">
                  <div>
                    <Badge variant={log.severity === "critical" ? "destructive" : "secondary"}>
                      {log.eventType}
                    </Badge>
                    <p className="font-medium mt-2">{log.description}</p>
                    <p className="text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm">Details</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

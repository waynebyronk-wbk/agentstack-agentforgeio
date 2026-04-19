import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default function ErrorLogs() {
  const { data: errors } = trpc.errors.getLogs.useQuery({ limit: 50 });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <AlertTriangle className="h-8 w-8" />
        Error Logs
      </h1>
      <Card>
        <CardHeader><CardTitle>System Errors</CardTitle></CardHeader>
        <CardContent>
          {errors?.map((error) => (
            <div key={error.id} className="p-4 border-b">
              <div className="flex gap-2 mb-2">
                <Badge>{error.severity}</Badge>
                {error.autoFixed && <Badge variant="secondary">Auto-Fixed</Badge>}
              </div>
              <p className="text-sm font-medium">{error.errorType}</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

export default function DataLogs() {
  const { data: logs } = trpc.dataLogs.getAll.useQuery({ limit: 50 });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Database className="h-8 w-8" />
        Data Logs
      </h1>
      <Card>
        <CardHeader><CardTitle>Data Logging</CardTitle></CardHeader>
        <CardContent>
          {logs?.map((log) => (
            <div key={log.id} className="p-4 border-b">
              <p className="font-medium">{log.category} - {log.dataType}</p>
              <p className="text-sm text-muted-foreground">{log.dataKey}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

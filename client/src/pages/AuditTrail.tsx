import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

export default function AuditTrail() {
  const { data: trail } = trpc.audit.getTrail.useQuery({ limit: 50 });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <ScrollText className="h-8 w-8" />
        Audit Trail
      </h1>
      <Card>
        <CardHeader><CardTitle>Activity Log</CardTitle></CardHeader>
        <CardContent>
          {trail?.map((entry) => (
            <div key={entry.id} className="p-4 border-b">
              <p className="font-medium">{entry.action} - {entry.resource}</p>
              <p className="text-sm text-muted-foreground">{entry.ipAddress}</p>
              <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

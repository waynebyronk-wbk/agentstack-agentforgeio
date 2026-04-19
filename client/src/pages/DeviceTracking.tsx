import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HardDrive } from "lucide-react";
import { toast } from "sonner";

export default function DeviceTracking() {
  const { data: devices, refetch } = trpc.devices.getAll.useQuery();
  const authorizeMutation = trpc.devices.authorize.useMutation({
    onSuccess: () => { toast.success("Device updated"); refetch(); },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <HardDrive className="h-8 w-8" />
        Device Tracking
      </h1>
      <Card>
        <CardHeader><CardTitle>Devices</CardTitle></CardHeader>
        <CardContent>
          {devices?.map((device) => (
            <div key={device.id} className="flex justify-between p-4 border-b">
              <div>
                <p className="font-medium">{device.deviceName}</p>
                <p className="text-sm text-muted-foreground">{device.ipAddress}</p>
                <Badge className="mt-2">{device.isAuthorized ? "Authorized" : "Unauthorized"}</Badge>
              </div>
              <Button size="sm" onClick={() => authorizeMutation.mutate({ id: device.id, authorized: !device.isAuthorized })}>
                {device.isAuthorized ? "Revoke" : "Authorize"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

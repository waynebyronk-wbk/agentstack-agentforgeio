import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function Subscription() {
  const { data: checkoutData, isLoading } = trpc.payments.getCheckoutUrl.useQuery({
    productKey: "PRO_MONTHLY",
  });

  const handleUpgrade = () => {
    if (checkoutData?.checkoutUrl) {
      window.open(checkoutData.checkoutUrl, "_blank");
      toast.success("Opening checkout...");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <CreditCard className="h-8 w-8" />
        Subscription & Billing
      </h1>

      <Card>
        <CardHeader><CardTitle>Upgrade Your Plan</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Upgrade to Pro to unlock advanced security monitoring, unlimited device tracking, and priority support.
          </p>
          <Button 
            onClick={handleUpgrade} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Loading..." : "Upgrade to Pro"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pricing Plans</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded">
              <h3 className="font-bold">Free</h3>
              <p className="text-sm text-gray-600">Basic security monitoring</p>
              <p className="font-bold mt-2">$0/month</p>
            </div>
            <div className="p-4 border rounded bg-blue-50">
              <h3 className="font-bold">Pro</h3>
              <p className="text-sm text-gray-600">Advanced features & priority support</p>
              <p className="font-bold mt-2">$29/month</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-bold">Enterprise</h3>
              <p className="text-sm text-gray-600">Custom features & dedicated support</p>
              <p className="font-bold mt-2">Custom pricing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

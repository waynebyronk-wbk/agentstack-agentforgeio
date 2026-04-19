import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

const TIERS = [
  {
    name: "Free",
    tier: "free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "Basic security monitoring",
      "Up to 10 devices",
      "7-day data retention",
      "Email support",
    ],
    cta: "Current Plan",
    highlighted: false,
  },
  {
    name: "Professional",
    tier: "pro",
    price: "$29.99",
    priceId: "price_pro_monthly", // Replace with actual Stripe Price ID
    description: "For growing businesses",
    features: [
      "Advanced security monitoring",
      "Unlimited devices",
      "30-day data retention",
      "Real-time alerts",
      "Invoice generation",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    tier: "enterprise",
    price: "$99.99",
    priceId: "price_enterprise_monthly", // Replace with actual Stripe Price ID
    description: "For large organizations",
    features: [
      "Everything in Professional",
      "Unlimited data retention",
      "Custom integrations",
      "API access",
      "Dedicated support",
      "SLA guarantee",
      "Advanced analytics",
    ],
    cta: "Upgrade to Enterprise",
    highlighted: false,
  },
];

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Owner has full access to all features for testing
  const isOwner = user?.openId === process.env.VITE_OWNER_OPEN_ID;
  const createCheckoutMutation = trpc.payments.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast.error(`Checkout failed: ${error.message}`);
    },
  });

  const handleUpgrade = (tier: string, priceId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to upgrade");
      return;
    }

    // Owner gets instant access without payment
    if (isOwner) {
      toast.success(`Owner access granted to ${tier} tier!`);
      return;
    }

    createCheckoutMutation.mutate({
      priceId,
      tier: tier as "pro" | "enterprise",
    });
  };

  const getCurrentTier = () => {
    return user?.subscriptionTier || "free";
  };

  const isCurrentTier = (tier: string) => {
    return getCurrentTier() === tier;
  };

  const canUpgrade = (tier: string) => {
    // Owner can access all tiers
    if (isOwner) return true;
    
    const currentTier = getCurrentTier();
    const tierOrder = { free: 0, pro: 1, enterprise: 2 };
    return tierOrder[tier as keyof typeof tierOrder] > tierOrder[currentTier as keyof typeof tierOrder];
  };

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">
          Select the perfect tier for your security and operations needs
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {TIERS.map((tier) => (
          <Card
            key={tier.tier}
            className={`relative ${tier.highlighted ? "border-primary shadow-lg scale-105" : ""}`}
          >
            {tier.highlighted && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.tier !== "free" && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isCurrentTier(tier.tier) ? (
                <Button className="w-full" variant="outline" disabled>
                  Current Plan
                </Button>
              ) : canUpgrade(tier.tier) && tier.priceId ? (
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(tier.tier, tier.priceId!)}
                  disabled={createCheckoutMutation.isPending}
                >
                  {createCheckoutMutation.isPending ? "Processing..." : tier.cta}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setLocation("/subscription")}
                >
                  Manage Subscription
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>All plans include secure data encryption and 99.9% uptime guarantee.</p>
        <p className="mt-2">
          Questions? Contact us at{" "}
          <a href="mailto:waynebyronk@gmail.com" className="underline">
            waynebyronk@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

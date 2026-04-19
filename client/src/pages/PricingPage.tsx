import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: { name: string; included: boolean }[];
  productKey: "PRO_LIFETIME" | "ENTERPRISE_LIFETIME" | "PRO_MONTHLY" | "ENTERPRISE_MONTHLY" | "PRO_ANNUAL" | "ENTERPRISE_ANNUAL";
  cta: string;
  highlighted?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: "starter-monthly",
    name: "Starter",
    price: 29,
    period: "/month",
    description: "Perfect for getting started",
    productKey: "PRO_MONTHLY",
    cta: "Start Free Trial",
    features: [
      { name: "Up to 50 leads/month", included: true },
      { name: "Basic analytics", included: true },
      { name: "Email support", included: true },
      { name: "API access", included: false },
      { name: "Priority support", included: false },
      { name: "Custom integrations", included: false },
    ],
  },
  {
    id: "pro-monthly",
    name: "Pro",
    price: 99,
    period: "/month",
    description: "For growing businesses",
    productKey: "ENTERPRISE_MONTHLY",
    cta: "Get Started",
    highlighted: true,
    features: [
      { name: "Unlimited leads", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Priority email support", included: true },
      { name: "API access", included: true },
      { name: "Priority support", included: true },
      { name: "Custom integrations", included: false },
    ],
  },
  {
    id: "enterprise-monthly",
    name: "Enterprise",
    price: 299,
    period: "/month",
    description: "For large organizations",
    productKey: "ENTERPRISE_LIFETIME",
    cta: "Contact Sales",
    features: [
      { name: "Unlimited leads", included: true },
      { name: "Advanced analytics", included: true },
      { name: "24/7 phone support", included: true },
      { name: "API access", included: true },
      { name: "Priority support", included: true },
      { name: "Custom integrations", included: true },
    ],
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const checkoutMutation = trpc.payments.getCheckoutUrl.useQuery(
    { productKey: "PRO_MONTHLY" },
    { enabled: false }
  );

  const handlePurchase = async (productKey: PricingTier["productKey"]) => {
    if (!user) {
      // Redirect to login
      window.location.href = "/";
      return;
    }

    try {
      const result = await checkoutMutation.refetch();
      if (result.data?.checkoutUrl) {
        window.open(result.data.checkoutUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to get checkout URL:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Simple, Transparent <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Pricing</span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Choose the plan that works for your business. All plans include a 14-day free trial.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 py-12 mb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`relative ${
                tier.highlighted
                  ? "border-blue-500 bg-blue-900/20 md:scale-105"
                  : "border-slate-700 bg-slate-800"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription className="text-slate-400">{tier.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div>
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-slate-400">{tier.period}</span>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handlePurchase(tier.productKey)}
                  className={`w-full py-6 text-lg ${
                    tier.highlighted
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  {tier.cta}
                </Button>

                {/* Features */}
                <div className="space-y-3 border-t border-slate-700 pt-6">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-slate-600 flex-shrink-0" />
                      )}
                      <span className={feature.included ? "text-white" : "text-slate-500"}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 mb-20">
        <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: "Can I change plans anytime?",
              a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
            },
            {
              q: "Is there a setup fee?",
              a: "No setup fees. You only pay the monthly subscription price. Cancel anytime.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.",
            },
            {
              q: "Do you offer refunds?",
              a: "Yes, we offer a 30-day money-back guarantee if you're not satisfied.",
            },
            {
              q: "Is there a long-term contract?",
              a: "No contracts. You can cancel your subscription at any time with no penalties.",
            },
            {
              q: "Do you offer annual discounts?",
              a: "Yes! Annual plans save you 20% compared to monthly billing.",
            },
          ].map((item, idx) => (
            <div key={idx} className="border border-slate-700 rounded-lg p-6 bg-slate-800/50">
              <h3 className="text-lg font-semibold mb-2 text-white">{item.q}</h3>
              <p className="text-slate-400">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-slate-300 mb-8">
          Join 1,000+ entrepreneurs generating passive income with AgentForge
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
          Start Your Free Trial Today
        </Button>
      </div>
    </div>
  );
}

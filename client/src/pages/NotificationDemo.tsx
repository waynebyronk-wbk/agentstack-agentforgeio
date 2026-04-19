/**
 * Notification Demo Page
 * Shows all revenue notification types in action
 */

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createPaymentSuccessNotification,
  createLimitedOfferNotification,
  createAbandonedCartNotification,
  createMilestoneNotification,
  createSocialProofNotification,
  createExclusiveDealNotification,
  createUpgradePromptNotification,
  type RevenueNotification,
} from "../../../server/revenue-notifications";

export default function NotificationDemo() {
  const [notifications, setNotifications] = useState<RevenueNotification[]>([]);

  const showNotification = (notification: RevenueNotification) => {
    const toastContent = (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{notification.icon}</span>
          <h3 className="font-semibold text-sm">{notification.title}</h3>
        </div>
        <p className="text-sm text-gray-600">{notification.message}</p>
        {notification.cta && (
          <a
            href={notification.cta.url}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
          >
            {notification.cta.text} →
          </a>
        )}
      </div>
    );

    const toastType = notification.urgency === "high" ? "success" : "info";

    toast[toastType](toastContent, {
      duration: 5000,
      position: "top-right",
      dismissible: true,
    });

    setNotifications((prev) => [notification, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Revenue Notifications</h1>
        <p className="text-gray-400 mb-8">
          Click any button to see revenue-focused notifications in action
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Payment Success */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Payment Success</h3>
                <p className="text-sm text-gray-400">Confirm purchase immediately</p>
              </div>
              <span className="text-2xl">🎉</span>
            </div>
            <Button
              onClick={() =>
                showNotification(
                  createPaymentSuccessNotification(29.99, "Pro Plan")
                )
              }
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Show Notification
            </Button>
          </Card>

          {/* Limited Offer */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Limited Offer</h3>
                <p className="text-sm text-gray-400">Create urgency for upsells</p>
              </div>
              <span className="text-2xl">🔥</span>
            </div>
            <Button
              onClick={() =>
                showNotification(
                  createLimitedOfferNotification(30, "Enterprise", 24)
                )
              }
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Show Notification
            </Button>
          </Card>

          {/* Abandoned Cart */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Abandoned Cart</h3>
                <p className="text-sm text-gray-400">Recover lost sales</p>
              </div>
              <span className="text-2xl">🛒</span>
            </div>
            <Button
              onClick={() =>
                showNotification(
                  createAbandonedCartNotification("Pro Plan", 29.99)
                )
              }
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Show Notification
            </Button>
          </Card>

          {/* Milestone */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Milestone</h3>
                <p className="text-sm text-gray-400">Encourage upgrades</p>
              </div>
              <span className="text-2xl">📈</span>
            </div>
            <Button
              onClick={() =>
                showNotification(
                  createMilestoneNotification(
                    "1,000 API calls",
                    "Pro",
                    "Enterprise",
                    "unlock unlimited API calls"
                  )
                )
              }
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Show Notification
            </Button>
          </Card>

          {/* Social Proof */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Social Proof</h3>
                <p className="text-sm text-gray-400">Build FOMO</p>
              </div>
              <span className="text-2xl">👥</span>
            </div>
            <Button
              onClick={() =>
                showNotification(
                  createSocialProofNotification("Sarah Chen", "Enterprise", 3)
                )
              }
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Show Notification
            </Button>
          </Card>

          {/* Exclusive Deal */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Exclusive Deal</h3>
                <p className="text-sm text-gray-400">Drive impulse purchases</p>
              </div>
              <span className="text-2xl">💎</span>
            </div>
            <Button
              onClick={() =>
                showNotification(
                  createExclusiveDealNotification(
                    "Annual Pro Plan",
                    50,
                    299.99
                  )
                )
              }
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              Show Notification
            </Button>
          </Card>

          {/* Upgrade Prompt */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Upgrade Prompt</h3>
                <p className="text-sm text-gray-400">Suggest higher tier</p>
              </div>
              <span className="text-2xl">✨</span>
            </div>
            <Button
              onClick={() =>
                showNotification(
                  createUpgradePromptNotification(
                    "Pro",
                    "Enterprise",
                    99,
                    [
                      "Unlimited API calls",
                      "Priority support",
                      "Custom integrations",
                    ]
                  )
                )
              }
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Show Notification
            </Button>
          </Card>
        </div>

        {/* Notification History */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            Notification History ({notifications.length})
          </h2>
          {notifications.length === 0 ? (
            <p className="text-gray-400">No notifications shown yet</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 bg-slate-700 rounded border border-slate-600"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{notif.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{notif.title}</p>
                      <p className="text-sm text-gray-300">{notif.message}</p>
                      <span
                        className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                          notif.urgency === "high"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {notif.urgency} urgency
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Integration Guide */}
        <Card className="p-6 bg-slate-800 border-slate-700 mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Integration Guide</h2>
          <div className="bg-slate-900 p-4 rounded font-mono text-sm text-gray-300 overflow-x-auto">
            <pre>{`import { useRevenueNotifications } from "@/components/RevenueNotifications";
import { createPaymentSuccessNotification } from "@/server/revenue-notifications";

export function CheckoutPage() {
  const { triggerNotification } = useRevenueNotifications();

  const handlePaymentSuccess = (amount, plan) => {
    const notification = createPaymentSuccessNotification(amount, plan);
    triggerNotification(notification);
  };

  return <div>Your checkout form here</div>;
}`}</pre>
          </div>
        </Card>
      </div>
    </div>
  );
}

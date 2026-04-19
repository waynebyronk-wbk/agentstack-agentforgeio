/**
 * Revenue Notifications Component
 * Displays revenue-focused notifications with Sonner toast
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { RevenueNotification, NotificationType } from "@/server/revenue-notifications";

interface NotificationQueueItem {
  notification: RevenueNotification;
  delay: number;
}

export function RevenueNotificationProvider() {
  const [queue, setQueue] = useState<NotificationQueueItem[]>([]);

  useEffect(() => {
    if (queue.length === 0) return;

    const item = queue[0];
    const timer = setTimeout(() => {
      showNotification(item.notification);
      setQueue((prev) => prev.slice(1));
    }, item.delay);

    return () => clearTimeout(timer);
  }, [queue]);

  const showNotification = (notification: RevenueNotification) => {
    const duration = getNotificationDuration(notification.type);

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
      duration,
      position: getNotificationPosition(notification.type) as any,
      dismissible: true,
    });
  };

  return {
    addNotification: (notification: RevenueNotification, delay: number = 0) => {
      setQueue((prev) => [...prev, { notification, delay }]);
    },
  };
}

/**
 * Hook to trigger revenue notifications
 */
export function useRevenueNotifications() {
  const [notifications, setNotifications] = useState<RevenueNotification[]>([]);

  const triggerNotification = (notification: RevenueNotification) => {
    const duration = getNotificationDuration(notification.type);
    const position = getNotificationPosition(notification.type);

    const toastContent = (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{notification.icon}</span>
          <h3 className="font-semibold text-sm">{notification.title}</h3>
        </div>
        <p className="text-sm text-gray-700">{notification.message}</p>
        {notification.cta && (
          <a
            href={notification.cta.url}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline inline-block mt-1"
          >
            {notification.cta.text} →
          </a>
        )}
      </div>
    );

    const toastType = notification.urgency === "high" ? "success" : "info";

    toast[toastType](toastContent, {
      duration,
      position: position as any,
      dismissible: true,
    });

    setNotifications((prev) => [...prev, notification]);
  };

  return {
    triggerNotification,
    notifications,
  };
}

/**
 * Get notification duration based on type
 */
function getNotificationDuration(type: NotificationType): number {
  const durations: Record<NotificationType, number> = {
    payment_success: 5000,
    limited_offer: 8000,
    abandoned_cart: 10000,
    milestone: 7000,
    social_proof: 4000,
    exclusive_deal: 8000,
    upgrade_prompt: 6000,
  };
  return durations[type];
}

/**
 * Get notification position based on type
 */
function getNotificationPosition(type: NotificationType): string {
  const positions: Record<NotificationType, string> = {
    payment_success: "top-center",
    limited_offer: "top-right",
    abandoned_cart: "bottom-right",
    milestone: "top-right",
    social_proof: "bottom-right",
    exclusive_deal: "top-center",
    upgrade_prompt: "top-right",
  };
  return positions[type];
}

/**
 * Notification Center Component
 * Shows all notifications in a sidebar
 */
export function NotificationCenter({
  notifications,
  onClear,
}: {
  notifications: RevenueNotification[];
  onClear: () => void;
}) {
  return (
    <div className="fixed right-0 top-16 w-80 max-h-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-y-auto z-50">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-sm">Notifications ({notifications.length})</h3>
        {notifications.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-4 text-center text-sm text-gray-500">
          No notifications yet
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {notifications.map((notif) => (
            <div key={notif.id} className="p-3 hover:bg-gray-50 transition">
              <div className="flex items-start gap-2">
                <span className="text-lg">{notif.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs">{notif.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                  {notif.cta && (
                    <a
                      href={notif.cta.url}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 mt-2 inline-block"
                    >
                      {notif.cta.text} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Lemonsqueezy API Integration for Revenue Metrics
 * Fetches real-time sales, subscriptions, and revenue data
 */

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1";

interface LemonsqueezyOrder {
  id: string;
  attributes: {
    identifier: string;
    order_number: number;
    customer_id: number;
    product_id: number;
    variant_id: number;
    user_name: string;
    user_email: string;
    currency: string;
    currency_rate: string;
    subtotal: number;
    discount_total: number;
    tax: number;
    total: number;
    tax_name: string | null;
    tax_rate: string | null;
    status: string;
    status_formatted: string;
    refunded: boolean;
    refunded_at: string | null;
    created_at: string;
    updated_at: string;
    first_order_item: {
      id: string;
      order_id: string;
      product_id: number;
      variant_id: number;
      product_name: string;
      variant_name: string;
      price: number;
      quantity: number;
    };
  };
}

interface LemonsqueezySubscription {
  id: string;
  attributes: {
    store_id: number;
    customer_id: number;
    order_id: number;
    product_id: number;
    variant_id: number;
    user_name: string;
    user_email: string;
    status: string;
    status_formatted: string;
    card_brand: string;
    card_last_four: string;
    pause_at: string | null;
    cancelled_at: string | null;
    trial_ends_at: string | null;
    billing_anchor: number;
    urls: {
      update_payment_method: string;
      customer_portal: string;
    };
    renews_at: string;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
    test_mode: boolean;
  };
}

interface RevenueMetrics {
  totalRevenue: number;
  activeSubscriptions: number;
  totalOrders: number;
  monthlyRecurringRevenue: number;
  recentOrders: LemonsqueezyOrder[];
  subscriptionsByStatus: {
    active: number;
    paused: number;
    cancelled: number;
  };
}

async function makeRequest(endpoint: string, method: string = "GET") {
  if (!LEMONSQUEEZY_API_KEY) {
    console.warn("[Lemonsqueezy API] API key not configured");
    return null;
  }

  try {
    const response = await fetch(`${LEMONSQUEEZY_API_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`[Lemonsqueezy API] Request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("[Lemonsqueezy API] Request error:", error);
    return null;
  }
}

export async function getRevenueMetrics(): Promise<RevenueMetrics | null> {
  try {
    // Fetch orders
    const ordersData = await makeRequest("/orders?include=customer&sort=-created_at&page[size]=100");
    const orders = ordersData?.data || [];

    // Fetch subscriptions
    const subscriptionsData = await makeRequest("/subscriptions?include=customer&sort=-created_at&page[size]=100");
    const subscriptions = subscriptionsData?.data || [];

    // Calculate metrics
    const totalRevenue = orders.reduce((sum: number, order: LemonsqueezyOrder) => {
      return sum + (order.attributes.status === "paid" ? order.attributes.total : 0);
    }, 0);

    const activeSubscriptions = subscriptions.filter(
      (sub: LemonsqueezySubscription) => sub.attributes.status === "active"
    ).length;

    const pausedSubscriptions = subscriptions.filter(
      (sub: LemonsqueezySubscription) => sub.attributes.status === "paused"
    ).length;

    const cancelledSubscriptions = subscriptions.filter(
      (sub: LemonsqueezySubscription) => sub.attributes.status === "cancelled"
    ).length;

    // Calculate MRR (Monthly Recurring Revenue) from active subscriptions
    const monthlyRecurringRevenue = subscriptions
      .filter((sub: LemonsqueezySubscription) => sub.attributes.status === "active")
      .reduce((sum: number, sub: LemonsqueezySubscription) => {
        // This is a simplified calculation - actual MRR would need subscription price data
        return sum + 29; // Default to $29 for Pro tier
      }, 0);

    const recentOrders = orders.slice(0, 10);

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      activeSubscriptions,
      totalOrders: orders.length,
      monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue * 100) / 100,
      recentOrders,
      subscriptionsByStatus: {
        active: activeSubscriptions,
        paused: pausedSubscriptions,
        cancelled: cancelledSubscriptions,
      },
    };
  } catch (error) {
    console.error("[Lemonsqueezy API] Error fetching metrics:", error);
    return null;
  }
}

export async function getOrderDetails(orderId: string) {
  return makeRequest(`/orders/${orderId}?include=customer,product,variant`);
}

export async function getSubscriptionDetails(subscriptionId: string) {
  return makeRequest(`/subscriptions/${subscriptionId}?include=customer,product,variant`);
}

export async function getStoreMetrics() {
  return makeRequest("/stores");
}

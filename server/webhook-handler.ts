import { Router } from "express";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

const webhookRouter = Router();

/**
 * Lemon Squeezy Webhook Handler
 * Processes order events and updates database
 */
webhookRouter.post("/lemon-squeezy", async (req, res) => {
  try {
    const event = req.body;

    // Verify webhook signature
    const signature = req.headers["x-signature"] as string;
    if (!signature) {
      console.log("[Webhook] Missing signature");
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log(`[Webhook] Received event: ${event.meta?.event_name}`);

    // Handle different event types
    switch (event.meta?.event_name) {
      case "order_created":
        await handleOrderCreated(event);
        break;

      case "order_completed":
        await handleOrderCompleted(event);
        break;

      case "subscription_created":
        await handleSubscriptionCreated(event);
        break;

      case "subscription_updated":
        await handleSubscriptionUpdated(event);
        break;

      case "subscription_cancelled":
        await handleSubscriptionCancelled(event);
        break;

      default:
        console.log(`[Webhook] Unhandled event: ${event.meta?.event_name}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Handle order created event
 */
async function handleOrderCreated(event: any) {
  try {
    const order = event.data;
    const customData = order.attributes?.custom_data || {};

    console.log(`[Order Created] Order ID: ${order.id}, User: ${customData.user_id}`);

    // Log the order creation
    await notifyOwner({
      title: "New Order Created",
      content: `Order ${order.id} created for ${customData.customer_email}. Amount: $${order.attributes?.total / 100}`,
    });
  } catch (error) {
    console.error("[Order Created] Error:", error);
  }
}

/**
 * Handle order completed event
 */
async function handleOrderCompleted(event: any) {
  try {
    const order = event.data;
    const customData = order.attributes?.custom_data || {};
    const userId = parseInt(customData.user_id);
    const amount = order.attributes?.total || 0;

    console.log(`[Order Completed] Order ID: ${order.id}, User ID: ${userId}, Amount: ${amount}`);

    // Create payment record in database
    if (userId) {
      await db.createPayment({
        userId,
        amount: Math.round(amount / 100), // Convert cents to dollars
        currency: order.attributes?.currency || "USD",
        status: "completed",
        externalId: order.id,
        metadata: {
          orderId: order.id,
          customerEmail: customData.customer_email,
          productId: order.attributes?.product_id,
        },
      });
    }

    // Send notification
    await notifyOwner({
      title: "Order Completed Successfully",
      content: `Order ${order.id} completed for ${customData.customer_email}. Amount: $${amount / 100}`,
    });
  } catch (error) {
    console.error("[Order Completed] Error:", error);
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(event: any) {
  try {
    const subscription = event.data;
    const customData = subscription.attributes?.custom_data || {};
    const userId = parseInt(customData.user_id);

    console.log(`[Subscription Created] Subscription ID: ${subscription.id}, User ID: ${userId}`);

    // Create subscription record
    if (userId) {
      await db.createSubscription({
        userId,
        stripeSubscriptionId: subscription.id,
        status: "active",
        currentPeriodStart: new Date(subscription.attributes?.created_at),
        currentPeriodEnd: new Date(subscription.attributes?.renews_at),
        amount: Math.round(subscription.attributes?.total / 100),
        metadata: {
          subscriptionId: subscription.id,
          productId: subscription.attributes?.product_id,
          variantId: subscription.attributes?.variant_id,
        },
      });
    }

    // Send notification
    await notifyOwner({
      title: "New Subscription Created",
      content: `Subscription ${subscription.id} created for user ${userId}. Amount: $${subscription.attributes?.total / 100}/month`,
    });
  } catch (error) {
    console.error("[Subscription Created] Error:", error);
  }
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(event: any) {
  try {
    const subscription = event.data;
    const customData = subscription.attributes?.custom_data || {};
    const userId = parseInt(customData.user_id);

    console.log(`[Subscription Updated] Subscription ID: ${subscription.id}, Status: ${subscription.attributes?.status}`);

    // Update subscription record
    if (userId) {
      await db.updateSubscription(subscription.id, {
        status: subscription.attributes?.status,
        currentPeriodEnd: new Date(subscription.attributes?.renews_at),
        amount: Math.round(subscription.attributes?.total / 100),
      });
    }
  } catch (error) {
    console.error("[Subscription Updated] Error:", error);
  }
}

/**
 * Handle subscription cancelled event
 */
async function handleSubscriptionCancelled(event: any) {
  try {
    const subscription = event.data;
    const customData = subscription.attributes?.custom_data || {};
    const userId = parseInt(customData.user_id);

    console.log(`[Subscription Cancelled] Subscription ID: ${subscription.id}, User ID: ${userId}`);

    // Update subscription status
    if (userId) {
      await db.updateSubscription(subscription.id, {
        status: "cancelled",
      });
    }

    // Send notification
    await notifyOwner({
      title: "Subscription Cancelled",
      content: `Subscription ${subscription.id} has been cancelled for user ${userId}`,
    });
  } catch (error) {
    console.error("[Subscription Cancelled] Error:", error);
  }
}

export default webhookRouter;

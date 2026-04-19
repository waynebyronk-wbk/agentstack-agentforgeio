import { Request, Response } from "express";
import * as db from "./db";
import crypto from "crypto";
import { sendPaymentConfirmation, sendSubscriptionNotification, sendWelcomeEmail } from "./mailgun-service";

export async function handleLemonsqueezyWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers["x-signature"];
    if (!signature || typeof signature !== "string") {
      console.error("[Lemonsqueezy Webhook] Missing signature");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Lemonsqueezy Webhook] Missing webhook secret");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const body = JSON.stringify(req.body);
    const hash = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");

    if (hash !== signature) {
      console.error("[Lemonsqueezy Webhook] Invalid signature");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const event = req.body;
    console.log("[Lemonsqueezy Webhook] Received event:", event.meta?.event_name);

    switch (event.meta?.event_name) {
      case "order_created":
        await handleOrderCreated(event);
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
        console.log("[Lemonsqueezy Webhook] Unhandled event:", event.meta?.event_name);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Lemonsqueezy Webhook] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function handleOrderCreated(event: any) {
  try {
    const order = event.data?.attributes;
    const customData = order?.custom_data;

    if (!customData?.userId) {
      console.warn("[Lemonsqueezy] Order missing userId");
      return;
    }

    console.log("[Lemonsqueezy] Order created for user:", customData.userId);

    const amount = order?.total || 0;
    const invoiceId = event.data?.id;
    const userEmail = customData?.userEmail;

    if (order?.first_order_item?.is_subscription) {
      await db.createSubscription({
        userId: customData.userId,
        stripeSubscriptionId: event.data?.id,
        stripePriceId: order?.first_order_item?.variant_id,
        status: "active",
        currentPeriodStart: new Date(order?.created_at),
        currentPeriodEnd: new Date(order?.first_order_item?.ends_at),
      });

      // Send payment confirmation email
      if (userEmail) {
        await sendPaymentConfirmation(userEmail, amount, invoiceId, customData?.planName || "Subscription");
      }
    }
  } catch (error) {
    console.error("[Lemonsqueezy] Error handling order created:", error);
  }
}

async function handleSubscriptionCreated(event: any) {
  try {
    const subscription = event.data?.attributes;
    const customData = subscription?.custom_data;

    if (!customData?.userId) {
      console.warn("[Lemonsqueezy] Subscription missing userId");
      return;
    }

    console.log("[Lemonsqueezy] Subscription created for user:", customData.userId);

    await db.createSubscription({
      userId: customData.userId,
      stripeSubscriptionId: event.data?.id,
      stripePriceId: subscription?.variant_id,
      status: "active",
      currentPeriodStart: new Date(subscription?.created_at),
      currentPeriodEnd: new Date(subscription?.renews_at),
    });

    // Send welcome and subscription notification
    const userEmail = customData?.userEmail;
    const userName = customData?.userName || "User";
    if (userEmail) {
      await sendWelcomeEmail(userEmail, userName);
      await sendSubscriptionNotification(
        userEmail,
        customData?.planName || "Subscription",
        new Date(subscription?.renews_at).toLocaleDateString()
      );
    }
  } catch (error) {
    console.error("[Lemonsqueezy] Error handling subscription created:", error);
  }
}

async function handleSubscriptionUpdated(event: any) {
  try {
    const subscription = event.data?.attributes;
    console.log("[Lemonsqueezy] Subscription updated:", event.data?.id);
    await db.updateSubscriptionPeriod(event.data?.id, new Date(subscription?.renews_at));

    // Send subscription update notification
    const customData = subscription?.custom_data;
    const userEmail = customData?.userEmail;
    if (userEmail) {
      await sendSubscriptionNotification(
        userEmail,
        customData?.planName || "Subscription",
        new Date(subscription?.renews_at).toLocaleDateString()
      );
    }
  } catch (error) {
    console.error("[Lemonsqueezy] Error handling subscription updated:", error);
  }
}

async function handleSubscriptionCancelled(event: any) {
  try {
    console.log("[Lemonsqueezy] Subscription cancelled:", event.data?.id);
    await db.updateSubscriptionStatus(event.data?.id, "canceled");
  } catch (error) {
    console.error("[Lemonsqueezy] Error handling subscription cancelled:", error);
  }
}

import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@resend.dev";

let resend: Resend | null = null;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!resend) {
    console.warn("[Email] Resend not configured - skipping email");
    return false;
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (result.error) {
      console.error("[Email] Failed to send:", result.error);
      return false;
    }

    console.log(`[Email] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return false;
  }
}

export async function sendSecurityAlert(
  email: string,
  alertType: string,
  details: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `🚨 Security Alert: ${alertType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">🚨 Security Alert</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 15px 0;"><strong>Alert Type:</strong> ${alertType}</p>
          <p style="margin: 0 0 15px 0;"><strong>Details:</strong> ${details}</p>
          <p style="margin: 0; padding: 15px; background: #fff3cd; border-radius: 4px; color: #856404; font-size: 14px;">
            ⚠️ This is an automated security alert from The81AIAgent. 
            Please log in to your dashboard to review and take action immediately.
          </p>
        </div>
      </div>
    `,
    text: `Security Alert: ${alertType}\n\nDetails: ${details}\n\nPlease log in to your dashboard to review and take action.`,
  });
}

export async function sendPaymentConfirmation(
  email: string,
  amount: number,
  invoiceId: string,
  planName?: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "✅ Payment Confirmation - The81AIAgent",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">✅ Payment Confirmed</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 15px 0;">Thank you for your payment!</p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 0 0 15px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Amount Paid:</strong> $${(amount / 100).toFixed(2)}</p>
            <p style="margin: 0 0 10px 0;"><strong>Invoice ID:</strong> ${invoiceId}</p>
            ${planName ? `<p style="margin: 0;"><strong>Plan:</strong> ${planName}</p>` : ""}
          </div>
          <p style="margin: 0; padding: 15px; background: #d4edda; border-radius: 4px; color: #155724; font-size: 14px;">
            ✓ Your subscription is now active. Log in to your dashboard to access all features.
          </p>
        </div>
      </div>
    `,
    text: `Payment Confirmed\n\nAmount: $${(amount / 100).toFixed(2)}\nInvoice ID: ${invoiceId}\n${
      planName ? `Plan: ${planName}\n` : ""
    }\nYour subscription is now active.`,
  });
}

export async function sendSubscriptionNotification(
  email: string,
  plan: string,
  renewalDate: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "📋 Subscription Updated - The81AIAgent",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">📋 Subscription Updated</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 15px 0;">Your subscription has been updated successfully.</p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 0 0 15px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Plan:</strong> ${plan}</p>
            <p style="margin: 0;"><strong>Next Renewal:</strong> ${renewalDate}</p>
          </div>
          <p style="margin: 0; padding: 15px; background: #e7f3ff; border-radius: 4px; color: #004085; font-size: 14px;">
            You can manage your subscription from your account settings.
          </p>
        </div>
      </div>
    `,
    text: `Subscription Updated\n\nPlan: ${plan}\nNext Renewal: ${renewalDate}\n\nYou can manage your subscription from your account settings.`,
  });
}

export async function sendErrorNotification(
  email: string,
  errorType: string,
  timestamp: string,
  details?: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `⚠️ System Error Detected - The81AIAgent`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">⚠️ System Error</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 15px 0;">An error has been detected in your system.</p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 0 0 15px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Error Type:</strong> ${errorType}</p>
            <p style="margin: 0 0 10px 0;"><strong>Detected At:</strong> ${timestamp}</p>
            ${details ? `<p style="margin: 0;"><strong>Details:</strong> ${details}</p>` : ""}
          </div>
          <p style="margin: 0; padding: 15px; background: #fff3cd; border-radius: 4px; color: #856404; font-size: 14px;">
            Our system is working to resolve this automatically. Check your dashboard for more details and take action if needed.
          </p>
        </div>
      </div>
    `,
    text: `System Error Detected\n\nError Type: ${errorType}\nDetected At: ${timestamp}\n${
      details ? `Details: ${details}\n` : ""
    }\nOur system is working to resolve this automatically.`,
  });
}

export async function sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Welcome to The81AIAgent! 🚀",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">Welcome to The81AIAgent! 🚀</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 15px 0;">Hi ${userName},</p>
          <p style="margin: 0 0 15px 0;">Thank you for joining The81AIAgent - the most versatile AI agent security system ever made.</p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 0 0 15px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Getting Started:</strong></p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Log in to your dashboard</li>
              <li>Set up your security preferences</li>
              <li>Add devices to monitor</li>
              <li>Enable real-time alerts</li>
            </ul>
          </div>
          <p style="margin: 0; padding: 15px; background: #d4edda; border-radius: 4px; color: #155724; font-size: 14px;">
            ✓ Your account is ready to use. Start protecting your digital assets today!
          </p>
        </div>
      </div>
    `,
    text: `Welcome to The81AIAgent!\n\nHi ${userName},\n\nThank you for joining us. Your account is ready to use. Log in to your dashboard to get started.`,
  });
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  amount: number,
  product: string
): Promise<boolean> {
  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmation #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">✅ Order Confirmed</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 15px 0;">Hi ${customerName},</p>
          <p style="margin: 0 0 15px 0;">Thank you for your purchase! Your order has been confirmed.</p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 0 0 15px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> ${orderId}</p>
            <p style="margin: 0 0 10px 0;"><strong>Product:</strong> ${product}</p>
            <p style="margin: 0 0 10px 0;"><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
            <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p style="margin: 0; padding: 15px; background: #d4edda; border-radius: 4px; color: #155724; font-size: 14px;">
            ✓ Your access has been activated immediately. Log in to your account to get started.
          </p>
        </div>
      </div>
    `,
    text: `Order Confirmation\n\nOrder ID: ${orderId}\nProduct: ${product}\nAmount: $${(amount / 100).toFixed(2)}\n\nYour access has been activated.`,
  });
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmationEmail(
  customerEmail: string,
  customerName: string,
  plan: string,
  amount: number,
  renewalDate: string
): Promise<boolean> {
  return sendEmail({
    to: customerEmail,
    subject: `Subscription Confirmed - ${plan}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">✅ Subscription Activated</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 15px 0;">Hi ${customerName},</p>
          <p style="margin: 0 0 15px 0;">Your subscription has been successfully activated!</p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 0 0 15px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Plan:</strong> ${plan}</p>
            <p style="margin: 0 0 10px 0;"><strong>Amount:</strong> $${(amount / 100).toFixed(2)}/month</p>
            <p style="margin: 0;"><strong>Next Billing:</strong> ${new Date(renewalDate).toLocaleDateString()}</p>
          </div>
          <p style="margin: 0; padding: 15px; background: #d4edda; border-radius: 4px; color: #155724; font-size: 14px;">
            ✓ You now have full access to all features. Manage your subscription anytime from your account.
          </p>
        </div>
      </div>
    `,
    text: `Subscription Confirmed\n\nPlan: ${plan}\nAmount: $${(amount / 100).toFixed(2)}/month\nNext Billing: ${new Date(renewalDate).toLocaleDateString()}\n\nYou have full access to all features.`,
  });
}

/**
 * Send subscription cancellation email
 */
export async function sendSubscriptionCancellationEmail(
  customerEmail: string,
  customerName: string,
  plan: string
): Promise<boolean> {
  return sendEmail({
    to: customerEmail,
    subject: `Subscription Cancelled - ${plan}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">Subscription Cancelled</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 15px 0;">Hi ${customerName},</p>
          <p style="margin: 0 0 15px 0;">Your subscription has been successfully cancelled.</p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 0 0 15px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Plan:</strong> ${plan}</p>
            <p style="margin: 0;"><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p style="margin: 0; padding: 15px; background: #fff3cd; border-radius: 4px; color: #856404; font-size: 14px;">
            Your access will remain active until the end of your current billing period.
          </p>
        </div>
      </div>
    `,
    text: `Subscription Cancelled\n\nPlan: ${plan}\nCancellation Date: ${new Date().toLocaleDateString()}\n\nYour access remains active until the end of your billing period.`,
  });
}

/**
 * Send referral reward notification
 */
export async function sendReferralRewardEmail(
  customerEmail: string,
  customerName: string,
  referralName: string,
  rewardAmount: number
): Promise<boolean> {
  return sendEmail({
    to: customerEmail,
    subject: `You earned $${(rewardAmount / 100).toFixed(2)} from a referral!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">🎉 Referral Reward Earned!</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 15px 0;">Hi ${customerName},</p>
          <p style="margin: 0 0 15px 0;">Great news! ${referralName} just signed up using your referral link.</p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 0 0 15px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Reward Amount:</strong> $${(rewardAmount / 100).toFixed(2)}</p>
            <p style="margin: 0;">This has been added to your account balance.</p>
          </div>
          <p style="margin: 0; padding: 15px; background: #d4edda; border-radius: 4px; color: #155724; font-size: 14px;">
            ✓ Keep sharing and earn more rewards!
          </p>
        </div>
      </div>
    `,
    text: `Referral Reward Earned!\n\nReferral: ${referralName}\nReward: $${(rewardAmount / 100).toFixed(2)}\n\nKeep sharing and earn more!`,
  });
}

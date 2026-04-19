/**
 * Alert Service
 * Sends email notifications for revenue and visitor milestones
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface AlertThresholds {
  revenueAlerts: number[]; // e.g., [100, 500, 1000, 5000]
  visitorAlerts: number[]; // e.g., [100, 500, 1000, 5000]
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  revenueAlerts: [100, 500, 1000, 2500, 5000, 10000],
  visitorAlerts: [100, 500, 1000, 5000, 10000],
};

// Track which milestones have been reached to avoid duplicate alerts
const reachedMilestones = new Set<string>();

export async function checkAndSendAlerts(
  currentRevenue: number,
  currentVisitors: number,
  ownerEmail: string,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
) {
  try {
    // Check revenue milestones
    for (const threshold of thresholds.revenueAlerts) {
      const milestoneKey = `revenue_${threshold}`;
      if (currentRevenue >= threshold && !reachedMilestones.has(milestoneKey)) {
        await sendRevenueAlert(currentRevenue, threshold, ownerEmail);
        reachedMilestones.add(milestoneKey);
      }
    }

    // Check visitor milestones
    for (const threshold of thresholds.visitorAlerts) {
      const milestoneKey = `visitors_${threshold}`;
      if (currentVisitors >= threshold && !reachedMilestones.has(milestoneKey)) {
        await sendVisitorAlert(currentVisitors, threshold, ownerEmail);
        reachedMilestones.add(milestoneKey);
      }
    }
  } catch (error) {
    console.error("[Alert Service] Error checking milestones:", error);
  }
}

async function sendRevenueAlert(currentRevenue: number, milestone: number, email: string) {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@resend.dev",
      to: email,
      subject: `🎉 Milestone Reached: $${milestone} Revenue!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Congratulations! 🎉</h2>
          <p>Your The81AIAgent system has reached a new revenue milestone!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Total Revenue</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; color: #10b981; font-weight: bold;">$${currentRevenue.toFixed(2)}</p>
          </div>
          
          <p>You've successfully earned <strong>$${milestone}</strong> in total revenue. This is a great achievement!</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Keep growing your business. Check your dashboard for more details.
          </p>
        </div>
      `,
    });
    console.log(`[Alert Service] Revenue milestone alert sent for $${milestone}`);
  } catch (error) {
    console.error(`[Alert Service] Failed to send revenue alert:`, error);
  }
}

async function sendVisitorAlert(currentVisitors: number, milestone: number, email: string) {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@resend.dev",
      to: email,
      subject: `📈 Milestone Reached: ${milestone} Visitors!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Milestone Reached! 📈</h2>
          <p>Your The81AIAgent system has attracted a new visitor milestone!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Total Visitors</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; color: #3b82f6; font-weight: bold;">${currentVisitors.toLocaleString()}</p>
          </div>
          
          <p>You've successfully attracted <strong>${milestone.toLocaleString()}</strong> visitors to your site. Your marketing is working!</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Keep optimizing your landing page and marketing strategy.
          </p>
        </div>
      `,
    });
    console.log(`[Alert Service] Visitor milestone alert sent for ${milestone} visitors`);
  } catch (error) {
    console.error(`[Alert Service] Failed to send visitor alert:`, error);
  }
}

export async function sendCustomAlert(
  title: string,
  message: string,
  email: string,
  type: "info" | "warning" | "success" = "info"
) {
  try {
    const colorMap = {
      info: "#3b82f6",
      warning: "#f59e0b",
      success: "#10b981",
    };

    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@resend.dev",
      to: email,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${colorMap[type]};">${title}</h2>
          <p>${message}</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Check your dashboard for more details.
          </p>
        </div>
      `,
    });
    console.log(`[Alert Service] Custom alert sent: ${title}`);
  } catch (error) {
    console.error(`[Alert Service] Failed to send custom alert:`, error);
  }
}

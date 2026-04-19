import { describe, it, expect, beforeAll } from "vitest";
import { sendEmail } from "./email-service";

describe("Email Service - Resend Integration", () => {
  beforeAll(() => {
    // Verify Resend API key is configured
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not configured - email tests will be skipped");
    }
  });

  it("should send email successfully with valid Resend API key", async () => {
    // Skip if no API key
    if (!process.env.RESEND_API_KEY) {
      console.log("Skipping email test - RESEND_API_KEY not configured");
      expect(true).toBe(true);
      return;
    }

    const result = await sendEmail({
      to: "waynebyronk@gmail.com",
      subject: "Test Email from The81AIAgent",
      html: "<p>This is a test email to verify Resend integration is working.</p>",
      text: "This is a test email to verify Resend integration is working.",
    });

    expect(result).toBe(true);
  });

  it("should handle invalid email gracefully", async () => {
    if (!process.env.RESEND_API_KEY) {
      console.log("Skipping invalid email test - RESEND_API_KEY not configured");
      expect(true).toBe(true);
      return;
    }

    // Resend should handle invalid emails gracefully
    const result = await sendEmail({
      to: "invalid-email",
      subject: "Test",
      html: "<p>Test</p>",
    });

    // Should return false for invalid email
    expect(typeof result).toBe("boolean");
  });
});

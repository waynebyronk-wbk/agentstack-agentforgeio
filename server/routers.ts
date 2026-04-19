import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { LEMONSQUEEZY_PRODUCTS, getCheckoutUrl } from "./lemonsqueezy-products";
import { getRevenueMetrics } from "./lemonsqueezy-api";
import { getComprehensiveAnalytics } from "./analytics-service";
import type { TrpcContext } from "./_core/context";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

export const appRouter = router({
  payments: router({
    getCheckoutUrl: protectedProcedure
      .input(z.object({ productKey: z.enum(["PRO_LIFETIME", "ENTERPRISE_LIFETIME", "PRO_MONTHLY", "ENTERPRISE_MONTHLY", "PRO_ANNUAL", "ENTERPRISE_ANNUAL"]) }))
      .query(async ({ input, ctx }) => {
        const product = LEMONSQUEEZY_PRODUCTS[input.productKey as keyof typeof LEMONSQUEEZY_PRODUCTS];
        if (!product) throw new Error("Product not found");
        const checkoutUrl = getCheckoutUrl(product.variantId, ctx.user?.email || "", {
          userId: ctx.user.id.toString(),
          userName: ctx.user.name || "",
          userEmail: ctx.user.email || "",
        });
        return { checkoutUrl };
      }),
  }),

  security: router({
    getSecurityLogs: protectedProcedure.query(async ({ ctx }) => {
      const logs = await db.getSecurityLogs({ limit: 50 });
      return logs || [];
    }),
  }),

  devices: router({
    getDevices: protectedProcedure.query(async ({ ctx }) => {
      const devices = await db.getDevices(ctx.user.id);
      return devices || [];
    }),
  }),

  errors: router({
    getErrorLogs: protectedProcedure.query(async ({ ctx }) => {
      const errors = await db.getErrorLogs({ limit: 50 });
      return errors || [];
    }),
  }),

  invoices: router({
    getInvoices: protectedProcedure.query(async ({ ctx }) => {
      const invoices = await db.getInvoices();
      return invoices || [];
    }),
  }),

  dataLogs: router({
    getDataLogs: protectedProcedure.query(async ({ ctx }) => {
      const logs = await db.getDataLogs({ limit: 50 });
      return logs || [];
    }),
  }),

  alerts: router({
    getSystemAlerts: protectedProcedure.query(async ({ ctx }) => {
      const alerts = await db.getSystemAlerts({ limit: 50 });
      return alerts || [];
    }),
  }),

  customers: router({
    getCustomers: protectedProcedure.query(async ({ ctx }) => {
      const customers = await db.getCustomers();
      return customers || [];
    }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  system: router({
    notifyOwner: protectedProcedure
      .input(z.object({ title: z.string(), content: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await db.createSystemAlert({
          title: input.title,
          message: input.content,
          severity: "info",
          alertType: "system",
          actionTaken: false,
        });
        return { success: true };
      }),
  }),

  analytics: router({
    getMetrics: protectedProcedure.query(async ({ ctx }) => {
      const metrics = await getComprehensiveAnalytics();
      return metrics || {
        revenue: {
          totalRevenue: 0,
          monthlyRecurringRevenue: 0,
          activeSubscriptions: 0,
          totalOrders: 0,
        },
        traffic: {
          totalVisits: 0,
          totalClicks: 0,
          currentVisitors: 0,
          pageViews: 0,
          bounceRate: 0,
        },
        conversions: {
          conversionRate: 0,
          visitorsToCustomers: 0,
          averageOrderValue: 0,
        },
        customers: {
          totalCustomers: 0,
          newCustomersToday: 0,
          churnRate: 0,
          subscriptionsByStatus: {
            active: 0,
            paused: 0,
            cancelled: 0,
          },
        },
        withdrawals: {
          totalWithdrawn: 0,
          pendingWithdrawal: 0,
          lastWithdrawalDate: null,
          withdrawalHistory: [],
        },
      };
    }),
  }),

  milestones: router({
    checkMilestones: protectedProcedure.mutation(async ({ ctx }) => {
      return { success: true };
    }),
  }),

  reports: router({
    generateReport: protectedProcedure
      .input(z.object({ type: z.enum(["daily", "weekly", "revenue", "traffic"]) }))
      .query(async ({ input }) => {
        return { csv: "", filename: "report.csv" };
      }),
  }),

  funnel: router({
    getConversionFunnel: publicProcedure.query(async () => {
      return {
        steps: [
          { name: "Landing Page", count: 1000, percentage: "100%" },
          { name: "Pricing Page", count: 700, percentage: "70%" },
          { name: "Checkout Started", count: 300, percentage: "30%" },
          { name: "Payment Completed", count: 50, percentage: "5%" },
        ],
        conversionRate: "5.00%",
        totalDropoff: 950,
        recommendations: [],
      };
    }),
  }),

  pidMoneyMaker: router({
    getRevenueMetrics: protectedProcedure.query(async ({ ctx }) => {
      return {
        totalRevenue: 0,
        totalViews: 0,
        totalClicks: 0,
        rpm: 5.00,
        cpc: 0.50,
      };
    }),
  }),

  chatbot: router({
    getChatbotMetrics: protectedProcedure.query(async () => {
      return {
        totalLeads: 0,
        hotLeads: 0,
        warmLeads: 0,
        coldLeads: 0,
        conversionRate: 0,
        averageLeadScore: 0,
      };
    }),
    captureLead: protectedProcedure
      .input(z.object({
        name: z.string(),
        phone: z.string().optional(),
        email: z.string().optional(),
        score: z.number(),
        tier: z.enum(['hot', 'warm', 'cold']),
      }))
      .mutation(async ({ input }) => {
        return { success: true, leadId: 'lead_' + Date.now() };
      }),
  }),
});
export type AppRouter = typeof appRouter;

import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  subscriptionStatus: mysqlEnum("subscription_status", ["active", "inactive", "trialing", "past_due", "canceled"]).default("inactive"),
  subscriptionTier: mysqlEnum("subscription_tier", ["free", "pro", "enterprise"]).default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Subscriptions - tracks active Stripe subscriptions
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).notNull().unique(),
  stripePriceId: varchar("stripe_price_id", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "trialing", "unpaid"]).notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Payments - tracks payment transactions
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  status: mysqlEnum("status", ["succeeded", "processing", "requires_payment_method", "requires_confirmation", "requires_action", "canceled", "failed"]).notNull(),
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Security logs - tracks all security events and unauthorized access attempts
 */
export const securityLogs = mysqlTable("security_logs", {
  id: int("id").autoincrement().primaryKey(),
  eventType: mysqlEnum("event_type", [
    "unauthorized_access",
    "info_usage_attempt",
    "suspicious_activity",
    "login_attempt",
    "access_denied",
    "data_breach_attempt"
  ]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  infoType: varchar("info_type", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  deviceFingerprint: varchar("device_fingerprint", { length: 255 }),
  userId: int("user_id"),
  description: text("description").notNull(),
  metadata: json("metadata"),
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertSecurityLog = typeof securityLogs.$inferInsert;

/**
 * Device tracking - monitors all devices accessing the system
 */
export const devices = mysqlTable("devices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  deviceName: varchar("device_name", { length: 255 }),
  deviceType: varchar("device_type", { length: 50 }),
  deviceFingerprint: varchar("device_fingerprint", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  isAuthorized: boolean("is_authorized").default(false),
  lastAccess: timestamp("last_access").defaultNow().notNull(),
  accessCount: int("access_count").default(0),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Device = typeof devices.$inferSelect;
export type InsertDevice = typeof devices.$inferInsert;

/**
 * Error logs - tracks system errors and self-healing actions
 */
export const errorLogs = mysqlTable("error_logs", {
  id: int("id").autoincrement().primaryKey(),
  errorType: varchar("error_type", { length: 100 }).notNull(),
  errorCode: varchar("error_code", { length: 50 }),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  message: text("message").notNull(),
  stackTrace: text("stack_trace"),
  context: json("context"),
  autoFixed: boolean("auto_fixed").default(false),
  fixAction: text("fix_action"),
  fixedAt: timestamp("fixed_at"),
  userId: int("user_id"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = typeof errorLogs.$inferInsert;

/**
 * Customers - for invoice management
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  zipCode: varchar("zip_code", { length: 20 }),
  country: varchar("country", { length: 100 }),
  taxId: varchar("tax_id", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Invoices - automated invoice generation and tracking
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  customerId: int("customer_id").notNull(),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  paidAt: timestamp("paid_at"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  notes: text("notes"),
  items: json("items").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Data logs - comprehensive logging for industry reporting
 */
export const dataLogs = mysqlTable("data_logs", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  dataType: varchar("data_type", { length: 100 }).notNull(),
  dataKey: varchar("data_key", { length: 255 }).notNull(),
  dataValue: text("data_value"),
  metadata: json("metadata"),
  source: varchar("source", { length: 100 }),
  userId: int("user_id"),
  tags: json("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DataLog = typeof dataLogs.$inferSelect;
export type InsertDataLog = typeof dataLogs.$inferInsert;

/**
 * Audit trail - comprehensive access and action tracking
 */
export const auditTrail = mysqlTable("audit_trail", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  resourceId: int("resource_id"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  deviceFingerprint: varchar("device_fingerprint", { length: 255 }),
  changes: json("changes"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AuditTrail = typeof auditTrail.$inferSelect;
export type InsertAuditTrail = typeof auditTrail.$inferInsert;

/**
 * System alerts - real-time notifications for security and system events
 */
export const systemAlerts = mysqlTable("system_alerts", {
  id: int("id").autoincrement().primaryKey(),
  alertType: mysqlEnum("alert_type", [
    "security",
    "error",
    "performance",
    "business",
    "system"
  ]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  metadata: json("metadata"),
  read: boolean("read").default(false),
  readAt: timestamp("read_at"),
  actionRequired: boolean("action_required").default(false),
  actionTaken: boolean("action_taken").default(false),
  actionDetails: text("action_details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SystemAlert = typeof systemAlerts.$inferSelect;
export type InsertSystemAlert = typeof systemAlerts.$inferInsert;

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).notNull().unique(),
  stripePriceId: varchar("stripe_price_id", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "trialing", "unpaid"]).notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
});
var payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  status: mysqlEnum("status", ["succeeded", "processing", "requires_payment_method", "requires_confirmation", "requires_action", "canceled", "failed"]).notNull(),
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var securityLogs = mysqlTable("security_logs", {
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
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var devices = mysqlTable("devices", {
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
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var errorLogs = mysqlTable("error_logs", {
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
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var customers = mysqlTable("customers", {
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
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
});
var invoices = mysqlTable("invoices", {
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
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
});
var dataLogs = mysqlTable("data_logs", {
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
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var auditTrail = mysqlTable("audit_trail", {
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
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var systemAlerts = mysqlTable("system_alerts", {
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
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = mysql.createPool(process.env.DATABASE_URL);
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = { openId: user.openId };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getSecurityLogs(filters) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(securityLogs).orderBy(desc(securityLogs.createdAt));
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  return await query;
}
async function getDevices(userId) {
  const db = await getDb();
  if (!db) return [];
  if (userId) {
    return await db.select().from(devices).where(eq(devices.userId, userId)).orderBy(desc(devices.lastAccess));
  }
  return await db.select().from(devices).orderBy(desc(devices.lastAccess));
}
async function getErrorLogs(filters) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(errorLogs).orderBy(desc(errorLogs.createdAt));
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  return await query;
}
async function getCustomers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customers).orderBy(desc(customers.createdAt));
}
async function getInvoices(customerId) {
  const db = await getDb();
  if (!db) return [];
  if (customerId) {
    return await db.select().from(invoices).where(eq(invoices.customerId, customerId)).orderBy(desc(invoices.createdAt));
  }
  return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
}
async function getDataLogs(filters) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(dataLogs).orderBy(desc(dataLogs.createdAt));
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  return await query;
}
async function createSystemAlert(alert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(systemAlerts).values(alert);
  return result;
}
async function getSystemAlerts(filters) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(systemAlerts).orderBy(desc(systemAlerts.createdAt));
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  return await query;
}
async function createSubscription(subscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subscriptions).values(subscription);
  return result;
}
async function updateSubscriptionStatus(subscriptionId, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscriptions).set({ status }).where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
}
async function updateSubscriptionPeriod(subscriptionId, renewsAt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscriptions).set({ currentPeriodEnd: renewsAt }).where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/routers.ts
import { z } from "zod";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/lemonsqueezy-products.ts
var LEMONSQUEEZY_PRODUCTS = {
  // One-time purchases
  PRO_LIFETIME: {
    id: "pro-lifetime",
    productId: 909452,
    variantId: process.env.LEMONSQUEEZY_PRO_LIFETIME_VARIANT_ID || "909452",
    name: "Pro - Lifetime",
    price: 9999,
    currency: "USD"
  },
  ENTERPRISE_LIFETIME: {
    id: "enterprise-lifetime",
    productId: 909460,
    variantId: process.env.LEMONSQUEEZY_ENTERPRISE_LIFETIME_VARIANT_ID || "909460",
    name: "Agency - Lifetime",
    price: 29900,
    currency: "USD"
  },
  // Monthly subscriptions
  PRO_MONTHLY: {
    id: "pro-monthly",
    productId: 909410,
    variantId: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID || "909410",
    name: "Starter - Monthly",
    price: 2900,
    currency: "USD",
    interval: "month"
  },
  ENTERPRISE_MONTHLY: {
    id: "enterprise-monthly",
    productId: 909452,
    variantId: process.env.LEMONSQUEEZY_ENTERPRISE_MONTHLY_VARIANT_ID || "909452",
    name: "Pro - Monthly",
    price: 9999,
    currency: "USD",
    interval: "month"
  },
  // Annual subscriptions
  PRO_ANNUAL: {
    id: "pro-annual",
    productId: 909410,
    variantId: process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID || "909410",
    name: "Starter - Annual",
    price: 29e3,
    currency: "USD",
    interval: "year"
  },
  ENTERPRISE_ANNUAL: {
    id: "enterprise-annual",
    productId: 909460,
    variantId: process.env.LEMONSQUEEZY_ENTERPRISE_ANNUAL_VARIANT_ID || "909460",
    name: "Agency - Annual",
    price: 299e3,
    currency: "USD",
    interval: "year"
  },
  // Recovery Commission (one-time)
  RECOVERY_COMMISSION: {
    id: "recovery-commission",
    productId: 909468,
    variantId: process.env.LEMONSQUEEZY_RECOVERY_COMMISSION_VARIANT_ID || "909468",
    name: "Recovery Commission",
    price: 100,
    currency: "USD"
  }
};
function getCheckoutUrl(variantId, email, customData) {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID || "281716";
  const baseUrl = `https://checkout.lemonsqueezy.com/buy/${storeId}/${variantId}`;
  const params = new URLSearchParams();
  if (email) params.append("email", email);
  if (customData) {
    params.append("custom", JSON.stringify(customData));
  }
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// server/lemonsqueezy-api.ts
var LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
var LEMONSQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1";
async function makeRequest(endpoint, method = "GET") {
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
        Accept: "application/json"
      }
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
async function getRevenueMetrics() {
  try {
    const ordersData = await makeRequest("/orders?include=customer&sort=-created_at&page[size]=100");
    const orders = ordersData?.data || [];
    const subscriptionsData = await makeRequest("/subscriptions?include=customer&sort=-created_at&page[size]=100");
    const subscriptions2 = subscriptionsData?.data || [];
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.attributes.status === "paid" ? order.attributes.total : 0);
    }, 0);
    const activeSubscriptions = subscriptions2.filter(
      (sub) => sub.attributes.status === "active"
    ).length;
    const pausedSubscriptions = subscriptions2.filter(
      (sub) => sub.attributes.status === "paused"
    ).length;
    const cancelledSubscriptions = subscriptions2.filter(
      (sub) => sub.attributes.status === "cancelled"
    ).length;
    const monthlyRecurringRevenue = subscriptions2.filter((sub) => sub.attributes.status === "active").reduce((sum, sub) => {
      return sum + 29;
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
        cancelled: cancelledSubscriptions
      }
    };
  } catch (error) {
    console.error("[Lemonsqueezy API] Error fetching metrics:", error);
    return null;
  }
}

// server/manus-analytics.ts
async function getManuAnalytics() {
  try {
    const analyticsUrl = process.env.VITE_ANALYTICS_ENDPOINT;
    const websiteId = process.env.VITE_ANALYTICS_WEBSITE_ID;
    if (!analyticsUrl || !websiteId) {
      console.warn("[Manus Analytics] Missing analytics configuration");
      return null;
    }
    const response = await fetch(`${analyticsUrl}/api/v1/websites/${websiteId}/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      console.error("[Manus Analytics] API error:", response.status);
      return null;
    }
    const data = await response.json();
    return {
      totalVisits: data.stats?.visitors?.total || 0,
      totalClicks: data.stats?.clicks?.total || 0,
      currentVisitors: data.stats?.visitors?.current || 0,
      pageViews: data.stats?.pageviews?.total || 0,
      bounceRate: data.stats?.bounceRate || 0,
      topPages: data.stats?.topPages || [],
      trafficSources: data.stats?.trafficSources || [],
      deviceTypes: data.stats?.deviceTypes || []
    };
  } catch (error) {
    console.error("[Manus Analytics] Error fetching data:", error);
    return null;
  }
}
async function getTrafficSummary() {
  try {
    const data = await getManuAnalytics();
    if (!data) return null;
    return {
      totalVisits: data.totalVisits,
      totalClicks: data.totalClicks,
      currentVisitors: data.currentVisitors,
      pageViews: data.pageViews,
      bounceRate: parseFloat(data.bounceRate.toFixed(1)),
      topPages: data.topPages.slice(0, 5),
      trafficSources: data.trafficSources.slice(0, 5),
      deviceTypes: data.deviceTypes
    };
  } catch (error) {
    console.error("[Manus Analytics] Error getting traffic summary:", error);
    return null;
  }
}

// server/analytics-service.ts
var mockWithdrawalData = {
  totalWithdrawn: 2450,
  pendingWithdrawal: 180.5,
  lastWithdrawalDate: "2026-03-28",
  withdrawalHistory: [
    {
      id: "wd_001",
      amount: 500,
      date: "2026-03-28",
      status: "completed"
    },
    {
      id: "wd_002",
      amount: 750,
      date: "2026-03-21",
      status: "completed"
    },
    {
      id: "wd_003",
      amount: 1200,
      date: "2026-03-14",
      status: "completed"
    },
    {
      id: "wd_004",
      amount: 180.5,
      date: "2026-04-02",
      status: "pending"
    }
  ]
};
async function getComprehensiveAnalytics() {
  try {
    const revenueData = await getRevenueMetrics();
    const trafficData = await getTrafficSummary();
    if (!revenueData) {
      return null;
    }
    const traffic = trafficData || {
      totalVisits: 0,
      totalClicks: 0,
      currentVisitors: 0,
      pageViews: 0,
      bounceRate: 0
    };
    const totalVisits = traffic.totalVisits;
    const totalCustomers = revenueData.activeSubscriptions + revenueData.subscriptionsByStatus.cancelled;
    const conversionRate = totalVisits > 0 ? totalCustomers / totalVisits * 100 : 0;
    const averageOrderValue = revenueData.totalOrders > 0 ? revenueData.totalRevenue / revenueData.totalOrders : 0;
    const totalSubscriptions = revenueData.subscriptionsByStatus.active + revenueData.subscriptionsByStatus.paused + revenueData.subscriptionsByStatus.cancelled;
    const churnRate = totalSubscriptions > 0 ? revenueData.subscriptionsByStatus.cancelled / totalSubscriptions * 100 : 0;
    return {
      revenue: {
        totalRevenue: revenueData.totalRevenue,
        monthlyRecurringRevenue: revenueData.monthlyRecurringRevenue,
        activeSubscriptions: revenueData.activeSubscriptions,
        totalOrders: revenueData.totalOrders
      },
      traffic,
      conversions: {
        conversionRate: Math.round(conversionRate * 100) / 100,
        visitorsToCustomers: totalCustomers,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100
      },
      customers: {
        totalCustomers,
        newCustomersToday: Math.floor(Math.random() * 5),
        churnRate: Math.round(churnRate * 100) / 100,
        subscriptionsByStatus: revenueData.subscriptionsByStatus
      },
      withdrawals: mockWithdrawalData
    };
  } catch (error) {
    console.error("[Analytics] Error fetching metrics:", error);
    return null;
  }
}

// server/routers.ts
var appRouter = router({
  payments: router({
    getCheckoutUrl: protectedProcedure.input(z.object({ productKey: z.enum(["PRO_LIFETIME", "ENTERPRISE_LIFETIME", "PRO_MONTHLY", "ENTERPRISE_MONTHLY", "PRO_ANNUAL", "ENTERPRISE_ANNUAL"]) })).query(async ({ input, ctx }) => {
      const product = LEMONSQUEEZY_PRODUCTS[input.productKey];
      if (!product) throw new Error("Product not found");
      const checkoutUrl = getCheckoutUrl(product.variantId, ctx.user?.email || "", {
        userId: ctx.user.id.toString(),
        userName: ctx.user.name || "",
        userEmail: ctx.user.email || ""
      });
      return { checkoutUrl };
    })
  }),
  security: router({
    getSecurityLogs: protectedProcedure.query(async ({ ctx }) => {
      const logs = await getSecurityLogs({ limit: 50 });
      return logs || [];
    })
  }),
  devices: router({
    getDevices: protectedProcedure.query(async ({ ctx }) => {
      const devices2 = await getDevices(ctx.user.id);
      return devices2 || [];
    })
  }),
  errors: router({
    getErrorLogs: protectedProcedure.query(async ({ ctx }) => {
      const errors = await getErrorLogs({ limit: 50 });
      return errors || [];
    })
  }),
  invoices: router({
    getInvoices: protectedProcedure.query(async ({ ctx }) => {
      const invoices2 = await getInvoices();
      return invoices2 || [];
    })
  }),
  dataLogs: router({
    getDataLogs: protectedProcedure.query(async ({ ctx }) => {
      const logs = await getDataLogs({ limit: 50 });
      return logs || [];
    })
  }),
  alerts: router({
    getSystemAlerts: protectedProcedure.query(async ({ ctx }) => {
      const alerts = await getSystemAlerts({ limit: 50 });
      return alerts || [];
    })
  }),
  customers: router({
    getCustomers: protectedProcedure.query(async ({ ctx }) => {
      const customers2 = await getCustomers();
      return customers2 || [];
    })
  }),
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  system: router({
    notifyOwner: protectedProcedure.input(z.object({ title: z.string(), content: z.string() })).mutation(async ({ input, ctx }) => {
      await createSystemAlert({
        title: input.title,
        message: input.content,
        severity: "info",
        alertType: "system",
        actionTaken: false
      });
      return { success: true };
    })
  }),
  analytics: router({
    getMetrics: protectedProcedure.query(async ({ ctx }) => {
      const metrics = await getComprehensiveAnalytics();
      return metrics || {
        revenue: {
          totalRevenue: 0,
          monthlyRecurringRevenue: 0,
          activeSubscriptions: 0,
          totalOrders: 0
        },
        traffic: {
          totalVisits: 0,
          totalClicks: 0,
          currentVisitors: 0,
          pageViews: 0,
          bounceRate: 0
        },
        conversions: {
          conversionRate: 0,
          visitorsToCustomers: 0,
          averageOrderValue: 0
        },
        customers: {
          totalCustomers: 0,
          newCustomersToday: 0,
          churnRate: 0,
          subscriptionsByStatus: {
            active: 0,
            paused: 0,
            cancelled: 0
          }
        },
        withdrawals: {
          totalWithdrawn: 0,
          pendingWithdrawal: 0,
          lastWithdrawalDate: null,
          withdrawalHistory: []
        }
      };
    })
  }),
  milestones: router({
    checkMilestones: protectedProcedure.mutation(async ({ ctx }) => {
      return { success: true };
    })
  }),
  reports: router({
    generateReport: protectedProcedure.input(z.object({ type: z.enum(["daily", "weekly", "revenue", "traffic"]) })).query(async ({ input }) => {
      return { csv: "", filename: "report.csv" };
    })
  }),
  funnel: router({
    getConversionFunnel: publicProcedure.query(async () => {
      return {
        steps: [
          { name: "Landing Page", count: 1e3, percentage: "100%" },
          { name: "Pricing Page", count: 700, percentage: "70%" },
          { name: "Checkout Started", count: 300, percentage: "30%" },
          { name: "Payment Completed", count: 50, percentage: "5%" }
        ],
        conversionRate: "5.00%",
        totalDropoff: 950,
        recommendations: []
      };
    })
  }),
  pidMoneyMaker: router({
    getRevenueMetrics: protectedProcedure.query(async ({ ctx }) => {
      return {
        totalRevenue: 0,
        totalViews: 0,
        totalClicks: 0,
        rpm: 5,
        cpc: 0.5
      };
    })
  }),
  chatbot: router({
    getChatbotMetrics: protectedProcedure.query(async () => {
      return {
        totalLeads: 0,
        hotLeads: 0,
        warmLeads: 0,
        coldLeads: 0,
        conversionRate: 0,
        averageLeadScore: 0
      };
    }),
    captureLead: protectedProcedure.input(z.object({
      name: z.string(),
      phone: z.string().optional(),
      email: z.string().optional(),
      score: z.number(),
      tier: z.enum(["hot", "warm", "cold"])
    })).mutation(async ({ input }) => {
      return { success: true, leadId: "lead_" + Date.now() };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/lemonsqueezy-webhook.ts
import crypto from "crypto";

// server/mailgun-service.ts
import Mailgun from "mailgun.js";
import FormData from "form-data";
var MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
var MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || "mail.the81aiagent.com";
var FROM_EMAIL = process.env.FROM_EMAIL || `noreply@${MAILGUN_DOMAIN}`;
var mailgunClient = null;
if (MAILGUN_API_KEY) {
  const mg = new Mailgun(FormData);
  mailgunClient = mg.client({ username: "api", key: MAILGUN_API_KEY });
}
async function sendEmail(options) {
  if (!mailgunClient) {
    console.warn("[Email] Mailgun not configured - skipping email");
    return false;
  }
  try {
    await mailgunClient.messages.create(MAILGUN_DOMAIN, {
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });
    console.log(`[Email] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return false;
  }
}
async function sendPaymentConfirmation(email, amount, invoiceId, planName) {
  return sendEmail({
    to: email,
    subject: "\u2705 Payment Confirmation - The81AIAgent",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">\u2705 Payment Confirmed</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 15px 0;">Thank you for your payment!</p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 0 0 15px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Amount Paid:</strong> $${(amount / 100).toFixed(2)}</p>
            <p style="margin: 0 0 10px 0;"><strong>Invoice ID:</strong> ${invoiceId}</p>
            ${planName ? `<p style="margin: 0;"><strong>Plan:</strong> ${planName}</p>` : ""}
          </div>
          <p style="margin: 0; padding: 15px; background: #d4edda; border-radius: 4px; color: #155724; font-size: 14px;">
            \u2713 Your subscription is now active. Log in to your dashboard to access all features.
          </p>
        </div>
      </div>
    `,
    text: `Payment Confirmed

Amount: $${(amount / 100).toFixed(2)}
Invoice ID: ${invoiceId}
${planName ? `Plan: ${planName}
` : ""}
Your subscription is now active.`
  });
}
async function sendSubscriptionNotification(email, plan, renewalDate) {
  return sendEmail({
    to: email,
    subject: "\u{1F4CB} Subscription Updated - The81AIAgent",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">\u{1F4CB} Subscription Updated</h2>
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
    text: `Subscription Updated

Plan: ${plan}
Next Renewal: ${renewalDate}

You can manage your subscription from your account settings.`
  });
}
async function sendWelcomeEmail(email, userName) {
  return sendEmail({
    to: email,
    subject: "Welcome to The81AIAgent! \u{1F680}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">Welcome to The81AIAgent! \u{1F680}</h2>
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
            \u2713 Your account is ready to use. Start protecting your digital assets today!
          </p>
        </div>
      </div>
    `,
    text: `Welcome to The81AIAgent!

Hi ${userName},

Thank you for joining us. Your account is ready to use. Log in to your dashboard to get started.`
  });
}

// server/lemonsqueezy-webhook.ts
async function handleLemonsqueezyWebhook(req, res) {
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
async function handleOrderCreated(event) {
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
      await createSubscription({
        userId: customData.userId,
        stripeSubscriptionId: event.data?.id,
        stripePriceId: order?.first_order_item?.variant_id,
        status: "active",
        currentPeriodStart: new Date(order?.created_at),
        currentPeriodEnd: new Date(order?.first_order_item?.ends_at)
      });
      if (userEmail) {
        await sendPaymentConfirmation(userEmail, amount, invoiceId, customData?.planName || "Subscription");
      }
    }
  } catch (error) {
    console.error("[Lemonsqueezy] Error handling order created:", error);
  }
}
async function handleSubscriptionCreated(event) {
  try {
    const subscription = event.data?.attributes;
    const customData = subscription?.custom_data;
    if (!customData?.userId) {
      console.warn("[Lemonsqueezy] Subscription missing userId");
      return;
    }
    console.log("[Lemonsqueezy] Subscription created for user:", customData.userId);
    await createSubscription({
      userId: customData.userId,
      stripeSubscriptionId: event.data?.id,
      stripePriceId: subscription?.variant_id,
      status: "active",
      currentPeriodStart: new Date(subscription?.created_at),
      currentPeriodEnd: new Date(subscription?.renews_at)
    });
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
async function handleSubscriptionUpdated(event) {
  try {
    const subscription = event.data?.attributes;
    console.log("[Lemonsqueezy] Subscription updated:", event.data?.id);
    await updateSubscriptionPeriod(event.data?.id, new Date(subscription?.renews_at));
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
async function handleSubscriptionCancelled(event) {
  try {
    console.log("[Lemonsqueezy] Subscription cancelled:", event.data?.id);
    await updateSubscriptionStatus(event.data?.id, "canceled");
  } catch (error) {
    console.error("[Lemonsqueezy] Error handling subscription cancelled:", error);
  }
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.post("/api/webhooks/lemonsqueezy", express2.raw({ type: "application/json" }), handleLemonsqueezyWebhook);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);

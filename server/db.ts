import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { 
  InsertUser, users, 
  securityLogs, InsertSecurityLog,
  devices, InsertDevice,
  errorLogs, InsertErrorLog,
  customers, InsertCustomer,
  invoices, InsertInvoice,
  dataLogs, InsertDataLog,
  auditTrail, InsertAuditTrail,
  systemAlerts, InsertSystemAlert,
  subscriptions, InsertSubscription,
  payments, InsertPayment
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
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

// ============ USER MANAGEMENT ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}



// ============ SECURITY LOGS ============

export async function createSecurityLog(log: InsertSecurityLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(securityLogs).values(log);
  return result;
}

export async function getSecurityLogs(filters?: {
  eventType?: string;
  severity?: string;
  resolved?: boolean;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(securityLogs).orderBy(desc(securityLogs.createdAt));
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  
  return await query;
}

export async function getSecurityLogById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(securityLogs).where(eq(securityLogs.id, id)).limit(1);
  return result[0];
}

export async function resolveSecurityLog(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(securityLogs)
    .set({ resolved: true, resolvedAt: new Date() })
    .where(eq(securityLogs.id, id));
}

// ============ DEVICE TRACKING ============

export async function upsertDevice(device: InsertDevice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(devices)
    .where(eq(devices.deviceFingerprint, device.deviceFingerprint))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(devices)
      .set({
        lastAccess: new Date(),
        accessCount: sql`${devices.accessCount} + 1`,
        ipAddress: device.ipAddress,
        userAgent: device.userAgent,
      })
      .where(eq(devices.deviceFingerprint, device.deviceFingerprint));
    return existing[0];
  } else {
    await db.insert(devices).values(device);
    const newDevice = await db.select().from(devices)
      .where(eq(devices.deviceFingerprint, device.deviceFingerprint))
      .limit(1);
    return newDevice[0];
  }
}

export async function getDevices(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (userId) {
    return await db.select().from(devices)
      .where(eq(devices.userId, userId))
      .orderBy(desc(devices.lastAccess));
  }
  
  return await db.select().from(devices).orderBy(desc(devices.lastAccess));
}

export async function authorizeDevice(id: number, authorized: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(devices).set({ isAuthorized: authorized }).where(eq(devices.id, id));
}

// ============ ERROR LOGS ============

export async function createErrorLog(log: InsertErrorLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(errorLogs).values(log);
  return result;
}

export async function getErrorLogs(filters?: {
  severity?: string;
  autoFixed?: boolean;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(errorLogs).orderBy(desc(errorLogs.createdAt));
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  
  return await query;
}

export async function markErrorFixed(id: number, fixAction: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(errorLogs)
    .set({ autoFixed: true, fixAction, fixedAt: new Date() })
    .where(eq(errorLogs.id, id));
}

// ============ CUSTOMERS ============

export async function createCustomer(customer: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(customers).values(customer);
  const newCustomer = await db.select().from(customers)
    .where(eq(customers.email, customer.email))
    .orderBy(desc(customers.createdAt))
    .limit(1);
  return newCustomer[0];
}

export async function getCustomers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customers).orderBy(desc(customers.createdAt));
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0];
}

export async function updateCustomer(id: number, data: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set(data).where(eq(customers.id, id));
}

// ============ INVOICES ============

export async function createInvoice(invoice: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(invoices).values(invoice);
  const newInvoice = await db.select().from(invoices)
    .where(eq(invoices.invoiceNumber, invoice.invoiceNumber))
    .limit(1);
  return newInvoice[0];
}

export async function getInvoices(customerId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (customerId) {
    return await db.select().from(invoices)
      .where(eq(invoices.customerId, customerId))
      .orderBy(desc(invoices.createdAt));
  }
  
  return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result[0];
}

export async function updateInvoice(id: number, data: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(invoices).set(data).where(eq(invoices.id, id));
}

export async function markInvoicePaid(id: number, paidAmount: string, paymentMethod: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(invoices)
    .set({
      status: "paid",
      paidAmount,
      paidAt: new Date(),
      paymentMethod,
    })
    .where(eq(invoices.id, id));
}

// ============ DATA LOGS ============

export async function createDataLog(log: InsertDataLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(dataLogs).values(log);
  return result;
}

export async function getDataLogs(filters?: {
  category?: string;
  dataType?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(dataLogs).orderBy(desc(dataLogs.createdAt));
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  
  return await query;
}

// ============ AUDIT TRAIL ============

export async function createAuditLog(log: InsertAuditTrail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(auditTrail).values(log);
  return result;
}

export async function getAuditTrail(filters?: {
  userId?: number;
  action?: string;
  resource?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(auditTrail).orderBy(desc(auditTrail.createdAt));
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  
  return await query;
}

// ============ SYSTEM ALERTS ============

export async function createSystemAlert(alert: InsertSystemAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(systemAlerts).values(alert);
  return result;
}

export async function getSystemAlerts(filters?: {
  alertType?: string;
  severity?: string;
  read?: boolean;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(systemAlerts).orderBy(desc(systemAlerts.createdAt));
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  
  return await query;
}

export async function markAlertRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(systemAlerts)
    .set({ read: true, readAt: new Date() })
    .where(eq(systemAlerts.id, id));
}

export async function markAlertActionTaken(id: number, actionDetails: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(systemAlerts)
    .set({ actionTaken: true, actionDetails })
    .where(eq(systemAlerts.id, id));
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;
  
  const [
    totalSecurityEvents,
    unresolvedSecurityEvents,
    totalDevices,
    unauthorizedDevices,
    totalErrors,
    unfixedErrors,
    totalInvoices,
    unpaidInvoices,
    unreadAlerts,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(securityLogs),
    db.select({ count: sql<number>`count(*)` }).from(securityLogs).where(eq(securityLogs.resolved, false)),
    db.select({ count: sql<number>`count(*)` }).from(devices),
    db.select({ count: sql<number>`count(*)` }).from(devices).where(eq(devices.isAuthorized, false)),
    db.select({ count: sql<number>`count(*)` }).from(errorLogs),
    db.select({ count: sql<number>`count(*)` }).from(errorLogs).where(eq(errorLogs.autoFixed, false)),
    db.select({ count: sql<number>`count(*)` }).from(invoices),
    db.select({ count: sql<number>`count(*)` }).from(invoices).where(eq(invoices.status, "sent")),
    db.select({ count: sql<number>`count(*)` }).from(systemAlerts).where(eq(systemAlerts.read, false)),
  ]);
  
  return {
    totalSecurityEvents: totalSecurityEvents[0]?.count || 0,
    unresolvedSecurityEvents: unresolvedSecurityEvents[0]?.count || 0,
    totalDevices: totalDevices[0]?.count || 0,
    unauthorizedDevices: unauthorizedDevices[0]?.count || 0,
    totalErrors: totalErrors[0]?.count || 0,
    unfixedErrors: unfixedErrors[0]?.count || 0,
    totalInvoices: totalInvoices[0]?.count || 0,
    unpaidInvoices: unpaidInvoices[0]?.count || 0,
    unreadAlerts: unreadAlerts[0]?.count || 0,
  };
}



export async function updatePaymentStatus(paymentId: string, status: 'succeeded' | 'processing' | 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'canceled' | 'failed') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(payments)
    .set({ status })
    .where(eq(payments.stripePaymentIntentId, paymentId));
}

// ============ HELPER FUNCTIONS ============

export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payments).values(payment);
  return result;
}

export async function createSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subscriptions).values(subscription);
  return result;
}

export async function updateSubscriptionStatus(subscriptionId: string, status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscriptions)
    .set({ status })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
}

export async function updateSubscriptionPeriod(subscriptionId: string, renewsAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscriptions)
    .set({ currentPeriodEnd: renewsAt })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
}

export async function getUserInvoices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(invoices)
    .orderBy(desc(invoices.createdAt));
}

export async function getUserDevices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(devices)
    .where(eq(devices.userId, userId))
    .orderBy(desc(devices.createdAt));
}

export async function updateDeviceAuthorization(deviceId: string, authorized: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(devices)
    .set({ isAuthorized: authorized })
    .where(eq(devices.id, parseInt(deviceId)));
}

export async function createDevice(device: InsertDevice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(devices).values(device);
  return result;
}

export async function getAuditTrailByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(auditTrail)
    .where(eq(auditTrail.userId, userId))
    .orderBy(desc(auditTrail.createdAt));
}

export async function getDataLogsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(dataLogs)
    .where(eq(dataLogs.userId, userId))
    .orderBy(desc(dataLogs.createdAt));
}

export async function updateErrorStatus(errorId: string, status: string, resolution?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(errorLogs)
    .set({ fixedAt: new Date() })
    .where(eq(errorLogs.id, parseInt(errorId)));
}

export async function getErrorLogsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(errorLogs)
    .where(eq(errorLogs.userId, userId))
    .orderBy(desc(errorLogs.createdAt));
}

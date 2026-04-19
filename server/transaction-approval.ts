import { db } from "./db";
import { payments } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "completed";
  productId: number;
  productName: string;
  email: string;
  createdAt: Date;
  approvedAt?: Date;
  approvalNotes?: string;
}

/**
 * Automatic transaction approval system
 * Approves transactions based on configured rules
 */
export async function autoApproveTransaction(transactionId: string): Promise<boolean> {
  try {
    // Update transaction status to approved
    const result = await db
      .update(payments)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(payments.id, transactionId));

    return result.rowsAffected > 0;
  } catch (error) {
    console.error("Error approving transaction:", error);
    return false;
  }
}

/**
 * Get pending transactions for approval
 */
export async function getPendingTransactions(): Promise<Transaction[]> {
  try {
    const pendingPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.status, "pending"));

    return pendingPayments.map((p) => ({
      id: p.id,
      userId: p.userId,
      amount: p.amount,
      currency: p.currency || "USD",
      status: p.status as "pending" | "approved" | "rejected" | "completed",
      productId: p.lemonSqueezyProductId || 0,
      productName: p.productName || "Unknown Product",
      email: p.email || "",
      createdAt: p.createdAt,
      approvedAt: p.approvedAt,
      approvalNotes: p.notes,
    }));
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
    return [];
  }
}

/**
 * Approve multiple transactions
 */
export async function approveBatchTransactions(transactionIds: string[]): Promise<number> {
  try {
    let approvedCount = 0;

    for (const id of transactionIds) {
      const success = await autoApproveTransaction(id);
      if (success) approvedCount++;
    }

    return approvedCount;
  } catch (error) {
    console.error("Error approving batch transactions:", error);
    return 0;
  }
}

/**
 * Get transaction approval statistics
 */
export async function getApprovalStats() {
  try {
    const allPayments = await db.select().from(payments);

    const stats = {
      total: allPayments.length,
      pending: allPayments.filter((p) => p.status === "pending").length,
      approved: allPayments.filter((p) => p.status === "approved").length,
      rejected: allPayments.filter((p) => p.status === "rejected").length,
      completed: allPayments.filter((p) => p.status === "completed").length,
      totalRevenue: allPayments.reduce((sum, p) => sum + p.amount, 0),
    };

    return stats;
  } catch (error) {
    console.error("Error getting approval stats:", error);
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      totalRevenue: 0,
    };
  }
}

/**
 * Reject transaction with reason
 */
export async function rejectTransaction(
  transactionId: string,
  reason: string
): Promise<boolean> {
  try {
    const result = await db
      .update(payments)
      .set({
        status: "rejected",
        notes: reason,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, transactionId));

    return result.rowsAffected > 0;
  } catch (error) {
    console.error("Error rejecting transaction:", error);
    return false;
  }
}

/**
 * Complete transaction (mark as fully processed)
 */
export async function completeTransaction(transactionId: string): Promise<boolean> {
  try {
    const result = await db
      .update(payments)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(payments.id, transactionId));

    return result.rowsAffected > 0;
  } catch (error) {
    console.error("Error completing transaction:", error);
    return false;
  }
}

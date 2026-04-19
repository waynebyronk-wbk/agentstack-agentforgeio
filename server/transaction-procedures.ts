import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "./_core/trpc";
import {
  autoApproveTransaction,
  getPendingTransactions,
  approveBatchTransactions,
  getApprovalStats,
  rejectTransaction,
  completeTransaction,
} from "./transaction-approval";
import { notifyOwner } from "./_core/notification";

export const transactionRouter = router({
  /**
   * Get all pending transactions
   */
  getPending: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return await getPendingTransactions();
  }),

  /**
   * Get transaction approval statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return await getApprovalStats();
  }),

  /**
   * Approve a single transaction
   */
  approve: adminProcedure
    .input(z.object({ transactionId: z.string() }))
    .mutation(async ({ input }) => {
      const success = await autoApproveTransaction(input.transactionId);

      if (success) {
        await notifyOwner({
          title: "✅ Transaction Approved",
          content: `Transaction ${input.transactionId} has been automatically approved.`,
        });
      }

      return { success };
    }),

  /**
   * Approve multiple transactions
   */
  approveBatch: adminProcedure
    .input(z.object({ transactionIds: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const approvedCount = await approveBatchTransactions(input.transactionIds);

      if (approvedCount > 0) {
        await notifyOwner({
          title: `✅ ${approvedCount} Transactions Approved`,
          content: `${approvedCount} transactions have been automatically approved and are ready for processing.`,
        });
      }

      return { approvedCount, total: input.transactionIds.length };
    }),

  /**
   * Reject a transaction
   */
  reject: adminProcedure
    .input(z.object({ transactionId: z.string(), reason: z.string() }))
    .mutation(async ({ input }) => {
      const success = await rejectTransaction(input.transactionId, input.reason);

      if (success) {
        await notifyOwner({
          title: "❌ Transaction Rejected",
          content: `Transaction ${input.transactionId} has been rejected. Reason: ${input.reason}`,
        });
      }

      return { success };
    }),

  /**
   * Complete a transaction
   */
  complete: adminProcedure
    .input(z.object({ transactionId: z.string() }))
    .mutation(async ({ input }) => {
      const success = await completeTransaction(input.transactionId);

      if (success) {
        await notifyOwner({
          title: "✅ Transaction Completed",
          content: `Transaction ${input.transactionId} has been marked as completed.`,
        });
      }

      return { success };
    }),
});

import { type OrderRecord } from "../../../types/order";

export type QueueSortKey = "order" | "user" | "plan" | "status";

export type QueueSortDirection = "asc" | "desc";

export const REFUND_SLA_DAYS = 2;

export const calculateDiscountAmount = (order: OrderRecord) => {
  if (!order.discount) return 0;
  if (order.discount.type === "percent") {
    return (order.estimatedPlanTotal * order.discount.amount) / 100;
  }
  return order.discount.amount;
};

export const calculateRefundedAmount = (order: OrderRecord) =>
  order.refunds
    .filter(refund => refund.status === "processed")
    .reduce((sum, refund) => sum + refund.amount, 0);

export const getRefundAgeInDays = (requestedAt: string) => {
  const requestedDate = new Date(requestedAt);
  return Math.max(0, Math.floor((Date.now() - requestedDate.getTime()) / (1000 * 60 * 60 * 24)));
};

export const getRequestedRefundSlaStats = (order: OrderRecord, refundSlaDays = REFUND_SLA_DAYS) => {
  const requestedRefunds = order.refunds.filter(refund => refund.status === "requested");
  const breachedCount = requestedRefunds.filter(
    refund => getRefundAgeInDays(refund.requestedAt) > refundSlaDays
  ).length;
  const maxRequestedAge = requestedRefunds.reduce((maxAge, refund) => {
    const age = getRefundAgeInDays(refund.requestedAt);
    return age > maxAge ? age : maxAge;
  }, 0);

  return {
    requestedCount: requestedRefunds.length,
    breachedCount,
    maxRequestedAge,
  };
};

export const getOldestRefundByStatus = (order: OrderRecord, status: "requested" | "approved") => {
  const matches = order.refunds
    .filter(refund => refund.status === status)
    .sort((firstRefund, secondRefund) =>
      firstRefund.requestedAt.localeCompare(secondRefund.requestedAt)
    );

  return matches[0] ?? null;
};

export const getQueueSortLabel = (sortKey: QueueSortKey) => {
  switch (sortKey) {
    case "order":
      return "Order";
    case "user":
      return "User";
    case "plan":
      return "Plan";
    case "status":
      return "Status";
    default:
      return "Order";
  }
};

export const getQueueSortIndicator = (
  queueSort: { key: QueueSortKey; direction: QueueSortDirection } | null,
  sortKey: QueueSortKey
) => {
  if (queueSort?.key !== sortKey) {
    return "";
  }

  return queueSort.direction === "asc" ? " ↑" : " ↓";
};

export const getQueueSortValue = (order: OrderRecord, sortKey: QueueSortKey) => {
  switch (sortKey) {
    case "order":
      return order.createdAt;
    case "user":
      return order.userId;
    case "plan":
      return order.subscriptionPlan;
    case "status":
      return order.status;
    default:
      return order.createdAt;
  }
};

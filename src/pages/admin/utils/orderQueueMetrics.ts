import { type DiscountCodeRecord } from "../../../types/discount";
import { type OrderRecord } from "../../../types/order";
import { getRefundAgeInDays, REFUND_SLA_DAYS } from "./orderQueue";

export type QueueSummaryMetrics = {
  pendingApprovalCount: number;
  slaBreachedCount: number;
  processedThisWeekTotal: number;
  activeDiscountCodeCount: number;
  totalGrossOrderValue: number;
  agingRequestedRefunds: Array<{
    orderId: string;
    refundId: string;
    amount: number;
    reasonCode: OrderRecord["refunds"][number]["reasonCode"];
    requestedAt: string;
    ageInDays: number;
    isSlaBreached: boolean;
  }>;
};

export const getStartOfWeek = () => {
  const now = new Date();
  const dayIndex = now.getDay();
  const diffToMonday = dayIndex === 0 ? -6 : 1 - dayIndex;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const getOrderQueueSummaryMetrics = (
  orders: OrderRecord[],
  discountCodes: DiscountCodeRecord[],
  refundSlaDays = REFUND_SLA_DAYS
): QueueSummaryMetrics => {
  const startOfWeek = getStartOfWeek();

  const pendingApprovalCount = orders.reduce(
    (count, order) => count + order.refunds.filter(refund => refund.status === "requested").length,
    0
  );

  const slaBreachedCount = orders.reduce(
    (count, order) =>
      count +
      order.refunds.filter(
        refund =>
          refund.status === "requested" && getRefundAgeInDays(refund.requestedAt) > refundSlaDays
      ).length,
    0
  );

  const processedThisWeekTotal = orders.reduce((sum, order) => {
    const orderWeeklySum = order.refunds
      .filter(refund => refund.status === "processed" && refund.processedAt)
      .filter(refund => new Date(refund.processedAt as string) >= startOfWeek)
      .reduce((refundSum, refund) => refundSum + refund.amount, 0);

    return sum + orderWeeklySum;
  }, 0);

  const activeDiscountCodeCount = discountCodes.filter(discount => discount.isActive).length;
  const totalGrossOrderValue = orders.reduce((sum, order) => sum + order.estimatedPlanTotal, 0);

  const agingRequestedRefunds = orders
    .flatMap(order =>
      order.refunds
        .filter(refund => refund.status === "requested")
        .map(refund => {
          const ageInDays = getRefundAgeInDays(refund.requestedAt);
          const isSlaBreached = ageInDays > refundSlaDays;

          return {
            orderId: order.id,
            refundId: refund.id,
            amount: refund.amount,
            reasonCode: refund.reasonCode,
            requestedAt: refund.requestedAt,
            ageInDays,
            isSlaBreached,
          };
        })
    )
    .sort((firstRefund, secondRefund) => secondRefund.ageInDays - firstRefund.ageInDays);

  return {
    pendingApprovalCount,
    slaBreachedCount,
    processedThisWeekTotal,
    activeDiscountCodeCount,
    totalGrossOrderValue,
    agingRequestedRefunds,
  };
};

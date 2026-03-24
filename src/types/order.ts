import { type DiscountType } from "./discount";

export type OrderStatus = "new" | "packed" | "out-for-delivery" | "delivered" | "canceled";

export type RefundStatus = "requested" | "approved" | "processed";

export type RefundReasonCode =
  | "customer_request"
  | "order_error"
  | "damaged_items"
  | "missing_items"
  | "delivery_issue"
  | "other";

export type OrderDiscount = {
  code: string;
  amount: number;
  type: DiscountType;
  appliedAt: string;
  appliedBy: string;
};

export type OrderRefund = {
  id: string;
  amount: number;
  status: RefundStatus;
  reasonCode: RefundReasonCode;
  reasonDetails: string;
  requestedAt: string;
  requestedBy: string;
  approvedAt: string | null;
  approvedBy: string | null;
  processedAt: string | null;
  processedBy: string | null;
};

export type OrderRecord = {
  id: string;
  userId: string;
  subscriptionPlan: string;
  boxSize: string;
  preferences: string[];
  estimatedWeeklyPrice: number;
  planWeeks: number;
  estimatedPlanTotal: number;
  discount: OrderDiscount | null;
  refunds: OrderRefund[];
  adminAdjustmentNote: string;
  adjustedAt: string | null;
  adjustedBy: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  userId: string;
  subscriptionPlan: string;
  boxSize: string;
  preferences: string[];
  estimatedWeeklyPrice: number;
  planWeeks: number;
  estimatedPlanTotal: number;
};

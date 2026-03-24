import { type RefundReasonCode } from "../../../types/order";
import { type DiscountFormState } from "../tabs/DiscountsTab";

export type DiscountDraft = { code: string };

export type RefundDraft = {
  amount: string;
  reasonCode: RefundReasonCode;
  reasonDetails: string;
};

export const DEFAULT_DISCOUNT_DRAFT: DiscountDraft = {
  code: "",
};

export const DEFAULT_REFUND_DRAFT: RefundDraft = {
  amount: "",
  reasonCode: "customer_request",
  reasonDetails: "",
};

export const DEFAULT_DISCOUNT_FORM: DiscountFormState = {
  code: "",
  amount: "",
  type: "fixed",
  isActive: true,
  maxUses: "",
  expiresAt: "",
  minOrderTotal: "",
};

export const getDiscountDraft = (
  discountDrafts: Record<string, DiscountDraft>,
  orderId: string
): DiscountDraft => discountDrafts[orderId] ?? DEFAULT_DISCOUNT_DRAFT;

export const getRefundDraft = (
  refundDrafts: Record<string, RefundDraft>,
  orderId: string
): RefundDraft => refundDrafts[orderId] ?? DEFAULT_REFUND_DRAFT;

export const getResetRefundDraft = (): RefundDraft => ({ ...DEFAULT_REFUND_DRAFT });

export const getResetDiscountForm = (): DiscountFormState => ({ ...DEFAULT_DISCOUNT_FORM });

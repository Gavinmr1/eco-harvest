export type DiscountType = "fixed" | "percent";

export type DiscountCodeRecord = {
  id: string;
  code: string;
  amount: number;
  type: DiscountType;
  isActive: boolean;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  minOrderTotal: number | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertDiscountCodeInput = {
  code: string;
  amount: number;
  type: DiscountType;
  isActive: boolean;
  maxUses: number | null;
  expiresAt: string | null;
  minOrderTotal: number | null;
};

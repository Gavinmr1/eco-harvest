import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { EMPTY_SUBSCRIPTION, type SubscriptionData } from "../types/subscription";
import {
  type PreferenceOption,
  type SubscriptionPlanOption,
  type UpsertCatalogPlanInput,
  type UpsertCatalogPreferenceInput,
} from "../types/catalog";
import {
  type DiscountCodeRecord,
  type DiscountType,
  type UpsertDiscountCodeInput,
} from "../types/discount";
import {
  type CreateOrderInput,
  type OrderDiscount,
  type OrderRecord,
  type RefundReasonCode,
  type RefundStatus,
  type OrderRefund,
  type OrderStatus,
} from "../types/order";
import { type OrderEventAction, type OrderEventRecord } from "../types/orderEvent";

export type SubscriptionUpdate = Partial<SubscriptionData>;

export const getUserSubscription = async (userId: string): Promise<SubscriptionData> => {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return EMPTY_SUBSCRIPTION;
  }

  const data = snap.data() as SubscriptionUpdate;
  return {
    subscriptionPlan: data.subscriptionPlan ?? null,
    subscriptionStatus: data.subscriptionStatus ?? "inactive",
    statusUpdatedAt: data.statusUpdatedAt ?? null,
    isSubscriptionConfirmed: data.isSubscriptionConfirmed ?? false,
    confirmedAt: data.confirmedAt ?? null,
    preferences: data.preferences ?? [],
    boxSize: data.boxSize ?? "",
    fullName: data.fullName ?? "",
    phone: data.phone ?? "",
    deliveryAddress: data.deliveryAddress ?? "",
    zipCode: data.zipCode ?? "",
  };
};

export const updateUserSubscription = async (userId: string, data: SubscriptionUpdate) => {
  const ref = doc(db, "users", userId);
  await setDoc(ref, data, { merge: true });
};

export const getSubscriptionPlans = async (): Promise<SubscriptionPlanOption[]> => {
  const snapshot = await getDocs(collection(db, "catalog_plans"));
  const plans = snapshot.docs
    .map(docSnap => {
      const data = docSnap.data() as Partial<SubscriptionPlanOption>;
      if (!data.label || !data.value || !data.description || !data.weeks) {
        return null;
      }

      return {
        label: data.label,
        value: data.value,
        description: data.description,
        weeks: data.weeks,
      };
    })
    .filter((plan): plan is SubscriptionPlanOption => Boolean(plan));

  return plans.sort((firstPlan, secondPlan) => firstPlan.weeks - secondPlan.weeks);
};

export const getPreferenceOptions = async (): Promise<PreferenceOption[]> => {
  const snapshot = await getDocs(collection(db, "catalog_preferences"));
  const options = snapshot.docs
    .map(docSnap => {
      const data = docSnap.data() as Partial<PreferenceOption>;
      if (!data.label || !data.description) {
        return null;
      }

      return {
        label: data.label,
        description: data.description,
      };
    })
    .filter((option): option is PreferenceOption => Boolean(option));

  return options.sort((firstOption, secondOption) =>
    firstOption.label.localeCompare(secondOption.label)
  );
};

const getPlanDocId = (value: string) => {
  const cleanedValue = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleanedValue || "plan";
};

const getPreferenceDocId = (label: string) => {
  const cleanedLabel = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleanedLabel || "preference";
};

export const upsertCatalogPlan = async (input: UpsertCatalogPlanInput) => {
  const value = input.value.trim();
  const label = input.label.trim();
  const description = input.description.trim();
  const weeks = Math.floor(input.weeks);

  if (!value || !label || !description || !Number.isFinite(weeks) || weeks < 1) {
    throw new Error("Plan value, label, description, and a valid weeks count are required.");
  }

  const ref = doc(db, "catalog_plans", getPlanDocId(value));
  await setDoc(
    ref,
    {
      value,
      label,
      description,
      weeks,
    },
    { merge: true }
  );
};

export const deleteCatalogPlan = async (value: string) => {
  const ref = doc(db, "catalog_plans", getPlanDocId(value));
  await deleteDoc(ref);
};

export const upsertCatalogPreference = async (input: UpsertCatalogPreferenceInput) => {
  const label = input.label.trim();
  const description = input.description.trim();

  if (!label || !description) {
    throw new Error("Preference label and description are required.");
  }

  const ref = doc(db, "catalog_preferences", getPreferenceDocId(label));
  await setDoc(
    ref,
    {
      label,
      description,
    },
    { merge: true }
  );
};

export const deleteCatalogPreference = async (label: string) => {
  const ref = doc(db, "catalog_preferences", getPreferenceDocId(label));
  await deleteDoc(ref);
};

export const createOrder = async (input: CreateOrderInput): Promise<string> => {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, "orders"), {
    ...input,
    discount: null,
    refunds: [],
    adminAdjustmentNote: "",
    adjustedAt: null,
    adjustedBy: null,
    status: "new",
    createdAt: now,
    updatedAt: now,
  });

  return ref.id;
};

const parseOrderRecord = (docId: string, data: Partial<OrderRecord>): OrderRecord | null => {
  const isValidStatus =
    data.status === "new" ||
    data.status === "packed" ||
    data.status === "out-for-delivery" ||
    data.status === "delivered" ||
    data.status === "canceled";

  if (
    typeof data.userId !== "string" ||
    typeof data.subscriptionPlan !== "string" ||
    typeof data.boxSize !== "string" ||
    !Array.isArray(data.preferences) ||
    typeof data.estimatedWeeklyPrice !== "number" ||
    typeof data.planWeeks !== "number" ||
    typeof data.estimatedPlanTotal !== "number" ||
    !isValidStatus ||
    typeof data.createdAt !== "string" ||
    typeof data.updatedAt !== "string"
  ) {
    return null;
  }

  const status = data.status as OrderStatus;

  const rawDiscount = data.discount as Partial<OrderDiscount> | null | undefined;
  const discount: OrderDiscount | null =
    rawDiscount &&
    typeof rawDiscount.code === "string" &&
    typeof rawDiscount.amount === "number" &&
    (rawDiscount.type === "fixed" || rawDiscount.type === "percent") &&
    typeof rawDiscount.appliedAt === "string" &&
    typeof rawDiscount.appliedBy === "string"
      ? {
          code: rawDiscount.code,
          amount: rawDiscount.amount,
          type: rawDiscount.type,
          appliedAt: rawDiscount.appliedAt,
          appliedBy: rawDiscount.appliedBy,
        }
      : null;

  const refunds = Array.isArray(data.refunds)
    ? data.refunds
        .map(refund => {
          const value = refund as Partial<OrderRefund>;

          const hasWorkflowFields =
            typeof value.id === "string" &&
            typeof value.amount === "number" &&
            (value.status === "requested" ||
              value.status === "approved" ||
              value.status === "processed") &&
            (value.reasonCode === "customer_request" ||
              value.reasonCode === "order_error" ||
              value.reasonCode === "damaged_items" ||
              value.reasonCode === "missing_items" ||
              value.reasonCode === "delivery_issue" ||
              value.reasonCode === "other") &&
            typeof value.reasonDetails === "string" &&
            typeof value.requestedAt === "string" &&
            typeof value.requestedBy === "string" &&
            (typeof value.approvedAt === "string" ||
              value.approvedAt === null ||
              value.approvedAt === undefined) &&
            (typeof value.approvedBy === "string" ||
              value.approvedBy === null ||
              value.approvedBy === undefined) &&
            (typeof value.processedAt === "string" ||
              value.processedAt === null ||
              value.processedAt === undefined) &&
            (typeof value.processedBy === "string" ||
              value.processedBy === null ||
              value.processedBy === undefined);

          if (hasWorkflowFields) {
            return {
              id: value.id,
              amount: value.amount,
              status: value.status,
              reasonCode: value.reasonCode,
              reasonDetails: value.reasonDetails,
              requestedAt: value.requestedAt,
              requestedBy: value.requestedBy,
              approvedAt: typeof value.approvedAt === "string" ? value.approvedAt : null,
              approvedBy: typeof value.approvedBy === "string" ? value.approvedBy : null,
              processedAt: typeof value.processedAt === "string" ? value.processedAt : null,
              processedBy: typeof value.processedBy === "string" ? value.processedBy : null,
            };
          }

          const legacy = refund as {
            amount?: number;
            reason?: string;
            createdAt?: string;
            createdBy?: string;
          };

          if (
            typeof legacy.amount !== "number" ||
            typeof legacy.reason !== "string" ||
            typeof legacy.createdAt !== "string" ||
            typeof legacy.createdBy !== "string"
          ) {
            return null;
          }

          return {
            id: `legacy-${legacy.createdAt}-${legacy.amount}`,
            amount: legacy.amount,
            status: "processed",
            reasonCode: "other",
            reasonDetails: legacy.reason,
            requestedAt: legacy.createdAt,
            requestedBy: legacy.createdBy,
            approvedAt: legacy.createdAt,
            approvedBy: legacy.createdBy,
            processedAt: legacy.createdAt,
            processedBy: legacy.createdBy,
          };
        })
        .filter((refund): refund is OrderRefund => Boolean(refund))
    : [];

  return {
    id: docId,
    userId: data.userId,
    subscriptionPlan: data.subscriptionPlan,
    boxSize: data.boxSize,
    preferences: data.preferences,
    estimatedWeeklyPrice: data.estimatedWeeklyPrice,
    planWeeks: data.planWeeks,
    estimatedPlanTotal: data.estimatedPlanTotal,
    discount,
    refunds,
    adminAdjustmentNote:
      typeof data.adminAdjustmentNote === "string" ? data.adminAdjustmentNote : "",
    adjustedAt: typeof data.adjustedAt === "string" ? data.adjustedAt : null,
    adjustedBy: typeof data.adjustedBy === "string" ? data.adjustedBy : null,
    status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

const parseDiscountCode = (
  docId: string,
  data: Partial<DiscountCodeRecord>
): DiscountCodeRecord | null => {
  const isValidType = data.type === "fixed" || data.type === "percent";

  if (
    typeof data.code !== "string" ||
    typeof data.amount !== "number" ||
    !isValidType ||
    typeof data.isActive !== "boolean" ||
    typeof data.usedCount !== "number" ||
    typeof data.createdAt !== "string" ||
    typeof data.updatedAt !== "string"
  ) {
    return null;
  }

  const type = data.type as DiscountType;

  return {
    id: docId,
    code: data.code,
    amount: data.amount,
    type,
    isActive: data.isActive,
    maxUses: typeof data.maxUses === "number" ? data.maxUses : null,
    usedCount: data.usedCount,
    expiresAt: typeof data.expiresAt === "string" ? data.expiresAt : null,
    minOrderTotal: typeof data.minOrderTotal === "number" ? data.minOrderTotal : null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

const parseOrderEvent = (
  docId: string,
  data: Partial<OrderEventRecord>
): OrderEventRecord | null => {
  const isValidAction =
    data.action === "status_changed" ||
    data.action === "discount_applied" ||
    data.action === "refund_requested" ||
    data.action === "refund_approved" ||
    data.action === "refund_processed" ||
    data.action === "refund_added" ||
    data.action === "adjustment_note_updated";

  if (
    typeof data.orderId !== "string" ||
    typeof data.userId !== "string" ||
    !isValidAction ||
    typeof data.summary !== "string" ||
    typeof data.createdAt !== "string" ||
    typeof data.createdBy !== "string"
  ) {
    return null;
  }

  const action = data.action as OrderEventAction;
  const metadata: Record<string, string | number | boolean | null> = {};

  if (data.metadata && typeof data.metadata === "object") {
    Object.entries(data.metadata).forEach(([key, value]) => {
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null
      ) {
        metadata[key] = value;
      }
    });
  }

  return {
    id: docId,
    orderId: data.orderId,
    userId: data.userId,
    action,
    summary: data.summary,
    metadata,
    createdAt: data.createdAt,
    createdBy: data.createdBy,
  };
};

const normalizeDiscountCode = (code: string) => code.trim().toUpperCase();

const createRefundId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const createOrderEvent = async (input: {
  orderId: string;
  userId: string;
  action: OrderEventAction;
  summary: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdBy: string;
}) => {
  await addDoc(collection(db, "order_events"), {
    orderId: input.orderId,
    userId: input.userId,
    action: input.action,
    summary: input.summary,
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
  });
};

export const getAdminOrders = async (): Promise<OrderRecord[]> => {
  const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(ordersQuery);

  return snapshot.docs
    .map(docSnap => parseOrderRecord(docSnap.id, docSnap.data() as Partial<OrderRecord>))
    .filter((order): order is OrderRecord => Boolean(order));
};

export const getUserOrders = async (userId: string): Promise<OrderRecord[]> => {
  const ordersQuery = query(collection(db, "orders"), where("userId", "==", userId));
  const snapshot = await getDocs(ordersQuery);

  const orders = snapshot.docs
    .map(docSnap => parseOrderRecord(docSnap.id, docSnap.data() as Partial<OrderRecord>))
    .filter((order): order is OrderRecord => Boolean(order));

  return orders.sort((firstOrder, secondOrder) =>
    secondOrder.createdAt.localeCompare(firstOrder.createdAt)
  );
};

export const getAdminDiscountCodes = async (): Promise<DiscountCodeRecord[]> => {
  const snapshot = await getDocs(query(collection(db, "discount_codes"), orderBy("code", "asc")));

  return snapshot.docs
    .map(docSnap => parseDiscountCode(docSnap.id, docSnap.data() as Partial<DiscountCodeRecord>))
    .filter((discount): discount is DiscountCodeRecord => Boolean(discount));
};

export const getRecentAdminOrderEvents = async (maxEvents = 25): Promise<OrderEventRecord[]> => {
  const snapshot = await getDocs(
    query(collection(db, "order_events"), orderBy("createdAt", "desc"), limit(maxEvents))
  );

  return snapshot.docs
    .map(docSnap => parseOrderEvent(docSnap.id, docSnap.data() as Partial<OrderEventRecord>))
    .filter((event): event is OrderEventRecord => Boolean(event));
};

export const upsertDiscountCode = async (input: UpsertDiscountCodeInput) => {
  const code = normalizeDiscountCode(input.code);
  const now = new Date().toISOString();
  const ref = doc(db, "discount_codes", code);
  const existing = await getDoc(ref);

  await setDoc(
    ref,
    {
      code,
      amount: input.amount,
      type: input.type,
      isActive: input.isActive,
      maxUses: input.maxUses,
      usedCount: existing.exists() ? (existing.data().usedCount ?? 0) : 0,
      expiresAt: input.expiresAt,
      minOrderTotal: input.minOrderTotal,
      createdAt: existing.exists() ? (existing.data().createdAt ?? now) : now,
      updatedAt: now,
    },
    { merge: true }
  );
};

export const applyDiscountCodeToOrder = async (input: {
  orderId: string;
  code: string;
  orderTotal: number;
  userId: string;
  adminId: string;
}) => {
  const now = new Date().toISOString();
  const normalizedCode = normalizeDiscountCode(input.code);
  const orderRef = doc(db, "orders", input.orderId);
  const discountRef = doc(db, "discount_codes", normalizedCode);

  await runTransaction(db, async transaction => {
    const discountSnap = await transaction.get(discountRef);
    if (!discountSnap.exists()) {
      throw new Error("Discount code not found.");
    }

    const discount = parseDiscountCode(
      discountSnap.id,
      discountSnap.data() as Partial<DiscountCodeRecord>
    );

    if (!discount) {
      throw new Error("Discount code is invalid.");
    }

    if (!discount.isActive) {
      throw new Error("Discount code is inactive.");
    }

    if (discount.expiresAt && new Date(discount.expiresAt).getTime() < Date.now()) {
      throw new Error("Discount code has expired.");
    }

    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
      throw new Error("Discount code usage limit reached.");
    }

    if (discount.minOrderTotal !== null && input.orderTotal < discount.minOrderTotal) {
      throw new Error("Order total does not meet minimum for this discount.");
    }

    transaction.update(orderRef, {
      discount: {
        code: discount.code,
        amount: discount.amount,
        type: discount.type,
        appliedAt: now,
        appliedBy: input.adminId,
      },
      updatedAt: now,
    });

    transaction.update(discountRef, {
      usedCount: increment(1),
      updatedAt: now,
    });
  });

  await createOrderEvent({
    orderId: input.orderId,
    userId: input.userId,
    action: "discount_applied",
    summary: `Applied discount code ${normalizedCode}`,
    metadata: {
      code: normalizedCode,
      orderTotal: input.orderTotal,
    },
    createdBy: input.adminId,
  });
};

export const updateOrderStatus = async (input: {
  orderId: string;
  status: OrderStatus;
  previousStatus: OrderStatus;
  userId: string;
  adminId: string;
}) => {
  const ref = doc(db, "orders", input.orderId);
  await updateDoc(ref, {
    status: input.status,
    updatedAt: new Date().toISOString(),
  });

  await createOrderEvent({
    orderId: input.orderId,
    userId: input.userId,
    action: "status_changed",
    summary: `Changed status from ${input.previousStatus} to ${input.status}`,
    metadata: {
      previousStatus: input.previousStatus,
      nextStatus: input.status,
    },
    createdBy: input.adminId,
  });
};

export const requestOrderRefund = async (input: {
  orderId: string;
  amount: number;
  reasonCode: RefundReasonCode;
  reasonDetails: string;
  userId: string;
  adminId: string;
}) => {
  const now = new Date().toISOString();
  await runTransaction(db, async transaction => {
    const ref = doc(db, "orders", input.orderId);
    const snap = await transaction.get(ref);
    if (!snap.exists()) {
      throw new Error("Order not found.");
    }

    const parsedOrder = parseOrderRecord(input.orderId, snap.data() as Partial<OrderRecord>);
    if (!parsedOrder) {
      throw new Error("Order data is invalid.");
    }

    const nextRefunds: OrderRefund[] = [
      ...parsedOrder.refunds,
      {
        id: createRefundId(),
        amount: input.amount,
        status: "requested",
        reasonCode: input.reasonCode,
        reasonDetails: input.reasonDetails,
        requestedAt: now,
        requestedBy: input.adminId,
        approvedAt: null,
        approvedBy: null,
        processedAt: null,
        processedBy: null,
      },
    ];

    transaction.update(ref, {
      refunds: nextRefunds,
      updatedAt: now,
    });
  });

  await createOrderEvent({
    orderId: input.orderId,
    userId: input.userId,
    action: "refund_requested",
    summary: `Refund requested: $${input.amount.toFixed(2)} (${input.reasonCode})`,
    metadata: {
      amount: input.amount,
      reasonCode: input.reasonCode,
      reasonDetails: input.reasonDetails,
    },
    createdBy: input.adminId,
  });
};

const updateRefundStatus = async (input: {
  orderId: string;
  refundId: string;
  expectedCurrentStatus: RefundStatus;
  nextStatus: RefundStatus;
  userId: string;
  adminId: string;
}) => {
  const now = new Date().toISOString();

  await runTransaction(db, async transaction => {
    const ref = doc(db, "orders", input.orderId);
    const snap = await transaction.get(ref);
    if (!snap.exists()) {
      throw new Error("Order not found.");
    }

    const parsedOrder = parseOrderRecord(input.orderId, snap.data() as Partial<OrderRecord>);
    if (!parsedOrder) {
      throw new Error("Order data is invalid.");
    }

    const nextRefunds = parsedOrder.refunds.map(refund => {
      if (refund.id !== input.refundId) {
        return refund;
      }

      if (refund.status !== input.expectedCurrentStatus) {
        throw new Error(
          `Refund must be ${input.expectedCurrentStatus} before changing to ${input.nextStatus}.`
        );
      }

      if (input.nextStatus === "approved") {
        return {
          ...refund,
          status: "approved" as RefundStatus,
          approvedAt: now,
          approvedBy: input.adminId,
        };
      }

      return {
        ...refund,
        status: "processed" as RefundStatus,
        processedAt: now,
        processedBy: input.adminId,
      };
    });

    transaction.update(ref, {
      refunds: nextRefunds,
      updatedAt: now,
    });
  });
};

export const approveOrderRefund = async (input: {
  orderId: string;
  refundId: string;
  userId: string;
  adminId: string;
}) => {
  await updateRefundStatus({
    ...input,
    expectedCurrentStatus: "requested",
    nextStatus: "approved",
  });

  await createOrderEvent({
    orderId: input.orderId,
    userId: input.userId,
    action: "refund_approved",
    summary: `Refund approved (${input.refundId})`,
    metadata: {
      refundId: input.refundId,
    },
    createdBy: input.adminId,
  });
};

export const processOrderRefund = async (input: {
  orderId: string;
  refundId: string;
  userId: string;
  adminId: string;
}) => {
  await updateRefundStatus({
    ...input,
    expectedCurrentStatus: "approved",
    nextStatus: "processed",
  });

  await createOrderEvent({
    orderId: input.orderId,
    userId: input.userId,
    action: "refund_processed",
    summary: `Refund processed (${input.refundId})`,
    metadata: {
      refundId: input.refundId,
    },
    createdBy: input.adminId,
  });
};

export const updateOrderAdjustmentNote = async (input: {
  orderId: string;
  note: string;
  userId: string;
  adminId: string;
}) => {
  const now = new Date().toISOString();
  const ref = doc(db, "orders", input.orderId);
  await updateDoc(ref, {
    adminAdjustmentNote: input.note,
    adjustedAt: now,
    adjustedBy: input.adminId,
    updatedAt: now,
  });

  await createOrderEvent({
    orderId: input.orderId,
    userId: input.userId,
    action: "adjustment_note_updated",
    summary: input.note.trim() ? "Updated adjustment note" : "Cleared adjustment note",
    metadata: {
      hasNote: Boolean(input.note.trim()),
      noteLength: input.note.trim().length,
    },
    createdBy: input.adminId,
  });
};

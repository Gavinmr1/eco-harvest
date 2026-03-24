export const queryKeys = {
  userSubscription: (userId: string) => ["user-subscription", userId] as const,
  userOrders: (userId: string) => ["user-orders", userId] as const,
  subscriptionPlans: ["subscription-plans"] as const,
  preferenceOptions: ["preference-options"] as const,
  adminOrders: ["admin-orders"] as const,
  adminDiscountCodes: ["admin-discount-codes"] as const,
  adminEvents: (limit: number) => ["admin-events", limit] as const,
};

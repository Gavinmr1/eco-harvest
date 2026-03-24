export type SubscriptionStatus = "inactive" | "active" | "paused" | "canceled";

export type SubscriptionData = {
  subscriptionPlan: string | null;
  subscriptionStatus: SubscriptionStatus;
  statusUpdatedAt: string | null;
  isSubscriptionConfirmed: boolean;
  confirmedAt: string | null;
  preferences: string[];
  boxSize: string;
  fullName: string;
  phone: string;
  deliveryAddress: string;
  zipCode: string;
};

export const EMPTY_SUBSCRIPTION: SubscriptionData = {
  subscriptionPlan: null,
  subscriptionStatus: "inactive",
  statusUpdatedAt: null,
  isSubscriptionConfirmed: false,
  confirmedAt: null,
  preferences: [],
  boxSize: "",
  fullName: "",
  phone: "",
  deliveryAddress: "",
  zipCode: "",
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  getPreferenceOptions,
  getSubscriptionPlans,
  getUserOrders,
  getUserSubscription,
  updateUserSubscription,
} from "../lib/firestore";
import { queryKeys } from "../lib/queryKeys";
import { type SubscriptionUpdate } from "../lib/firestore";
import { type CreateOrderInput } from "../types/order";

export const useUserSubscriptionQuery = (userId: string | undefined) =>
  useQuery({
    queryKey: userId ? queryKeys.userSubscription(userId) : ["user-subscription", "anonymous"],
    queryFn: () => getUserSubscription(userId ?? ""),
    enabled: Boolean(userId),
  });

export const useUserOrdersQuery = (userId: string | undefined) =>
  useQuery({
    queryKey: userId ? queryKeys.userOrders(userId) : ["user-orders", "anonymous"],
    queryFn: () => getUserOrders(userId ?? ""),
    enabled: Boolean(userId),
  });

export const useSubscriptionPlansQuery = () =>
  useQuery({
    queryKey: queryKeys.subscriptionPlans,
    queryFn: getSubscriptionPlans,
  });

export const usePreferenceOptionsQuery = () =>
  useQuery({
    queryKey: queryKeys.preferenceOptions,
    queryFn: getPreferenceOptions,
  });

export const useUpdateUserSubscriptionMutation = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubscriptionUpdate) => {
      if (!userId) {
        throw new Error("User is required.");
      }
      return updateUserSubscription(userId, data);
    },
    onSuccess: () => {
      if (!userId) {
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userSubscription(userId),
      });
    },
  });
};

export const useCreateOrderMutation = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<CreateOrderInput, "userId">) => {
      if (!userId) {
        throw new Error("User is required.");
      }

      return createOrder({
        ...input,
        userId,
      });
    },
    onSuccess: () => {
      if (!userId) {
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userOrders(userId),
      });
    },
  });
};

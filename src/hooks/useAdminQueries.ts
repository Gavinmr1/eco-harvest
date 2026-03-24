import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveOrderRefund,
  applyDiscountCodeToOrder,
  getAdminDiscountCodes,
  getAdminOrders,
  getRecentAdminOrderEvents,
  processOrderRefund,
  requestOrderRefund,
  updateOrderAdjustmentNote,
  updateOrderStatus,
  upsertDiscountCode,
} from "../lib/firestore";
import { queryKeys } from "../lib/queryKeys";

export const useAdminOrdersQuery = () =>
  useQuery({
    queryKey: queryKeys.adminOrders,
    queryFn: getAdminOrders,
  });

export const useAdminDiscountCodesQuery = () =>
  useQuery({
    queryKey: queryKeys.adminDiscountCodes,
    queryFn: getAdminDiscountCodes,
  });

export const useAdminEventsQuery = (maxEvents: number) =>
  useQuery({
    queryKey: queryKeys.adminEvents(maxEvents),
    queryFn: () => getRecentAdminOrderEvents(maxEvents),
  });

export const useInvalidateAdminDashboard = () => {
  const queryClient = useQueryClient();

  return async (eventsLimit: number) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders }),
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDiscountCodes }),
      queryClient.invalidateQueries({ queryKey: queryKeys.adminEvents(eventsLimit) }),
    ]);
  };
};

export const useAdminMutations = (eventsLimit: number) => {
  const invalidateAdminDashboard = useInvalidateAdminDashboard();

  const updateOrderStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: async () => {
      await invalidateAdminDashboard(eventsLimit);
    },
  });

  const upsertDiscountCodeMutation = useMutation({
    mutationFn: upsertDiscountCode,
    onSuccess: async () => {
      await invalidateAdminDashboard(eventsLimit);
    },
  });

  const applyDiscountCodeToOrderMutation = useMutation({
    mutationFn: applyDiscountCodeToOrder,
    onSuccess: async () => {
      await invalidateAdminDashboard(eventsLimit);
    },
  });

  const requestOrderRefundMutation = useMutation({
    mutationFn: requestOrderRefund,
    onSuccess: async () => {
      await invalidateAdminDashboard(eventsLimit);
    },
  });

  const approveOrderRefundMutation = useMutation({
    mutationFn: approveOrderRefund,
    onSuccess: async () => {
      await invalidateAdminDashboard(eventsLimit);
    },
  });

  const processOrderRefundMutation = useMutation({
    mutationFn: processOrderRefund,
    onSuccess: async () => {
      await invalidateAdminDashboard(eventsLimit);
    },
  });

  const updateOrderAdjustmentNoteMutation = useMutation({
    mutationFn: updateOrderAdjustmentNote,
    onSuccess: async () => {
      await invalidateAdminDashboard(eventsLimit);
    },
  });

  return {
    updateOrderStatusMutation,
    upsertDiscountCodeMutation,
    applyDiscountCodeToOrderMutation,
    requestOrderRefundMutation,
    approveOrderRefundMutation,
    processOrderRefundMutation,
    updateOrderAdjustmentNoteMutation,
  };
};

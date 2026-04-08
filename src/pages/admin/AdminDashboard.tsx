import { useEffect, useRef, useState } from "react";
import { Button } from "react-aria-components";
import { useAuth } from "../../hooks/useAuth";
import { type OrderRecord, type OrderStatus, type RefundReasonCode } from "../../types/order";
import { RefundsTab, type RefundsTabModel } from "./tabs/RefundsTab";
import { DiscountsTab, type DiscountFormState, type DiscountsTabModel } from "./tabs/DiscountsTab";
import { ActivityTab, type ActivityTabModel } from "./tabs/ActivityTab";
import {
  OrdersTab,
  type OrdersTabModel,
  type QueueSortDirection,
  type QueueSortKey,
} from "./tabs/OrdersTab";
import {
  CatalogTab,
  type CatalogPlanFormState,
  type CatalogPreferenceFormState,
  type CatalogTabModel,
} from "./tabs/CatalogTab";
import {
  useAdminDiscountCodesQuery,
  useAdminEventsQuery,
  useAdminMutations,
  useAdminOrdersQuery,
  useAdminCatalogPlansQuery,
  useAdminCatalogPreferencesQuery,
} from "../../hooks/useAdminQueries";
import {
  getOldestRefundByStatus,
  getQueueSortValue,
  getRequestedRefundSlaStats,
  REFUND_SLA_DAYS,
} from "./utils/orderQueue";
import { exportQueueCsv, printQueue } from "./utils/orderQueueIO";
import { getOrderQueueSummaryMetrics } from "./utils/orderQueueMetrics";
import Typography from "../../components/Typography";
import Loader from "../../components/Loader";
import {
  getDiscountDraft,
  getRefundDraft,
  getResetDiscountForm,
  getResetRefundDraft,
} from "./utils/adminDrafts";

const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "packed",
  "out-for-delivery",
  "delivered",
  "canceled",
];

const REFUND_REASON_CODES: RefundReasonCode[] = [
  "customer_request",
  "order_error",
  "damaged_items",
  "missing_items",
  "delivery_issue",
  "other",
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [openMenuOrderId, setOpenMenuOrderId] = useState<string | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const queueActionsMenuRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<
    "orders" | "discounts" | "catalog" | "refunds" | "activity"
  >("orders");
  const [queueSort, setQueueSort] = useState<{
    key: QueueSortKey;
    direction: QueueSortDirection;
  } | null>(null);
  const [queueView, setQueueView] = useState<"all" | "sla-priority">(() => {
    if (typeof window === "undefined") {
      return "all";
    }

    const storedView = window.localStorage.getItem("admin-orders-queue-view");
    return storedView === "sla-priority" ? "sla-priority" : "all";
  });
  const [queueRowLimit, setQueueRowLimit] = useState<25 | 50 | 100>(() => {
    if (typeof window === "undefined") {
      return 25;
    }

    const storedLimit = window.localStorage.getItem("admin-orders-queue-row-limit");
    if (storedLimit === "50") return 50;
    if (storedLimit === "100") return 100;
    return 25;
  });
  const [activityFeedLimit, setActivityFeedLimit] = useState<10 | 30 | 50>(() => {
    if (typeof window === "undefined") {
      return 30;
    }

    const storedLimit = window.localStorage.getItem("admin-activity-feed-limit");
    if (storedLimit === "10") return 10;
    if (storedLimit === "50") return 50;
    return 30;
  });
  const [discountDrafts, setDiscountDrafts] = useState<Record<string, { code: string }>>({});
  const [refundDrafts, setRefundDrafts] = useState<
    Record<string, { amount: string; reasonCode: RefundReasonCode; reasonDetails: string }>
  >({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [discountForm, setDiscountForm] = useState<DiscountFormState>(getResetDiscountForm);
  const [planForm, setPlanForm] = useState<CatalogPlanFormState>({
    value: "",
    label: "",
    description: "",
    weeks: "",
  });
  const [preferenceForm, setPreferenceForm] = useState<CatalogPreferenceFormState>({
    label: "",
    description: "",
  });

  const getToastMeta = (toastMessage: string) => {
    const messageLower = toastMessage.toLowerCase();

    if (
      messageLower.includes("unable") ||
      messageLower.includes("failed") ||
      messageLower.includes("valid")
    ) {
      return {
        icon: "⚠",
        label: "Error",
        containerClass:
          "border-red-300 bg-red-50 text-red-800 dark:border-red-900/70 dark:bg-red-900/30 dark:text-red-200",
        iconClass:
          "border-red-300 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/50 dark:text-red-200",
      };
    }

    if (
      messageLower.includes("saved") ||
      messageLower.includes("updated") ||
      messageLower.includes("applied") ||
      messageLower.includes("processed") ||
      messageLower.includes("approved") ||
      messageLower.includes("requested") ||
      messageLower.includes("opened") ||
      messageLower.includes("exported")
    ) {
      return {
        icon: "✓",
        label: "Success",
        containerClass:
          "border-green-300 bg-green-50 text-green-800 dark:border-green-900/70 dark:bg-green-900/30 dark:text-green-200",
        iconClass:
          "border-green-300 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/50 dark:text-green-200",
      };
    }

    return {
      icon: "i",
      label: "Info",
      containerClass: "border-background-border bg-background text-foreground",
      iconClass: "border-background-border bg-background-dimmed1 text-foreground-dimmed2",
    };
  };

  const hideToastNow = () => {
    setIsToastVisible(false);
    window.setTimeout(() => setMessage(""), 250);
  };

  const adminOrdersQuery = useAdminOrdersQuery();
  const adminDiscountCodesQuery = useAdminDiscountCodesQuery();
  const adminCatalogPlansQuery = useAdminCatalogPlansQuery();
  const adminCatalogPreferencesQuery = useAdminCatalogPreferencesQuery();
  const adminEventsQuery = useAdminEventsQuery(activityFeedLimit);
  const adminMutations = useAdminMutations(activityFeedLimit);

  const ordersData = adminOrdersQuery.data;
  const orders = ordersData ?? [];
  const discountCodes = adminDiscountCodesQuery.data ?? [];
  const catalogPlans = adminCatalogPlansQuery.data ?? [];
  const catalogPreferences = adminCatalogPreferencesQuery.data ?? [];
  const recentEvents = adminEventsQuery.data ?? [];
  const loading =
    adminOrdersQuery.isLoading ||
    adminDiscountCodesQuery.isLoading ||
    adminCatalogPlansQuery.isLoading ||
    adminCatalogPreferencesQuery.isLoading ||
    adminEventsQuery.isLoading;

  useEffect(() => {
    if (
      adminOrdersQuery.isError ||
      adminDiscountCodesQuery.isError ||
      adminCatalogPlansQuery.isError ||
      adminCatalogPreferencesQuery.isError ||
      adminEventsQuery.isError
    ) {
      setMessage("Unable to load admin data.");
    }
  }, [
    adminCatalogPlansQuery.isError,
    adminCatalogPreferencesQuery.isError,
    adminDiscountCodesQuery.isError,
    adminEventsQuery.isError,
    adminOrdersQuery.isError,
  ]);

  useEffect(() => {
    if (!message) {
      setIsToastVisible(false);
      return;
    }

    setIsToastVisible(true);

    const hideTimer = window.setTimeout(() => {
      setIsToastVisible(false);
    }, 4600);

    const clearTimer = window.setTimeout(() => {
      setMessage("");
    }, 5000);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(clearTimer);
    };
  }, [message]);

  useEffect(() => {
    setNoteDrafts(prev => {
      const next = { ...prev };
      (ordersData ?? []).forEach(order => {
        if (!(order.id in next)) {
          next[order.id] = order.adminAdjustmentNote;
        }
      });
      return next;
    });
  }, [ordersData]);

  useEffect(() => {
    window.localStorage.setItem("admin-orders-queue-view", queueView);
  }, [queueView]);

  useEffect(() => {
    window.localStorage.setItem("admin-orders-queue-row-limit", String(queueRowLimit));
  }, [queueRowLimit]);

  useEffect(() => {
    window.localStorage.setItem("admin-activity-feed-limit", String(activityFeedLimit));
  }, [activityFeedLimit]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!queueActionsMenuRef.current?.contains(target)) {
        setIsExportMenuOpen(false);
        setIsPrintMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  const prioritizedOrders = [...orders].sort((firstOrder, secondOrder) => {
    const firstStats = getRequestedRefundSlaStats(firstOrder);
    const secondStats = getRequestedRefundSlaStats(secondOrder);

    if (secondStats.breachedCount !== firstStats.breachedCount) {
      return secondStats.breachedCount - firstStats.breachedCount;
    }

    if (secondStats.maxRequestedAge !== firstStats.maxRequestedAge) {
      return secondStats.maxRequestedAge - firstStats.maxRequestedAge;
    }

    if (secondStats.requestedCount !== firstStats.requestedCount) {
      return secondStats.requestedCount - firstStats.requestedCount;
    }

    return secondOrder.createdAt.localeCompare(firstOrder.createdAt);
  });

  const filteredOrders =
    queueView === "sla-priority"
      ? prioritizedOrders.filter(order => {
          const stats = getRequestedRefundSlaStats(order);
          return stats.breachedCount > 0 || stats.requestedCount > 0;
        })
      : prioritizedOrders;

  const displayedOrders =
    queueSort === null
      ? filteredOrders
      : [...filteredOrders].sort((firstOrder, secondOrder) => {
          const firstValue = getQueueSortValue(firstOrder, queueSort.key);
          const secondValue = getQueueSortValue(secondOrder, queueSort.key);

          if (typeof firstValue === "number" && typeof secondValue === "number") {
            return queueSort.direction === "asc"
              ? firstValue - secondValue
              : secondValue - firstValue;
          }

          const firstText = String(firstValue);
          const secondText = String(secondValue);

          return queueSort.direction === "asc"
            ? firstText.localeCompare(secondText)
            : secondText.localeCompare(firstText);
        });

  const handleQueueSortChange = (sortKey: QueueSortKey) => {
    setQueueSort(currentSort => {
      if (currentSort?.key === sortKey) {
        return {
          key: sortKey,
          direction: currentSort.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key: sortKey,
        direction: sortKey === "order" ? "desc" : "asc",
      };
    });
  };

  const limitedDisplayedOrders = displayedOrders.slice(0, queueRowLimit);

  const {
    pendingApprovalCount,
    slaBreachedCount,
    processedThisWeekTotal,
    activeDiscountCodeCount,
    totalGrossOrderValue,
    agingRequestedRefunds,
  } = getOrderQueueSummaryMetrics(orders, discountCodes, REFUND_SLA_DAYS);

  const handleStatusChange = async (order: OrderRecord, status: OrderStatus) => {
    setMessage("");
    try {
      await adminMutations.updateOrderStatusMutation.mutateAsync({
        orderId: order.id,
        status,
        previousStatus: order.status,
        userId: order.userId,
        adminId: user?.uid ?? "unknown",
      });
      setMessage("Order status updated.");
    } catch (error) {
      console.error("Failed to update order status:", error);
      setMessage("Unable to update order status.");
    }
  };

  const handleApplyDiscount = async (order: OrderRecord) => {
    if (!user) return;

    const draft = getDiscountDraft(discountDrafts, order.id);
    const code = draft.code.trim();

    if (!code) {
      setMessage("Enter a discount code.");
      return;
    }

    try {
      await adminMutations.applyDiscountCodeToOrderMutation.mutateAsync({
        orderId: order.id,
        code,
        orderTotal: order.estimatedPlanTotal,
        userId: order.userId,
        adminId: user.uid,
      });
      setDiscountDrafts(prev => ({ ...prev, [order.id]: { code: "" } }));
      setMessage("Discount applied.");
    } catch (error) {
      console.error("Failed to apply discount:", error);
      const errorMessage = error instanceof Error ? error.message : "Unable to apply discount.";
      setMessage(errorMessage);
    }
  };

  const handleRequestRefund = async (order: OrderRecord) => {
    if (!user) return;

    const draft = getRefundDraft(refundDrafts, order.id);
    const amount = Number(draft.amount);

    if (Number.isNaN(amount) || amount <= 0 || !draft.reasonDetails.trim()) {
      setMessage("Enter a valid refund amount and reason details.");
      return;
    }

    try {
      await adminMutations.requestOrderRefundMutation.mutateAsync({
        orderId: order.id,
        amount,
        reasonCode: draft.reasonCode,
        reasonDetails: draft.reasonDetails.trim(),
        userId: order.userId,
        adminId: user.uid,
      });
      setMessage("Refund requested.");
      setRefundDrafts(prev => ({
        ...prev,
        [order.id]: getResetRefundDraft(),
      }));
    } catch (error) {
      console.error("Failed to request refund:", error);
      setMessage("Unable to request refund.");
    }
  };

  const handleApproveRefund = async (order: OrderRecord, refundId: string) => {
    if (!user) return;

    try {
      await adminMutations.approveOrderRefundMutation.mutateAsync({
        orderId: order.id,
        refundId,
        userId: order.userId,
        adminId: user.uid,
      });
      setMessage("Refund approved.");
    } catch (error) {
      console.error("Failed to approve refund:", error);
      setMessage("Unable to approve refund.");
    }
  };

  const handleProcessRefund = async (order: OrderRecord, refundId: string) => {
    if (!user) return;

    try {
      await adminMutations.processOrderRefundMutation.mutateAsync({
        orderId: order.id,
        refundId,
        userId: order.userId,
        adminId: user.uid,
      });
      setMessage("Refund processed.");
    } catch (error) {
      console.error("Failed to process refund:", error);
      setMessage("Unable to process refund.");
    }
  };

  const handleSaveAdjustmentNote = async (order: OrderRecord) => {
    if (!user) return;

    const note = noteDrafts[order.id] ?? "";
    try {
      await adminMutations.updateOrderAdjustmentNoteMutation.mutateAsync({
        orderId: order.id,
        note,
        userId: order.userId,
        adminId: user.uid,
      });
      setMessage("Adjustment note saved.");
    } catch (error) {
      console.error("Failed to save adjustment note:", error);
      setMessage("Unable to save adjustment note.");
    }
  };

  const handleSaveDiscountCode = async () => {
    const code = discountForm.code.trim();
    const amount = Number(discountForm.amount);

    if (!code || Number.isNaN(amount) || amount <= 0) {
      setMessage("Enter a valid discount code and amount.");
      return;
    }

    const maxUses = discountForm.maxUses.trim() ? Number(discountForm.maxUses) : null;
    const minOrderTotal = discountForm.minOrderTotal.trim()
      ? Number(discountForm.minOrderTotal)
      : null;

    if (
      (maxUses !== null && (Number.isNaN(maxUses) || maxUses < 1)) ||
      (minOrderTotal !== null && Number.isNaN(minOrderTotal))
    ) {
      setMessage("Enter valid numeric values for max uses and minimum order total.");
      return;
    }

    try {
      await adminMutations.upsertDiscountCodeMutation.mutateAsync({
        code,
        amount,
        type: discountForm.type,
        isActive: discountForm.isActive,
        maxUses,
        expiresAt: discountForm.expiresAt ? new Date(discountForm.expiresAt).toISOString() : null,
        minOrderTotal,
      });
      setMessage("Discount code saved.");
      setDiscountForm(getResetDiscountForm());
    } catch (error) {
      console.error("Failed to save discount code:", error);
      setMessage("Unable to save discount code.");
    }
  };

  const handleSavePlan = async () => {
    const value = planForm.value.trim();
    const label = planForm.label.trim();
    const description = planForm.description.trim();
    const weeks = Number(planForm.weeks);

    if (!value || !label || !description || Number.isNaN(weeks) || weeks < 1) {
      setMessage("Enter a valid plan value, label, description, and weeks.");
      return;
    }

    try {
      await adminMutations.upsertCatalogPlanMutation.mutateAsync({
        value,
        label,
        description,
        weeks,
      });
      setPlanForm({ value: "", label: "", description: "", weeks: "" });
      setMessage("Catalog plan saved.");
    } catch (error) {
      console.error("Failed to save catalog plan:", error);
      setMessage("Unable to save catalog plan.");
    }
  };

  const handleDeletePlan = async (planValue: string) => {
    if (!window.confirm(`Delete catalog plan \"${planValue}\"?`)) {
      return;
    }

    try {
      await adminMutations.deleteCatalogPlanMutation.mutateAsync(planValue);
      setMessage("Catalog plan deleted.");
    } catch (error) {
      console.error("Failed to delete catalog plan:", error);
      setMessage("Unable to delete catalog plan.");
    }
  };

  const handleSavePreference = async () => {
    const label = preferenceForm.label.trim();
    const description = preferenceForm.description.trim();

    if (!label || !description) {
      setMessage("Enter a preference label and description.");
      return;
    }

    try {
      await adminMutations.upsertCatalogPreferenceMutation.mutateAsync({
        label,
        description,
      });
      setPreferenceForm({ label: "", description: "" });
      setMessage("Catalog preference saved.");
    } catch (error) {
      console.error("Failed to save catalog preference:", error);
      setMessage("Unable to save catalog preference.");
    }
  };

  const handleDeletePreference = async (label: string) => {
    if (!window.confirm(`Delete catalog preference \"${label}\"?`)) {
      return;
    }

    try {
      await adminMutations.deleteCatalogPreferenceMutation.mutateAsync(label);
      setMessage("Catalog preference deleted.");
    } catch (error) {
      console.error("Failed to delete catalog preference:", error);
      setMessage("Unable to delete catalog preference.");
    }
  };

  const handleExportQueueCsv = () => {
    if (limitedDisplayedOrders.length === 0) {
      setMessage("No orders available to export.");
      return;
    }

    exportQueueCsv({
      rowsToExport: limitedDisplayedOrders,
      queueView,
      queueRowLimit,
      scope: "limited",
    });

    setMessage(`Exported ${limitedDisplayedOrders.length} orders to CSV.`);
  };

  const handleExportFullQueueCsv = () => {
    if (displayedOrders.length === 0) {
      setMessage("No orders available to export.");
      return;
    }

    exportQueueCsv({
      rowsToExport: displayedOrders,
      queueView,
      queueRowLimit,
      scope: "full",
    });

    setMessage(`Exported ${displayedOrders.length} orders to CSV.`);
  };

  const handlePrintQueue = () => {
    if (limitedDisplayedOrders.length === 0) {
      setMessage("No orders available to print.");
      return;
    }

    const didPrint = printQueue({
      rowsToPrint: limitedDisplayedOrders,
      queueView,
      scope: "limited",
    });

    if (!didPrint) {
      setMessage("Unable to open print window.");
      return;
    }

    setMessage(`Opened print view for ${limitedDisplayedOrders.length} orders.`);
  };

  const handlePrintFullQueue = () => {
    if (displayedOrders.length === 0) {
      setMessage("No orders available to print.");
      return;
    }

    const didPrint = printQueue({
      rowsToPrint: displayedOrders,
      queueView,
      scope: "full",
    });

    if (!didPrint) {
      setMessage("Unable to open print window.");
      return;
    }

    setMessage(`Opened print view for ${displayedOrders.length} orders.`);
  };

  const handleQuickApproveOldestRefund = async (order: OrderRecord) => {
    const oldestRequestedRefund = getOldestRefundByStatus(order, "requested");
    if (!oldestRequestedRefund) {
      setMessage("No requested refunds to approve.");
      return;
    }

    await handleApproveRefund(order, oldestRequestedRefund.id);
  };

  const handleQuickProcessOldestRefund = async (order: OrderRecord) => {
    const oldestApprovedRefund = getOldestRefundByStatus(order, "approved");
    if (!oldestApprovedRefund) {
      setMessage("No approved refunds to process.");
      return;
    }

    await handleProcessRefund(order, oldestApprovedRefund.id);
  };

  const ordersTabModel: OrdersTabModel = {
    queue: {
      queueView,
      setQueueView,
      queueRowLimit,
      setQueueRowLimit,
      queueSort,
      handleQueueSortChange,
      limitedDisplayedOrders,
    },
    actions: {
      queueActionsMenuRef,
      isExportMenuOpen,
      setIsExportMenuOpen,
      isPrintMenuOpen,
      setIsPrintMenuOpen,
      handleExportQueueCsv,
      handleExportFullQueueCsv,
      handlePrintQueue,
      handlePrintFullQueue,
      expandedOrderId,
      setExpandedOrderId,
      openMenuOrderId,
      setOpenMenuOrderId,
      handleQuickApproveOldestRefund,
      handleQuickProcessOldestRefund,
    },
    operations: {
      handleStatusChange,
      orderStatuses: ORDER_STATUSES,
      getDiscountDraft: orderId => getDiscountDraft(discountDrafts, orderId),
      setDiscountDrafts,
      handleApplyDiscount,
      getRefundDraft: orderId => getRefundDraft(refundDrafts, orderId),
      setRefundDrafts,
      refundReasonCodes: REFUND_REASON_CODES,
      handleRequestRefund,
      noteDrafts,
      setNoteDrafts,
      handleSaveAdjustmentNote,
      handleApproveRefund,
      handleProcessRefund,
    },
  };

  const refundsTabModel: RefundsTabModel = {
    pendingApprovalCount,
    processedThisWeekTotal,
    slaBreachedCount,
    refundSlaDays: REFUND_SLA_DAYS,
    agingRequestedRefunds,
  };

  const discountsTabModel: DiscountsTabModel = {
    discountForm,
    setDiscountForm,
    discountCodes,
    handleSaveDiscountCode,
  };

  const activityTabModel: ActivityTabModel = {
    activityFeedLimit,
    setActivityFeedLimit,
    recentEvents,
  };

  const catalogTabModel: CatalogTabModel = {
    plans: catalogPlans,
    preferences: catalogPreferences,
    planForm,
    setPlanForm,
    preferenceForm,
    setPreferenceForm,
    handleSavePlan,
    handleDeletePlan,
    handleSavePreference,
    handleDeletePreference,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader label="Loading admin dashboard" />
      </div>
    );
  }

  const toastMeta = getToastMeta(message);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-6">
      <Typography as="h1" className="text-primary text-2xl font-semibold">
        Admin Dashboard
      </Typography>
      <Typography as="p" className="text-foreground-dimmed2">
        This area is reserved for operational workflows (order queue, subscription oversight, and
        customer support actions).
      </Typography>

      <section className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-background border-background-border rounded border p-3 text-sm">
          <Typography as="p" className="text-foreground-dimmed2">
            Orders
          </Typography>
          <Typography as="p" className="text-xl font-semibold">
            {orders.length}
          </Typography>
        </div>
        <div className="bg-background border-background-border rounded border p-3 text-sm">
          <Typography as="p" className="text-foreground-dimmed2">
            Active discount codes
          </Typography>
          <Typography as="p" className="text-xl font-semibold">
            {activeDiscountCodeCount}
          </Typography>
        </div>
        <div className="bg-background border-background-border rounded border p-3 text-sm">
          <Typography as="p" className="text-foreground-dimmed2">
            Refunds waiting for approval
          </Typography>
          <Typography as="p" className="text-xl font-semibold">
            {pendingApprovalCount}
          </Typography>
        </div>
        <div className="bg-background border-background-border rounded border p-3 text-sm">
          <Typography as="p" className="text-foreground-dimmed2">
            Overdue refunds
          </Typography>
          <Typography as="p" className="text-xl font-semibold">
            {slaBreachedCount}
          </Typography>
        </div>
        <div className="bg-background border-background-border rounded border p-3 text-sm">
          <Typography as="p" className="text-foreground-dimmed2">
            Gross order value
          </Typography>
          <Typography as="p" className="text-xl font-semibold">
            ${totalGrossOrderValue.toFixed(2)}
          </Typography>
        </div>
      </section>

      <section className="border-background-border border-b">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className={`text-foreground border-b px-4 py-2 text-sm ${
              activeTab === "orders"
                ? "border-green-500 text-green-700"
                : "border-transparent text-white"
            }`}
            onPress={() => setActiveTab("orders")}
          >
            Orders
          </Button>
          <Button
            type="button"
            className={`text-foreground border-b px-4 py-2 text-sm ${
              activeTab === "discounts"
                ? "border-green-500 text-green-700"
                : "border-transparent text-white"
            }`}
            onPress={() => setActiveTab("discounts")}
          >
            Discounts
          </Button>
          <Button
            type="button"
            className={`text-foreground border-b px-4 py-2 text-sm ${
              activeTab === "refunds"
                ? "border-green-500 text-green-700"
                : "border-transparent text-white"
            }`}
            onPress={() => setActiveTab("refunds")}
          >
            Refunds
          </Button>
          <Button
            type="button"
            className={`text-foreground border-b px-4 py-2 text-sm ${
              activeTab === "catalog"
                ? "border-green-500 text-green-700"
                : "border-transparent text-white"
            }`}
            onPress={() => setActiveTab("catalog")}
          >
            Catalog
          </Button>
          <Button
            type="button"
            className={`text-foreground border-b px-4 py-2 text-sm ${
              activeTab === "activity"
                ? "border-green-500 text-green-700"
                : "border-transparent text-white"
            }`}
            onPress={() => setActiveTab("activity")}
          >
            Activity
          </Button>
        </div>
      </section>

      {activeTab === "refunds" ? <RefundsTab model={refundsTabModel} /> : null}
      {activeTab === "discounts" ? <DiscountsTab model={discountsTabModel} /> : null}
      {activeTab === "orders" ? <OrdersTab model={ordersTabModel} /> : null}
      {activeTab === "catalog" ? <CatalogTab model={catalogTabModel} /> : null}
      {activeTab === "activity" ? <ActivityTab model={activityTabModel} /> : null}

      {message ? (
        <div
          className={`fixed right-4 bottom-4 z-50 transition-all duration-300 ease-out ${
            isToastVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          role="status"
          aria-live="polite"
        >
          <div
            className={`pointer-events-auto max-w-md min-w-72 rounded border px-3 py-2 text-sm shadow ${toastMeta.containerClass}`}
          >
            <div className="flex items-start gap-2">
              <Typography
                as="span"
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${toastMeta.iconClass}`}
                aria-hidden="true"
              >
                {toastMeta.icon}
              </Typography>
              <div className="min-w-0 flex-1">
                <Typography as="p" className="text-xs font-semibold">
                  {toastMeta.label}
                </Typography>
                <Typography as="p" className="mt-0.5 break-words">
                  {message}
                </Typography>
              </div>
              <Button
                type="button"
                className="hover:bg-background-dimmed1 rounded px-1 py-0.5 text-xs"
                onPress={hideToastNow}
                aria-label="Dismiss message"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

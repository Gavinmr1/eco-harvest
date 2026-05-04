import { Fragment, type Dispatch, type RefObject, type SetStateAction } from "react";
import { Button } from "react-aria-components";
import ArrowDownTrayIcon from "../../../assets/svgs/arrow-down-tray.svg?react";
import PrinterIcon from "../../../assets/svgs/printer.svg?react";
import FormInput from "../../../components/FormInput";
import FormSelect from "../../../components/FormSelect";
import { type OrderRecord, type OrderStatus, type RefundReasonCode } from "../../../types/order";
import Typography from "../../../components/Typography";
import {
  calculateDiscountAmount,
  calculateRefundedAmount,
  getQueueSortIndicator,
  getQueueSortLabel,
  REFUND_SLA_DAYS,
  getRefundAgeInDays,
  getRequestedRefundSlaStats,
  type QueueSortDirection as OrderQueueSortDirection,
  type QueueSortKey as OrderQueueSortKey,
} from "../utils/orderQueue";

export type QueueSortKey = OrderQueueSortKey;

export type QueueSortDirection = OrderQueueSortDirection;

type QueueSortState = {
  key: QueueSortKey;
  direction: QueueSortDirection;
};

export type OrdersTabQueueModel = {
  queueView: "all" | "sla-priority";
  setQueueView: Dispatch<SetStateAction<"all" | "sla-priority">>;
  queueRowLimit: 25 | 50 | 100;
  setQueueRowLimit: Dispatch<SetStateAction<25 | 50 | 100>>;
  queueSort: QueueSortState | null;
  handleQueueSortChange: (sortKey: QueueSortKey) => void;
  limitedDisplayedOrders: OrderRecord[];
};

export type OrdersTabActionsModel = {
  queueActionsMenuRef: RefObject<HTMLDivElement | null>;
  isExportMenuOpen: boolean;
  setIsExportMenuOpen: Dispatch<SetStateAction<boolean>>;
  isPrintMenuOpen: boolean;
  setIsPrintMenuOpen: Dispatch<SetStateAction<boolean>>;
  handleExportQueueCsv: () => void;
  handleExportFullQueueCsv: () => void;
  handlePrintQueue: () => void;
  handlePrintFullQueue: () => void;
  expandedOrderId: string | null;
  setExpandedOrderId: Dispatch<SetStateAction<string | null>>;
  openMenuOrderId: string | null;
  setOpenMenuOrderId: Dispatch<SetStateAction<string | null>>;
  handleQuickApproveOldestRefund: (order: OrderRecord) => Promise<void>;
  handleQuickProcessOldestRefund: (order: OrderRecord) => Promise<void>;
};

export type OrdersTabOperationsModel = {
  handleStatusChange: (order: OrderRecord, status: OrderStatus) => Promise<void>;
  orderStatuses: OrderStatus[];
  getDiscountDraft: (orderId: string) => { code: string };
  setDiscountDrafts: Dispatch<SetStateAction<Record<string, { code: string }>>>;
  handleApplyDiscount: (order: OrderRecord) => Promise<void>;
  getRefundDraft: (orderId: string) => {
    amount: string;
    reasonCode: RefundReasonCode;
    reasonDetails: string;
  };
  setRefundDrafts: Dispatch<
    SetStateAction<
      Record<string, { amount: string; reasonCode: RefundReasonCode; reasonDetails: string }>
    >
  >;
  refundReasonCodes: RefundReasonCode[];
  handleRequestRefund: (order: OrderRecord) => Promise<void>;
  noteDrafts: Record<string, string>;
  setNoteDrafts: Dispatch<SetStateAction<Record<string, string>>>;
  handleSaveAdjustmentNote: (order: OrderRecord) => Promise<void>;
  handleApproveRefund: (order: OrderRecord, refundId: string) => Promise<void>;
  handleProcessRefund: (order: OrderRecord, refundId: string) => Promise<void>;
};

export type OrdersTabModel = {
  queue: OrdersTabQueueModel;
  actions: OrdersTabActionsModel;
  operations: OrdersTabOperationsModel;
};

type OrdersTabProps = {
  model: OrdersTabModel;
};

export function OrdersTab({ model }: OrdersTabProps) {
  const { queue, actions, operations } = model;

  const {
    queueView,
    setQueueView,
    queueRowLimit,
    setQueueRowLimit,
    queueSort,
    handleQueueSortChange,
    limitedDisplayedOrders,
  } = queue;

  const {
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
  } = actions;

  const {
    handleStatusChange,
    orderStatuses,
    getDiscountDraft,
    setDiscountDrafts,
    handleApplyDiscount,
    getRefundDraft,
    setRefundDrafts,
    refundReasonCodes,
    handleRequestRefund,
    noteDrafts,
    setNoteDrafts,
    handleSaveAdjustmentNote,
    handleApproveRefund,
    handleProcessRefund,
  } = operations;

  const getActionRequiredStatus = (order: OrderRecord) => {
    const requestedRefundStats = getRequestedRefundSlaStats(order);
    const hasApprovedRefund = order.refunds.some(refund => refund.status === "approved");

    if (requestedRefundStats.breachedCount > 0) {
      return "Overdue refund review";
    }

    if (requestedRefundStats.requestedCount > 0) {
      return "Refund review needed";
    }

    if (hasApprovedRefund) {
      return "Process approved refund";
    }

    return "None";
  };

  const getActionRequiredBadgeClass = (status: string) => {
    switch (status) {
      case "Overdue refund review":
        return "border-red-300 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-900/30 dark:text-red-200";
      case "Refund review needed":
        return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-900/30 dark:text-amber-200";
      case "Process approved refund":
        return "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-900/30 dark:text-blue-200";
      default:
        return "border-background-border bg-background text-foreground-dimmed2";
    }
  };

  const getRefundStatusBadgeClass = (status: string) => {
    switch (status) {
      case "requested":
        return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-900/30 dark:text-amber-200";
      case "approved":
        return "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-900/30 dark:text-blue-200";
      case "processed":
        return "border-green-300 bg-green-50 text-green-700 dark:border-green-900/70 dark:bg-green-900/30 dark:text-green-200";
      default:
        return "border-background-border bg-background text-foreground-dimmed2";
    }
  };

  return (
    <section className="border-background-border/20 rounded-2xl border bg-white/10 p-6 shadow-md backdrop-blur-lg">
      <div className="flex flex-col gap-1">
        <Typography as="h2">Orders Queue</Typography>
        <Typography as="p" variant="muted">
          Review fulfillment status, apply adjustments, and handle refunds.
        </Typography>
      </div>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <FormSelect
            className="w-auto min-w-[10rem]"
            value={queueView}
            onChange={event => setQueueView(event.target.value as "all" | "sla-priority")}
          >
            <option value="all">All queue items</option>
            <option value="sla-priority">Urgent refunds only</option>
          </FormSelect>
          <FormSelect
            className="w-auto min-w-[9rem]"
            value={queueRowLimit}
            onChange={event => setQueueRowLimit(Number(event.target.value) as 25 | 50 | 100)}
          >
            <option value={25}>Show 25 rows</option>
            <option value={50}>Show 50 rows</option>
            <option value={100}>Show 100 rows</option>
          </FormSelect>
          {queueSort ? (
            <Typography
              as="span"
              className="border-background-border/30 bg-background/70 inline-flex items-center rounded-full border px-3 py-1.5"
            >
              Sorted by {getQueueSortLabel(queueSort.key)}{" "}
              {queueSort.direction === "asc" ? "↑" : "↓"}
            </Typography>
          ) : null}
        </div>

        <div ref={queueActionsMenuRef} className="flex shrink-0 items-start gap-2">
          <div className="relative">
            <Button
              type="button"
              className="border-background-border/30 bg-background/70 hover:bg-background-dimmed1 rounded-xl border p-2 transition-colors"
              aria-label="Open export options"
              onPress={() => {
                setIsExportMenuOpen(current => !current);
                setIsPrintMenuOpen(false);
              }}
            >
              <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
            </Button>

            {isExportMenuOpen ? (
              <div className="bg-background border-background-border/30 absolute top-11 right-0 z-30 flex w-44 flex-col gap-1 rounded-xl border p-2 shadow-lg backdrop-blur-lg">
                <Button
                  type="button"
                  className="hover:bg-background-dimmed1 rounded-lg px-2 py-1.5 text-left text-xs transition-colors"
                  onPress={() => {
                    handleExportQueueCsv();
                    setIsExportMenuOpen(false);
                  }}
                >
                  Export CSV
                </Button>
                <Button
                  type="button"
                  className="hover:bg-background-dimmed1 rounded-lg px-2 py-1.5 text-left text-xs transition-colors"
                  onPress={() => {
                    handleExportFullQueueCsv();
                    setIsExportMenuOpen(false);
                  }}
                >
                  Export Full Queue
                </Button>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <Button
              type="button"
              className="border-background-border/30 bg-background/70 hover:bg-background-dimmed1 rounded-xl border p-2 transition-colors"
              aria-label="Open print options"
              onPress={() => {
                setIsPrintMenuOpen(current => !current);
                setIsExportMenuOpen(false);
              }}
            >
              <PrinterIcon className="h-4 w-4" aria-hidden="true" />
            </Button>

            {isPrintMenuOpen ? (
              <div className="bg-background border-background-border/30 absolute top-11 right-0 z-30 flex w-44 flex-col gap-1 rounded-xl border p-2 shadow-lg backdrop-blur-lg">
                <Button
                  type="button"
                  className="hover:bg-background-dimmed1 rounded-lg px-2 py-1.5 text-left text-xs transition-colors"
                  onPress={() => {
                    handlePrintQueue();
                    setIsPrintMenuOpen(false);
                  }}
                >
                  Print Queue
                </Button>
                <Button
                  type="button"
                  className="hover:bg-background-dimmed1 rounded-lg px-2 py-1.5 text-left text-xs transition-colors"
                  onPress={() => {
                    handlePrintFullQueue();
                    setIsPrintMenuOpen(false);
                  }}
                >
                  Print Full Queue
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {limitedDisplayedOrders.length === 0 ? (
        <Typography as="p" variant="muted" className="mt-2">
          No orders yet.
        </Typography>
      ) : (
        <div className="border-background-border/20 mt-4 overflow-x-auto rounded-2xl border bg-white/5">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="text-foreground-dimmed1 border-b border-white/10 bg-white/5">
                <th className="px-3 py-3">
                  <Button
                    type="button"
                    className="text-foreground-dimmed1 hover:text-foreground text-xs font-semibold tracking-wide whitespace-nowrap uppercase transition-colors"
                    onPress={() => handleQueueSortChange("order")}
                  >
                    Order{getQueueSortIndicator(queueSort, "order")}
                  </Button>
                </th>
                <th className="px-3 py-3">
                  <Button
                    type="button"
                    className="text-foreground-dimmed1 hover:text-foreground text-xs font-semibold tracking-wide whitespace-nowrap uppercase transition-colors"
                    onPress={() => handleQueueSortChange("user")}
                  >
                    User{getQueueSortIndicator(queueSort, "user")}
                  </Button>
                </th>
                <th className="px-3 py-3">
                  <Button
                    type="button"
                    className="text-foreground-dimmed1 hover:text-foreground text-xs font-semibold tracking-wide whitespace-nowrap uppercase transition-colors"
                    onPress={() => handleQueueSortChange("plan")}
                  >
                    Plan{getQueueSortIndicator(queueSort, "plan")}
                  </Button>
                </th>
                <th className="px-3 py-3 font-semibold">
                  <Typography as="span" variant="caption" className="tracking-wide uppercase">
                    Net total
                  </Typography>
                </th>
                <th className="px-3 py-3">
                  <Button
                    type="button"
                    className="text-foreground-dimmed1 hover:text-foreground text-xs font-semibold tracking-wide whitespace-nowrap uppercase transition-colors"
                    onPress={() => handleQueueSortChange("status")}
                  >
                    Status{getQueueSortIndicator(queueSort, "status")}
                  </Button>
                </th>
                <th className="px-3 py-3 font-semibold">
                  <Typography as="span" variant="caption" className="tracking-wide uppercase">
                    Action required
                  </Typography>
                </th>
                <th className="px-3 py-3">
                  <Typography as="span" variant="caption" className="tracking-wide uppercase">
                    Operations
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {limitedDisplayedOrders.map(order => {
                const discountAmount = calculateDiscountAmount(order);
                const refundedAmount = calculateRefundedAmount(order);
                const netTotal = Math.max(
                  0,
                  order.estimatedPlanTotal - discountAmount - refundedAmount
                );
                const actionRequiredStatus = getActionRequiredStatus(order);
                const isExpanded = expandedOrderId === order.id;
                const isMenuOpen = openMenuOrderId === order.id;

                return (
                  <Fragment key={order.id}>
                    <tr className="border-b border-white/10 align-top hover:bg-white/5">
                      <td className="px-3 py-3">
                        <div className="font-mono text-xs font-medium">
                          {order.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-xxs text-foreground-dimmed3">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">{order.userId.slice(0, 8)}</td>
                      <td className="px-3 py-3">{order.subscriptionPlan}</td>
                      <td className="px-3 py-3 font-medium">${netTotal.toFixed(2)}</td>
                      <td className="px-3 py-3">
                        <Typography as="span" className="capitalize">
                          {order.status.replace(/-/g, " ")}
                        </Typography>
                      </td>
                      <td className="px-3 py-3">
                        <Typography
                          as="span"
                          className={`inline-flex rounded-full border px-2 py-0.5 ${getActionRequiredBadgeClass(actionRequiredStatus)}`}
                        >
                          {actionRequiredStatus}
                        </Typography>
                      </td>
                      <td className="relative px-3 py-3">
                        <Button
                          type="button"
                          className="border-background-border/30 hover:bg-background/70 rounded-lg border px-2 py-1 text-xs transition-colors"
                          onPress={() =>
                            setOpenMenuOrderId(currentId =>
                              currentId === order.id ? null : order.id
                            )
                          }
                        >
                          ...
                        </Button>
                        {isMenuOpen ? (
                          <div className="bg-background border-background-border/30 absolute top-10 right-2 z-20 flex w-44 flex-col gap-1 rounded-xl border p-2 shadow-lg backdrop-blur-lg">
                            <Button
                              type="button"
                              className="hover:bg-background-dimmed1 rounded-lg px-2 py-1.5 text-left text-xs transition-colors"
                              onPress={() => {
                                setExpandedOrderId(currentId =>
                                  currentId === order.id ? null : order.id
                                );
                                setOpenMenuOrderId(null);
                              }}
                            >
                              {isExpanded ? "Hide details" : "View details"}
                            </Button>
                            <Button
                              type="button"
                              className="hover:bg-background-dimmed1 rounded-lg px-2 py-1.5 text-left text-xs transition-colors"
                              onPress={() => {
                                void handleQuickApproveOldestRefund(order);
                                setOpenMenuOrderId(null);
                              }}
                            >
                              Approve oldest requested refund
                            </Button>
                            <Button
                              type="button"
                              className="hover:bg-background-dimmed1 rounded-lg px-2 py-1.5 text-left text-xs transition-colors"
                              onPress={() => {
                                void handleQuickProcessOldestRefund(order);
                                setOpenMenuOrderId(null);
                              }}
                            >
                              Process oldest approved refund
                            </Button>
                          </div>
                        ) : null}
                      </td>
                    </tr>

                    {isExpanded ? (
                      <tr className="border-background-border/20 border-b">
                        <td colSpan={7} className="bg-white/5 px-3 py-3">
                          <div className="space-y-3">
                            <div className="grid gap-3 lg:grid-cols-2">
                              <div className="border-background-border/20 rounded-xl border bg-white/10 p-3 backdrop-blur-lg">
                                <Typography as="p" className="tracking-wide uppercase">
                                  Order summary
                                </Typography>
                                <div className="mt-2 grid gap-1 text-xs">
                                  <Typography as="p">
                                    <Typography as="span" variant="caption">
                                      Order ID:
                                    </Typography>{" "}
                                    {order.id}
                                  </Typography>
                                  <Typography as="p">
                                    <Typography as="span" variant="caption">
                                      User ID:
                                    </Typography>{" "}
                                    {order.userId}
                                  </Typography>
                                  <Typography as="p">
                                    <Typography as="span" variant="caption">
                                      Created:
                                    </Typography>{" "}
                                    {new Date(order.createdAt).toLocaleString()}
                                  </Typography>
                                  <Typography as="p">
                                    <Typography as="span" variant="caption">
                                      Plan:
                                    </Typography>{" "}
                                    {order.subscriptionPlan}
                                  </Typography>
                                </div>
                              </div>

                              <div className="border-background-border/20 rounded-xl border bg-white/10 p-3 backdrop-blur-lg">
                                <Typography as="p" className="tracking-wide uppercase">
                                  Financial summary
                                </Typography>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                                  <div>
                                    <Typography as="p" variant="caption">
                                      Gross
                                    </Typography>
                                    <Typography as="p" variant="label">
                                      ${order.estimatedPlanTotal.toFixed(2)}
                                    </Typography>
                                  </div>
                                  <div>
                                    <Typography as="p" variant="caption">
                                      Discount
                                    </Typography>
                                    <Typography as="p" variant="label">
                                      ${discountAmount.toFixed(2)}
                                    </Typography>
                                  </div>
                                  <div>
                                    <Typography as="p" variant="caption">
                                      Refunded
                                    </Typography>
                                    <Typography as="p" variant="label">
                                      ${refundedAmount.toFixed(2)}
                                    </Typography>
                                  </div>
                                  <div>
                                    <Typography as="p" variant="caption">
                                      Net
                                    </Typography>
                                    <Typography as="p" variant="label">
                                      ${netTotal.toFixed(2)}
                                    </Typography>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="border-background-border/20 rounded-xl border bg-white/10 p-3 backdrop-blur-lg">
                              <Typography as="p" className="tracking-wide uppercase">
                                Order actions
                              </Typography>
                              <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <div className="border-background-border/20 rounded-xl border bg-white/5 p-2">
                                  <Typography as="p" variant="label" className="mb-1">
                                    Status
                                  </Typography>
                                  <FormSelect
                                    className="rounded-lg"
                                    value={order.status}
                                    onChange={event =>
                                      void handleStatusChange(
                                        order,
                                        event.target.value as OrderStatus
                                      )
                                    }
                                  >
                                    {orderStatuses.map(status => (
                                      <option key={status} value={status}>
                                        {status}
                                      </option>
                                    ))}
                                  </FormSelect>
                                </div>

                                <div className="border-background-border/20 rounded-xl border bg-white/5 p-2">
                                  <Typography as="p" variant="label" className="mb-1">
                                    Apply discount code
                                  </Typography>
                                  <FormInput
                                    className="rounded-lg"
                                    placeholder="Code"
                                    value={getDiscountDraft(order.id).code}
                                    onChange={event =>
                                      setDiscountDrafts(prev => ({
                                        ...prev,
                                        [order.id]: {
                                          ...getDiscountDraft(order.id),
                                          code: event.target.value,
                                        },
                                      }))
                                    }
                                  />
                                  <Button
                                    type="button"
                                    className="btn-secondary mt-1 w-full"
                                    onPress={() => void handleApplyDiscount(order)}
                                  >
                                    Apply code
                                  </Button>
                                </div>

                                <div className="border-background-border/20 rounded-xl border bg-white/5 p-2">
                                  <Typography as="p" variant="label" className="mb-1">
                                    Request refund
                                  </Typography>
                                  <div className="grid grid-cols-1 gap-1">
                                    <FormInput
                                      className="rounded-lg"
                                      placeholder="Amount"
                                      type="number"
                                      min={0}
                                      step="0.01"
                                      value={getRefundDraft(order.id).amount}
                                      onChange={event =>
                                        setRefundDrafts(prev => ({
                                          ...prev,
                                          [order.id]: {
                                            ...getRefundDraft(order.id),
                                            amount: event.target.value,
                                          },
                                        }))
                                      }
                                    />
                                    <FormSelect
                                      className="rounded-lg"
                                      value={getRefundDraft(order.id).reasonCode}
                                      onChange={event =>
                                        setRefundDrafts(prev => ({
                                          ...prev,
                                          [order.id]: {
                                            ...getRefundDraft(order.id),
                                            reasonCode: event.target.value as RefundReasonCode,
                                          },
                                        }))
                                      }
                                    >
                                      {refundReasonCodes.map(reasonCode => (
                                        <option key={reasonCode} value={reasonCode}>
                                          {reasonCode}
                                        </option>
                                      ))}
                                    </FormSelect>
                                    <FormInput
                                      className="rounded-lg"
                                      placeholder="Reason details"
                                      value={getRefundDraft(order.id).reasonDetails}
                                      onChange={event =>
                                        setRefundDrafts(prev => ({
                                          ...prev,
                                          [order.id]: {
                                            ...getRefundDraft(order.id),
                                            reasonDetails: event.target.value,
                                          },
                                        }))
                                      }
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    className="btn-secondary mt-1 w-full"
                                    onPress={() => void handleRequestRefund(order)}
                                  >
                                    Request refund
                                  </Button>
                                </div>

                                <div className="border-background-border/20 rounded-xl border bg-white/5 p-2">
                                  <Typography as="p" variant="label" className="mb-1">
                                    Adjustment note
                                  </Typography>
                                  <textarea
                                    className="border-background-border-dimmed1 bg-background-dimmed1 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-300 outline-none focus:border-yellow-500 focus:ring-yellow-500"
                                    rows={3}
                                    value={noteDrafts[order.id] ?? ""}
                                    onChange={event =>
                                      setNoteDrafts(prev => ({
                                        ...prev,
                                        [order.id]: event.target.value,
                                      }))
                                    }
                                  />
                                  <Button
                                    type="button"
                                    className="btn-tertiary mt-1 w-full"
                                    onPress={() => void handleSaveAdjustmentNote(order)}
                                  >
                                    Save note
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="border-background-border/20 rounded-xl border bg-white/10 p-3 backdrop-blur-lg">
                              <Typography as="p" className="tracking-wide uppercase">
                                Refund history
                              </Typography>
                              {order.refunds.length > 0 ? (
                                <div className="mt-2 grid gap-2 md:grid-cols-2">
                                  {order.refunds.map(refund => (
                                    <div
                                      key={refund.id}
                                      className="border-background-border/20 rounded-xl border bg-white/5 p-2 text-xs"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <Typography as="p" variant="label">
                                          ${refund.amount.toFixed(2)}
                                        </Typography>
                                        <Typography
                                          as="span"
                                          className={`inline-flex rounded-full border px-2 py-0.5 ${getRefundStatusBadgeClass(refund.status)}`}
                                        >
                                          {refund.status}
                                        </Typography>
                                      </div>
                                      <div className="text-foreground-dimmed2 mt-1 text-xs">
                                        Reason: {refund.reasonCode}
                                      </div>
                                      <div className="text-xxs text-foreground-dimmed3">
                                        Requested {new Date(refund.requestedAt).toLocaleString()}
                                      </div>
                                      {refund.status === "requested" ? (
                                        <div className="font-semibold">
                                          Age: {getRefundAgeInDays(refund.requestedAt)}d ·{" "}
                                          {getRefundAgeInDays(refund.requestedAt) > REFUND_SLA_DAYS
                                            ? "BREACHED"
                                            : "OK"}
                                        </div>
                                      ) : null}
                                      {refund.status === "requested" ? (
                                        <Button
                                          type="button"
                                          className="btn-secondary mt-1 w-full"
                                          onPress={() => void handleApproveRefund(order, refund.id)}
                                        >
                                          Approve refund
                                        </Button>
                                      ) : null}
                                      {refund.status === "approved" ? (
                                        <Button
                                          type="button"
                                          className="btn-tertiary mt-1 w-full"
                                          onPress={() => void handleProcessRefund(order, refund.id)}
                                        >
                                          Mark processed
                                        </Button>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <Typography as="p" variant="caption" className="mt-2">
                                  No refund requests for this order.
                                </Typography>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

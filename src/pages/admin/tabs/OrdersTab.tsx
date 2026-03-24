import { Fragment, type Dispatch, type RefObject, type SetStateAction } from "react";
import ArrowDownTrayIcon from "../../../assets/svgs/arrow-down-tray.svg?react";
import PrinterIcon from "../../../assets/svgs/printer.svg?react";
import { type OrderRecord, type OrderStatus, type RefundReasonCode } from "../../../types/order";
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
    <section className="border-background-border bg-background rounded border p-4 shadow">
      <h2 className="text-foreground-dimmed1 text-lg font-semibold">Orders Queue</h2>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <select
            className="border-background-border bg-background rounded border px-2 py-1.5 text-xs"
            value={queueView}
            onChange={event => setQueueView(event.target.value as "all" | "sla-priority")}
          >
            <option value="all">All queue items</option>
            <option value="sla-priority">Urgent refunds only</option>
          </select>
          <select
            className="border-background-border bg-background rounded border px-2 py-1.5 text-xs"
            value={queueRowLimit}
            onChange={event => setQueueRowLimit(Number(event.target.value) as 25 | 50 | 100)}
          >
            <option value={25}>Show 25 rows</option>
            <option value={50}>Show 50 rows</option>
            <option value={100}>Show 100 rows</option>
          </select>
          {queueSort ? (
            <span className="border-background-border bg-background-dimmed1 text-foreground-dimmed2 rounded border px-2 py-1 text-xs">
              Sorted by {getQueueSortLabel(queueSort.key)}{" "}
              {queueSort.direction === "asc" ? "↑" : "↓"}
            </span>
          ) : null}
        </div>

        <div ref={queueActionsMenuRef} className="flex shrink-0 items-start gap-2">
          <div className="relative">
            <button
              type="button"
              className="border-background-border bg-background hover:bg-background-dimmed1 rounded border p-2 transition-colors"
              aria-label="Open export options"
              title="Export"
              onClick={() => {
                setIsExportMenuOpen(current => !current);
                setIsPrintMenuOpen(false);
              }}
            >
              <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
            </button>

            {isExportMenuOpen ? (
              <div className="bg-background border-background-border absolute top-10 right-0 z-30 flex w-44 flex-col gap-1 rounded border p-2 shadow">
                <button
                  type="button"
                  className="hover:bg-background-dimmed1 rounded px-2 py-1 text-left text-xs"
                  onClick={() => {
                    handleExportQueueCsv();
                    setIsExportMenuOpen(false);
                  }}
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  className="hover:bg-background-dimmed1 rounded px-2 py-1 text-left text-xs"
                  onClick={() => {
                    handleExportFullQueueCsv();
                    setIsExportMenuOpen(false);
                  }}
                >
                  Export Full Queue
                </button>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              className="border-background-border bg-background hover:bg-background-dimmed1 rounded border p-2 transition-colors"
              aria-label="Open print options"
              title="Print"
              onClick={() => {
                setIsPrintMenuOpen(current => !current);
                setIsExportMenuOpen(false);
              }}
            >
              <PrinterIcon className="h-4 w-4" aria-hidden="true" />
            </button>

            {isPrintMenuOpen ? (
              <div className="bg-background border-background-border absolute top-10 right-0 z-30 flex w-44 flex-col gap-1 rounded border p-2 shadow">
                <button
                  type="button"
                  className="hover:bg-background-dimmed1 rounded px-2 py-1 text-left text-xs"
                  onClick={() => {
                    handlePrintQueue();
                    setIsPrintMenuOpen(false);
                  }}
                >
                  Print Queue
                </button>
                <button
                  type="button"
                  className="hover:bg-background-dimmed1 rounded px-2 py-1 text-left text-xs"
                  onClick={() => {
                    handlePrintFullQueue();
                    setIsPrintMenuOpen(false);
                  }}
                >
                  Print Full Queue
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {limitedDisplayedOrders.length === 0 ? (
        <p className="text-foreground-dimmed2 mt-2 text-sm">No orders yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="text-foreground-dimmed1 border-background-border border-b">
                <th className="px-2 py-2">
                  <button
                    type="button"
                    className="text-foreground-dimmed1 hover:text-foreground font-semibold whitespace-nowrap transition-colors"
                    onClick={() => handleQueueSortChange("order")}
                  >
                    Order{getQueueSortIndicator(queueSort, "order")}
                  </button>
                </th>
                <th className="px-2 py-2">
                  <button
                    type="button"
                    className="text-foreground-dimmed1 hover:text-foreground font-semibold whitespace-nowrap transition-colors"
                    onClick={() => handleQueueSortChange("user")}
                  >
                    User{getQueueSortIndicator(queueSort, "user")}
                  </button>
                </th>
                <th className="px-2 py-2">
                  <button
                    type="button"
                    className="text-foreground-dimmed1 hover:text-foreground font-semibold whitespace-nowrap transition-colors"
                    onClick={() => handleQueueSortChange("plan")}
                  >
                    Plan{getQueueSortIndicator(queueSort, "plan")}
                  </button>
                </th>
                <th className="px-2 py-2 font-semibold">Net total</th>
                <th className="px-2 py-2">
                  <button
                    type="button"
                    className="text-foreground-dimmed1 hover:text-foreground font-semibold whitespace-nowrap transition-colors"
                    onClick={() => handleQueueSortChange("status")}
                  >
                    Status{getQueueSortIndicator(queueSort, "status")}
                  </button>
                </th>
                <th className="px-2 py-2 font-semibold">Action required</th>
                <th className="px-2 py-2">Operations</th>
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
                    <tr className="border-background-border border-b align-top">
                      <td className="px-2 py-2">
                        <div className="font-medium">{order.id.slice(0, 8)}</div>
                        <div className="text-xxs text-foreground-dimmed3">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-2 py-2">{order.userId.slice(0, 8)}</td>
                      <td className="px-2 py-2">{order.subscriptionPlan}</td>
                      <td className="px-2 py-2 font-medium">${netTotal.toFixed(2)}</td>
                      <td className="px-2 py-2">
                        <div>{order.status}</div>
                      </td>
                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getActionRequiredBadgeClass(actionRequiredStatus)}`}
                        >
                          {actionRequiredStatus}
                        </span>
                      </td>
                      <td className="relative px-2 py-2">
                        <button
                          type="button"
                          className="border-background-border rounded border px-2 py-1 text-xs"
                          onClick={() =>
                            setOpenMenuOrderId(currentId =>
                              currentId === order.id ? null : order.id
                            )
                          }
                        >
                          ...
                        </button>
                        {isMenuOpen ? (
                          <div className="bg-background border-background-border absolute top-10 right-2 z-20 flex w-44 flex-col gap-1 rounded border p-2 shadow">
                            <button
                              type="button"
                              className="hover:bg-background-dimmed1 rounded px-2 py-1 text-left text-xs"
                              onClick={() => {
                                setExpandedOrderId(currentId =>
                                  currentId === order.id ? null : order.id
                                );
                                setOpenMenuOrderId(null);
                              }}
                            >
                              {isExpanded ? "Hide details" : "View details"}
                            </button>
                            <button
                              type="button"
                              className="hover:bg-background-dimmed1 rounded px-2 py-1 text-left text-xs"
                              onClick={() => {
                                void handleQuickApproveOldestRefund(order);
                                setOpenMenuOrderId(null);
                              }}
                            >
                              Approve oldest requested refund
                            </button>
                            <button
                              type="button"
                              className="hover:bg-background-dimmed1 rounded px-2 py-1 text-left text-xs"
                              onClick={() => {
                                void handleQuickProcessOldestRefund(order);
                                setOpenMenuOrderId(null);
                              }}
                            >
                              Process oldest approved refund
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>

                    {isExpanded ? (
                      <tr className="border-background-border border-b">
                        <td colSpan={7} className="bg-background-dimmed1 px-3 py-3">
                          <div className="space-y-3">
                            <div className="grid gap-3 lg:grid-cols-2">
                              <div className="border-background-border bg-background rounded border p-3">
                                <p className="text-foreground-dimmed2 text-xs font-semibold tracking-wide uppercase">
                                  Order summary
                                </p>
                                <div className="mt-2 grid gap-1 text-xs">
                                  <p>
                                    <span className="text-foreground-dimmed3">Order ID:</span>{" "}
                                    {order.id}
                                  </p>
                                  <p>
                                    <span className="text-foreground-dimmed3">User ID:</span>{" "}
                                    {order.userId}
                                  </p>
                                  <p>
                                    <span className="text-foreground-dimmed3">Created:</span>{" "}
                                    {new Date(order.createdAt).toLocaleString()}
                                  </p>
                                  <p>
                                    <span className="text-foreground-dimmed3">Plan:</span>{" "}
                                    {order.subscriptionPlan}
                                  </p>
                                </div>
                              </div>

                              <div className="border-background-border bg-background rounded border p-3">
                                <p className="text-foreground-dimmed2 text-xs font-semibold tracking-wide uppercase">
                                  Financial summary
                                </p>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                                  <div>
                                    <p className="text-foreground-dimmed3">Gross</p>
                                    <p className="text-sm font-semibold">
                                      ${order.estimatedPlanTotal.toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-foreground-dimmed3">Discount</p>
                                    <p className="text-sm font-semibold">
                                      ${discountAmount.toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-foreground-dimmed3">Refunded</p>
                                    <p className="text-sm font-semibold">
                                      ${refundedAmount.toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-foreground-dimmed3">Net</p>
                                    <p className="text-sm font-semibold">${netTotal.toFixed(2)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="border-background-border bg-background rounded border p-3">
                              <p className="text-foreground-dimmed2 text-xs font-semibold tracking-wide uppercase">
                                Order actions
                              </p>
                              <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <div className="border-background-border rounded border p-2">
                                  <p className="mb-1 text-xs font-medium">Status</p>
                                  <select
                                    className="border-background-border w-full rounded border p-1 text-xs"
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
                                  </select>
                                </div>

                                <div className="border-background-border rounded border p-2">
                                  <p className="mb-1 text-xs font-medium">Apply discount code</p>
                                  <input
                                    className="border-background-border w-full rounded border p-1 text-xs"
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
                                  <button
                                    type="button"
                                    className="mt-1 w-full rounded bg-green-700 px-2 py-1 text-xs text-white"
                                    onClick={() => void handleApplyDiscount(order)}
                                  >
                                    Apply code
                                  </button>
                                </div>

                                <div className="border-background-border rounded border p-2">
                                  <p className="mb-1 text-xs font-medium">Request refund</p>
                                  <div className="grid grid-cols-1 gap-1">
                                    <input
                                      className="border-background-border rounded border p-1 text-xs"
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
                                    <select
                                      className="border-background-border rounded border p-1 text-xs"
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
                                    </select>
                                    <input
                                      className="border-background-border rounded border p-1 text-xs"
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
                                  <button
                                    type="button"
                                    className="mt-1 w-full rounded bg-slate-700 px-2 py-1 text-xs text-white"
                                    onClick={() => void handleRequestRefund(order)}
                                  >
                                    Request refund
                                  </button>
                                </div>

                                <div className="border-background-border rounded border p-2">
                                  <p className="mb-1 text-xs font-medium">Adjustment note</p>
                                  <textarea
                                    className="border-background-border w-full rounded border p-1 text-xs"
                                    rows={3}
                                    value={noteDrafts[order.id] ?? ""}
                                    onChange={event =>
                                      setNoteDrafts(prev => ({
                                        ...prev,
                                        [order.id]: event.target.value,
                                      }))
                                    }
                                  />
                                  <button
                                    type="button"
                                    className="mt-1 w-full rounded bg-gray-700 px-2 py-1 text-xs text-white"
                                    onClick={() => void handleSaveAdjustmentNote(order)}
                                  >
                                    Save note
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="border-background-border bg-background rounded border p-3">
                              <p className="text-foreground-dimmed2 text-xs font-semibold tracking-wide uppercase">
                                Refund history
                              </p>
                              {order.refunds.length > 0 ? (
                                <div className="mt-2 grid gap-2 md:grid-cols-2">
                                  {order.refunds.map(refund => (
                                    <div
                                      key={refund.id}
                                      className="border-background-border rounded border p-2 text-xs"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium">${refund.amount.toFixed(2)}</p>
                                        <span
                                          className={`text-xxs inline-flex rounded-full border px-2 py-0.5 font-medium ${getRefundStatusBadgeClass(refund.status)}`}
                                        >
                                          {refund.status}
                                        </span>
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
                                        <button
                                          type="button"
                                          className="mt-1 w-full rounded bg-indigo-700 px-2 py-1 text-xs text-white"
                                          onClick={() => void handleApproveRefund(order, refund.id)}
                                        >
                                          Approve refund
                                        </button>
                                      ) : null}
                                      {refund.status === "approved" ? (
                                        <button
                                          type="button"
                                          className="mt-1 w-full rounded bg-purple-700 px-2 py-1 text-xs text-white"
                                          onClick={() => void handleProcessRefund(order, refund.id)}
                                        >
                                          Mark processed
                                        </button>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-foreground-dimmed3 mt-2 text-xs">
                                  No refund requests for this order.
                                </p>
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

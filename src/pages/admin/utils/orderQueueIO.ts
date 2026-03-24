import { type OrderRecord } from "../../../types/order";
import {
  calculateDiscountAmount,
  calculateRefundedAmount,
  getRequestedRefundSlaStats,
  REFUND_SLA_DAYS,
} from "./orderQueue";

type QueueScope = "limited" | "full";

type ExportQueueCsvInput = {
  rowsToExport: OrderRecord[];
  queueView: "all" | "sla-priority";
  queueRowLimit: number;
  scope: QueueScope;
};

type PrintQueueInput = {
  rowsToPrint: OrderRecord[];
  queueView: "all" | "sla-priority";
  scope: QueueScope;
};

const escapeCsv = (value: string) => {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const exportQueueCsv = ({
  rowsToExport,
  queueView,
  queueRowLimit,
  scope,
}: ExportQueueCsvInput) => {
  const headers = [
    "order_id",
    "user_id",
    "subscription_plan",
    "gross_total",
    "discount_total",
    "processed_refund_total",
    "net_total",
    "order_status",
    "requested_refund_count",
    "requested_refund_breaches",
    "oldest_requested_refund_age_days",
    "refund_sla_status",
    "created_at",
  ];

  const rows = rowsToExport.map(order => {
    const slaStats = getRequestedRefundSlaStats(order);
    const discountAmount = calculateDiscountAmount(order);
    const refundedAmount = calculateRefundedAmount(order);
    const netTotal = Math.max(0, order.estimatedPlanTotal - discountAmount - refundedAmount);

    const refundSlaStatus =
      slaStats.breachedCount > 0 ? "breached" : slaStats.requestedCount > 0 ? "pending" : "none";

    return [
      order.id,
      order.userId,
      order.subscriptionPlan,
      order.estimatedPlanTotal.toFixed(2),
      discountAmount.toFixed(2),
      refundedAmount.toFixed(2),
      netTotal.toFixed(2),
      order.status,
      String(slaStats.requestedCount),
      String(slaStats.breachedCount),
      String(slaStats.maxRequestedAge),
      refundSlaStatus,
      order.createdAt,
    ];
  });

  const generatedAt = new Date().toISOString();
  const metadataRows = [
    ["generated_at", generatedAt],
    ["queue_view", queueView],
    ["export_scope", scope],
    ["sla_threshold_days", String(REFUND_SLA_DAYS)],
    ["exported_row_count", String(rowsToExport.length)],
    [
      "queue_row_limit",
      scope === "limited" ? String(queueRowLimit) : "full_queue_ignores_row_limit",
    ],
  ];

  const metadataContent = metadataRows
    .map(columns => columns.map(column => escapeCsv(String(column))).join(","))
    .join("\n");

  const tableContent = [headers, ...rows]
    .map(columns => columns.map(column => escapeCsv(String(column))).join(","))
    .join("\n");

  const csvContent = `${metadataContent}\n\n${tableContent}`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = generatedAt.slice(0, 19).replace(/[T:]/g, "-");
  link.href = url;
  link.download = `orders-queue-${queueView}-${scope}-${timestamp}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const printQueue = ({ rowsToPrint, queueView, scope }: PrintQueueInput): boolean => {
  const generatedAt = new Date();
  const tableRows = rowsToPrint
    .map(order => {
      const requestedStats = getRequestedRefundSlaStats(order);
      const discountAmount = calculateDiscountAmount(order);
      const refundedAmount = calculateRefundedAmount(order);
      const netAmount = Math.max(0, order.estimatedPlanTotal - discountAmount - refundedAmount);

      return `
          <tr>
            <td>${escapeHtml(order.id.slice(0, 8))}</td>
            <td>${escapeHtml(order.userId.slice(0, 8))}</td>
            <td>${escapeHtml(order.subscriptionPlan)}</td>
            <td>$${order.estimatedPlanTotal.toFixed(2)}</td>
            <td>$${discountAmount.toFixed(2)}</td>
            <td>$${refundedAmount.toFixed(2)}</td>
            <td>$${netAmount.toFixed(2)}</td>
            <td>${escapeHtml(order.status)}</td>
            <td>${requestedStats.requestedCount}</td>
            <td>${requestedStats.breachedCount}</td>
          </tr>
        `;
    })
    .join("");

  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=800");
  if (!printWindow) {
    return false;
  }

  const printHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Orders Queue Print</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #111; }
            h1 { margin: 0 0 8px 0; font-size: 20px; }
            .meta { margin: 0 0 16px 0; font-size: 12px; color: #444; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #cfd4dc; padding: 6px 8px; text-align: left; }
            th { background: #f5f7fa; }
          </style>
        </head>
        <body>
          <h1>Orders Queue</h1>
          <p class="meta">
            Generated: ${escapeHtml(generatedAt.toLocaleString())}<br/>
            Queue view: ${escapeHtml(queueView)}<br/>
            Print scope: ${escapeHtml(scope)}<br/>
            Rows: ${rowsToPrint.length}
          </p>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>User</th>
                <th>Plan</th>
                <th>Gross</th>
                <th>Discount</th>
                <th>Refunded</th>
                <th>Net</th>
                <th>Status</th>
                <th>Waiting</th>
                <th>Overdue</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

  printWindow.document.open();
  printWindow.document.write(printHtml);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();

  return true;
};

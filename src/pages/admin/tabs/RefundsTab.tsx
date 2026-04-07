import { type RefundReasonCode } from "../../../types/order";
import Typography from "../../../components/Typography";

export type AgingRequestedRefundItem = {
  orderId: string;
  refundId: string;
  amount: number;
  reasonCode: RefundReasonCode;
  requestedAt: string;
  ageInDays: number;
  isSlaBreached: boolean;
};

export type RefundsTabModel = {
  pendingApprovalCount: number;
  processedThisWeekTotal: number;
  slaBreachedCount: number;
  refundSlaDays: number;
  agingRequestedRefunds: AgingRequestedRefundItem[];
};

type RefundsTabProps = {
  model: RefundsTabModel;
};

export function RefundsTab({ model }: RefundsTabProps) {
  const {
    pendingApprovalCount,
    processedThisWeekTotal,
    slaBreachedCount,
    refundSlaDays,
    agingRequestedRefunds,
  } = model;

  return (
    <section className="border-background-border bg-background rounded border p-4 shadow">
      <Typography as="h2" className="text-foreground-dimmed1 text-lg font-semibold">Refund Overview</Typography>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="border-background-border rounded border p-3 text-sm">
          <Typography as="p" className="text-foreground-dimmed2">Waiting for approval</Typography>
          <Typography as="p" className="text-xl font-semibold">{pendingApprovalCount}</Typography>
        </div>
        <div className="border-background-border rounded border p-3 text-sm">
          <Typography as="p" className="text-foreground-dimmed2">Processed this week</Typography>
          <Typography as="p" className="text-xl font-semibold">${processedThisWeekTotal.toFixed(2)}</Typography>
        </div>
        <div className="border-background-border rounded border p-3 text-sm">
          <Typography as="p" className="text-foreground-dimmed2">Overdue refunds (&gt;{refundSlaDays}d)</Typography>
          <Typography as="p" className="text-xl font-semibold">{slaBreachedCount}</Typography>
        </div>
      </div>

      <div className="mt-4">
        <Typography as="h3" className="text-foreground-dimmed1 text-sm font-semibold">Oldest waiting refunds</Typography>
        {agingRequestedRefunds.length === 0 ? (
          <Typography as="p" className="text-foreground-dimmed2 mt-2 text-xs">
            No requested refunds waiting on approval.
          </Typography>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead>
                <tr className="text-foreground-dimmed1 border-background-border border-b">
                  <th className="px-2 py-2">Order</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Reason</th>
                  <th className="px-2 py-2">Requested</th>
                  <th className="px-2 py-2">Age (days)</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {agingRequestedRefunds.slice(0, 10).map(refund => (
                  <tr key={refund.refundId} className="border-background-border border-b">
                    <td className="px-2 py-2">{refund.orderId.slice(0, 8)}</td>
                    <td className="px-2 py-2">${refund.amount.toFixed(2)}</td>
                    <td className="px-2 py-2">{refund.reasonCode}</td>
                    <td className="px-2 py-2">{new Date(refund.requestedAt).toLocaleString()}</td>
                    <td className="px-2 py-2">{refund.ageInDays}</td>
                    <td className="px-2 py-2 font-semibold">
                      {refund.isSlaBreached ? "OVERDUE" : "ON TIME"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

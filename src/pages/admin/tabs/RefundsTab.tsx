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
    <section className="border-background-border/20 rounded-2xl border bg-white/10 p-6 shadow-md backdrop-blur-lg">
      <div className="flex flex-col gap-1">
        <Typography as="h2">Refund Overview</Typography>
        <Typography as="p" variant="muted">
          Keep an eye on refund SLA risk and processing volume.
        </Typography>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="border-background-border/20 flex flex-col gap-0.5 rounded-xl border bg-white/5 p-4">
          <Typography as="p" variant="caption" className="tracking-wide uppercase">
            Waiting for approval
          </Typography>
          <Typography as="p" displayAs="h4">
            {pendingApprovalCount}
          </Typography>
        </div>
        <div className="border-background-border/20 flex flex-col gap-0.5 rounded-xl border bg-white/5 p-4">
          <Typography as="p" variant="caption" className="tracking-wide uppercase">
            Processed this week
          </Typography>
          <Typography as="p" displayAs="h4">
            ${processedThisWeekTotal.toFixed(2)}
          </Typography>
        </div>
        <div className="border-background-border/20 flex flex-col gap-0.5 rounded-xl border bg-white/5 p-4">
          <Typography as="p" variant="caption" className="tracking-wide uppercase">
            Overdue refunds (&gt;{refundSlaDays}d)
          </Typography>
          <Typography as="p" displayAs="h4">
            {slaBreachedCount}
          </Typography>
        </div>
      </div>

      <div className="mt-4">
        <Typography as="h3">Oldest waiting refunds</Typography>
        {agingRequestedRefunds.length === 0 ? (
          <Typography as="p" variant="muted" className="mt-2">
            No requested refunds waiting on approval.
          </Typography>
        ) : (
          <div className="border-background-border/20 mt-3 overflow-x-auto rounded-2xl border bg-white/5">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="text-foreground-dimmed1 border-b border-white/10 bg-white/5">
                  <th className="px-3 py-3">
                    <Typography as="span" variant="caption" className="tracking-wide uppercase">
                      Order
                    </Typography>
                  </th>
                  <th className="px-3 py-3">
                    <Typography as="span" variant="caption" className="tracking-wide uppercase">
                      Amount
                    </Typography>
                  </th>
                  <th className="px-3 py-3">
                    <Typography as="span" variant="caption" className="tracking-wide uppercase">
                      Reason
                    </Typography>
                  </th>
                  <th className="px-3 py-3">
                    <Typography as="span" variant="caption" className="tracking-wide uppercase">
                      Requested
                    </Typography>
                  </th>
                  <th className="px-3 py-3">
                    <Typography as="span" variant="caption" className="tracking-wide uppercase">
                      Age (days)
                    </Typography>
                  </th>
                  <th className="px-3 py-3">
                    <Typography as="span" variant="caption" className="tracking-wide uppercase">
                      Status
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {agingRequestedRefunds.slice(0, 10).map(refund => (
                  <tr key={refund.refundId} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-3 py-3">
                      <Typography as="span" className="font-mono text-xs">
                        {refund.orderId.slice(0, 8).toUpperCase()}
                      </Typography>
                    </td>
                    <td className="px-3 py-3">
                      <Typography as="span">${refund.amount.toFixed(2)}</Typography>
                    </td>
                    <td className="px-3 py-3">
                      <Typography as="span" className="capitalize">
                        {refund.reasonCode.replace(/_/g, " ")}
                      </Typography>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Typography as="span">
                        {new Date(refund.requestedAt).toLocaleString()}
                      </Typography>
                    </td>
                    <td className="px-3 py-3">
                      <Typography as="span">{refund.ageInDays}</Typography>
                    </td>
                    <td className="px-3 py-3">
                      <Typography
                        as="span"
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${
                          refund.isSlaBreached
                            ? "border-red-500/30 bg-red-500/15 text-red-200"
                            : "border-green-500/30 bg-green-500/15 text-green-200"
                        }`}
                      >
                        {refund.isSlaBreached ? "OVERDUE" : "ON TIME"}
                      </Typography>
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

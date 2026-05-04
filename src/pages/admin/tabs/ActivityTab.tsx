import { type Dispatch, type SetStateAction } from "react";
import { type OrderEventRecord } from "../../../types/orderEvent";
import FormSelect from "../../../components/FormSelect";
import Typography from "../../../components/Typography";

export type ActivityTabModel = {
  activityFeedLimit: 10 | 30 | 50;
  setActivityFeedLimit: Dispatch<SetStateAction<10 | 30 | 50>>;
  recentEvents: OrderEventRecord[];
};

type ActivityTabProps = {
  model: ActivityTabModel;
};

export function ActivityTab({ model }: ActivityTabProps) {
  const { activityFeedLimit, setActivityFeedLimit, recentEvents } = model;

  return (
    <section className="border-background-border/20 rounded-2xl border bg-white/10 p-6 shadow-md backdrop-blur-lg">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Typography as="h2">Recent Admin Activity</Typography>
          <Typography as="p" variant="muted">
            Track the most recent actions across orders, refunds, and adjustments.
          </Typography>
        </div>
        <FormSelect
          className="w-auto min-w-[9rem]"
          value={activityFeedLimit}
          onChange={event => setActivityFeedLimit(Number(event.target.value) as 10 | 30 | 50)}
        >
          <option value={10}>Last 10 events</option>
          <option value={30}>Last 30 events</option>
          <option value={50}>Last 50 events</option>
        </FormSelect>
      </div>
      {recentEvents.length === 0 ? (
        <Typography as="p" variant="muted" className="mt-2">
          No activity recorded yet.
        </Typography>
      ) : (
        <div className="border-background-border/20 mt-4 overflow-x-auto rounded-2xl border bg-white/5">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="text-foreground-dimmed1 border-b border-white/10 bg-white/5">
                <th className="px-3 py-3">
                  <Typography as="span" variant="caption" className="tracking-wide uppercase">
                    Time
                  </Typography>
                </th>
                <th className="px-3 py-3">
                  <Typography as="span" variant="caption" className="tracking-wide uppercase">
                    Order
                  </Typography>
                </th>
                <th className="px-3 py-3">
                  <Typography as="span" variant="caption" className="tracking-wide uppercase">
                    Action
                  </Typography>
                </th>
                <th className="px-3 py-3">
                  <Typography as="span" variant="caption" className="tracking-wide uppercase">
                    Summary
                  </Typography>
                </th>
                <th className="px-3 py-3">
                  <Typography as="span" variant="caption" className="tracking-wide uppercase">
                    Admin
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map(event => (
                <tr key={event.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Typography as="span">{new Date(event.createdAt).toLocaleString()}</Typography>
                  </td>
                  <td className="px-3 py-3">
                    <Typography as="span" className="font-mono text-xs">
                      {event.orderId.slice(0, 8).toUpperCase()}
                    </Typography>
                  </td>
                  <td className="px-3 py-3">
                    <Typography as="span">{event.action}</Typography>
                  </td>
                  <td className="px-3 py-3">
                    <Typography as="span">{event.summary}</Typography>
                  </td>
                  <td className="px-3 py-3">
                    <Typography as="span" className="font-mono text-xs">
                      {event.createdBy.slice(0, 8).toUpperCase()}
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

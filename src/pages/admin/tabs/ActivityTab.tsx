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
    <section className="border-background-border bg-background rounded border p-4 shadow">
      <div className="flex items-center justify-between gap-2">
        <Typography as="h2" className="text-foreground-dimmed1 text-lg font-semibold">Recent Admin Activity</Typography>
        <FormSelect
          className="w-auto rounded border px-2 py-1.5 text-xs"
          value={activityFeedLimit}
          onChange={event => setActivityFeedLimit(Number(event.target.value) as 10 | 30 | 50)}
        >
          <option value={10}>Last 10 events</option>
          <option value={30}>Last 30 events</option>
          <option value={50}>Last 50 events</option>
        </FormSelect>
      </div>
      {recentEvents.length === 0 ? (
        <Typography as="p" className="text-foreground-dimmed2 mt-2 text-sm">No activity recorded yet.</Typography>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead>
              <tr className="text-foreground-dimmed1 border-background-border border-b">
                <th className="px-2 py-2">Time</th>
                <th className="px-2 py-2">Order</th>
                <th className="px-2 py-2">Action</th>
                <th className="px-2 py-2">Summary</th>
                <th className="px-2 py-2">Admin</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map(event => (
                <tr key={event.id} className="border-background-border border-b">
                  <td className="px-2 py-2">{new Date(event.createdAt).toLocaleString()}</td>
                  <td className="px-2 py-2">{event.orderId.slice(0, 8)}</td>
                  <td className="px-2 py-2">{event.action}</td>
                  <td className="px-2 py-2">{event.summary}</td>
                  <td className="px-2 py-2">{event.createdBy.slice(0, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

import { useAuth } from "../hooks/useAuth";
import { type OrderRecord } from "../types/order";
import { useUserOrdersQuery } from "../hooks/useCustomerQueries";
import Typography from "../components/Typography";
import LeafLoader from "../components/LeafLoader";

export default function MyOrders() {
  const { user } = useAuth();
  const {
    data: orders = [],
    isLoading,
    isError,
  } = useUserOrdersQuery(user?.uid) as {
    data: OrderRecord[] | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <LeafLoader label="Loading orders" />
      </div>
    );
  }

  const getDiscountAmount = (order: OrderRecord) => {
    if (!order.discount) return 0;
    return order.discount.type === "percent"
      ? (order.estimatedPlanTotal * order.discount.amount) / 100
      : order.discount.amount;
  };

  const getRefundedAmount = (order: OrderRecord) =>
    order.refunds
      .filter(refund => refund.status === "processed")
      .reduce((sum, refund) => sum + refund.amount, 0);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
      <Typography as="h1" className="text-primary text-2xl font-semibold">
        My Orders
      </Typography>
      {orders.length === 0 ? (
        <Typography as="p" className="text-foreground-dimmed2">
          You have no orders yet.
        </Typography>
      ) : (
        <div className="border-background-border bg-background overflow-x-auto rounded border p-4 shadow">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="text-foreground-dimmed1 border-b">
                <th className="px-2 py-2">Order</th>
                <th className="px-2 py-2">Plan</th>
                <th className="px-2 py-2">Box</th>
                <th className="px-2 py-2">Gross</th>
                <th className="px-2 py-2">Discount</th>
                <th className="px-2 py-2">Refunded</th>
                <th className="px-2 py-2">Net</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Refunds</th>
                <th className="px-2 py-2">Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b align-top">
                  <td className="px-2 py-2">{order.id.slice(0, 8)}</td>
                  <td className="px-2 py-2">{order.subscriptionPlan}</td>
                  <td className="px-2 py-2">{order.boxSize}</td>
                  <td className="px-2 py-2">${order.estimatedPlanTotal.toFixed(2)}</td>
                  <td className="px-2 py-2">${getDiscountAmount(order).toFixed(2)}</td>
                  <td className="px-2 py-2">${getRefundedAmount(order).toFixed(2)}</td>
                  <td className="px-2 py-2">
                    $
                    {Math.max(
                      0,
                      order.estimatedPlanTotal - getDiscountAmount(order) - getRefundedAmount(order)
                    ).toFixed(2)}
                  </td>
                  <td className="px-2 py-2">{order.status}</td>
                  <td className="px-2 py-2">
                    {order.refunds.length === 0
                      ? "-"
                      : order.refunds
                          .map(refund => `${refund.status}: $${refund.amount.toFixed(2)}`)
                          .join(", ")}
                  </td>
                  <td className="px-2 py-2">{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isError ? (
        <Typography as="p" className="text-sm text-gray-600">
          Unable to load your orders.
        </Typography>
      ) : null}
    </div>
  );
}

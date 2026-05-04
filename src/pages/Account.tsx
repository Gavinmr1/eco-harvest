import { useEffect, useState } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { Button } from "react-aria-components";
import { useAuth } from "../hooks/useAuth";
import useDynamicMultiColumn from "../hooks/useDynamicMultiColumn";
import Column from "../components/Column";
import { type OrderRecord } from "../types/order";
import {
  useUpdateUserSubscriptionMutation,
  useUserOrdersQuery,
  useUserSubscriptionQuery,
} from "../hooks/useCustomerQueries";
import { EMPTY_SUBSCRIPTION } from "../types/subscription";
import FormInput from "../components/FormInput";
import PageHeader from "../components/PageHeader";
import PageLoaderGate from "../components/PageLoaderGate";
import Typography from "../components/Typography";

export default function Account() {
  const { user } = useAuth();
  const { data: subscriptionData, isLoading: isSubscriptionLoading } = useUserSubscriptionQuery(
    user?.uid
  );
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    isError: isOrdersError,
  } = useUserOrdersQuery(user?.uid) as {
    data: OrderRecord[] | undefined;
    isLoading: boolean;
    isError: boolean;
  };
  const updateSubscriptionMutation = useUpdateUserSubscriptionMutation(user?.uid);
  const subscription = subscriptionData ?? EMPTY_SUBSCRIPTION;

  const [profileDetails, setProfileDetails] = useState({
    fullName: "",
    phone: "",
    deliveryAddress: "",
    zipCode: "",
  });
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(
    () => window.matchMedia("(min-width: 1024px)").matches
  );

  useDynamicMultiColumn({
    topOffsets: ["--navbar-height", "--appSpacing"],
    bottomOffsets: ["--appSpacing"],
  });

  useEffect(() => {
    setProfileDetails({
      fullName: subscription.fullName,
      phone: subscription.phone,
      deliveryAddress: subscription.deliveryAddress,
      zipCode: subscription.zipCode,
    });
  }, [
    subscription.deliveryAddress,
    subscription.fullName,
    subscription.phone,
    subscription.zipCode,
  ]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setJustSaved(false);
    setSaveError(false);
    try {
      await updateSubscriptionMutation.mutateAsync(profileDetails);
      setJustSaved(true);
    } catch (error) {
      console.error("Failed to save profile details:", error);
      setSaveError(true);
    }
  };

  // ── Order helpers ──────────────────────────────────────────────────────────

  const getDiscountAmount = (order: OrderRecord) => {
    if (!order.discount) return 0;
    return order.discount.type === "percent"
      ? (order.estimatedPlanTotal * order.discount.amount) / 100
      : order.discount.amount;
  };

  const getRefundedAmount = (order: OrderRecord) =>
    order.refunds.filter(r => r.status === "processed").reduce((sum, r) => sum + r.amount, 0);

  const getNetAmount = (order: OrderRecord) =>
    Math.max(0, order.estimatedPlanTotal - getDiscountAmount(order) - getRefundedAmount(order));

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatStatus = (status: OrderRecord["status"]) =>
    status
      .split("-")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const getStatusBadgeClass = (status: OrderRecord["status"]) => {
    switch (status) {
      case "delivered":
        return "border-emerald-500/30 bg-emerald-500/20 text-emerald-200";
      case "out-for-delivery":
        return "border-sky-500/30 bg-sky-500/20 text-sky-200";
      case "packed":
        return "border-amber-500/30 bg-amber-500/20 text-amber-200";
      case "canceled":
        return "border-rose-500/30 bg-rose-500/20 text-rose-200";
      default:
        return "border-white/10 bg-white/10 text-foreground-dimmed1";
    }
  };

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsLargeScreen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const statusLabel = subscription.subscriptionStatus.replace(/^./, c => c.toUpperCase());

  if (isSubscriptionLoading || isOrdersLoading) {
    return <PageLoaderGate label="Loading Account..." />;
  }

  return (
    <main className="text-foreground dark:text-secondary-foreground gap-appSpacing flex flex-col py-[calc(var(--appSpacing)*2)]">
      <PageHeader
        title="Account"
        subtitle="Manage your contact details, view your active subscription, and track your order history."
      />
      <div className="gap-appSpacing max-w-9xl px-appSpacing mx-auto flex w-full flex-col lg:flex-row">
        {/* ── Contact & Subscription ─────────────────────────────────────────── */}
        <Column
          off={!isLargeScreen}
          className="gap-appSpacing relative z-10 flex w-full flex-col md:flex-row lg:w-2/5 lg:flex-col xl:w-1/2"
        >
          {/* Subscription summary */}
          {subscription.subscriptionPlan ? (
            <div className="gap-appInnerSpacing flex w-full flex-col rounded-2xl bg-white/10 p-6 shadow-md backdrop-blur-lg">
              <div className="flex flex-col gap-2">
                <Typography as="h2" displayAs="h3">
                  Your Subscription
                </Typography>
                <Typography as="p" variant="muted">
                  A summary of your current box setup.
                </Typography>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="flex flex-col gap-0.5">
                  <Typography as="p" variant="caption" className="tracking-wide uppercase">
                    Plan
                  </Typography>
                  <Typography as="p">{subscription.subscriptionPlan}</Typography>
                </div>
                <div className="flex flex-col gap-0.5">
                  <Typography as="p" variant="caption" className="tracking-wide uppercase">
                    Box Size
                  </Typography>
                  <Typography as="p" className="capitalize">
                    {subscription.boxSize || "—"}
                  </Typography>
                </div>
                <div className="flex flex-col gap-0.5">
                  <Typography as="p" variant="caption" className="tracking-wide uppercase">
                    Status
                  </Typography>
                  <Typography as="p">{statusLabel}</Typography>
                </div>
                {subscription.confirmedAt ? (
                  <div className="flex flex-col gap-0.5">
                    <Typography as="p" variant="caption" className="tracking-wide uppercase">
                      Active Since
                    </Typography>
                    <Typography as="p">{formatDate(subscription.confirmedAt)}</Typography>
                  </div>
                ) : null}
                {subscription.preferences.length > 0 ? (
                  <div className="col-span-2 flex flex-col gap-0.5">
                    <Typography as="p" variant="caption" className="tracking-wide uppercase">
                      Preferences
                    </Typography>
                    <Typography as="p">
                      {subscription.preferences.length <= 3
                        ? subscription.preferences.join(", ")
                        : `${subscription.preferences.slice(0, 3).join(", ")} +${subscription.preferences.length - 3} more`}
                    </Typography>
                  </div>
                ) : null}
              </div>
              <Link to="/build-your-box" className="btn-secondary mt-auto self-end">
                Manage Subscription
              </Link>
            </div>
          ) : (
            <div className="gap-appInnerSpacing flex flex-col rounded-2xl bg-white/10 p-6 shadow-md backdrop-blur-lg">
              <div className="flex flex-col gap-2">
                <Typography as="h2" displayAs="h3">
                  Your Subscription
                </Typography>
                <Typography as="p" variant="muted">
                  No subscription yet. Build your box to get started.
                </Typography>
              </div>
              <Link to="/build-your-box" className="btn-primary mt-auto w-fit self-end">
                Get Started
              </Link>
            </div>
          )}

          {/* Contact & Delivery */}
          <form
            onSubmit={handleProfileSave}
            className="gap-appInnerSpacing flex w-full flex-col rounded-2xl bg-white/10 p-6 shadow-md backdrop-blur-lg"
          >
            <div className="flex flex-col gap-2">
              <Typography as="h2" displayAs="h3">
                Contact &amp; Delivery
              </Typography>
              <Typography as="p" variant="muted">
                Update where and how we deliver your box.
              </Typography>
            </div>
            <FormInput
              type="text"
              placeholder="Full name"
              value={profileDetails.fullName}
              onChange={e => setProfileDetails(prev => ({ ...prev, fullName: e.target.value }))}
              required
            />
            <FormInput
              type="tel"
              placeholder="Phone number"
              value={profileDetails.phone}
              onChange={e => setProfileDetails(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
            <FormInput
              type="text"
              placeholder="Delivery address"
              value={profileDetails.deliveryAddress}
              onChange={e =>
                setProfileDetails(prev => ({ ...prev, deliveryAddress: e.target.value }))
              }
              required
            />
            <FormInput
              type="text"
              placeholder="ZIP code"
              value={profileDetails.zipCode}
              onChange={e => setProfileDetails(prev => ({ ...prev, zipCode: e.target.value }))}
              required
            />
            <div className="mt-auto flex flex-wrap items-center gap-3 self-end">
              {justSaved ? (
                <Typography as="p" variant="muted">
                  Details saved.
                </Typography>
              ) : saveError ? (
                <Typography as="p" className="text-rose-300">
                  Unable to save. Please try again.
                </Typography>
              ) : null}
              <Button
                type="submit"
                className="btn-secondary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                isDisabled={updateSubscriptionMutation.isPending}
              >
                {updateSubscriptionMutation.isPending ? "Saving..." : "Save Details"}
              </Button>
            </div>
          </form>
        </Column>

        {/* ── Order History ──────────────────────────────────────────────────── */}
        <Column
          off={!isLargeScreen}
          className="gap-appInnerSpacing relative z-10 mx-auto flex w-full max-w-5xl flex-col rounded-2xl bg-white/10 p-6 shadow-md backdrop-blur-lg lg:w-3/5 xl:w-1/2"
        >
          <div className="flex flex-col gap-2">
            <Typography as="h2" displayAs="h3">
              Order History
            </Typography>
            <Typography as="p" variant="muted">
              All your past and active box deliveries in one place.
            </Typography>
          </div>

          {/* Error state */}
          {isOrdersError ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 shadow-md backdrop-blur-lg">
              <Typography as="p">
                Unable to load your orders right now. Please refresh and try again.
              </Typography>
            </div>
          ) : null}

          {/* Empty state */}
          {!isOrdersError && orders.length === 0 ? (
            <div className="border-background-border/10 gap-appInnerSpacing flex flex-col items-center rounded-2xl border bg-white/5 px-6 py-12 text-center shadow-md backdrop-blur-lg">
              <div className="flex flex-col gap-2">
                <Typography as="h3">No orders yet</Typography>
                <Typography as="p" variant="muted" className="max-w-md">
                  Once you place your first box order it will appear here.
                </Typography>
              </div>
              <Link to="/build-your-box" className="btn-primary w-fit">
                Build Your Box
              </Link>
            </div>
          ) : null}

          {/* Orders table */}
          {orders.length > 0 ? (
            <div className="border-background-border/10 scrollbar-track:mx-3 w-full overflow-x-auto rounded-2xl border bg-white/5 shadow-md backdrop-blur-lg">
              <div className="relative flex w-full min-w-lg">
                <table className="w-full min-w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Order", "Plan & Box", "Status", "Net Paid", "Placed"].map(col => (
                        <th key={col} className="px-4 py-3">
                          <Typography
                            as="span"
                            variant="caption"
                            className="tracking-wide uppercase"
                          >
                            {col}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr
                        key={order.id}
                        className="border-b border-white/10 align-middle last:border-b-0 hover:bg-white/5"
                      >
                        <td className="px-4 py-3">
                          <Typography as="span" className="font-mono text-xs">
                            {order.id.slice(0, 8).toUpperCase()}
                          </Typography>
                        </td>
                        <td className="px-4 py-3">
                          <Typography as="p">{order.subscriptionPlan}</Typography>
                          <Typography as="p" variant="caption" className="capitalize">
                            {order.boxSize} box
                          </Typography>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={clsx(
                              "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide whitespace-nowrap",
                              getStatusBadgeClass(order.status)
                            )}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Typography as="span">{formatCurrency(getNetAmount(order))}</Typography>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Typography as="span" variant="muted">
                            {formatDate(order.createdAt)}
                          </Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </Column>
      </div>
    </main>
  );
}

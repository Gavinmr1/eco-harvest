import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  useUpdateUserSubscriptionMutation,
  useUserSubscriptionQuery,
} from "../hooks/useCustomerQueries";
import { EMPTY_SUBSCRIPTION, type SubscriptionStatus } from "../types/subscription";

export default function Profile() {
  const { user } = useAuth();
  const { data: subscriptionData, isLoading } = useUserSubscriptionQuery(user?.uid);
  const updateSubscriptionMutation = useUpdateUserSubscriptionMutation(user?.uid);
  const subscription = subscriptionData ?? EMPTY_SUBSCRIPTION;
  const [saveMessage, setSaveMessage] = useState("");

  const [profileDetails, setProfileDetails] = useState({
    fullName: "",
    phone: "",
    deliveryAddress: "",
    zipCode: "",
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
    if (!user) {
      return;
    }

    setSaveMessage("");
    try {
      await updateSubscriptionMutation.mutateAsync(profileDetails);
      setSaveMessage("Profile details saved.");
    } catch (error) {
      console.error("Failed to save profile details:", error);
      setSaveMessage("Unable to save profile details. Please try again.");
    }
  };

  const handleStatusChange = async (nextStatus: SubscriptionStatus) => {
    if (!user) {
      return;
    }

    setSaveMessage("");

    const statusUpdatedAt = new Date().toISOString();
    try {
      await updateSubscriptionMutation.mutateAsync({
        subscriptionStatus: nextStatus,
        statusUpdatedAt,
      });
      setSaveMessage(`Subscription ${nextStatus}.`);
    } catch (error) {
      console.error("Failed to update subscription status:", error);
      setSaveMessage("Unable to update subscription status. Please try again.");
    }
  };

  const statusLabel = subscription.subscriptionStatus.replace(/^./, char => char.toUpperCase());

  if (isLoading) return <div className="text-foreground p-4">Loading...</div>;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
      <h2 className="text-foreground text-2xl font-semibold">Your Profile</h2>
      <form
        onSubmit={handleProfileSave}
        className="border-background-border bg-background flex flex-col gap-3 rounded border p-4 shadow"
      >
        <h3 className="text-foreground-dimmed1 text-lg font-semibold">Contact & Delivery</h3>
        <input
          type="text"
          placeholder="Full name"
          className="w-full rounded border border-gray-300 p-2"
          value={profileDetails.fullName}
          onChange={e => setProfileDetails(prev => ({ ...prev, fullName: e.target.value }))}
          required
        />
        <input
          type="tel"
          placeholder="Phone number"
          className="w-full rounded border border-gray-300 p-2"
          value={profileDetails.phone}
          onChange={e => setProfileDetails(prev => ({ ...prev, phone: e.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="Delivery address"
          className="w-full rounded border border-gray-300 p-2"
          value={profileDetails.deliveryAddress}
          onChange={e => setProfileDetails(prev => ({ ...prev, deliveryAddress: e.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="ZIP code"
          className="w-full rounded border border-gray-300 p-2"
          value={profileDetails.zipCode}
          onChange={e => setProfileDetails(prev => ({ ...prev, zipCode: e.target.value }))}
          required
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="btn-primary"
            disabled={updateSubscriptionMutation.isPending}
          >
            {updateSubscriptionMutation.isPending ? "Saving..." : "Save Details"}
          </button>
          {saveMessage ? <p className="text-sm text-gray-600">{saveMessage}</p> : null}
        </div>
      </form>

      <h2 className="text-foreground mb-4 text-2xl font-semibold">Your Subscription</h2>
      {subscription.subscriptionPlan ? (
        <div className="border-background-border bg-background flex flex-col gap-4 rounded border p-4 shadow">
          <div>
            <h3 className="text-foreground-dimmed1 text-lg font-semibold">Plan</h3>
            <p className="text-foreground-dimmed2">
              {subscription.subscriptionPlan.replace("-week", "-week plan")}
            </p>
          </div>
          <div>
            <h3 className="text-foreground-dimmed1 text-lg font-semibold">Status</h3>
            <p className="text-foreground-dimmed2">{statusLabel}</p>
            {subscription.statusUpdatedAt ? (
              <p className="text-xxs text-foreground-dimmed3">
                Updated {new Date(subscription.statusUpdatedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
          <div>
            <h3 className="text-foreground-dimmed1 text-lg font-semibold">Confirmation</h3>
            <p className="text-foreground-dimmed2">
              {subscription.isSubscriptionConfirmed ? "Confirmed" : "Pending confirmation"}
            </p>
            {subscription.confirmedAt ? (
              <p className="text-xxs text-foreground-dimmed3">
                Confirmed {new Date(subscription.confirmedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
          <div>
            <h3 className="text-foreground-dimmed1 text-lg font-semibold">Box Size</h3>
            <p className="text-foreground-dimmed2">{subscription.boxSize || "Not selected"}</p>
          </div>
          <div>
            <h3 className="text-foreground-dimmed1 text-lg font-semibold">Preferences</h3>
            {subscription.preferences.length > 0 ? (
              <ul className="text-foreground-dimmed2 list-inside list-disc">
                {subscription.preferences.map(pref => (
                  <li key={pref}>{pref}</li>
                ))}
              </ul>
            ) : (
              <p className="text-foreground-dimmed2">No preferences selected</p>
            )}
          </div>
          <Link to="/build-your-box" className="btn-primary self-start">
            Manage Subscription
          </Link>
          <div className="flex flex-wrap gap-2">
            {subscription.subscriptionStatus === "active" ? (
              <button
                type="button"
                onClick={() => handleStatusChange("paused")}
                disabled={updateSubscriptionMutation.isPending}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
              >
                Pause
              </button>
            ) : null}
            {subscription.subscriptionStatus === "paused" ? (
              <button
                type="button"
                onClick={() => handleStatusChange("active")}
                disabled={updateSubscriptionMutation.isPending}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
              >
                Resume
              </button>
            ) : null}
            {subscription.subscriptionStatus !== "canceled" ? (
              <button
                type="button"
                onClick={() => handleStatusChange("canceled")}
                disabled={updateSubscriptionMutation.isPending}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleStatusChange("active")}
                disabled={updateSubscriptionMutation.isPending}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
              >
                Reactivate
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="border-background-border bg-background rounded border p-4 shadow">
          <p className="text-foreground-dimmed1">No subscription selected yet.</p>
          <Link to="/build-your-box" className="btn-primary mt-4 inline-block">
            Get Started
          </Link>
        </div>
      )}
    </div>
  );
}

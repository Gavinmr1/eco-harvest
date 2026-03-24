import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { type PreferenceOption, type SubscriptionPlanOption } from "../types/catalog";
import {
  useCreateOrderMutation,
  usePreferenceOptionsQuery,
  useSubscriptionPlansQuery,
  useUpdateUserSubscriptionMutation,
  useUserSubscriptionQuery,
} from "../hooks/useCustomerQueries";

const WEEKLY_BOX_PRICES: Record<string, number> = {
  small: 15,
  medium: 22,
  large: 35,
};

const DEFAULT_PLANS: SubscriptionPlanOption[] = [
  {
    label: "4 Weeks",
    value: "4-week",
    description: "Try it out for a month—perfect for new members.",
    weeks: 4,
  },
  {
    label: "26 Weeks",
    value: "26-week",
    description: "Enjoy half a year of seasonal freshness.",
    weeks: 26,
  },
  {
    label: "52 Weeks",
    value: "52-week",
    description: "Best value—fresh produce every week for a full year.",
    weeks: 52,
  },
];

const DEFAULT_PREFERENCES: PreferenceOption[] = [
  { label: "Salad Lover", description: "Leafy greens, cucumbers, and other crisp veggies." },
  { label: "Snack Pack", description: "Easy-to-eat, bite-sized produce for busy lifestyles." },
  {
    label: "Italian Style",
    description: "Tomatoes, basil, garlic—great for Mediterranean cooking.",
  },
  { label: "Kid Friendly", description: "Mild and familiar veggies for picky eaters." },
  { label: "Low Carb", description: "Great for keto—cauliflower, greens, peppers, etc." },
  { label: "Root Veggies", description: "Potatoes, carrots, beets—hearty and earthy." },
  { label: "Juicing", description: "Produce perfect for making healthy juices." },
  { label: "Farmhouse Classic", description: "A balanced variety from what’s freshest that week." },
];

export default function BuildYourBox() {
  const { user } = useAuth();
  const { data: subscriptionData, isLoading: isSubscriptionLoading } = useUserSubscriptionQuery(
    user?.uid
  );
  const { data: firestorePlans } = useSubscriptionPlansQuery();
  const { data: firestorePreferences } = usePreferenceOptionsQuery();
  const updateSubscriptionMutation = useUpdateUserSubscriptionMutation(user?.uid);
  const createOrderMutation = useCreateOrderMutation(user?.uid);

  const [plans, setPlans] = useState<SubscriptionPlanOption[]>(DEFAULT_PLANS);
  const [preferences, setPreferences] = useState<PreferenceOption[]>(DEFAULT_PREFERENCES);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [boxSize, setBoxSize] = useState<string>("");
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [isSubscriptionConfirmed, setIsSubscriptionConfirmed] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [orderMessage, setOrderMessage] = useState("");

  useEffect(() => {
    if (!subscriptionData) {
      return;
    }

    setSelectedPlan(subscriptionData.subscriptionPlan);
    setBoxSize(subscriptionData.boxSize);
    setSelectedPrefs(subscriptionData.preferences);
    setIsSubscriptionConfirmed(subscriptionData.isSubscriptionConfirmed);
    setConfirmedAt(subscriptionData.confirmedAt);
  }, [subscriptionData]);

  useEffect(() => {
    if (firestorePlans && firestorePlans.length > 0) {
      setPlans(firestorePlans);
    }
  }, [firestorePlans]);

  useEffect(() => {
    if (firestorePreferences && firestorePreferences.length > 0) {
      setPreferences(firestorePreferences);
    }
  }, [firestorePreferences]);

  const handleSelectPlan = async (plan: string) => {
    if (!user) return;
    try {
      setSelectedPlan(plan);
      setIsSubscriptionConfirmed(false);
      setConfirmedAt(null);
      setConfirmationMessage("");
      setOrderMessage("");
      await updateSubscriptionMutation.mutateAsync({
        subscriptionPlan: plan,
        subscriptionStatus: "active",
        statusUpdatedAt: new Date().toISOString(),
        isSubscriptionConfirmed: false,
        confirmedAt: null,
      });
    } catch (error) {
      console.error("Failed to save subscription plan:", error);
    }
  };

  const handleBoxSizeChange = async (size: string) => {
    if (!user) return;
    try {
      setBoxSize(size);
      setIsSubscriptionConfirmed(false);
      setConfirmedAt(null);
      setConfirmationMessage("");
      setOrderMessage("");
      await updateSubscriptionMutation.mutateAsync({
        boxSize: size,
        isSubscriptionConfirmed: false,
        confirmedAt: null,
      });
    } catch (error) {
      console.error("Failed to save box size:", error);
    }
  };

  const togglePref = async (pref: string) => {
    if (!user) return;
    try {
      const updatedPrefs = selectedPrefs.includes(pref)
        ? selectedPrefs.filter(existingPref => existingPref !== pref)
        : [...selectedPrefs, pref];
      setSelectedPrefs(updatedPrefs);
      setIsSubscriptionConfirmed(false);
      setConfirmedAt(null);
      setConfirmationMessage("");
      setOrderMessage("");
      await updateSubscriptionMutation.mutateAsync({
        preferences: updatedPrefs,
        isSubscriptionConfirmed: false,
        confirmedAt: null,
      });
    } catch (error) {
      console.error("Failed to update preferences:", error);
    }
  };

  const estimatedWeeklyPrice = boxSize ? (WEEKLY_BOX_PRICES[boxSize] ?? null) : null;
  const selectedPlanWeeks = selectedPlan
    ? (plans.find(plan => plan.value === selectedPlan)?.weeks ?? null)
    : null;
  const estimatedPlanTotal =
    estimatedWeeklyPrice && selectedPlanWeeks ? estimatedWeeklyPrice * selectedPlanWeeks : null;

  const handleConfirmSubscription = async () => {
    if (!user) return;
    if (!selectedPlan || !boxSize || !estimatedWeeklyPrice || !selectedPlanWeeks) {
      setConfirmationMessage("Select a plan and box size before confirming.");
      return;
    }

    setIsConfirming(true);
    setConfirmationMessage("");

    const confirmedTimestamp = new Date().toISOString();
    try {
      await updateSubscriptionMutation.mutateAsync({
        subscriptionStatus: "active",
        statusUpdatedAt: confirmedTimestamp,
        isSubscriptionConfirmed: true,
        confirmedAt: confirmedTimestamp,
      });
      setIsSubscriptionConfirmed(true);
      setConfirmedAt(confirmedTimestamp);
      setConfirmationMessage("Subscription confirmed.");
    } catch (error) {
      console.error("Failed to confirm subscription:", error);
      setConfirmationMessage("Unable to confirm subscription. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) return;

    if (
      !isSubscriptionConfirmed ||
      !selectedPlan ||
      !boxSize ||
      !estimatedWeeklyPrice ||
      !selectedPlanWeeks ||
      !estimatedPlanTotal
    ) {
      setOrderMessage("Confirm your subscription before placing an order.");
      return;
    }

    setIsPlacingOrder(true);
    setOrderMessage("");
    try {
      await createOrderMutation.mutateAsync({
        subscriptionPlan: selectedPlan,
        boxSize,
        preferences: selectedPrefs,
        estimatedWeeklyPrice,
        planWeeks: selectedPlanWeeks,
        estimatedPlanTotal,
      });
      setOrderMessage("Order placed successfully.");
    } catch (error) {
      console.error("Failed to place order:", error);
      setOrderMessage("Unable to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isSubscriptionLoading) return <div className="p-4 text-gray-600">Loading...</div>;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <h2 className="text-primary text-2xl font-semibold">Build Your Box</h2>

      {/* Subscription Plans */}
      <section>
        <h3 className="mb-2 text-xl font-semibold">Choose a Plan</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map(({ label, value, description }) => (
            <button
              key={value}
              onClick={() => handleSelectPlan(value)}
              className={`rounded border p-4 text-left shadow transition hover:shadow-md ${
                selectedPlan === value
                  ? "bg-primary border-primary text-white"
                  : "text-primary border-gray-300 bg-white"
              }`}
            >
              <h4 className="text-lg font-semibold">{label}</h4>
              <p className="text-sm opacity-80">{description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Box Size */}
      <section>
        <h3 className="mb-2 text-xl font-semibold">Select a Box Size</h3>
        <select
          className="focus:ring-primary w-full rounded border border-gray-300 p-2 shadow focus:ring-2 focus:outline-none"
          value={boxSize}
          onChange={e => handleBoxSizeChange(e.target.value)}
        >
          <option value="">Choose a size</option>
          <option value="small">Small (3–4 items)</option>
          <option value="medium">Medium (5–7 items)</option>
          <option value="large">Large (8–10 items)</option>
        </select>
      </section>

      {/* Preferences */}
      <section>
        <h3 className="mb-2 text-xl font-semibold">Choose Your Preferences</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {preferences.map(({ label, description }) => (
            <label
              key={label}
              className="flex cursor-pointer gap-3 rounded border border-gray-300 bg-white p-3 shadow-sm hover:shadow-md"
            >
              <input
                type="checkbox"
                checked={selectedPrefs.includes(label)}
                onChange={() => togglePref(label)}
                className="accent-primary mt-1"
              />
              <div>
                <div className="text-primary font-semibold">{label}</div>
                <div className="text-sm text-gray-600">{description}</div>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="border-background-border bg-background space-y-3 rounded border p-4 shadow">
        <h3 className="text-xl font-semibold">Order Preview</h3>
        <p className="text-foreground-dimmed2 text-sm">
          Review estimated pricing and confirm your current subscription setup.
        </p>
        <div className="text-foreground-dimmed2 space-y-1 text-sm">
          <p>
            Weekly estimate: {estimatedWeeklyPrice ? `$${estimatedWeeklyPrice.toFixed(2)}` : "-"}
          </p>
          <p>Plan duration: {selectedPlanWeeks ? `${selectedPlanWeeks} weeks` : "-"}</p>
          <p>Total estimate: {estimatedPlanTotal ? `$${estimatedPlanTotal.toFixed(2)}` : "-"}</p>
          <p>Status: {isSubscriptionConfirmed ? "Confirmed" : "Pending confirmation"}</p>
          {confirmedAt ? (
            <p className="text-xxs">Confirmed {new Date(confirmedAt).toLocaleString()}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleConfirmSubscription}
          disabled={isConfirming}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isConfirming ? "Confirming..." : "Confirm Subscription"}
        </button>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || !isSubscriptionConfirmed}
          className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPlacingOrder ? "Placing Order..." : "Place Order"}
        </button>
        {confirmationMessage ? (
          <p className="text-sm text-gray-600">{confirmationMessage}</p>
        ) : null}
        {orderMessage ? <p className="text-sm text-gray-600">{orderMessage}</p> : null}
      </section>
    </div>
  );
}

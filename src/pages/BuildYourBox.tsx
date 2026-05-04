import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Button, Checkbox } from "react-aria-components";
import { useAuth } from "../hooks/useAuth";
import BuildSectionCard from "../components/BuildSectionCard";
import { type PreferenceOption, type SubscriptionPlanOption } from "../types/catalog";
import {
  useCreateOrderMutation,
  usePreferenceOptionsQuery,
  useSubscriptionPlansQuery,
  useUpdateUserSubscriptionMutation,
  useUserSubscriptionQuery,
} from "../hooks/useCustomerQueries";
import { type SubscriptionStatus } from "../types/subscription";
import PageHeader from "../components/PageHeader";
import PageLoaderGate from "../components/PageLoaderGate";
import Typography from "../components/Typography";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isBoxSizeOpen, setIsBoxSizeOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const boxSizeRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isBoxSizeOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (boxSizeRef.current && !boxSizeRef.current.contains(e.target as Node)) {
        setIsBoxSizeOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsBoxSizeOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isBoxSizeOpen]);

  useEffect(() => {
    if (!isActionsMenuOpen) return;

    const onClickOutside = (e: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsActionsMenuOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isActionsMenuOpen]);

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
      setJustSaved(false);
      setJustSubscribed(false);
      setMutationError(null);

      if (hasConfirmedSubscription) {
        return;
      }

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
      setJustSaved(false);
      setJustSubscribed(false);
      setMutationError(null);

      if (hasConfirmedSubscription) {
        return;
      }

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
      setJustSaved(false);
      setJustSubscribed(false);
      setMutationError(null);

      if (hasConfirmedSubscription) {
        return;
      }

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

  const handleSubscribeAndOrder = async () => {
    if (!user) return;
    if (
      !selectedPlan ||
      !boxSize ||
      !estimatedWeeklyPrice ||
      !selectedPlanWeeks ||
      !estimatedPlanTotal
    ) {
      return;
    }

    setIsSubmitting(true);
    setJustSaved(false);
    setMutationError(null);

    const now = new Date().toISOString();
    try {
      if (hasConfirmedSubscription) {
        // Existing subscriber: just update the subscription
        await updateSubscriptionMutation.mutateAsync({
          subscriptionPlan: selectedPlan,
          boxSize,
          preferences: selectedPrefs,
          subscriptionStatus: "active",
          statusUpdatedAt: now,
        });
        setJustSaved(true);
      } else {
        // New subscriber: update subscription + create first order
        await updateSubscriptionMutation.mutateAsync({
          subscriptionStatus: "active",
          statusUpdatedAt: now,
          isSubscriptionConfirmed: true,
          confirmedAt: now,
        });
        setIsSubscriptionConfirmed(true);
        setConfirmedAt(now);
        await createOrderMutation.mutateAsync({
          subscriptionPlan: selectedPlan,
          boxSize,
          preferences: selectedPrefs,
          estimatedWeeklyPrice,
          planWeeks: selectedPlanWeeks,
          estimatedPlanTotal,
        });
        setJustSubscribed(true);
      }
    } catch (error) {
      console.error("Failed to update subscription:", error);
      setMutationError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (nextStatus: SubscriptionStatus) => {
    if (!user) return;
    setMutationError(null);
    setIsActionsMenuOpen(false);
    try {
      await updateSubscriptionMutation.mutateAsync({
        subscriptionStatus: nextStatus,
        statusUpdatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to update subscription status:", error);
      setMutationError("Unable to update subscription status. Please try again.");
    }
  };

  const currentStatus = subscriptionData?.subscriptionStatus ?? "active";
  const isReady = !!selectedPlan && !!boxSize;
  const planLabel = plans.find(p => p.value === selectedPlan)?.label ?? selectedPlan;
  const hasConfirmedSubscription = !!subscriptionData?.isSubscriptionConfirmed;
  const hasChanges =
    hasConfirmedSubscription &&
    (selectedPlan !== subscriptionData.subscriptionPlan ||
      boxSize !== subscriptionData.boxSize ||
      JSON.stringify(selectedPrefs) !== JSON.stringify(subscriptionData.preferences));

  const incompleteSteps = [
    !selectedPlan ? 1 : null,
    !boxSize ? 2 : null,
    selectedPrefs.length === 0 ? 3 : null,
  ].filter((step): step is number => step !== null);

  const stepsIncompleteText =
    incompleteSteps.length === 0
      ? "none of the steps"
      : incompleteSteps.length === 1
        ? `step ${incompleteSteps[0]}`
        : incompleteSteps.length === 2
          ? `steps ${incompleteSteps[0]} and ${incompleteSteps[1]}`
          : "all steps";

  const primaryActionLabel = hasConfirmedSubscription
    ? isSubmitting
      ? "Saving..."
      : "Save My Subscription"
    : isSubmitting
      ? "Processing..."
      : "Start My Subscription";
  const statusPillClass = mutationError
    ? "border-red-500/30 bg-red-500/15 text-red-200"
    : currentStatus === "active"
      ? "border-green-500/30 bg-green-500/15 text-green-200"
      : currentStatus === "paused"
        ? "border-yellow-500/30 bg-yellow-500/15 text-yellow-200"
        : "border-red-500/30 bg-red-500/15 text-red-200";
  const subscriptionStateLabel = mutationError
    ? "Error"
    : currentStatus === "active"
      ? "Active"
      : currentStatus === "paused"
        ? "Paused"
        : "Canceled";
  const subscriptionStateMessage = mutationError
    ? mutationError
    : justSubscribed
      ? "You're all set — your first box is on its way."
      : currentStatus === "active"
        ? justSaved
          ? "All saved. Your changes will apply to your next delivery."
          : hasChanges
            ? "You have unsaved changes. Save to apply them to your next delivery."
            : "Your subscription is active and deliveries are on schedule."
        : currentStatus === "paused"
          ? "Deliveries are paused. Resume anytime from the menu."
          : "Your subscription is canceled. Reactivate from the menu whenever you're ready.";
  const statusCardClass = mutationError
    ? "border-red-500/20 bg-red-500/10"
    : hasChanges
      ? "border-yellow-500/20 bg-yellow-500/10"
      : justSaved || justSubscribed
        ? "border-green-500/20 bg-green-500/10"
        : "border-white/10 bg-white/5";

  const subscriptionMenuActions =
    currentStatus === "active"
      ? [
          { label: "Pause Deliveries", onPress: () => handleStatusChange("paused") },
          {
            label: "Cancel Subscription",
            onPress: () => handleStatusChange("canceled"),
            destructive: true,
          },
        ]
      : currentStatus === "paused"
        ? [
            { label: "Resume Deliveries", onPress: () => handleStatusChange("active") },
            {
              label: "Cancel Subscription",
              onPress: () => handleStatusChange("canceled"),
              destructive: true,
            },
          ]
        : [{ label: "Reactivate Subscription", onPress: () => handleStatusChange("active") }];

  if (isSubscriptionLoading) {
    return <PageLoaderGate label="Loading Subscription..." />;
  }

  return (
    <main className="text-foreground dark:text-secondary-foreground gap-appSpacing z-10 flex flex-col py-[calc(var(--appSpacing)*2)]">
      <PageHeader
        title={hasConfirmedSubscription ? "Manage Your Box" : "Build Your Box"}
        subtitle={
          hasConfirmedSubscription
            ? "Update your preferences, plan, or box size. Changes apply to your next delivery."
            : "Follow the four steps below to build your perfect weekly produce box."
        }
      />

      <section className="px-appSpacing gap-appInnerSpacing relative z-10 mx-auto flex w-full max-w-4xl flex-col">
        {/* Plans */}
        <BuildSectionCard
          step="1"
          isComplete={!!selectedPlan}
          title="Choose a Plan"
          description="Select how long you'd like your weekly deliveries to run."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map(({ label, value, description }) => (
              <Button
                key={value}
                type="button"
                onPress={() => handleSelectPlan(value)}
                className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-4 text-left transition-all duration-200 ${
                  selectedPlan === value
                    ? "border-yellow-500 bg-yellow-500/20 text-white"
                    : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Typography as="h3" displayAs="h5">
                  {label}
                </Typography>
                <Typography as="p" displayAs="body" variant="muted">
                  {description}
                </Typography>
              </Button>
            ))}
          </div>
        </BuildSectionCard>

        {/* Box Size */}
        <BuildSectionCard
          step="2"
          isComplete={!!boxSize}
          title="Select a Box Size"
          description="How much produce would you like each week?"
          className="z-10" // Ensure this section is above the background image and dropdown
        >
          <div className="relative" ref={boxSizeRef}>
            <Button
              type="button"
              onPress={() => setIsBoxSizeOpen(o => !o)}
              aria-expanded={isBoxSizeOpen}
              className="text-foreground flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/20 bg-white/15 px-3 py-2 transition-all focus:border-yellow-500 focus:ring-yellow-500"
            >
              <Typography as="span">
                {boxSize === "small"
                  ? "Small — 3 to 4 items"
                  : boxSize === "medium"
                    ? "Medium — 5 to 7 items"
                    : boxSize === "large"
                      ? "Large — 8 to 10 items"
                      : "Choose a size"}
              </Typography>
              <Typography as="span" variant="caption" className="ml-2">
                {isBoxSizeOpen ? "▲" : "▼"}
              </Typography>
            </Button>

            {isBoxSizeOpen && (
              <div className="bg-background absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                <div className="flex flex-col gap-1 py-1">
                  {[
                    { value: "small", label: "Small — 3 to 4 items" },
                    { value: "medium", label: "Medium — 5 to 7 items" },
                    { value: "large", label: "Large — 8 to 10 items" },
                  ].map(opt => (
                    <Button
                      key={opt.value}
                      type="button"
                      onPress={() => {
                        handleBoxSizeChange(opt.value);
                        setIsBoxSizeOpen(false);
                      }}
                      className={`flex items-center px-4 py-2 text-left text-white transition-all hover:bg-white/10 ${
                        boxSize === opt.value ? "bg-yellow-500 font-medium hover:bg-yellow-500" : ""
                      }`}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </BuildSectionCard>

        {/* Preferences */}
        <BuildSectionCard
          step="3"
          isComplete={selectedPrefs.length > 0}
          title="Your Preferences"
          description="Tell us what you enjoy so we can tailor your box. This step is optional."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {preferences.map(({ label, description }) => (
              <Checkbox
                key={label}
                isSelected={selectedPrefs.includes(label)}
                onChange={() => togglePref(label)}
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-all duration-200 ${
                  selectedPrefs.includes(label)
                    ? "border-yellow-500 bg-yellow-500/20"
                    : "border-white/20 bg-white/10 hover:bg-white/20"
                }`}
              >
                {({ isSelected }) => (
                  <>
                    <div
                      aria-hidden="true"
                      className={clsx(
                        "mt-1 flex size-5 shrink-0 items-center justify-center rounded border text-xs font-bold transition-colors",
                        isSelected
                          ? "border-yellow-500 bg-yellow-500 text-white"
                          : "border-white/20 bg-white/10"
                      )}
                    >
                      {isSelected ? "✓" : null}
                    </div>
                    <div>
                      <Typography as="p">{label}</Typography>
                      <Typography as="p" displayAs="body" variant="muted" className="mt-0.5">
                        {description}
                      </Typography>
                    </div>
                  </>
                )}
              </Checkbox>
            ))}
          </div>
        </BuildSectionCard>

        {/* Review & Subscribe */}
        <BuildSectionCard
          step="4"
          isComplete={isReady}
          title={
            hasConfirmedSubscription
              ? hasChanges
                ? "Update Subscription"
                : "Subscription Active"
              : "Review & Subscribe"
          }
          description={
            hasConfirmedSubscription && !hasChanges
              ? "Your subscription is active and will continue on schedule."
              : "Review your selections and confirm to continue."
          }
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-white/5 p-4 text-sm sm:grid-cols-3">
            <div className="flex flex-col gap-0.5">
              <Typography as="p" variant="caption" className="tracking-wide uppercase">
                Plan
              </Typography>
              <Typography as="p">{planLabel ?? "Not selected"}</Typography>
            </div>
            <div className="flex flex-col gap-0.5">
              <Typography as="p" variant="caption" className="tracking-wide uppercase">
                Box Size
              </Typography>
              <Typography as="p" className="capitalize">
                {boxSize || "Not selected"}
              </Typography>
            </div>
            <div className="flex flex-col gap-0.5">
              <Typography as="p" variant="caption" className="tracking-wide uppercase">
                Weekly Cost
              </Typography>
              <Typography as="p">
                {estimatedWeeklyPrice ? `$${estimatedWeeklyPrice.toFixed(2)}` : "—"}
              </Typography>
            </div>
            <div className="flex flex-col gap-0.5">
              <Typography as="p" variant="caption" className="tracking-wide uppercase">
                Duration
              </Typography>
              <Typography as="p">
                {selectedPlanWeeks ? `${selectedPlanWeeks} weeks` : "—"}
              </Typography>
            </div>
            <div className="flex flex-col gap-0.5">
              <Typography as="p" variant="caption" className="tracking-wide uppercase">
                Preferences
              </Typography>
              <Typography as="p">
                {selectedPrefs.length > 0
                  ? selectedPrefs.length <= 2
                    ? selectedPrefs.join(", ")
                    : `${selectedPrefs.slice(0, 2).join(", ")} +${selectedPrefs.length - 2} more`
                  : "None selected"}
              </Typography>
            </div>
            <div className="flex flex-col gap-0.5">
              <Typography as="p" variant="caption" className="tracking-wide uppercase">
                Estimated Total
              </Typography>
              <Typography as="p">
                {estimatedPlanTotal ? `$${estimatedPlanTotal.toFixed(2)}` : "—"}
              </Typography>
            </div>
          </div>

          {!isReady && (
            <Typography as="p" variant="muted" className="mb-appInnerSpacing">
              Complete {stepsIncompleteText} above to continue.
            </Typography>
          )}
          <div className="gap-appInnerSpacing flex w-full flex-col">
            {hasConfirmedSubscription ? (
              <>
                <hr className="border-white/10" />
                <div className="gap-appInnerSpacing flex flex-col">
                  <div className="flex flex-col gap-2">
                    <Typography as="h2" displayAs="h4">
                      Manage Subscription
                    </Typography>

                    <Typography as="p" variant="muted">
                      Pause, resume, or cancel your deliveries at any time.
                    </Typography>
                  </div>
                  <div className={clsx("flex gap-2 rounded-xl border p-3", statusCardClass)}>
                    <div
                      className={clsx(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border text-center text-xs text-white",
                        statusPillClass
                      )}
                    >
                      {mutationError
                        ? "!"
                        : currentStatus === "active"
                          ? "✓"
                          : currentStatus === "paused"
                            ? "⏸"
                            : "✕"}
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Typography as="p">Subscription Status</Typography>
                        <span
                          className={clsx(
                            "rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide uppercase",
                            statusPillClass
                          )}
                        >
                          {subscriptionStateLabel}
                        </span>
                      </div>
                      <Typography as="p" variant="muted">
                        {subscriptionStateMessage}
                      </Typography>
                      {confirmedAt && isSubscriptionConfirmed ? (
                        <Typography as="p" variant="caption">
                          Active since {new Date(confirmedAt).toLocaleString()}
                        </Typography>
                      ) : null}
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            <div className="gap-appInnerSpacing flex w-full flex-wrap items-center justify-between">
              <div className="ml-auto flex items-center gap-2">
                <Button
                  type="button"
                  onPress={handleSubscribeAndOrder}
                  isDisabled={isSubmitting || !isReady || (hasConfirmedSubscription && !hasChanges)}
                  className="btn-secondary ml-auto flex whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
                >
                  {primaryActionLabel}
                </Button>
                <div className="relative" ref={actionsMenuRef}>
                  <Button
                    type="button"
                    onPress={() => setIsActionsMenuOpen(open => !open)}
                    aria-expanded={isActionsMenuOpen}
                    aria-haspopup="menu"
                    className="hover:text-foreground-dimmed2 flex cursor-pointer items-center justify-center p-1 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    isDisabled={updateSubscriptionMutation.isPending || isSubmitting}
                  >
                    <span className="text-xl leading-none">⋮</span>
                  </Button>

                  {isActionsMenuOpen ? (
                    <div className="bg-background absolute top-full right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                      <div className="flex flex-col gap-1 py-1">
                        {subscriptionMenuActions.map(action => (
                          <Button
                            key={action.label}
                            type="button"
                            onPress={action.onPress}
                            isDisabled={updateSubscriptionMutation.isPending}
                            className={clsx(
                              "cursor-pointer px-4 py-2 text-left transition-all hover:bg-white/10",
                              action.destructive ? "text-red-400" : "text-white"
                            )}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </BuildSectionCard>
      </section>
    </main>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-aria-components";
import { useAuth } from "../hooks/useAuth";
import {
  useUpdateUserSubscriptionMutation,
  useUserSubscriptionQuery,
} from "../hooks/useCustomerQueries";
import { EMPTY_SUBSCRIPTION } from "../types/subscription";
import veggiesBgImage from "../assets/images/veggies-bg.webp";
import FormInput from "../components/FormInput";
import Typography from "../components/Typography";
import Loader from "../components/Loader";

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

  const statusLabel = subscription.subscriptionStatus.replace(/^./, char => char.toUpperCase());

  if (!isLoading) {
    return <Loader label="Loading Profile..." variant="crate" />;
  }

  return (
    <main className="text-foreground dark:text-secondary-foreground gap-appSpacing flex flex-col py-[calc(var(--appSpacing)*2)]">
      <div
        className="mask-fade fixed top-0 left-0 z-0 h-screen w-full bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${veggiesBgImage})` }}
      />

      <section className="px-appSpacing gap-appInnerSpacing relative z-10 mx-auto flex w-full max-w-4xl flex-col text-center">
        <Typography as="h1" className="text-foreground text-4xl font-bold">
          Your Profile
        </Typography>
        <Typography as="p" className="text-foreground-dimmed3 mx-auto max-w-2xl text-lg">
          Manage your contact details and keep your weekly subscription exactly how you like it.
        </Typography>
      </section>

      <section className="px-appSpacing relative z-10 mx-auto grid w-full max-w-4xl gap-4 lg:grid-cols-2">
        <form
          onSubmit={handleProfileSave}
          className="border-background-border/20 gap-appInnerSpacing flex flex-col rounded-2xl border bg-white/10 p-6 shadow-md backdrop-blur-lg"
        >
          <div className="flex grow flex-col gap-2">
            <Typography as="h2" className="text-foreground text-2xl font-semibold">
              Contact & Delivery
            </Typography>
            <Typography as="p" className="text-foreground-dimmed3 text-base">
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
            {saveMessage ? (
              <Typography as="p" className="text-foreground-dimmed3 text-sm">
                {saveMessage}
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

        {subscription.subscriptionPlan ? (
          <div className="border-background-border/20 gap-appInnerSpacing flex flex-col rounded-2xl border bg-white/10 p-6 shadow-md backdrop-blur-lg">
            <Typography as="h2" className="text-foreground text-2xl font-semibold">
              Your Subscription
            </Typography>
            <div>
              <Typography as="h3" className="text-foreground-dimmed1 text-lg font-semibold">
                Plan
              </Typography>
              <Typography as="p" className="text-foreground-dimmed3">
                {subscription.subscriptionPlan.replace("-week", "-week plan")}
              </Typography>
            </div>
            <div>
              <Typography as="h3" className="text-foreground-dimmed1 text-lg font-semibold">
                Status
              </Typography>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Typography as="p" className="text-foreground-dimmed3">
                  {statusLabel}
                </Typography>
                {subscription.statusUpdatedAt ? (
                  <Typography
                    as="p"
                    className="bg-background/60 text-background-foreground w-fit rounded-full px-3 py-1 text-xs"
                  >
                    Updated {new Date(subscription.statusUpdatedAt).toLocaleString()}
                  </Typography>
                ) : null}
              </div>
            </div>

            <div>
              <Typography as="h3" className="text-foreground-dimmed1 text-lg font-semibold">
                Box Size
              </Typography>
              <Typography as="p" className="text-foreground-dimmed3">
                {subscription.boxSize || "Not selected"}
              </Typography>
            </div>
            <div>
              <Typography as="h3" className="text-foreground-dimmed1 text-lg font-semibold">
                Preferences
              </Typography>
              {subscription.preferences.length > 0 ? (
                <ul className="text-foreground-dimmed3 list-inside list-disc">
                  {subscription.preferences.map(pref => (
                    <li key={pref}>{pref}</li>
                  ))}
                </ul>
              ) : (
                <Typography as="p" className="text-foreground-dimmed2">
                  No preferences selected
                </Typography>
              )}
            </div>
            <Link to="/build-your-box" className="btn-secondary mt-auto self-end">
              Manage Subscription
            </Link>
          </div>
        ) : (
          <div className="gap-appInnerSpacing border-background-border/20 flex flex-col rounded-2xl border bg-white/10 p-6 shadow-md backdrop-blur-lg">
            <div className="flex grow flex-col gap-2">
              <Typography as="h2" className="text-foreground text-2xl font-semibold">
                Your Subscription
              </Typography>
              <Typography as="p" className="text-foreground-dimmed1">
                No subscription selected yet.
              </Typography>{" "}
            </div>
            <Link to="/build-your-box" className="btn-primary inline-block w-fit self-end">
              Get Started
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<{
    subscriptionPlan: string | null;
    preferences: string[];
    boxSize: string;
  }>({ subscriptionPlan: null, preferences: [], boxSize: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadSubscription = async () => {
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        const data = docSnap.data();
        setSubscription({
          subscriptionPlan: data?.subscriptionPlan || null,
          preferences: data?.preferences || [],
          boxSize: data?.boxSize || "",
        });
      } catch (error) {
        console.error("Failed to load subscription:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSubscription();
  }, [user]);

  if (loading) return <div className="text-foreground p-4">Loading...</div>;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
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

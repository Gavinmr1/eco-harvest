import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";

const plans = [
  {
    label: "4 Weeks",
    value: "4-week",
    description: "Try it out for a month—perfect for new members.",
  },
  { label: "26 Weeks", value: "26-week", description: "Enjoy half a year of seasonal freshness." },
  {
    label: "52 Weeks",
    value: "52-week",
    description: "Best value—fresh produce every week for a full year.",
  },
];

const preferences = [
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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [boxSize, setBoxSize] = useState<string>("");
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadUserData = async () => {
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        const data = docSnap.data();
        setSelectedPlan(data?.subscriptionPlan || null);
        setBoxSize(data?.boxSize || "");
        setSelectedPrefs(data?.preferences || []);
      } catch (error) {
        console.error("Failed to load subscription data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [user]);

  const handleSelectPlan = async (plan: string) => {
    if (!user) return;
    try {
      setSelectedPlan(plan);
      await setDoc(doc(db, "users", user.uid), { subscriptionPlan: plan }, { merge: true });
    } catch (error) {
      console.error("Failed to save subscription plan:", error);
    }
  };

  const handleBoxSizeChange = async (size: string) => {
    if (!user) return;
    try {
      setBoxSize(size);
      await setDoc(doc(db, "users", user.uid), { boxSize: size }, { merge: true });
    } catch (error) {
      console.error("Failed to save box size:", error);
    }
  };

  const togglePref = async (pref: string) => {
    if (!user) return;
    try {
      const updatedPrefs = selectedPrefs.includes(pref)
        ? selectedPrefs.filter(p => p !== pref)
        : [...selectedPrefs, pref];
      setSelectedPrefs(updatedPrefs);
      await setDoc(doc(db, "users", user.uid), { preferences: updatedPrefs }, { merge: true });
    } catch (error) {
      console.error("Failed to update preferences:", error);
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Loading...</div>;

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
    </div>
  );
}

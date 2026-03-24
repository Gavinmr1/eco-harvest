import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const parseEnvFile = envPath => {
  if (!fs.existsSync(envPath)) return {};

  const content = fs.readFileSync(envPath, "utf8");
  const entries = content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"))
    .map(line => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) return [line, ""];
      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      return [key, value.replace(/^['\"]|['\"]$/g, "")];
    });

  return Object.fromEntries(entries);
};

const envFromFile = parseEnvFile(path.join(projectRoot, ".env"));
const getEnv = key => process.env[key] ?? envFromFile[key] ?? "";

const serviceAccountJson = getEnv("FIREBASE_SERVICE_ACCOUNT_JSON");
const serviceAccountPath = getEnv("FIREBASE_SERVICE_ACCOUNT_PATH");

let serviceAccount = null;
if (serviceAccountJson) {
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch {
    console.error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.");
    process.exit(1);
  }
} else if (serviceAccountPath) {
  const resolvedPath = path.isAbsolute(serviceAccountPath)
    ? serviceAccountPath
    : path.join(projectRoot, serviceAccountPath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`Service account file not found: ${resolvedPath}`);
    process.exit(1);
  }

  serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
} else {
  console.error("Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH in .env");
  process.exit(1);
}

const defaultPlans = [
  {
    id: "4-week",
    label: "4 Weeks",
    value: "4-week",
    description: "Try it out for a month—perfect for new members.",
    weeks: 4,
  },
  {
    id: "26-week",
    label: "26 Weeks",
    value: "26-week",
    description: "Enjoy half a year of seasonal freshness.",
    weeks: 26,
  },
  {
    id: "52-week",
    label: "52 Weeks",
    value: "52-week",
    description: "Best value—fresh produce every week for a full year.",
    weeks: 52,
  },
];

const defaultPreferences = [
  {
    id: "salad-lover",
    label: "Salad Lover",
    description: "Leafy greens, cucumbers, and other crisp veggies.",
  },
  {
    id: "snack-pack",
    label: "Snack Pack",
    description: "Easy-to-eat, bite-sized produce for busy lifestyles.",
  },
  {
    id: "italian-style",
    label: "Italian Style",
    description: "Tomatoes, basil, garlic—great for Mediterranean cooking.",
  },
  {
    id: "kid-friendly",
    label: "Kid Friendly",
    description: "Mild and familiar veggies for picky eaters.",
  },
  {
    id: "low-carb",
    label: "Low Carb",
    description: "Great for keto—cauliflower, greens, peppers, etc.",
  },
  {
    id: "root-veggies",
    label: "Root Veggies",
    description: "Potatoes, carrots, beets—hearty and earthy.",
  },
  { id: "juicing", label: "Juicing", description: "Produce perfect for making healthy juices." },
  {
    id: "farmhouse-classic",
    label: "Farmhouse Classic",
    description: "A balanced variety from what’s freshest that week.",
  },
];

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

const seedCatalog = async () => {
  const batch = db.batch();

  for (const plan of defaultPlans) {
    const ref = db.collection("catalog_plans").doc(plan.id);
    batch.set(ref, {
      label: plan.label,
      value: plan.value,
      description: plan.description,
      weeks: plan.weeks,
    });
  }

  for (const preference of defaultPreferences) {
    const ref = db.collection("catalog_preferences").doc(preference.id);
    batch.set(ref, {
      label: preference.label,
      description: preference.description,
    });
  }

  await batch.commit();

  console.log(
    `Seeded ${defaultPlans.length} catalog plans and ${defaultPreferences.length} preference options.`
  );
  console.log("Collections: catalog_plans, catalog_preferences");
};

seedCatalog().catch(error => {
  console.error("Failed to seed catalog:", error);
  process.exit(1);
});

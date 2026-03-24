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

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

const now = new Date();
const isoDaysAgo = days => {
  const date = new Date(now);
  date.setDate(now.getDate() - days);
  return date.toISOString();
};

const demoOrders = [
  {
    id: "demo-order-001",
    userId: "demo-user-alpha",
    subscriptionPlan: "26-week",
    boxSize: "Medium",
    preferences: ["salad-lover", "kid-friendly"],
    estimatedWeeklyPrice: 29.99,
    planWeeks: 26,
    estimatedPlanTotal: 779.74,
    discount: {
      code: "WELCOME10",
      amount: 10,
      type: "percent",
      appliedAt: isoDaysAgo(5),
      appliedBy: "demo-admin-01",
    },
    refunds: [
      {
        id: "demo-refund-001",
        amount: 24.5,
        status: "requested",
        reasonCode: "delivery_issue",
        reasonDetails: "Box arrived 4 days late and contents were warm.",
        requestedAt: isoDaysAgo(4),
        requestedBy: "demo-admin-01",
        approvedAt: null,
        approvedBy: null,
        processedAt: null,
        processedBy: null,
      },
    ],
    adminAdjustmentNote: "Customer requested delivery day change for next shipment.",
    adjustedAt: isoDaysAgo(2),
    adjustedBy: "demo-admin-01",
    status: "out-for-delivery",
    createdAt: isoDaysAgo(9),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "demo-order-002",
    userId: "demo-user-bravo",
    subscriptionPlan: "4-week",
    boxSize: "Small",
    preferences: ["juicing"],
    estimatedWeeklyPrice: 19.5,
    planWeeks: 4,
    estimatedPlanTotal: 78,
    discount: null,
    refunds: [
      {
        id: "demo-refund-002",
        amount: 10,
        status: "requested",
        reasonCode: "missing_items",
        reasonDetails: "Two items listed were not in the box.",
        requestedAt: isoDaysAgo(1),
        requestedBy: "demo-admin-01",
        approvedAt: null,
        approvedBy: null,
        processedAt: null,
        processedBy: null,
      },
    ],
    adminAdjustmentNote: "",
    adjustedAt: null,
    adjustedBy: null,
    status: "packed",
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "demo-order-003",
    userId: "demo-user-charlie",
    subscriptionPlan: "52-week",
    boxSize: "Large",
    preferences: ["farmhouse-classic", "root-veggies"],
    estimatedWeeklyPrice: 42,
    planWeeks: 52,
    estimatedPlanTotal: 2184,
    discount: {
      code: "FARM20",
      amount: 20,
      type: "fixed",
      appliedAt: isoDaysAgo(10),
      appliedBy: "demo-admin-01",
    },
    refunds: [
      {
        id: "demo-refund-003",
        amount: 18,
        status: "approved",
        reasonCode: "damaged_items",
        reasonDetails: "Produce bruised due to packaging issue.",
        requestedAt: isoDaysAgo(3),
        requestedBy: "demo-admin-01",
        approvedAt: isoDaysAgo(2),
        approvedBy: "demo-admin-02",
        processedAt: null,
        processedBy: null,
      },
    ],
    adminAdjustmentNote: "Prioritize quality check on next shipment.",
    adjustedAt: isoDaysAgo(2),
    adjustedBy: "demo-admin-02",
    status: "active",
    createdAt: isoDaysAgo(18),
    updatedAt: isoDaysAgo(2),
  },
  {
    id: "demo-order-004",
    userId: "demo-user-delta",
    subscriptionPlan: "26-week",
    boxSize: "Medium",
    preferences: ["italian-style"],
    estimatedWeeklyPrice: 27.25,
    planWeeks: 26,
    estimatedPlanTotal: 708.5,
    discount: null,
    refunds: [
      {
        id: "demo-refund-004",
        amount: 12,
        status: "processed",
        reasonCode: "order_error",
        reasonDetails: "Incorrect box size shipped.",
        requestedAt: isoDaysAgo(6),
        requestedBy: "demo-admin-01",
        approvedAt: isoDaysAgo(5),
        approvedBy: "demo-admin-01",
        processedAt: isoDaysAgo(1),
        processedBy: "demo-admin-02",
      },
    ],
    adminAdjustmentNote: "Replacement box sent.",
    adjustedAt: isoDaysAgo(5),
    adjustedBy: "demo-admin-01",
    status: "delivered",
    createdAt: isoDaysAgo(14),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "demo-order-005",
    userId: "demo-user-echo",
    subscriptionPlan: "4-week",
    boxSize: "Small",
    preferences: ["low-carb"],
    estimatedWeeklyPrice: 21,
    planWeeks: 4,
    estimatedPlanTotal: 84,
    discount: null,
    refunds: [],
    adminAdjustmentNote: "",
    adjustedAt: null,
    adjustedBy: null,
    status: "new",
    createdAt: isoDaysAgo(0),
    updatedAt: isoDaysAgo(0),
  },
];

const demoDiscountCodes = [
  {
    id: "WELCOME10",
    code: "WELCOME10",
    amount: 10,
    type: "percent",
    isActive: true,
    maxUses: 100,
    usedCount: 18,
    expiresAt: null,
    minOrderTotal: 50,
    createdAt: isoDaysAgo(30),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "FARM20",
    code: "FARM20",
    amount: 20,
    type: "fixed",
    isActive: true,
    maxUses: null,
    usedCount: 7,
    expiresAt: null,
    minOrderTotal: 100,
    createdAt: isoDaysAgo(22),
    updatedAt: isoDaysAgo(2),
  },
  {
    id: "WINTER15",
    code: "WINTER15",
    amount: 15,
    type: "percent",
    isActive: false,
    maxUses: 50,
    usedCount: 50,
    expiresAt: isoDaysAgo(1),
    minOrderTotal: 80,
    createdAt: isoDaysAgo(90),
    updatedAt: isoDaysAgo(1),
  },
];

const demoOrderEvents = [
  {
    id: "demo-event-001",
    orderId: "demo-order-001",
    userId: "demo-user-alpha",
    action: "refund_requested",
    summary: "Refund requested: $24.50 (delivery_issue)",
    metadata: {
      amount: 24.5,
      reasonCode: "delivery_issue",
    },
    createdAt: isoDaysAgo(4),
    createdBy: "demo-admin-01",
  },
  {
    id: "demo-event-002",
    orderId: "demo-order-003",
    userId: "demo-user-charlie",
    action: "refund_approved",
    summary: "Refund approved (demo-refund-003)",
    metadata: {
      refundId: "demo-refund-003",
    },
    createdAt: isoDaysAgo(2),
    createdBy: "demo-admin-02",
  },
  {
    id: "demo-event-003",
    orderId: "demo-order-004",
    userId: "demo-user-delta",
    action: "refund_processed",
    summary: "Refund processed (demo-refund-004)",
    metadata: {
      refundId: "demo-refund-004",
    },
    createdAt: isoDaysAgo(1),
    createdBy: "demo-admin-02",
  },
  {
    id: "demo-event-004",
    orderId: "demo-order-001",
    userId: "demo-user-alpha",
    action: "discount_applied",
    summary: "Applied discount code WELCOME10",
    metadata: {
      code: "WELCOME10",
      orderTotal: 779.74,
    },
    createdAt: isoDaysAgo(5),
    createdBy: "demo-admin-01",
  },
  {
    id: "demo-event-005",
    orderId: "demo-order-002",
    userId: "demo-user-bravo",
    action: "status_changed",
    summary: "Changed status from new to packed",
    metadata: {
      previousStatus: "new",
      nextStatus: "packed",
    },
    createdAt: isoDaysAgo(1),
    createdBy: "demo-admin-01",
  },
];

const seedDemoAdminData = async () => {
  const batch = db.batch();

  for (const order of demoOrders) {
    const ref = db.collection("orders").doc(order.id);
    batch.set(ref, order, { merge: true });
  }

  for (const discountCode of demoDiscountCodes) {
    const ref = db.collection("discount_codes").doc(discountCode.id);
    batch.set(ref, discountCode, { merge: true });
  }

  for (const orderEvent of demoOrderEvents) {
    const ref = db.collection("order_events").doc(orderEvent.id);
    batch.set(ref, orderEvent, { merge: true });
  }

  await batch.commit();

  console.log(`Seeded demo admin data:`);
  console.log(`- orders: ${demoOrders.length}`);
  console.log(`- discount_codes: ${demoDiscountCodes.length}`);
  console.log(`- order_events: ${demoOrderEvents.length}`);
  console.log("Use /admin to validate refund workflow, SLA, sorting, filters, and CSV exports.");
};

seedDemoAdminData().catch(error => {
  console.error("Failed to seed demo admin data:", error);
  process.exit(1);
});

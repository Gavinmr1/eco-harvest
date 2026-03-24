import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

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

const args = process.argv.slice(2);
const getArgValue = flag => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : "";
};

const uidArg = getArgValue("--uid");
const emailArg = getArgValue("--email");
const revoke = args.includes("--revoke");
const checkOnly = args.includes("--check");

if (!uidArg && !emailArg) {
  console.error("Usage: npm run set:admin -- --uid <uid> [--revoke]");
  console.error("   or: npm run set:admin -- --email <email> [--revoke]");
  process.exit(1);
}

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

const auth = getAuth();

const run = async () => {
  const user = uidArg ? await auth.getUser(uidArg) : await auth.getUserByEmail(emailArg);

  if (checkOnly) {
    const claims = user.customClaims ?? {};
    console.log(`User ${user.uid} (${user.email ?? "no-email"}) claims:`, claims);
    return;
  }

  const nextClaims = {
    ...(user.customClaims ?? {}),
  };

  if (revoke) {
    delete nextClaims.admin;
  } else {
    nextClaims.admin = true;
  }

  await auth.setCustomUserClaims(user.uid, nextClaims);
  await auth.revokeRefreshTokens(user.uid);

  const updatedUser = await auth.getUser(user.uid);

  const actionLabel = revoke ? "Revoked" : "Granted";
  console.log(`${actionLabel} admin claim for user ${user.uid} (${user.email ?? "no-email"}).`);
  console.log("Current claims:", updatedUser.customClaims ?? {});
  console.log("User must sign out/in (or refresh token) to pick up new claims.");
};

run().catch(error => {
  console.error("Failed to update admin claim:", error);
  process.exit(1);
});

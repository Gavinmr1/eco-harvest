# Eco Harvest

Eco Harvest is a React + Firebase app for weekly farm produce subscriptions.

Users can:

- create an account / log in,
- build a produce box (plan, size, preferences),
- save and revisit subscription selections,
- view their saved subscription in profile.

## Current Product Status

### What the app is for

This app is an MVP for a direct-to-consumer produce subscription service. The current experience focuses on onboarding users and collecting subscription preferences.

### What is already functional

- Firebase authentication (signup, login, logout)
- Protected routes for subscription/profile pages
- Build Your Box flow with persisted Firestore user selections
- Profile page reading back saved plan/size/preferences
- Lazy-loaded route pages and passing lint/build

### What is missing for a fully functional production app

- No checkout/payment flow yet
- No delivery address capture or delivery scheduling
- No admin dashboard for managing plans/orders/users
- No order lifecycle status (pending, active, paused, canceled)
- No transactional notifications (email/SMS)
- No backend validation/business rules enforcement in Firestore security rules shown here
- No automated tests yet
- No deployment/operations docs yet (until this plan)

## Local Development

### Prerequisites

- Node.js 20+
- npm
- Firebase project configured for Auth + Firestore

### Environment setup

1. Copy `.env.example` to `.env`.
2. Fill in your Firebase project values:

```bash
cp .env.example .env
```

Required variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Optional:

- `VITE_FIREBASE_MEASUREMENT_ID`

### Firestore catalog collections

`BuildYourBox` now supports Firestore-driven catalog data with fallback defaults.

- `catalog_plans` documents:
  - `label` (string)
  - `value` (string, e.g. `4-week`)
  - `description` (string)
  - `weeks` (number)
- `catalog_preferences` documents:
  - `label` (string)
  - `description` (string)

To seed default catalog data:

```bash
npm run seed:catalog
```

To seed demo admin testing data (orders, discount codes, and activity events):

```bash
npm run seed:demo-admin
```

Important: `seed:catalog` uses Firebase Admin credentials (not client auth). Set one of these in `.env` before running:

- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_SERVICE_ACCOUNT_PATH`

`firestore.rules` makes catalog collections read-only from clients, so admin tooling is required for writes.

### Run locally

```bash
npm install
npm run dev
```

Note: this project uses Vite scripts. Use `npm run dev` for local development (not `npm start`).

### Build and quality checks

```bash
npm run lint
npm run build
```

### Firestore rules deployment

This repo includes:

- `firestore.rules`
- `firestore.indexes.json`
- `firebase.json`

Deploy Firestore rules/indexes with Firebase CLI:

```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore
```

### Asset optimization

```bash
npm run optimize:images
```

This generates optimized `.webp` assets for the main landing-page images.

## Finish Plan (Start to Deploy)

This is the execution roadmap to complete and launch Eco Harvest.

### Phase 1 — Stabilize MVP (Now)

Goal: make current functionality reliable and production-safe.

1. **Configuration hardening**

- Move Firebase config to environment variables (`.env`, `.env.production`)
- Add `.env.example` with required keys

2. **Data model cleanup**

- Centralize Firestore user/subscription types in one module
- Refactor pages to use shared types + service helpers

3. **Validation and UX polish**

- Add stronger client-side validation for subscription form fields
- Add user-facing success/error toasts instead of silent console errors

4. **Performance quick wins**

- Compress/replace very large images
- Convert heavy backgrounds to optimized web assets

**Exit criteria:** Users can reliably sign up, log in, configure a box, and see profile data with clear feedback and fast page loads.

### Phase 2 — Complete Core Product Flows

Goal: support real customer subscriptions, not just preference capture.

1. **Account profile essentials**

- Add name, phone, delivery address, and zip code

2. **Subscription lifecycle**

- Add pause/resume/cancel actions
- Save subscription status and timestamps

3. **Plan catalog management**

- Move plans/preferences from hardcoded arrays to Firestore collections

4. **Order preview**

- Add estimated weekly price summary before confirmation

**Exit criteria:** A customer can complete account setup, select plan details, and manage subscription state over time.

### Phase 3 — Payments + Notifications

Goal: make the app commercially usable.

1. **Payments integration**

- Integrate Stripe checkout or subscription billing
- Persist payment customer IDs and subscription IDs

2. **Post-checkout sync**

- Use secure backend/webhooks to update subscription status

3. **Notifications**

- Send welcome, payment success/failure, and delivery reminder emails

**Exit criteria:** Paid subscription flow works end-to-end and status stays in sync.

### Phase 4 — Admin + Operations

Goal: run the business from the app.

1. **Admin area**

- Manage users, plans, and active subscriptions

2. **Operational views**

- Weekly packing/delivery list export

3. **Support tooling**

- Internal notes and customer subscription override tools

**Exit criteria:** Team can manage customer operations without manual database edits.

### Phase 5 — Quality, Security, and Scale

Goal: reduce risk before growth.

1. **Testing**

- Unit tests (auth/services)
- Integration tests (critical user flows)

2. **Security**

- Firestore security rules review and least-privilege enforcement
- Verify route protection + server-side validation paths

3. **Observability**

- Error tracking (e.g., Sentry)
- Basic analytics funnel (signup → subscription completion)

**Exit criteria:** Critical flows are tested, monitored, and protected.

## Deployment Plan

### Admin architecture decision

Recommended approach right now: keep customer site and admin interface in the same project, but isolated by route and permissions.

- Customer app: standard public/authenticated routes
- Admin app: `/admin` route protected by Firebase custom claim (`admin: true`)
- Data access: Firestore rules enforce admin-only writes for operational collections

Why this is best at current stage:

- Faster delivery and lower maintenance overhead
- Shared design system/types/services reduce duplication
- Easy to split later into separate repos/apps once admin complexity grows

Current admin foundation in this repo:

- `src/routes/AdminRoute.tsx` checks admin custom claim
- `src/pages/admin/AdminDashboard.tsx` serves as operations entry point
- `firestore.rules` allows admin writes to `catalog_*` and `orders`

### Granting admin access

Use Firebase custom claims via the script:

```bash
npm run set:admin -- --email your-admin@email.com
```

or by UID:

```bash
npm run set:admin -- --uid <firebase-uid>
```

To revoke admin access:

```bash
npm run set:admin -- --email your-admin@email.com --revoke
```

Required env for this script (set one):

- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_SERVICE_ACCOUNT_PATH`

Security note: never commit service account credentials.

### Orders workflow

- Customers place orders from confirmed subscription settings in `BuildYourBox`
- Customers track their order statuses in `My Orders` (`/orders`)
- Orders are written to `orders` with status `new`
- Admins manage order statuses in `/admin` (`new` → `packed` → `out-for-delivery` → `delivered`)
- Firestore rules allow:
  - customer create + own-read
  - admin read/write for all orders

### Recommended stack

- **Frontend hosting:** Vercel (fast setup for Vite SPA) or Firebase Hosting
- **Backend services:** Firebase Auth + Firestore
- **Payments/webhooks:** Serverless functions (Firebase Functions or Vercel functions)

### Deployment checklist

1. Set production env vars in hosting platform
2. Configure allowed auth domains in Firebase
3. Deploy frontend (`npm run build` output)
4. Deploy/update Firestore security rules and indexes
5. Configure custom domain + HTTPS
6. Smoke test core flow in production:

- sign up
- login
- save subscription
- view profile data

### Release workflow (suggested)

- `feature` branch → pull request → lint/build checks → merge to `main` → automatic production deploy

## Immediate Next Sprint (Recommended)

1. Move Firebase config to environment variables
2. Compress and replace oversized hero/background images
3. Add shared Firestore types/service layer used by `BuildYourBox` and `Profile`
4. Implement profile details (name + address)
5. Add first integration tests for auth + subscription save/read flow

---

This README is now the source of truth for product direction and delivery sequencing.

## Progress Log

- ✅ 2026-02-22: Firebase config moved to environment variables with `.env.example`.
- ✅ 2026-02-22: Large homepage/background images converted to optimized `.webp` assets.
- ✅ 2026-02-22: Shared subscription data types + Firestore service layer adopted by `BuildYourBox` and `Profile`.
- ✅ 2026-02-27: Added subscription lifecycle (`active`, `paused`, `canceled`) with persisted status timestamps and profile controls.
- ✅ 2026-02-27: Added order preview estimates and explicit subscription confirmation state/timestamp.
- ✅ 2026-02-27: `BuildYourBox` catalog now loads plans/preferences from Firestore collections with safe fallback defaults.
- ✅ 2026-02-27: Added repeatable Firestore catalog seed command (`npm run seed:catalog`).
- ✅ 2026-02-27: Added baseline Firestore security rules + deployment config (`firestore.rules`, `firebase.json`).
- ✅ 2026-02-27: Added Vite vendor manual chunking to reduce initial bundle pressure and eliminate chunk-size warnings.
- ✅ 2026-02-27: Added admin foundation (`/admin` route, claim-based guard, and admin-scoped Firestore write rules).
- ✅ 2026-02-27: Added order pipeline (customer place order + admin queue with status updates).
- ✅ 2026-02-27: Added customer order tracking page (`/orders`) with user-scoped order status history.
- ✅ 2026-02-27: Added admin-claim tooling (`npm run set:admin`) for controlled access to `/admin`.
- ✅ 2026-02-27: Expanded admin operations with per-order discount application, refund tracking, and manual adjustment notes.
- ✅ 2026-02-27: Added admin discount-code catalog with usage limits, expiration, minimum-order validation, and code-based order discount application.
- ✅ 2026-02-27: Added immutable admin order activity tracking (`order_events`) and a recent-activity feed in the admin dashboard.
- ✅ 2026-02-27: Added refund workflow with reason codes and state transitions (`requested` → `approved` → `processed`) plus approver/processor tracking.

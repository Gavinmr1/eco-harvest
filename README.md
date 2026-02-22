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

### Run locally

```bash
npm install
npm run dev
```

### Build and quality checks

```bash
npm run lint
npm run build
```

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

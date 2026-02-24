# HuloolFuture — AILine PRD · MVP v0.3.1 (Execution Spec)

> **Company:** HuloolFuture (huloolfuture.sa) · **Product:** AILine (first product in the HuloolFuture suite)

**Status:** Execution-Ready · **Date:** February 2026 · **Audience:** Solo Technical Founder
**Commit target:** `docs/AILine_PRD_v0.3.1.1.md`

---

## Implementation Status

### Core DB Foundation — 100% Complete

- [x] All 7 tables created via migrations (001-007)
- [x] Foreign key constraints enforced (users → schedules → lectures → exam_dates)
- [x] Auth sync trigger (`on_auth_user_created`) implemented
- [x] RLS enabled on all tables with ownership policies
- [x] Partial unique index on `schedules(user_id) WHERE is_active = true`
- [x] CHECK constraints on lectures (valid time range, meeting link format)
- [x] Indexes on all foreign keys and common query paths

### Week 1 Checklist Progress

- [x] **W1-1** Supabase project created. Schema migrations for all 7 tables completed.
- [x] **W1-2** Auth trigger created: `on_auth_user_created` fires on `auth.users` INSERT.
- [x] **W1-3** RLS policies applied to all tables.
- [x] **W1-4** Partial unique index on `schedules (user_id) WHERE is_active = true` created.

---

## 0) Change Summary — v0.3 → v0.3.1

**Bugs fixed / Contradictions resolved:**

- **[ARCH FIX — Critical]** Next.js `middleware.ts` runs on the Edge Runtime and **cannot query Supabase**. v0.3 incorrectly placed DB-dependent plan-limit logic inside middleware. Fix: `middleware.ts` validates JWT only; all plan enforcement (row counting, regen checks) moves into the `/api/generate-plan` route handler using a server-side Supabase client.
- **[SCHEMA FIX]** `subscriptions.plan_type` conflicted with `study_plans.plan_type` (same column name, different value domains). Renamed `subscriptions.plan_type` → `subscriptions.billing_period` (`monthly` | `annual`). Eliminates code-level confusion.
- **[SCHEMA ADD]** Added `plan_snapshot` column to `study_plans` (`free` | `pro`). Records the user's plan tier at generation time. Required to correctly enforce free limits if a user cancels a Pro subscription and reverts to Free — only rows with `plan_snapshot = 'free'` count toward the 2-generation lifetime limit.
- **[SCHEMA ADD]** Added `onboarding_completed` boolean (default `false`) to `users`. Required to redirect new vs. returning users correctly on app load.
- **[SCHEMA ADD]** Added `updated_at` to `users` table. Required for webhook plan updates.
- **[SCHEMA ADD]** Added `CHECK (start_time < end_time)` constraint on `lectures`. Prevents corrupt lecture data at the DB layer.
- **[SCHEMA ADD]** Added partial unique index on `schedules (user_id) WHERE is_active = true`. Enforces the "one active schedule per user" invariant at the DB layer without application-level transactions.
- **[SCHEMA ADD]** Specified `NOT NULL` constraints on all columns where null values would break the application.
- **[STRIPE FIX]** Added `customer.subscription.created` and `invoice.payment_succeeded` to the webhook event list. The previous list was incomplete and would miss first-time subscription activations.
- **[AI FIX]** Removed `plan_type` from per-session objects in the Gemini output schema. It was redundant with `study_plans.plan_type` and caused JSON bloat. Gemini still receives `plan_type` context in the system prompt for distribution logic, but does not return it per session.
- **[AI FIX]** Specified exact retry prompt suffix and error logging fields. v0.3 left both vague.
- **[UX FIX]** Specified timezone for exam countdown card and `week_reference` calculation: Saudi Arabia Standard Time (AST = UTC+3). Without this, day counts would be wrong for students.
- **[FLOW FIX]** Added auth trigger specification: `auth.users` INSERT → Postgres trigger → inserts row into `public.users` with defaults. Required to make the public user table self-maintaining.
- **[FLOW FIX]** Clarified the `is_active` uniqueness enforcement strategy: DB partial index + application-level atomic update (set old `false`, set new `true` in a single Supabase RPC call).

---

## 1) One-liner + Vision

### One-liner

> AILine turns a Saudi university student's class schedule — and exam dates when available — into a personalized, AI-generated study plan in Arabic or English, in under 60 seconds.

### Hypothesis to validate

> Students will pay for an AI-generated study plan built from their own schedule.

### MVP success criteria

| Criteria                                | Target              |
| --------------------------------------- | ------------------- |
| Signup → generated plan                 | Under 10 minutes    |
| Activation rate (plan generated, day 7) | > 65% of signups    |
| Free → Pro conversion (day 30)          | > 5% of signups     |
| Stable operation without infra change   | 90 days post-launch |

---

## 2) MVP Scope + Non-Goals

### What we build (MVP scope)

1. Email + Google OAuth authentication
2. Bilingual UI (Arabic RTL / English LTR) with `next-intl`
3. Schedule management — manual entry + text-paste parser
4. Exam date entry — linked to lectures via dropdown
5. AI study plan generation — exam-driven or weekly optimization (Gemini)
6. Dashboard exam countdown card — 4 states, server-rendered
7. Freemium gate — Free: 2 lifetime generations; Pro: 5/week
8. Stripe subscriptions — monthly (SAR 39) and annual (SAR 299)

### Non-Goals — do not build, do not design for

| Feature                                 | Why excluded                                   |
| --------------------------------------- | ---------------------------------------------- |
| AI chat assistant                       | Different UX pattern, separate product         |
| PDF / lecture summarization             | File pipeline + Gemini doc handling, 2+ weeks  |
| Flashcard / practice question generator | Post-PMF only                                  |
| OCR / image schedule import             | Google Vision billing dependency               |
| CSV schedule import                     | Text paste covers the use case                 |
| Push / email notifications              | The countdown card covers retention without it |
| Spaced repetition                       | No flashcards in MVP                           |
| Native iOS / Android app                | Web-first; responsive is sufficient            |
| University LMS integrations             | No external API connections                    |
| Grade tracking / GPA calculator         | Different problem space                        |
| Social / collaborative features         | Post-PMF                                       |
| Referral / affiliate program            | Post-retention                                 |
| Admin dashboard                         | Query Supabase directly                        |
| Multi-university parsers                | Generic parser is sufficient for validation    |
| Gamification / streaks                  | Adds complexity without validating core value  |
| Moyasar / MADA payments                 | Add post-launch if Stripe conversion < 40%     |

---

## 3) User Persona + Key Jobs-To-Be-Done

### Persona — Khalid, the Overwhelmed Saudi Student

| Attribute          | Detail                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------- |
| Age                | 19–25                                                                                       |
| University         | Any Saudi university (KSU, KAU, AOU, PNU, KFUPM, private)                                   |
| Year               | 2nd–4th. 5–7 courses/semester.                                                              |
| Language           | Arabic-first. Reads English academic material. Wants Arabic UI.                             |
| Device             | iPhone or Android primary. Laptop for longer sessions.                                      |
| Schedule behavior  | Gets schedule as PDF or text via WhatsApp. Re-enters it into phone calendar every semester. |
| Study behavior     | Reactive. Starts prep 2–3 days before exams. No structured weekly plan.                     |
| AI familiarity     | Uses ChatGPT occasionally. Finds it too generic. Doesn't want to prompt-engineer.           |
| Core pain          | "I have 6 courses and no idea how to split my time — and exam dates aren't announced yet."  |
| Willingness to pay | SAR 29–39/month if it saves real study time. Annual plan discount effective.                |
| Acquisition        | University WhatsApp groups, Twitter/X Saudi student communities, TikTok.                    |

### Jobs-To-Be-Done (priority order)

1. **Schedule job:** "Store my semester schedule in one place so I don't re-enter it every time."
2. **Planning job:** "Tell me when to study what, based on my actual timetable and exam dates."
3. **Refinement job:** "Update my plan when new exam dates are announced without starting from scratch."

---

## 4) Core User Flows

### Flow 1 — First-time signup to first plan

```
1. User lands on /  (landing page, AR default)
2. Clicks "ابدأ مجاناً" / "Get Started Free"
3. /auth/signup  →  email + password OR Google OAuth
   - Language preference selected on this page (AR/EN toggle)
   - On submit: Supabase creates auth.users row → trigger creates public.users row
     with { plan: 'free', language_pref: selected, onboarding_completed: false }
4. Redirect to /onboarding
   - Step 1: University name (free text) + year level
   - Step 2: Confirm language preference
   - Step 3: Auto-create first schedule named "{current semester}" → set is_active = true
   - Set users.onboarding_completed = true
   - Redirect to /dashboard
5. /dashboard  →  empty state: "Add your first lecture to get started"
   - Exam countdown card: state 4 ("No exams yet — add your first exam")
   - Generate button: disabled (no lectures yet)
6. User clicks "Add Lectures" → /schedule/new
   - Tab A: Manual entry form
   - Tab B: Paste text → /api/parse-schedule → preview → confirm → save
7. Returns to /dashboard
   - Generate button: NOW ACTIVE (≥1 lecture exists)
   - Exam countdown card: still state 4
8. User clicks "Generate Study Plan"
   - POST /api/generate-plan
   - Route handler checks: plan=free, count(study_plans where user_id=X)=0 → proceed
   - No exam dates → Variant B prompt (weekly_optimization)
   - Gemini call → validate JSON → store in study_plans (plan_type='weekly_optimization', plan_snapshot='free')
   - Redirect to /study-plan
9. /study-plan shows:
   - Plan type label: "Weekly Optimization Plan"
   - Soft prompt: "Add exam dates to get an exam-tailored plan"
   - Generation counter: "1 of 2 free generations used"
   - "Refine Plan" button: active (1 free refinement remaining)
```

### Flow 2 — Adding exams and using the free refinement

```
1. User returns to /dashboard (day 3, exam dates announced by university)
2. Exam countdown card: state 4 → user clicks "+ Add Exam"
3. Exam entry form:
   - Course dropdown: populated from lectures for active schedule
   - User selects "Data Structures" → sets lecture_id + denormalizes course_name
   - Date picker: sets exam_date
   - Type: "midterm"
4. Returns to /dashboard
   - Exam countdown card: state 1 → "Next exam: Data Structures — in 18 days"
5. User clicks "Refine Plan" on /study-plan
   - POST /api/generate-plan
   - Route handler: plan=free, count(study_plans)=1 → proceed (refinement allowed)
   - Exam dates exist → Variant A prompt (exam_driven)
   - Gemini call → store (plan_type='exam_driven', plan_snapshot='free')
   - Generation counter updates: "2 of 2 free generations used"
   - "Refine Plan" button: now shows upgrade prompt
6. User sees exam-driven plan. Satisfied. Refine button is now paywalled.
```

### Flow 3 — Upgrade to Pro

```
1. User clicks "Upgrade to Pro" (from /study-plan or /pricing)
2. POST /api/stripe/checkout
   - Creates Stripe Checkout session with price_id (monthly or annual)
   - Returns checkout URL
3. User completes Stripe Checkout (card payment)
4. Stripe fires: customer.subscription.created
5. /api/stripe/webhook receives event
   - Upserts subscriptions row: { stripe_customer_id, stripe_subscription_id,
     billing_period: 'monthly', status: 'active', current_period_end }
   - Updates users.plan = 'pro', users.updated_at = now()
6. User redirected to /study-plan (success_url)
7. "Refine Plan" button now shows "5 refinements available this week"
8. Pro user can regenerate up to 5x per 7-day window
```

### Flow 4 — Returning user (week 2+)

```
1. User opens app → middleware.ts verifies JWT → valid → /dashboard
2. Exam countdown card: "Next exam: Algorithms — in 6 days"
3. User clicks "+ Add Exam" to add a new exam date
4. Returns to /dashboard → countdown updates
5. Clicks "Refine Plan" (Pro: still has 3 refinements left this week)
6. New exam-driven plan generated immediately
```

---

## 5) Features (P0 Only) with Acceptance Criteria

### F1 — Authentication

**Acceptance criteria:**

- [x] Email signup creates `auth.users` row + triggers `public.users` insert with `plan='free'`, `onboarding_completed=false`
- [x] Google OAuth login creates the same `public.users` row on first login
- [x] Returning user with valid session is redirected to `/dashboard` (not `/auth/login`)
- [x] Returning user with `onboarding_completed=false` is redirected to `/onboarding`
- [x] Password reset email sends within 60 seconds and link works
- [x] Unauthenticated requests to any `/dashboard`, `/study-plan`, `/settings` route redirect to `/auth/login`
- [x] **Email confirmation gating:** Unconfirmed users cannot access protected routes — middleware redirects to `/auth/login?unconfirmed=1`

---

#### Auth Flow (Final Implementation – Phase 2)

> **Updated: Auth Implementation Synced**
>
> The following flow reflects the **actual implemented behavior** as of February 2026. This differs from earlier PRD versions which specified auto-login on email confirmation.

##### Signup Flow

1. User submits email + password at `/auth/signup`
2. Supabase creates `auth.users` row (email unconfirmed)
3. Trigger inserts `public.users` row with defaults
4. On success: redirect to `/auth/login?check_email=1`
5. No countdown page — user must check their email

##### Email Confirmation

- Supabase sends confirmation email with link to `/auth/confirm?code=xxx`
- **We do NOT use this route.** No auto-login occurs.
- User must manually log in after confirming their email

##### Login Gating (Critical Security)

1. User submits credentials at `/auth/login`
2. `signInWithPassword` succeeds
3. Fetch user via `supabase.auth.getUser()`
4. Check `user.email_confirmed_at`:
   - **If null/undefined:**
     - Immediately call `supabase.auth.signOut()`
     - Show error: "Please confirm your email before logging in."
     - Show "Resend confirmation email" button
   - **If confirmed:**
     - Redirect to `/dashboard`

##### Query Parameters

| Param            | Source                  | UI Effect                                                     |
| ---------------- | ----------------------- | ------------------------------------------------------------- |
| `?check_email=1` | After successful signup | Blue info banner: "Check your email to confirm your account." |
| `?unconfirmed=1` | Middleware redirect     | Blue warning banner: "Please confirm your email to continue." |

##### Middleware Gating

```typescript
// middleware.ts — protects routes + gates unconfirmed users
const protectedRoutes = [
  '/dashboard',
  '/study-plan',
  '/settings',
  '/schedule',
  '/onboarding',
]

if (isProtectedRoute && !user) {
  // No session → redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url))
}

if (isProtectedRoute && user && !user.email_confirmed_at) {
  // Has session but email not confirmed → redirect with unconfirmed flag
  const url = new URL('/auth/login', request.url)
  url.searchParams.set('unconfirmed', '1')
  return NextResponse.redirect(url)
}
```

- Auth routes (`/auth/*`) are NOT blocked — users can access login/signup
- Unconfirmed users cannot reach any protected page until they confirm email

##### Resend Confirmation

- Login page includes "Resend confirmation email" button
- Calls `supabase.auth.resend({ type: 'signup', email })`
- Shows success message on successful resend

##### Security Reasoning

- **No auto-login:** Prevents users from accessing the app without confirming their email address, reducing spam and fake accounts.
- **Immediate signOut on login:** If a confirmed user somehow has their `email_confirmed_at` cleared, they are immediately logged out.
- **Middleware gating:** Provides defense-in-depth — even if client-side checks are bypassed, middleware blocks access to protected routes.

---

### F2 — Onboarding

**Acceptance criteria:**

- [ ] Flow completes in ≤ 3 screen interactions
- [ ] University and year level fields are optional (cannot block progress)
- [ ] Completing onboarding sets `users.onboarding_completed = true`
- [ ] Completing onboarding auto-inserts one `schedules` row with `is_active=true`
- [ ] User cannot reach `/dashboard` without completing onboarding. Redirect is enforced in the App Router server layout (`app/(app)/layout.tsx`) which queries Supabase server-side for `onboarding_completed`. Middleware only handles session validation — it does not read `users.onboarding_completed`.

---

### Navigation — Sidebar

**Implementation:** Responsive sidebar layout using Next.js App Router (`usePathname`).

**Active state rules:**

- **Dashboard:** Exact match only (`/dashboard`)
- **Schedule:** Exact match only (`/schedule`) — does NOT match `/schedule/week`
- **Week View:** Exact match only (`/schedule/week`)
- Nested routes do NOT auto-activate parent items. Each nav item uses `exact: true` to enforce precise matching.
- Trailing slashes are normalized (e.g., `/schedule/` is treated as `/schedule`)

**Technical details:**

- Client component: `src/components/sidebar/Sidebar.tsx`
- Nav item component: `src/components/sidebar/NavItem.tsx`
- Nav configuration: `src/components/sidebar/nav.config.ts`
- App shell wrapper: `src/components/app/AppShell.tsx` (handles responsive drawer on mobile)

---

### F3 — Schedule Management

**Acceptance criteria:**

- [ ] Manual lecture form requires: course_name, day_of_week, start_time, end_time. All other fields optional.
- [ ] Form rejects `start_time >= end_time` with inline validation message before submission
- [ ] Color is auto-assigned from a 10-color palette by hashing `course_name`. Same `course_name` always gets same color within a session.
- [ ] Text paste parser accepts Arabic and English schedule text. Correctly identifies day names in both scripts (e.g., "الأحد" and "Sunday"), time ranges in 12h/24h format, and Arabic Eastern numerals (٠–٩).
- [ ] Parser returns a preview array before saving. Student can edit/delete individual parsed rows before confirming.
- [ ] If parser extracts zero lectures, user sees: "We couldn't parse this schedule. Add lectures manually." with a direct link to the manual entry form.
- [ ] Failed parse attempts are logged to a `parse_failures` table (raw text, user_id, timestamp) — used for parser iteration post-launch.
- [ ] Weekly grid renders correctly in RTL (Arabic) and LTR (English). Day columns order: Sat → Fri for Arabic; Mon → Fri + Sat/Sun for English view. _(Implementation note: render Sat–Thu for Saudi week by default in both.)_
- [ ] Deleting a lecture that has linked exam dates shows: "This course has exam dates attached. Delete anyway?" Confirming deletes the lecture and sets `exam_dates.lecture_id = NULL` (ON DELETE SET NULL). Exam entries remain visible.

---

### F4 — Exam Date Entry

**Acceptance criteria:**

- [ ] Course dropdown is populated from distinct `course_name` values in `lectures` for the active schedule. No free-text entry.
- [ ] Selecting a course sets `exam_dates.lecture_id` and denormalizes `exam_dates.course_name` from the selected lecture row.
- [ ] `exam_date` is required. `exam_time`, `exam_type`, `notes` are optional.
- [ ] Exam dates are visible as colored markers on the weekly schedule grid on the day of the exam.
- [ ] Exam list view shows exams sorted by `exam_date` ascending. Past exams are visually dimmed but not hidden.
- [ ] Dashboard "Generate" button is active regardless of whether exam dates exist.

---

### F5 — AI Study Plan Generation

**Acceptance criteria:**

- [ ] Generate button is enabled as soon as ≥ 1 lecture exists in the active schedule. Disabled with tooltip if no schedule/lectures.
- [ ] API correctly detects `exam_driven` vs `weekly_optimization` based on count of `exam_dates` rows for active schedule.
- [ ] Gemini response is valid JSON matching the defined session schema (see Section 8). Invalid response triggers one retry.
- [ ] Generated plan is stored in `study_plans` with correct `plan_type`, `plan_snapshot`, `language`, `week_reference`.
- [ ] Plan renders in the language matching `users.language_pref` at generation time. Arabic plan text is in Arabic; English in English.
- [ ] **Free limit:** API returns `402` with `{"error":"upgrade_required"}` if `COUNT(study_plans WHERE user_id=X AND plan_snapshot='free') >= 2`.
- [ ] **Pro limit:** API returns `429` with `{"error":"weekly_limit_reached"}` if Pro user's current-week `regen_count >= 5`.
- [ ] Generation counter shown in UI is always consistent with DB state (no stale cache).
- [ ] On Gemini API failure (non-JSON, timeout, HTTP error): user sees localized error message + "Try again" button. Error logged to Sentry with `{user_id, prompt_variant, raw_response, error_type}`.

---

### F6 — Dashboard Exam Countdown Card

**Acceptance criteria:**

- [ ] Card renders on every `/dashboard` load, server-side. Single query: `SELECT exam_date, course_name FROM exam_dates WHERE schedule_id = [active] AND exam_date >= TODAY ORDER BY exam_date ASC LIMIT 1`. Today = current date in AST (UTC+3).
- [ ] **State 1 (future exam):** Shows course name and days until exam. "X days" computed as `exam_date - today` in AST, where today is `00:00:00 AST`.
- [ ] **State 2 (exam today):** `exam_date = today` in AST. Shows warning style.
- [ ] **State 3 (no future exams, past exams exist):** "No upcoming exams."
- [ ] **State 4 (no exams at all):** Shows "+ Add Exam" CTA button linking to exam entry form.
- [ ] Card has all 4 states translated in both AR and EN translation files.
- [ ] Card does not show past exams in the countdown. Only future (`exam_date >= today`).

---

### F7 — Study Plan View

**Acceptance criteria:**

- [ ] Plan displays as a table grouped by day. Columns: Day, Time, Course, Topic Focus, Session Type.
- [ ] `plan_type` label shown at top: "Exam-Driven Plan" / "خطة الامتحانات" or "Weekly Optimization Plan" / "خطة أسبوعية".
- [ ] Weekly optimization plans show an inline prompt: "Add exam dates to get a deadline-driven plan."
- [ ] Free user sees generation counter: "X of 2 free generations used."
- [ ] Free user at limit sees upgrade prompt instead of "Refine Plan" button.
- [ ] Pro user sees: "X of 5 refinements used this week. Resets [Day, Date]." Reset date = next ISO Monday in AST.
- [ ] Plan is print-friendly via `@media print` stylesheet (no nav, no sidebar, clean table).
- [ ] If no plan exists yet, `/study-plan` shows: "No plan generated yet. [Generate Study Plan]" CTA.

---

### F8 — Freemium Gate

**Acceptance criteria:**

- [ ] All plan-check logic executes in the API route handler (not `middleware.ts`).
- [ ] Free users: count query is `SELECT COUNT(*) FROM study_plans WHERE user_id = X AND plan_snapshot = 'free'`. Gate fires at `>= 2`.
- [ ] UI state is derived from the same count (fetched in a dashboard/plan server component). No client-side-only state.
- [ ] On `402` from `/api/generate-plan`: UI shows upgrade modal, does NOT show error message.
- [ ] On `429` from `/api/generate-plan`: UI shows "Weekly limit reached. Resets on [date]." Does NOT show upgrade modal.

---

### F9 — Payments (Stripe)

**Acceptance criteria:**

- [ ] `/pricing` page shows two plans with SAR pricing. Monthly SAR 39/month. Annual SAR 299/year with per-month equivalent (SAR 24.9/month).
- [ ] Clicking "Subscribe" POSTs to `/api/stripe/checkout`. Returns a Checkout URL. Redirects user.
- [ ] Stripe `success_url` redirects to `/study-plan?upgraded=true`. Query param triggers a success banner.
- [ ] Stripe `cancel_url` redirects to `/pricing`.
- [ ] On `customer.subscription.created` or `customer.subscription.updated` with `status=active`: `users.plan` set to `pro`, `subscriptions` upserted.
- [ ] On `customer.subscription.deleted` or `status=cancelled/past_due`: `users.plan` set to `free`, `subscriptions.status` updated.
- [ ] All webhook events verified with `stripe.webhooks.constructEvent(payload, sig, WEBHOOK_SECRET)`. Invalid signature returns `400`.
- [ ] `/settings` shows: current plan, billing period, next renewal date (from `subscriptions.current_period_end`), and "Cancel Subscription" button.
- [ ] Cancel button POSTs to `POST /api/stripe/cancel` (a server route). The route uses the Stripe secret key server-side to call `stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })`. Client never calls Stripe directly. On success, UI shows: "Plan stays active until [date]."

---

### F10 — Bilingual UI

**Acceptance criteria:**

- [ ] All user-facing strings are in `/messages/ar.json` and `/messages/en.json`. Zero hardcoded text in components.
- [ ] `<html dir="rtl">` when `language_pref = ar`. `<html dir="ltr">` when `language_pref = en`.
- [ ] Language toggle in nav bar updates `users.language_pref` in DB and refreshes layout direction without full page reload.
- [ ] Gemini prompt includes: `"Respond in [Arabic/English] only."` matching `users.language_pref`. All `topic_focus` values in generated plan are in the correct language.
- [ ] All 4 countdown card states, plan type labels, and generation counters have AR/EN translation keys defined before Week 2 build starts.
- [ ] Date formatting uses `ar-SA` locale when Arabic, `en-US` locale when English (use `Intl.DateTimeFormat`).

---

## 6) Data Model

### Tables overview

| Table                            | Purpose                                                     |
| -------------------------------- | ----------------------------------------------------------- |
| `users`                          | Extends `auth.users`. Profile + plan state.                 |
| `schedules`                      | One active schedule per user per semester.                  |
| `lectures`                       | Individual class sessions.                                  |
| `exam_dates`                     | Exams/deadlines linked to lecture rows.                     |
| `study_plans`                    | One row per AI generation event.                            |
| `subscriptions`                  | Stripe subscription state. Webhook-maintained.              |
| `parse_failures` _(lightweight)_ | Logs failed schedule text parses for post-launch iteration. |

---

### `users`

```sql
CREATE TABLE public.users (
  id                    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 text NOT NULL,
  full_name             text,
  university            text,
  year_level            smallint CHECK (year_level BETWEEN 1 AND 6),
  language_pref         text NOT NULL DEFAULT 'ar' CHECK (language_pref IN ('ar', 'en')),
  plan                  text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  onboarding_completed  boolean NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Auto-create public.users row when auth.users is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### `schedules`

```sql
CREATE TABLE public.schedules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  is_active   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Enforce: only one active schedule per user
CREATE UNIQUE INDEX schedules_one_active_per_user
  ON public.schedules (user_id)
  WHERE is_active = true;

-- Atomic activation: call this RPC to switch active schedule
-- UPDATE schedules SET is_active = false WHERE user_id = $1;
-- UPDATE schedules SET is_active = true  WHERE id = $2 AND user_id = $1;
-- Wrap in a Postgres function or Supabase RPC to keep atomic.
```

---

### `lectures`

```sql
CREATE TABLE public.lectures (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id   uuid NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  course_name   text NOT NULL,
  course_code   text,
  day_of_week   text NOT NULL CHECK (day_of_week IN ('sat','sun','mon','tue','wed','thu','fri')),
  start_time    time NOT NULL,
  end_time      time NOT NULL,
  room          text,
  color_hex     text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT lectures_time_order CHECK (start_time < end_time)
);
```

---

### `exam_dates`

```sql
CREATE TABLE public.exam_dates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id   uuid NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  lecture_id    uuid REFERENCES public.lectures(id) ON DELETE SET NULL,
  course_name   text NOT NULL,  -- denormalized from lectures.course_name at insert
  exam_date     date NOT NULL,
  exam_time     time,
  exam_type     text NOT NULL DEFAULT 'other'
                  CHECK (exam_type IN ('midterm','final','quiz','assignment','other')),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX exam_dates_schedule_date ON public.exam_dates (schedule_id, exam_date);
```

**Insert logic (server-side):** When user selects a course from the dropdown, the API/server action receives `lecture_id`. Before insert, fetch `lectures.course_name` for that `lecture_id` where `schedule_id` matches the user's active schedule. Set `exam_dates.course_name = fetched value`. This prevents a race condition where the client sends a stale course name.

---

### `study_plans`

```sql
CREATE TABLE public.study_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  schedule_id     uuid NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  plan_json       jsonb NOT NULL,
  plan_type       text NOT NULL CHECK (plan_type IN ('exam_driven', 'weekly_optimization')),
  plan_snapshot   text NOT NULL CHECK (plan_snapshot IN ('free', 'pro')),  -- plan tier at generation time
  language        text NOT NULL CHECK (language IN ('ar', 'en')),
  regen_count     smallint NOT NULL DEFAULT 0,
  generated_at    timestamptz NOT NULL DEFAULT now(),
  week_reference  date NOT NULL  -- ISO Monday of the week in AST (UTC+3). Set server-side.
);

CREATE INDEX study_plans_user_week ON public.study_plans (user_id, week_reference);
```

**`week_reference` computation (server-side, TypeScript):**

```typescript
// Get ISO Monday for current week in AST (UTC+3), consistent with exam countdown card.
// "Monday" in Saudi time is the anchor — a student in Riyadh at 01:00 AST on Tuesday
// is in the same week as one at 22:00 AST on Monday.
function getWeekReference(): string {
  // Shift now to AST by adding 3 hours to UTC
  const utcNow = new Date()
  const astNow = new Date(utcNow.getTime() + 3 * 60 * 60 * 1000)

  const day = astNow.getUTCDay() // treat shifted time as local: 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day // days back to Monday
  const monday = new Date(astNow)
  monday.setUTCDate(astNow.getUTCDate() + diff)

  // Return as YYYY-MM-DD (the AST Monday date)
  return monday.toISOString().split('T')[0] // e.g. "2026-02-16"
}
```

**Pro regen logic (server-side):**

```typescript
// Find this week's plan row for this user
const { data: thisWeekPlan } = await supabase
  .from('study_plans')
  .select('id, regen_count')
  .eq('user_id', userId)
  .eq('week_reference', weekRef)
  .eq('plan_snapshot', 'pro')
  .order('generated_at', { ascending: false })
  .limit(1)
  .single();

if (thisWeekPlan && thisWeekPlan.regen_count >= 5) {
  return Response.json({ error: 'weekly_limit_reached' }, { status: 429 });
}

if (thisWeekPlan) {
  // Update existing week row
  await supabase.from('study_plans').update({ plan_json: newPlan, regen_count: thisWeekPlan.regen_count + 1 })
    .eq('id', thisWeekPlan.id);
} else {
  // New week, insert fresh row
  await supabase.from('study_plans').insert({ ..., regen_count: 0, week_reference: weekRef });
}
```

---

### `subscriptions`

```sql
CREATE TABLE public.subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id      text NOT NULL,
  stripe_subscription_id  text NOT NULL UNIQUE,
  billing_period          text NOT NULL CHECK (billing_period IN ('monthly', 'annual')),
  status                  text NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_end      timestamptz NOT NULL,
  cancel_at_period_end    boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT subscriptions_one_per_user UNIQUE (user_id)
);
```

> **Note:** `billing_period` replaces `plan_type` from v0.3 to eliminate the naming conflict with `study_plans.plan_type`.

---

### `parse_failures` _(lightweight logging table)_

```sql
CREATE TABLE public.parse_failures (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES public.users(id) ON DELETE SET NULL,
  raw_text    text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.parse_failures ENABLE ROW LEVEL SECURITY;

-- Authenticated users may insert their own failed parse attempts.
-- No SELECT policy: clients cannot read this table.
-- Server routes using the service role key bypass RLS and can read for analysis.
CREATE POLICY "parse_failures: insert own" ON public.parse_failures
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

> Inserts are made from the `/api/parse-schedule` route handler, which runs server-side and has the authenticated user's `user_id` available. No client ever reads this table — queries for parser analysis run directly in the Supabase dashboard using the service role.

---

## 7) API Routes + Middleware Rules

### `middleware.ts` — Session + Email Confirmation Gating

```typescript
// middleware.ts — Edge Runtime compatible
// Validates session AND checks email confirmation status.
// Does NOT query DB for plan checks or onboarding — those are handled in server components.
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/study-plan',
  '/settings',
  '/schedule',
  '/onboarding',
]

export async function middleware(req: NextRequest) {
  const supabaseResponse = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const path = req.nextUrl.pathname
  const isProtectedRoute = PROTECTED_PATHS.some(p => path.startsWith(p))

  // Not authenticated → redirect to login
  if (isProtectedRoute && !user) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Has session but email not confirmed → redirect with unconfirmed flag
  if (isProtectedRoute && user && !user.email_confirmed_at) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('unconfirmed', '1')
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/study-plan/:path*',
    '/settings/:path*',
    '/schedule/:path*',
    '/onboarding/:path*',
  ],
}
```

> **Note:** The matcher no longer includes `/api/*` routes — API routes handle their own auth via session validation in route handlers.
>
> **Critical:** All business logic (plan limits, row counting, regen checks) happens inside the API route handlers using the server-side Supabase client with the service role key. Never in `middleware.ts`.
>
> **Onboarding redirect:** `middleware.ts` cannot query the DB (Edge Runtime). The redirect for `onboarding_completed = false` is implemented in the App Router server layout at `app/(app)/layout.tsx`. On every render, this layout fetches `users.onboarding_completed` via a Supabase server client. If `false`, it returns `redirect('/onboarding')`. This runs server-side and is invisible to the client.

---

### API Route Contracts

#### `POST /api/generate-plan`

**Request body:**

```json
{ "schedule_id": "uuid" }
```

**Server-side logic (route handler):**

```
1. Get session from Supabase Auth cookie. If no session → 401.
2. Fetch users row: plan, language_pref.
3. Fetch active schedule's lectures (≤ 20, ordered by created_at).
4. Fetch exam_dates for this schedule.
5. Determine plan_type: exam_dates.length > 0 ? 'exam_driven' : 'weekly_optimization'

6. FREE LIMIT CHECK:
   - SELECT COUNT(*) FROM study_plans WHERE user_id = X AND plan_snapshot = 'free'
   - If count >= 2 → return 402 { error: "upgrade_required" }

7. PRO LIMIT CHECK (if plan = 'pro'):
   - weekRef = getWeekReference()
   - SELECT id, regen_count FROM study_plans
     WHERE user_id = X AND week_reference = weekRef AND plan_snapshot = 'pro'
     ORDER BY generated_at DESC LIMIT 1
   - If row exists AND regen_count >= 5 → return 429 { error: "weekly_limit_reached" }

8. Build prompt (Variant A or B — see Section 8).
9. Call Gemini API. Validate JSON response.
10. On success: upsert study_plans row. Return { plan_id, plan_type, plan_json }.
11. On Gemini failure: return 500 { error: "ai_generation_failed" }.
```

**Response (success):**

```json
{
  "plan_id": "uuid",
  "plan_type": "exam_driven" | "weekly_optimization",
  "plan_json": [ ...sessions ],
  "generation_number": 1 | 2,    // for Free users: which generation this is
  "weekly_regen_count": 3         // for Pro users: how many used this week
}
```

---

#### `POST /api/parse-schedule`

**Request:** `{ "raw_text": "string" }`  
**Auth:** Required (session cookie)  
**Logic:**

1. Run parser on `raw_text`. Return parsed lectures array if ≥ 1 lecture found.
2. If 0 lectures found: insert into `parse_failures` (user_id, raw_text). Return `{ lectures: [], error: "parse_failed" }`.
3. Do NOT save lectures to DB. Client shows preview; saves on confirm via standard Supabase client insert.

**Response (success):** `{ "lectures": [{ course_name, day_of_week, start_time, end_time, course_code? }] }`

---

#### `POST /api/stripe/checkout`

**Request:** `{ "billing_period": "monthly" | "annual" }`  
**Auth:** Required  
**Logic:**

1. Get user email from session.
2. Check if `subscriptions` row exists for this user (to reuse `stripe_customer_id`).
3. Create Stripe Checkout session:
   ```
   mode: 'subscription'
   customer: existing stripe_customer_id (or undefined for new)
   customer_email: user.email (if no existing customer)
   line_items: [{ price: PRICE_ID_MAP[billing_period], quantity: 1 }]
   success_url: {BASE_URL}/study-plan?upgraded=true
   cancel_url: {BASE_URL}/pricing
   metadata: { user_id: session.user.id }
   ```
4. Return `{ url: checkoutSession.url }`. Client redirects.

---

#### `POST /api/stripe/cancel`

**Auth:** Required (session cookie)  
**Logic:**

1. Get session. If no session → 401.
2. Fetch `subscriptions` row for this user: `stripe_subscription_id`, `status`, `current_period_end`.
3. If no row or `status ≠ 'active'` → return 400 `{ error: "no_active_subscription" }`.
4. Call Stripe **server-side** using `STRIPE_SECRET_KEY`:
   ```typescript
   await stripe.subscriptions.update(stripe_subscription_id, {
     cancel_at_period_end: true,
   })
   ```
5. Update `subscriptions.cancel_at_period_end = true`, `subscriptions.updated_at = now()`.
6. Return 200 `{ cancel_at: current_period_end }` (ISO timestamp string).
7. Client displays: "Your plan will stay active until [formatted date]."

> The client never calls Stripe directly. `STRIPE_SECRET_KEY` is used only in server route handlers and the webhook. Never expose it to the client or include it in API responses.

---

#### `POST /api/stripe/webhook`

**Auth:** Stripe-Signature header verification (not session-based)

**Events handled:**

| Event                           | Action                                                                                                                                  |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `customer.subscription.created` | Upsert `subscriptions`. Set `users.plan = 'pro'`.                                                                                       |
| `customer.subscription.updated` | Upsert `subscriptions`. If `status = 'active'` → `users.plan = 'pro'`. If `status IN ('cancelled','past_due')` → `users.plan = 'free'`. |
| `customer.subscription.deleted` | Update `subscriptions.status = 'cancelled'`. Set `users.plan = 'free'`.                                                                 |
| `invoice.payment_succeeded`     | Update `subscriptions.current_period_end`. Ensure `users.plan = 'pro'`.                                                                 |
| `invoice.payment_failed`        | Update `subscriptions.status = 'past_due'`. Set `users.plan = 'free'`.                                                                  |

**User ID resolution:** Extract `user_id` from `subscription.metadata.user_id` (set at checkout creation). If missing, look up via `stripe_customer_id → subscriptions.user_id`.

**Idempotency:** All writes use upsert with `stripe_subscription_id` as the conflict key. Safe to receive duplicate events.

**Verification (must be first line of handler):**

```typescript
const event = stripe.webhooks.constructEvent(
  await req.text(),
  req.headers.get('stripe-signature')!,
  process.env.STRIPE_WEBHOOK_SECRET!
)
// Any error here → return 400 immediately
```

---

## 8) AI Prompt Contract + Output JSON Schema + Validation

### Output JSON Schema (strict)

Each element of the returned array must conform to:

```typescript
type StudySession = {
  day: string // Full day name in the response language. AR: "الأحد". EN: "Sunday".
  start_time: string // "HH:MM" 24h format. E.g. "18:00".
  end_time: string // "HH:MM" 24h format. Must be > start_time.
  course_name: string // Must match one of the courses sent in the prompt exactly.
  topic_focus: string // Specific topic. E.g. "Chapter 3 review" / "مراجعة الفصل الثالث".
  session_type: 'review' | 'first_read' | 'practice'
}
```

> `plan_type` is NOT in the per-session schema. It is stored at the `study_plans` row level only. Gemini does not need to return it per session.

### Validation rules (server-side, after Gemini response)

```typescript
function validatePlanJson(
  raw: string,
  coursesInSchedule: string[]
): StudySession[] | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return null

  const VALID_SESSION_TYPES = ['review', 'first_read', 'practice']
  const TIME_REGEX = /^\d{2}:\d{2}$/

  for (const item of parsed as StudySession[]) {
    if (typeof item.day !== 'string' || !item.day) return null
    if (!TIME_REGEX.test(item.start_time)) return null
    if (!TIME_REGEX.test(item.end_time)) return null
    if (item.start_time >= item.end_time) return null
    if (typeof item.course_name !== 'string' || !item.course_name) return null
    // Soft check: course_name should be in the schedule (log mismatch but don't reject)
    if (!coursesInSchedule.includes(item.course_name)) {
      console.warn(
        '[plan-validation] Unknown course in plan:',
        item.course_name
      )
    }
    if (!VALID_SESSION_TYPES.includes(item.session_type)) return null
    if (typeof item.topic_focus !== 'string' || !item.topic_focus) return null
  }

  return parsed as StudySession[]
}
```

### Retry logic

```
Attempt 1:
  → Call Gemini with standard prompt
  → If validatePlanJson returns null:

Attempt 2 (one retry only):
  → Append to user message: "\n\nIMPORTANT: Your previous response was not valid JSON.
     Return ONLY the JSON array with no other text, no markdown, no backticks, no explanation."
  → Call Gemini again
  → If validatePlanJson returns null again:
    → Log to Sentry: { user_id, schedule_id, prompt_variant, attempt: 2, raw_response: string, error: 'invalid_json_after_retry' }
    → Return HTTP 500 { error: "ai_generation_failed" } to client
    → Client shows: "Plan generation failed. Please try again." with retry button
```

### Prompt — Variant A (exam_driven)

```
SYSTEM:
You are an academic study planner for a Saudi university student.
Respond in [Arabic|English] only. All text fields must be in [Arabic|English].
Return ONLY a valid JSON array. No markdown. No code blocks. No preamble. No explanation.
The array must contain objects matching this exact schema:
{"day": string, "start_time": "HH:MM", "end_time": "HH:MM", "course_name": string, "topic_focus": string, "session_type": "review"|"first_read"|"practice"}

USER:
Generate a weekly exam-driven study plan.

SCHEDULE (these time slots are occupied — do not schedule study sessions during them):
[JSON: [{course_name, day_of_week, start_time, end_time}]]

EXAMS (upcoming):
[JSON: [{course_name, exam_date, exam_type}]]

TODAY: [ISO date in AST, e.g. "2026-02-19"]

RULES:
1. Do not schedule any study session during a lecture slot.
2. Prioritize courses with the nearest exam dates. More sessions = closer exam.
3. Sessions must be 60–90 minutes long (end_time - start_time).
4. Every course in the schedule must appear at least once per week.
5. Use a mix of session_type values across the week.
6. Spread sessions across the full 7-day week.
7. Use day names that match the language specified in the system message.
```

### Prompt — Variant B (weekly_optimization)

```
SYSTEM: (same as Variant A)

USER:
Generate a balanced weekly optimization study plan. No exams have been scheduled yet.
The goal is to build consistent weekly study habits across all courses.

SCHEDULE (occupied slots):
[JSON: [{course_name, day_of_week, start_time, end_time}]]

RULES:
1. Do not schedule any study session during a lecture slot.
2. Distribute study time equally across all courses — no urgency weighting.
3. Sessions must be 60–90 minutes long.
4. Every course must appear at least twice per week.
5. Prioritize "first_read" and "review" session types.
6. Spread sessions evenly across the 7-day week.
7. Use day names that match the language specified in the system message.
```

### Token / lecture truncation

If `lectures.length > 20`: select the 20 lectures whose `course_name` appears in the `exam_dates` table first (sorted by nearest `exam_date`), then fill remaining slots by `created_at`. Log the truncation event. Display a notice in the UI: "Your schedule has more than 20 courses. The plan covers your most exam-critical courses."

---

## 9) Payments (Stripe) Contract

### Price IDs

Store in environment variables. Never hardcode.

```
STRIPE_PRICE_MONTHLY=price_xxx   # SAR 39/month
STRIPE_PRICE_ANNUAL=price_yyy    # SAR 299/year
STRIPE_WEBHOOK_SECRET=whsec_zzz
```

### Webhook idempotency guarantee

All `subscriptions` upserts use `stripe_subscription_id` as the unique key:

```sql
INSERT INTO subscriptions (...) VALUES (...)
ON CONFLICT (stripe_subscription_id) DO UPDATE SET
  status = EXCLUDED.status,
  current_period_end = EXCLUDED.current_period_end,
  cancel_at_period_end = EXCLUDED.cancel_at_period_end,
  updated_at = now();
```

### Plan downgrade behavior (cancellation)

When `users.plan` is set to `'free'` on cancellation:

- The student retains access to their schedule, exam dates, and the most recent study plan view.
- The "Refine Plan" button re-evaluates using the free limit: `COUNT(study_plans WHERE plan_snapshot='free')`.
- If the user previously generated 0 free plans (was on Pro from day 1), they now get 2 free generations.
- If the user previously generated 2+ free plans before upgrading, they are immediately at the free limit and see the upgrade prompt.

### Stripe Checkout metadata (required)

Always include:

```
metadata: {
  user_id: session.user.id,          // for webhook user resolution
  billing_period: 'monthly'|'annual' // for subscriptions.billing_period
}
```

### Cancellation route — `POST /api/stripe/cancel`

The client never calls the Stripe API directly. The Cancel button in `/settings` POSTs to this server route.

```
1. Verify session. If no session → 401.
2. Fetch subscriptions row for user: stripe_subscription_id, status.
3. If no active subscription → return 400 { error: "no_active_subscription" }.
4. Call Stripe server-side:
   stripe.subscriptions.update(stripe_subscription_id, { cancel_at_period_end: true })
5. Update subscriptions.cancel_at_period_end = true, subscriptions.updated_at = now().
6. Return 200 { cancel_at: current_period_end (ISO string) }.
7. Client displays: "Your plan will stay active until [formatted date]."
```

> `STRIPE_SECRET_KEY` is used here, never the publishable key. This key must never appear in client-side code or be exposed in responses.

---

### M1 — Activation Rate

**Definition:** % of signups who generate ≥ 1 study plan within 7 days of signup.  
**Target:** > 65%.  
**Query:**

```sql
SELECT
  COUNT(DISTINCT sp.user_id)::float / COUNT(DISTINCT u.id) AS activation_rate
FROM public.users u
LEFT JOIN public.study_plans sp
  ON sp.user_id = u.id
  AND sp.generated_at <= u.created_at + INTERVAL '7 days'
WHERE u.created_at >= NOW() - INTERVAL '30 days';
```

**Diagnostic splits to run weekly:**

- `plan_type = weekly_optimization` vs `exam_driven` — monitors fallback plan adoption
- Activation rate for users who used text-paste parser vs manual entry — identifies friction point
- Drop-off point: users with schedule but no plan — count `users WHERE id IN (SELECT DISTINCT user_id FROM lectures) AND id NOT IN (SELECT DISTINCT user_id FROM study_plans)`

**If below 65%:** Check drop-off point. If users enter lectures but don't generate: the dashboard CTA is not prominent enough or the button state (enabled/disabled) is wrong. If users don't even enter lectures: the manual entry form is the problem — reduce to 3 required fields (course_name, day, start_time, end_time only; make room and code optional).

---

### M2 — Free-to-Pro Conversion Rate

**Definition:** % of registered users who activate a Pro subscription within 30 days.  
**Target:** > 5%.  
**Query:**

```sql
SELECT
  COUNT(DISTINCT s.user_id)::float / COUNT(DISTINCT u.id) AS conversion_rate
FROM public.users u
LEFT JOIN public.subscriptions s
  ON s.user_id = u.id
  AND s.status = 'active'
  AND s.created_at <= u.created_at + INTERVAL '30 days'
WHERE u.created_at >= NOW() - INTERVAL '60 days';
```

**Diagnostic:** Check `COUNT(study_plans WHERE plan_snapshot='free')` distribution. If most free users have 0–1 plans: they're not hitting the paywall — fix retention first (they need to return and use their second generation). If most have 2 plans: they're hitting the paywall but not converting — test stricter copy or price change.

---

### M3 — Week-2 Return Rate

**Definition:** % of users who perform any tracked action in days 8–14 after signup.  
**Target:** > 30%.  
**Tracked actions:** Any INSERT into `lectures`, `exam_dates`, or `study_plans`, OR any page load to `/dashboard` or `/study-plan` (tracked via a lightweight `user_sessions` log or Vercel Analytics page view events).  
**Query (for study_plans returns):**

```sql
SELECT COUNT(DISTINCT user_id)::float /
  (SELECT COUNT(*) FROM public.users WHERE created_at <= NOW() - INTERVAL '14 days') AS week2_return_rate
FROM public.study_plans
WHERE generated_at BETWEEN created_at + INTERVAL '7 days' AND created_at + INTERVAL '14 days';
-- Note: join to users.created_at for the window calculation
```

**If below 30%:** Students generated a plan, had no reason to return. Primary fix: ensure the exam countdown card is visible and rendering the correct state on login. Secondary check: did students actually add exam dates? If they didn't add exams, there is no urgency signal pulling them back. Consider making the "Add exam dates" onboarding step more prominent (not blocking, but very visible).

---

## 11) Milestones — Week 1–4 Engineering Checklist

### Week 1 — Foundation

**Goal:** Authenticated user can create a schedule and add lectures.

#### Task checklist

- [x] **W1-1** Supabase project created. Run schema migrations for all 7 tables (including `parse_failures`). Verify with `\d` in Supabase SQL editor.
  - _AC:_ All tables exist. All FK constraints are enforced. `CHECK` constraints on `lectures` reject `start_time >= end_time`.

- [x] **W1-2** Auth trigger created: `on_auth_user_created` fires on `auth.users` INSERT → inserts `public.users` row.
  - _AC:_ New signup via email and via Google OAuth both create a `public.users` row automatically. No manual insert required in application code.

- [x] **W1-3** RLS policies applied to all tables (see Appendix A).
  - _AC:_ User A cannot SELECT, INSERT, UPDATE, or DELETE rows owned by User B. Test with two test accounts.

- [x] **W1-4** Partial unique index on `schedules (user_id) WHERE is_active = true` created.
  - _AC:_ Attempting to set two schedules as `is_active = true` for the same user throws a unique constraint error.

- [ ] **W1-5** `next-intl` installed and configured. `ar.json` and `en.json` files created with all known string keys (including v0.3 additions: countdown card states, plan type labels, generation counter strings).
  - _AC:_ Switching language in `/settings` changes `users.language_pref` in DB and re-renders the page with correct translations and `dir` attribute (`rtl`/`ltr`).

- [ ] **W1-6** Email + Google OAuth auth pages built (`/auth/signup`, `/auth/login`). Language toggle on signup page.
  - _AC:_ User can sign up with email. User can sign up with Google. Both paths create `public.users` row. Session persists on page refresh.

- [ ] **W1-7** Onboarding flow (`/onboarding`): 3-step form (language confirm → university + year → auto-create schedule). Sets `onboarding_completed = true`.
  - _AC:_ After onboarding: `public.users.onboarding_completed = true`. One `schedules` row with `is_active = true`. User redirected to `/dashboard`.

- [ ] **W1-8** Middleware: JWT check on protected routes. `onboarding_completed = false` → redirect to `/onboarding`.
  - _AC:_ Unauthenticated GET to `/dashboard` redirects to `/auth/login`. Authenticated user with `onboarding_completed = false` redirects to `/onboarding`.

- [ ] **W1-9** Manual lecture entry form. Validates required fields. Calls Supabase insert. Assigns `color_hex` from preset palette.
  - _AC:_ Form submits and inserts lecture. `start_time >= end_time` shows inline error and blocks submit. Form available in Arabic and English.

- [ ] **W1-10** Basic weekly grid view on `/dashboard`. Renders lectures by day column. RTL-aware.
  - _AC:_ 5 test lectures (Sat–Wed) render in correct columns. Arabic UI shows columns right-to-left with Arabic day labels. English UI shows left-to-right with English day labels.

- [ ] **W1-11** Vercel project connected to GitHub repo. Preview deployments working.
  - _AC:_ Push to `main` auto-deploys. Push to feature branch creates preview URL.

**Week 1 done when:** New Arabic-speaking user signs up, completes onboarding, adds 5 lectures manually, and sees them correctly in RTL weekly grid on a mobile browser.

---

### Week 2 — Schedule Parser + Exam Entry + Dashboard Card

**Goal:** Full schedule import works. Exams can be added. Dashboard card renders all states.

#### Task checklist

- [ ] **W2-1** `/api/parse-schedule` route implemented. Arabic day name mapping. Eastern numeral conversion. 12h/24h time parsing.
  - _AC:_ Paste of a real AOU/KAU-style schedule (Arabic text with day names like "الأحد", "الاثنين") returns ≥ 1 correctly parsed lecture. Failed parse inserts into `parse_failures` and returns `{ lectures: [], error: "parse_failed" }`.

- [ ] **W2-2** Text-paste parser UI: two-tab interface (Manual / Paste). Preview table shown before save. Each row editable/deletable. Confirm saves to DB.
  - _AC:_ Student can paste text, see preview, delete one row, confirm, and see saved lectures in the grid.

- [ ] **W2-3** Exam date entry form. Course dropdown populated from active schedule's lectures. Sets `lecture_id` FK + denormalizes `course_name` server-side.
  - _AC:_ Exam inserts correctly. `exam_dates.lecture_id` is set. `exam_dates.course_name` matches `lectures.course_name`. Deleting the linked lecture sets `lecture_id = NULL`, leaves `course_name` intact.

- [ ] **W2-4** Exam list view on `/dashboard`: sorted by `exam_date` ascending. Past exams visually dimmed. Exam markers on weekly grid.
  - _AC:_ Exams render on correct days in grid. List sorts correctly.

- [ ] **W2-5** Dashboard exam countdown card — all 4 states.
  - _AC:_
    - State 1: Active schedule with future exam → shows "Next exam: [Course] — in X days". Days calculated in AST (UTC+3).
    - State 2: `exam_date = today` in AST → shows warning style.
    - State 3: All exams in the past → shows "No upcoming exams."
    - State 4: No exam rows at all → shows "+ Add Exam" CTA.
  - _AC (timezone):_ Test with a real exam_date = tomorrow UTC. In AST (+3h), if current time is 22:00 UTC (= 01:00 AST next day), card shows "in 0 days" (today in AST), not "in 1 day".

- [ ] **W2-6** "Generate Study Plan" button enabled state: active when ≥ 1 lecture exists, disabled (with tooltip) otherwise.
  - _AC:_ Fresh account with 0 lectures → button disabled. Add 1 lecture → button enabled immediately (no page refresh needed; use server component revalidation or optimistic update).

**Week 2 done when:** User can paste an Arabic schedule, add 3 exam dates, and see the correct countdown state on the dashboard.

---

### Week 3 — AI Generation + Payments + Freemium Gate

**Goal:** End-to-end plan generation, Stripe subscriptions, and all tier limits enforced.

#### Task checklist

- [ ] **W3-1** `/api/generate-plan` route handler. Plan type detection. Prompt construction (Variant A / B). Gemini API call. JSON validation + retry. DB insert/update.
  - _AC:_ With lectures + exams → generates `exam_driven` plan. With lectures only → generates `weekly_optimization` plan. Both plans have all sessions with valid schema (day, start_time, end_time, course_name, topic_focus, session_type). Plan stored in DB with correct `plan_type`, `plan_snapshot`, `language`.

- [ ] **W3-2** Free limit enforcement in route handler. `plan_snapshot = 'free'` row count check.
  - _AC:_ Free user with 0 plans → generate succeeds. Free user with 1 plan → generate succeeds (refinement). Free user with 2 plans → route returns `402 { error: "upgrade_required" }`. Client shows upgrade modal, not error toast.

- [ ] **W3-3** Pro limit enforcement. `week_reference` computed correctly. `regen_count` incremented on same-week row.
  - _AC:_ Pro user generates 5 times in one week → 5th generation succeeds, counter shows "5 of 5". 6th attempt returns `429`. Counter resets on next ISO Monday (UTC).

- [ ] **W3-4** Study plan view page (`/study-plan`). Table layout. Plan type label. Counter badge for Free. Refine button with correct state per tier.
  - _AC:_ Free user at limit sees upgrade prompt (not Refine button). Pro user sees counter "X of 5 used". Weekly optimization plan shows soft upsell prompt. No plan yet → shows empty state with CTA.

- [ ] **W3-5** `/api/stripe/checkout` route. Creates Checkout session with `metadata.user_id`.
  - _AC:_ POST returns `{ url: "https://checkout.stripe.com/..." }`. Visiting that URL shows Stripe Checkout with correct SAR pricing. After test payment, redirects to `/study-plan?upgraded=true`.

- [ ] **W3-6** `/api/stripe/webhook` route. All 5 events handled. Signature verified.
  - _AC:_ Use `stripe listen --forward-to localhost:3000/api/stripe/webhook` in dev. After test subscription: `users.plan = 'pro'`, `subscriptions` row inserted. After test cancellation: `users.plan = 'free'`, `subscriptions.status = 'cancelled'`.

- [ ] **W3-7** Subscription management page (`/settings`): shows plan, billing period, next renewal date, Cancel button.
  - _AC:_ Cancel button calls Stripe to set `cancel_at_period_end = true`. Page shows "Your plan will stay active until [date]." Sentry integrated. Error boundary on all pages.

**Week 3 done when:** Free user generates plan, adds exam, uses refinement, hits paywall, upgrades via Stripe, regenerates as Pro. All without console errors.

---

### Week 4 — Polish + QA + Launch

**Goal:** Production-ready. Ship to real users.

#### Task checklist

- [ ] **W4-1** Mobile responsiveness audit. All pages tested on iPhone 14 (375px) and Samsung Galaxy S21 (360px) in Safari and Chrome.
  - _AC:_ No horizontal scroll. No overlapping elements. Countdown card, plan table, and exam entry form all readable on 375px.

- [ ] **W4-2** Loading states: skeleton screens for plan view, dashboard grid. Spinner with localized copy for Generate button.
  - _AC:_ Generate button shows "جارٍ إنشاء خطتك..." (AR) / "Generating your plan..." (EN) during API call. No layout shift.

- [ ] **W4-3** Error states: Gemini timeout/failure → retry button. Parse failure → fallback CTA. Stripe failure → support email.
  - _AC:_ Simulate Gemini 500 (mock env var) → user sees localized error with Try Again button. Parser failure → "Try manual entry" link.

- [ ] **W4-4** QA matrix — all 16 combinations documented:

  ```
  AR × EN × Mobile × Desktop × Free × Pro × exam_driven × weekly_optimization
  ```

  - _AC:_ All 16 paths complete without JS errors in browser console. Sentry shows 0 unhandled exceptions after 30 minutes of QA.

- [ ] **W4-5** Landing page (`/`): headline, 3-sentence problem statement, pricing preview, sign-up CTA. Arabic and English versions.
  - _AC:_ Page loads in < 2s on mobile (Vercel Edge). No broken links. CTA goes to `/auth/signup`.

- [ ] **W4-6** Print stylesheet for `/study-plan`.
  - _AC:_ `Ctrl+P` / print preview shows clean plan table, no nav, no buttons, no sidebar.

- [ ] **W4-7** Soft launch: invite 15–20 students. Share Typeform feedback link from `/settings`.
  - _AC:_ ≥ 10 students complete full flow (signup → plan generated). Collect and triage feedback within 48h.

- [ ] **W4-8** Fix critical bugs from soft launch only. No new features.
  - _AC:_ Zero P0 bugs (crash, data loss, blocked flow) open at launch.

- [ ] **W4-9** Public launch post in 3+ Saudi university WhatsApp groups + Twitter/X thread.

**Week 4 done when:** A complete stranger finds the app in a WhatsApp group, signs up in Arabic, builds a schedule, generates a plan (with or without exams), understands the upgrade offer, and can pay via Stripe — without founder intervention.

---

## 12) Open Questions — Maximum 10, Execution-Blocking Only

| #   | Question                                                                                                                                                                                                                                                                                                                         | Blocks              | Suggested default                                                                                                                                                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | What is the Saudi Arabic semester calendar? We need to know semester start months to time launch for maximum acquisition.                                                                                                                                                                                                        | Marketing timing    | Assume semesters start mid-Feb and mid-Sep. Validate with 3 local students.                                                                                                                                                                                                                            |
| 2   | Does Stripe support SAR (Saudi Riyal) as a settlement currency for a Saudi-registered business?                                                                                                                                                                                                                                  | Payments            | SAR is supported. Verify in Stripe dashboard under Settings > Business > Payout currency before Week 3.                                                                                                                                                                                                |
| 3   | Which Google Gemini model to use: `gemini-1.5-flash` (fast, cheaper) or `gemini-1.5-pro` (smarter, 5x cost)?                                                                                                                                                                                                                     | AI quality vs cost  | Start with `gemini-1.5-flash`. Upgrade to `pro` only if plan quality is poor in soft launch testing.                                                                                                                                                                                                   |
| 4   | ~~Should `week_reference` for Pro limits use UTC Monday or AST (UTC+3) Monday?~~ **Resolved:** Use AST (UTC+3) Monday, consistent with the exam countdown card timezone. `getWeekReference()` shifts the current time to AST before computing the ISO Monday. Users see "resets Monday" which matches their local week boundary. | Pro limit edge case | **Resolved — use AST Monday.**                                                                                                                                                                                                                                                                         |
| 5   | If a user deletes their active schedule, what happens to their study plans and exam dates?                                                                                                                                                                                                                                       | Data model          | Cascade delete all linked `lectures`, `exam_dates`, and `study_plans` via FK cascade. Warn user with modal before delete.                                                                                                                                                                              |
| 6   | Can a user have multiple schedules (e.g., previous semesters)?                                                                                                                                                                                                                                                                   | UX flow             | MVP: one active schedule, previous schedules retained as inactive (viewable but not editable). Do not build multi-schedule switching in MVP.                                                                                                                                                           |
| 7   | What is the maximum acceptable Gemini response time before we show a timeout error to the user?                                                                                                                                                                                                                                  | UX / AI             | 15 seconds. After 15s: abort the request, show error, log to Sentry. Do not show a spinner indefinitely.                                                                                                                                                                                               |
| 8   | Is there a Stripe payment method that Saudi students without international cards can use at launch?                                                                                                                                                                                                                              | Conversion risk     | Check if Stripe supports Apple Pay / Google Pay for Saudi cards — these often work where direct card entry fails. Test before launch week.                                                                                                                                                             |
| 9   | Which `next-intl` routing strategy: locale-prefix (`/ar/dashboard`) or cookie-based (no URL prefix)?                                                                                                                                                                                                                             | i18n architecture   | Use cookie-based with no URL prefix for MVP. Simpler to implement. RTL/LTR applied via `<html dir>` attribute. Locale prefix adds route complexity for zero SEO benefit at launch scale.                                                                                                               |
| 10  | How do we handle a student who exits mid-onboarding (has `onboarding_completed = false` and a partial `public.users` row)?                                                                                                                                                                                                       | Auth flow           | On next login: `app/(app)/layout.tsx` (server layout) fetches `users.onboarding_completed` and returns `redirect('/onboarding')` if `false`. Middleware only validates the session JWT — it does not read DB state. Onboarding is idempotent: checks if a schedule already exists before creating one. |

---

## 13) Appendix

### A — RLS Policies (minimal, per table)

Apply these in Supabase Dashboard → Authentication → Policies, or via SQL migrations.

```sql
-- USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users: select own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users: update own" ON public.users FOR UPDATE USING (auth.uid() = id);
-- INSERT is handled by trigger; no user-facing INSERT policy needed.

-- SCHEDULES
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedules: all own" ON public.schedules
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- LECTURES
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lectures: all own" ON public.lectures
  USING (auth.uid() = (SELECT user_id FROM schedules WHERE id = schedule_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM schedules WHERE id = schedule_id));

-- EXAM_DATES
ALTER TABLE public.exam_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exam_dates: all own" ON public.exam_dates
  USING (auth.uid() = (SELECT user_id FROM schedules WHERE id = schedule_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM schedules WHERE id = schedule_id));

-- STUDY_PLANS
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "study_plans: all own" ON public.study_plans
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SUBSCRIPTIONS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions: select own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
-- INSERT/UPDATE only from server-side webhook (service role). No user-facing write policy.

-- PARSE_FAILURES
ALTER TABLE public.parse_failures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parse_failures: insert own" ON public.parse_failures
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- No SELECT policy. Clients cannot read this table.
-- Service role key (used in server routes and Supabase dashboard) bypasses RLS for analysis.
```

> **Service role key:** All webhook handlers and server-side operations that write to `subscriptions` or update `users.plan` must use `SUPABASE_SERVICE_ROLE_KEY` (not the anon key). Never expose this key to the client.

---

### B — HTTP Error Code Reference

| Code  | Meaning                  | When returned                                                                    |
| ----- | ------------------------ | -------------------------------------------------------------------------------- |
| `401` | Unauthenticated          | No valid session on protected route                                              |
| `402` | Free limit reached       | Free user has ≥ 2 `study_plans` with `plan_snapshot='free'`                      |
| `403` | Forbidden                | User attempts to access another user's data (should not occur if RLS is correct) |
| `429` | Pro weekly limit reached | Pro user's `regen_count >= 5` for current `week_reference`                       |
| `500` | AI generation failed     | Gemini returned invalid JSON after 2 attempts                                    |
| `400` | Bad request              | Invalid Stripe webhook signature; malformed request body                         |

---

### C — Key Edge Cases

| Edge case                                               | Behavior                                                                                                                                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| User upgrades mid-week as Pro, then generates 5 plans   | Week 1: `regen_count` counts from their first Pro generation that week. Previous free plans have `plan_snapshot='free'` and are not counted in the Pro limit.                              |
| User cancels Pro, re-subscribes same day                | On cancellation webhook: `users.plan = 'free'`. On re-subscribe webhook: `users.plan = 'pro'`. Subscriptions row is upserted. No data loss.                                                |
| Gemini response contains `plan_type` field (old prompt) | Validation strips unknown fields. `StudySession` type only has 6 fields; extra fields are ignored during validation.                                                                       |
| User deletes all lectures after generating a plan       | Plan remains in `study_plans`. `/study-plan` still displays the last generated plan. Dashboard shows empty schedule. Generate button becomes disabled.                                     |
| Exam date added with `exam_date` in the past            | No validation blocking this. Past exams are allowed (student may be logging retroactively). Countdown card ignores past exams for display.                                                 |
| Two browser tabs open; user generates plan in one tab   | Second tab's "Refine Plan" button may show stale state. On click: API call executes, limit check runs fresh from DB. If limit exceeded, returns 402. Client re-fetches counter state.      |
| Text parser receives an image URL or binary data        | Parser operates on plain text only. If input contains no recognized pattern, returns `parse_failed`. No crash.                                                                             |
| `schedule_id` in POST body belongs to another user      | RLS on `lectures` and `exam_dates` fetches only rows matching `auth.uid()`. No data leak. Plan generation would return 0 lectures → API returns 400 "No lectures found for this schedule." |

---

_AILine PRD v0.3.1 · February 2026 · Commit to `docs/PRD-v0.3.1.md`_  
_This document is the contract. Build what is here. Log everything else in `docs/future-ideas.md`._

---

### Auth Implementation Sync Note (February 2026)

**Updated: Auth Implementation Synced**

The Authentication section (F1) and Middleware section have been updated to reflect the **actual implemented behavior**:

- No auto-login on email confirmation (no `/auth/confirm` route with `exchangeCodeForSession`)
- Signup redirects to `/auth/login?check_email=1`
- Login checks `email_confirmed_at` and immediately signs out unconfirmed users
- Middleware gates unconfirmed users to `/auth/login?unconfirmed=1`
- No countdown check-email page

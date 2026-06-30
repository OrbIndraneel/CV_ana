# Sitemap & User Flows
## Resume Analyzer Pro

---

## Information Architecture (Sitemap)

```
┌─ Landing Page (/)
│  ├─ Value props
│  ├─ Pricing preview
│  ├─ Social proof
│  └─ [Sign up] [Sign in]
│
├─ Auth Pages
│  ├─ /auth/signup
│  │  └─ Create account (email, password)
│  ├─ /auth/login
│  │  └─ Sign in (email, password)
│  ├─ /auth/forgot-password
│  │  └─ Reset password flow
│  └─ /auth/verify-email
│     └─ Email verification (if enabled)
│
├─ Authenticated App
│  │
│  ├─ /dashboard (HOME)
│  │  ├─ Statistics cards
│  │  ├─ Recent analyses
│  │  ├─ Quick actions
│  │  └─ Upgrade CTA (if free user)
│  │
│  ├─ /resumes (UPLOAD & MANAGE)
│  │  ├─ /resumes/upload
│  │  │  ├─ Drag-and-drop
│  │  │  ├─ File preview
│  │  │  └─ [Analyze] button
│  │  ├─ /resumes (list all)
│  │  │  ├─ Each resume card
│  │  │  ├─ Version history
│  │  │  └─ [View analysis] [Delete] [Compare]
│  │  ├─ /resumes/:id (single resume)
│  │  │  ├─ Parsed sections
│  │  │  ├─ Previous analyses
│  │  │  └─ [New analysis]
│  │  └─ /resumes/:id/versions (version history)
│  │     ├─ Timeline view
│  │     ├─ Diff view
│  │     └─ Score progression
│  │
│  ├─ /analysis (ANALYZE & VIEW RESULTS)
│  │  ├─ /analysis/start
│  │  │  ├─ Select resume
│  │  │  ├─ Paste/input JD
│  │  │  └─ [Analyze]
│  │  ├─ /analysis/:id (result page, THE HERO)
│  │  │  ├─ Overall score card
│  │  │  ├─ Category breakdown
│  │  │  ├─ Semantic heatmap
│  │  │  ├─ Bullet analysis
│  │  │  ├─ Career timeline
│  │  │  ├─ ATS report
│  │  │  └─ [Export PDF] [Get AI rewrites]
│  │  ├─ /analysis/:id/compare
│  │  │  └─ Multi-JD comparison view
│  │  └─ /analysis/history
│  │     └─ All past analyses (filterable)
│  │
│  ├─ /jobs (SAVED JOB DESCRIPTIONS)
│  │  ├─ /jobs (list)
│  │  │  ├─ Saved job cards
│  │  │  └─ [Analyze against resume]
│  │  ├─ /jobs/:id (single JD)
│  │  │  └─ Full text + analyses using this JD
│  │  └─ /jobs/compare (multi-JD comparison)
│  │     └─ Side-by-side JD comparison
│  │
│  ├─ /account (USER SETTINGS)
│  │  ├─ /account/profile
│  │  │  ├─ Edit name, email
│  │  │  └─ Avatar upload
│  │  ├─ /account/subscription
│  │  │  ├─ Current plan info
│  │  │  ├─ Usage stats
│  │  │  ├─ [Upgrade] [Manage]
│  │  │  └─ Billing history
│  │  ├─ /account/preferences
│  │  │  ├─ Theme (light/dark)
│  │  │  ├─ Email notifications
│  │  │  └─ Privacy settings
│  │  ├─ /account/api-keys (if Team tier)
│  │  │  └─ Manage API access
│  │  └─ /account/security
│  │     ├─ Change password
│  │     ├─ 2FA setup
│  │     └─ Session management
│  │
│  └─ /help (SUPPORT)
│     ├─ FAQ
│     ├─ Docs
│     ├─ Contact form
│     └─ Feature requests
│
├─ Pricing Page (/pricing)
│  ├─ Tier comparison table
│  ├─ FAQ
│  └─ [Choose plan]
│
└─ Policies
   ├─ /privacy
   ├─ /terms
   └─ /contact
```

---

## Key User Flows

### Flow 1: New User → Free Analysis (10 min)

```
1. Land on home page
   ↓ [Sign up]
2. Create account (email, password)
   ↓ [Verify email] (or skip)
3. Redirect to dashboard
   ↓ [Upload resume]
4. Upload resume (PDF/DOCX)
   ↓ (parsing in background)
5. Resume preview with parsed sections
   ↓ [Analyze]
6. Paste or input job description
   ↓ [Analyze]
7. Processing screen (1-5 seconds)
   ↓
8. ANALYSIS RESULT PAGE (hero moment)
   • Overall score card (animated reveal)
   • Category breakdown
   • Semantic heatmap
   • Bullet analysis (with suggestions)
   • Career timeline
   ↓ User scrolls and explores
9. [Export PDF] or [Get AI rewrite] (upgrade nudge)
   ↓
10. Done! Prompt to upload another resume or save job description
```

**Key Points:**
- Free user can run 1 analysis/month
- No real friction until they hit the limit
- Premium features (AI rewrites, multi-JD) shown but gated

---

### Flow 2: Recurring User → Multi-JD Comparison (5 min)

```
1. Sign in
   ↓
2. Dashboard shows recent analyses
   ↓ [Compare against multiple jobs]
3. Input/paste 3-5 job descriptions
   ↓ [Compare]
4. Processing...
   ↓
5. Comparison results page
   • Score card for each JD
   • Heatmap showing fit for each
   • Top matches highlighted
   • Recommendation (which role fits best)
   ↓ User reads comparison
6. [Get AI rewrites] (upsell to Pro Plus)
   ↓ If user clicks:
7. Rewrite suggestions page
   • Original bullet
   • AI-improved version
   • [Accept] [Try again] [Dismiss]
8. Done! Suggestion to upgrade to Pro Plus
```

**Key Points:**
- This is a "stickiness" feature (jobs hunters do this weekly)
- AI rewrites are the conversion driver to Pro Plus
- Multi-JD comparison is Pro-only (not free)

---

### Flow 3: Pro User → Optimize & Upgrade to Pro Plus (20 min)

```
1. Upload resume (2nd version)
   ↓
2. Analyze against target job
   ↓
3. See results:
   • Score: 72/100 (good but not great)
   • Semantic match: 78% (strong)
   • Bullet quality: 65% (weak) ← tap into this
   ↓ [Get AI rewrites]
4. Paywall: "Upgrade to Pro Plus for AI rewrites"
   ↓ [Upgrade]
5. Stripe checkout
   ↓ [Complete purchase]
6. Return to analysis page
   ↓ Now can click [Get AI rewrites]
7. AI rewrite suggestions
   • Original: "Responsible for managing databases"
   • Improved: "Engineered PostgreSQL infrastructure for 50+ microservices,
     reducing query latency by 38%"
   • [Accept] [Try again]
   ↓ User accepts rewrites
8. Bullet is updated in their draft
   ↓ [Re-analyze]
9. New score: 78/100 (+6 points)
   ✓ Success moment! "Your improvements paid off"
   ↓
10. User is now a paying customer (LTV increases)
```

**Key Points:**
- Pro → Pro Plus conversion happens at the "get AI rewrites" button
- Showing them the *result* (new score) drives retention
- This creates a feedback loop (analyze → improve → re-analyze)

---

### Flow 4: Team Tier (Enterprise) → Bulk Upload & API (30 min)

```
1. Career coach signs up for Team plan ($49.99/mo)
   ↓
2. Dashboard shows team features
   ↓ [Generate API key]
3. Create API credentials
   ↓ [Copy]
4. Set up integration with their ATS/platform
   ↓ (out of scope, they handle)
5. Use API to analyze resumes in bulk
   • POST /api/v1/analysis/start
   • {resume_id, job_description_id}
   • Returns analysis_id for polling
   ↓
6. Bulk results come back as JSON
   ↓
7. Coach imports results into their own platform
   ↓
8. Coach uses web dashboard to:
   • Upload 50 resumes at once
   • Create shared job descriptions
   • See aggregated analytics
   • Custom scoring per organization
```

**Key Points:**
- API unlocks enterprise revenue ($500-5k/mo per customer)
- White-label option available (additional cost)
- This is not the primary user flow, but very high LTV

---

## Page Templates & Layouts

### 1. Score Result Page (Most Important)

**Header Section:**
```
[< Back] | "Analysis Results" | [Share] [Export PDF]
```

**Body (scrollable):**
```
[Overall Score Card]       (300ms entrance, animated reveal)
   ↓ (100ms delay)
[Category Breakdown Grid]  (staggered 100-600ms)
   ↓ (200ms delay after cards finish)
[Tabs: Issues | Gaps | Wins]  (fade in, 700ms)
   ↓ (user clicks tab)
[Content animates in]      (150ms)
   ↓ (scroll down)
[Semantic Heatmap]         (reveals on scroll into view)
   ↓ (scroll down)
[Bullet Analysis]          (reveals on scroll)
   ↓ (scroll down)
[Career Timeline]          (reveals on scroll)
   ↓ (scroll to bottom)
[CTA: Export / Rewrite]    (fixed bottom if not visible)
```

**Timing:**
- Total entrance time: 700ms (feels quick, not rushed)
- All critical info visible after 1 second
- Details available on scroll (no scrolljacking)

---

### 2. Upload Page

**Header:**
```
"Upload your resume"
"We accept PDF and DOCX (max 5MB)"
```

**Body:**
```
[Large drag-and-drop zone]
  "Drag and drop your resume here"
  "or [click to select file]"

[File preview (if selected)]
  Filename | Size | [Remove]

[Progress bar (if uploading)]
  Animates from 0-100

[Success message (if complete)]
  ✓ "Resume uploaded successfully"
  [Preview] [Analyze]

[Alternative tab: Paste text]
  [Textarea for resume content]
  [Analyze]
```

---

### 3. Dashboard

**Header:**
```
"Dashboard"
"Welcome back, [User]"
```

**Body (grid layout):**
```
[Statistics Row]
  4 cards: Resumes | Analyses | Avg Score | Last Analysis
  (stagger entrance 100-600ms)

[Recent Activity Section]
  "Analyses from the past week"
  Each card: Resume name | JD title | Score | Date | [View]
  (stagger entrance, 50ms apart)

[CTA Section (if free user)]
  "Unlock Pro features"
  "Semantic matching, AI rewrites, multi-JD comparison"
  [Upgrade to Pro] button

[Next Steps (contextual)]
  - If no resumes: Upload your first resume
  - If resumes but no analyses: Analyze your resume
  - If analyses exist: Upload another or compare jobs
```

---

### 4. Settings Page

**Sidebar tabs:**
```
Profile
Subscription
Preferences
Security
API Keys (if applicable)
Data & Privacy
```

**Profile tab:**
```
Avatar (circle, drag-to-upload)
Name [input]
Email [input] (shows verification status)
Tier badge (Free / Pro / Pro Plus / Team)
Created: [date]

[Save] [Cancel] buttons
```

**Subscription tab:**
```
Current plan: Pro
Next billing: [date]
Cost: $4.99/month

[Upgrade] [Manage payment] [Cancel subscription]

Billing history (table):
  Date | Description | Amount | Status | [Invoice]
```

---

## Responsive Design

### Desktop (> 1024px)
```
Sidebar (240px) | Content (1fr)
└─ Sticky navigation, shows all items

Analysis page:
  2-column layout for some sections
  Single column for hero score
```

### Tablet (640-1024px)
```
Sidebar becomes drawer (slide-in from left)
Content takes full width

Analysis page:
  Single column, wider margins
  Heatmap grid: 2 columns instead of 3
```

### Mobile (< 640px)
```
Sidebar: drawer (hamburger menu)
Header: fixed top, compact
Content: full width, minimal padding

Analysis page:
  Single column, minimal margins
  Heatmap grid: 1 column
  Cards: stack vertically
  All buttons: full width
```

---

## State Machine: Analysis Processing

```
IDLE
  ↓ [User clicks Analyze]
UPLOADING_RESUME
  ↓ (show progress)
PARSING
  ↓ (show "Parsing your resume...")
EXTRACTING_SKILLS
  ↓ (show "Extracting key skills...")
SEMANTIC_MATCHING
  ↓ (show "Analyzing job fit...")
GENERATING_FEEDBACK
  ↓ (show "Generating insights...")
COMPLETE
  ↓ (show results page)
READY_TO_EXPORT
  ↓ [User clicks Export]
EXPORTING
  ↓ (show spinner)
SUCCESS
  ↓ (PDF downloaded)
IDLE

ERROR (at any stage)
  ↓ Show error message
  ↓ [Retry] button
  ↓ Return to IDLE or previous state
```

**UI for each state:**
```
UPLOADING_RESUME:    Progress bar 0-30%
PARSING:             Progress bar 30-50%
EXTRACTING_SKILLS:   Progress bar 50-70%
SEMANTIC_MATCHING:   Progress bar 70-90%
GENERATING_FEEDBACK: Progress bar 90-100%
COMPLETE:            Fade in results page
```

---

## Navigation Hierarchy

### Primary Navigation
```
Icon + Label + Badge (count)
  • Dashboard (home icon)
  • Resumes (file icon + count of versions)
  • Analysis (chart icon + count of analyses)
  • Jobs (briefcase icon)
  • Account (user icon)
```

### Secondary Navigation (in-page)
```
Breadcrumbs: Home > Resumes > Resume Name
Tabs: Used to group related content (Issues | Gaps | Wins)
Action buttons: Primary (blue), Secondary (outline), Tertiary (ghost)
```

### Mobile Navigation
```
Bottom tab bar (5 icons):
  Home | Resumes | Analyses | Jobs | Account

Drawer menu (opened from hamburger):
  Dashboard
  Upload Resume
  History
  Pricing
  Settings
  ─────────────
  Sign out
```

---

## Summary: Why This Information Architecture Works

1. **Clear mental model** — Users understand the three main actions: Upload, Analyze, Explore results
2. **Progressive complexity** — Simple for free users, more options unlock with paid tiers
3. **Natural user flows** — Each path feels intuitive and frictionless
4. **Conversion moments** — Premium features introduced at the right moments (when users need them)
5. **Mobile-first** — All layouts tested on mobile, drawer navigation on narrow screens
6. **Accessible** — Breadcrumbs + clear labeling + keyboard nav throughout
7. **Scalable** — Easy to add new pages/features without breaking existing flows

**Result:** Users can easily find what they need, achieve their goals, and discover premium features naturally.

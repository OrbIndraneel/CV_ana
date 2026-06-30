# UI/UX Design System
## Resume Analyzer Pro

---

## Design Philosophy

### Core Principles
1. **Progressive Disclosure** — Don't overwhelm users with all information at once. Reveal complexity gradually.
2. **Purpose-Driven Animation** — Every animation serves a function:
   - Guides attention to critical information
   - Reveals information hierarchy
   - Provides feedback on user actions
   - Makes state changes intelligible
3. **Semantic Color Coding** — Colors encode meaning, not decoration:
   - Green = success, matched, strong
   - Amber = warning, partial, fair
   - Red = error, missing, weak
   - Blue = info, neutral, actionable
4. **Minimal & Clean** — White space is generous, shadows are subtle, fonts are limited

### Typography
```
Font Family: Inter (sans-serif)
Body: 16px, weight 400, line-height 1.5
Headings: 500 weight only (never 600+, looks heavy)
  - h1: 32px (page titles)
  - h2: 24px (section headers)
  - h3: 18px (subsections)
  - h4: 16px (card titles)
Monospace: Fira Code 12px (for code snippets, numbers)
```

### Color Palette
```
Primary: #0084ff (bright, modern blue)
Success: #22c55e (emerald, clear positive)
Warning: #f59e0b (amber, gets attention without alarm)
Error: #ef4444 (red, only for critical issues)
Info: #0ea5e9 (sky blue, informational)
Neutral: Slate 50-900 (full range for depth)

Example palette allocation:
- Strong bullet point: emerald-600
- Weak bullet point: red-600
- Employment gap: amber-600
- Matched requirement: emerald-500
- Unmatched requirement: slate-400
```

---

## Page Layout System

### Global Layout
```
┌─────────────────────────────────────────────────────────┐
│  Navbar                                                  │
│  ┌───────────────────────────────────────────────────────┤
│  │  Logo | Nav Items  │                    User Menu     │
│  └───────────────────────────────────────────────────────┤
├─────────────────────────────────────────────────────────┤
│   Sidebar                       Main Content            │
│  ┌──────────────┐  ┌──────────────────────────────────┐  │
│  │ Dashboard    │  │  Page Content                     │  │
│  │ Uploads      │  │  (responsive grid layout)         │  │
│  │ History      │  │                                   │  │
│  │ Pricing      │  │                                   │  │
│  │ Settings     │  │                                   │  │
│  └──────────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
```
Mobile:      < 640px   (sidebar = drawer)
Tablet:      640-1024  (sidebar visible)
Desktop:     > 1024px  (full layout)
Wide:        > 1400px  (sidebar fixed, content wider)
```

---

## Screen Designs & User Flows

### 1. Landing Page (Unauthenticated)
**Purpose:** Hook + convert to signup

```
Header Section:
  "Your resume deserves better than a score"
  "Semantic analysis + AI rewrites + ATS optimization"
  [Get Started] button

Value Props (Cards with icons):
  - Semantic matching (not keyword matching)
  - Bullet-by-bullet feedback
  - Multi-JD comparison
  - Career gap analysis
  - Interview prep

Pricing cards (teaser):
  Free | Pro ($4.99/mo) | Pro Plus ($14.99/mo)

Social proof:
  "Trusted by 5,000+ job seekers"
  Testimonials (carousel or static)
```

**Animations:**
```css
/* Header text: stagger in */
h1 { animation: slideInUp 400ms ease-out 0ms; }
p  { animation: slideInUp 400ms ease-out 100ms; }
button { animation: slideInUp 400ms ease-out 200ms; }

/* Cards: fade and scale in */
.value-card { animation: scaleIn 400ms ease-out 300ms + (n * 100ms); }

/* Carousel: fade between slides */
.testimonial { animation: fadeIn 500ms ease-in-out; }
```

---

### 2. Dashboard (Main App)
**Purpose:** Central hub for all user activities

Left Sidebar (fixed on desktop, drawer on mobile):
```
- Logo + App name (sticky top)
- Navigation items:
  * Dashboard (home icon)
  * Upload new resume
  * Saved resumes (with version count badge)
  * History
  * Settings
  * Pricing
- User profile (sticky bottom)
  * Avatar
  * Email
  * Pro badge (if paid)
  * Logout
```

Main Content (responsive grid):
```
Top section: Statistics cards (stagger entrance)
  - Resumes uploaded
  - Analyses run
  - Avg score
  - Days since last analysis

Middle section: Recent activity
  - Card layout, newest first
  - Each card = one analysis
  - Shows resume name, score, JD company, date
  - Hover = quick preview, click = full results

Bottom: Pricing CTA (if free user)
  "Unlock semantic matching with Pro"
  [Upgrade now]
```

**Animations:**
```css
/* Cards enter in cascade */
.stat-card { animation: slideInUp 300ms ease-out (100ms + n*100ms); }

/* Recent activity list items */
.activity-item { animation: slideInUp 300ms ease-out (200ms + n*80ms); }

/* Hover effects */
.card:hover {
  box-shadow: transition 300ms ease-in-out;
  transform: translateY(-2px) transition 200ms ease-out;
}
```

---

### 3. Upload Resume Page
**Purpose:** Get resume into the system

Layout:
```
Header:
  "Upload your resume"
  "Supported formats: PDF, DOCX (max 5MB)"

Upload area:
  - Drag-and-drop zone (large, inviting)
  - "Click to select file" fallback
  - File preview (show filename + size)
  - Progress bar during upload
  - Success message with "Analyze" CTA

Alternative: Paste text
  - Tab to switch modes
  - Text area for resume content
```

**Animations:**
```css
/* Drag-over state */
.upload-zone.dragging {
  border-color: #0084ff;
  background: rgba(0, 132, 255, 0.05);
  animation: pulse 500ms ease-in-out infinite;
}

/* Upload progress */
.progress-bar { animation: slideInUp 300ms ease-out; }

/* Success check */
.success-icon { animation: scaleIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1); }
```

---

### 4. Analysis Result Page (THE HERO)
**Purpose:** Show comprehensive analysis results

Layout: Single column, scrollable, progressive reveal

Section 1: Overall Score Card (reveals first)
```
┌─────────────────────────────┐
│ ✓ Excellent                 │
│                             │
│         78                  │
│        /100                 │
│                             │
│ Your resume semantically    │
│ matches 85% of job reqs...  │
│                             │
│         [Progress circle]   │
└─────────────────────────────┘
```

**Animations:**
```css
/* Card background fade-in */
.score-card {
  animation: fadeIn 300ms ease-in 0ms;
}

/* Icon slide-in from left */
.score-card .icon {
  animation: slideInLeft 400ms ease-out 100ms;
}

/* Score number counts up */
.score-number {
  animation: countUp 800ms ease-out 400ms;
}

/* Score circle animates as stroke */
circle {
  animation: strokeDraw 800ms ease-out 200ms;
}
```

Section 2: Category Breakdown (cascading reveal)
```
Score breakdown

┌─────────────┐  ┌─────────────┐
│ Semantic    │  │ Keywords    │
│ Fit         │  │ Matched     │
│             │  │             │
│ 85%  [█████]│  │ 72%  [█████]│
└─────────────┘  └─────────────┘

(4 cards total, each staggered by 100ms)
```

**Animations:**
```css
.category-card {
  animation: slideInUp 300ms ease-out (150ms + n*100ms);
}

.category-card:hover {
  border-left: 4px solid (category-color);
  box-shadow: transition 200ms ease-in-out;
}
```

Section 3: Actionable Insights (tabs)
```
[Issues] [Gaps] [Strengths]

Issues tab (if ATS problems):
  ⚠️ Resume uses columns → ATS may fail
  ⚠️ No email detected in body

(Each item animates in with slideInUp, staggered)
```

Section 4: Semantic Heatmap
```
Job requirement → Resume bullet matching

Requirement 1    [██████░░] 78%
Requirement 2    [████░░░░] 65%
Requirement 3    [████░░░░] 58% (unmatched)

(Color codes: green = matched, yellow = partial, gray = no match)
(Hover = full text in tooltip)
```

**Animations:**
```css
.heatmap-row {
  animation: slideInUp 300ms ease-out (100ms + n*50ms);
}

.match-score {
  animation: scaleX 500ms ease-out (100ms + n*50ms);
  transform-origin: left;
}
```

Section 5: Bullet Analysis
```
Bullet point quality

Experience
  3 bullets total, 68% avg quality

⚠️ "Responsible for managing database systems"
   ✗ No action verb  ✗ No metrics
   → Suggestion: "Led optimization of PostgreSQL infrastructure,
     reducing query latency by 40%"
   [Get AI rewrite]

(Each bullet expands on click, shows suggestion)
```

**Animations:**
```css
.bullet-item {
  animation: slideInUp 300ms ease-out (100ms + n*40ms);
}

.bullet-item.expanded {
  max-height: 500px;
  animation: expandDown 300ms ease-in-out;
}

.suggestion {
  animation: fadeIn 300ms ease-out;
}
```

Section 6: Career Timeline
```
Career trajectory

2019 └─ Software Engineer ─┐
          (Google)         │
                          └─ Gap: 6 months
2020 ┌─ Senior Engineer ──┐
     │ (Startup)          │
2023 └─────────────────────┘ ← Current

(Timeline bar at top shows entire career span)
(Gaps highlighted in red/amber)
```

**Animations:**
```css
.timeline-bar {
  animation: slideInUp 300ms ease-out 100ms;
}

.timeline-bar > div {
  animation: slideInRight 500ms ease-out (100ms + n*100ms);
}

.timeline-entry {
  animation: slideInUp 300ms ease-out (100ms + n*100ms);
}

.gap-indicator {
  animation: slideInUp 300ms ease-out;
  border-left: 2px dashed #f59e0b;
}
```

---

### 5. Multi-JD Comparison Page
**Purpose:** Compare resume against multiple jobs

Layout:
```
Header:
  "Compare against multiple jobs"
  "Upload or paste 2-5 job descriptions"

Input section:
  [JD 1] [JD 2] [JD 3] [Add more]
  [Compare] button

Results (card grid):
  ┌──────────────┐  ┌──────────────┐
  │ Google SWE   │  │ Meta ML Eng  │
  │ 89% fit      │  │ 65% fit      │
  │              │  │              │
  │ Strengths:   │  │ Missing:     │
  │ • Kubernetes │  │ • PyTorch    │
  │ • Docker     │  │ • TensorFlow │
  └──────────────┘  └──────────────┘

Recommendation:
  "Go with Google — 89% match vs 65%"
```

**Animations:**
```css
.jd-input {
  animation: slideInDown 300ms ease-out (100ms + n*100ms);
}

.comparison-card {
  animation: scaleIn 400ms ease-out (500ms + n*150ms);
}

.recommendation {
  animation: slideInUp 300ms ease-out 800ms;
  background: linear-gradient to right from transparent to rgba(34, 197, 94, 0.05);
}
```

---

## Animation Specifications

### Timing Functions (Use These, Don't Invent)
```css
/* Fast: micro-interactions */
150ms cubic-bezier(0.4, 0, 0.2, 1) = ease-in-out

/* Standard: state changes */
300ms cubic-bezier(0.4, 0, 0.2, 1)

/* Reveal: data entrance */
500ms cubic-bezier(0.16, 1, 0.3, 1) = ease-out

/* Relax: complex animations */
800ms cubic-bezier(0.34, 1.56, 0.64, 1) = ease-out-elastic
```

### Reusable Animations
```css
fadeIn:     opacity 0 → 1 (300ms)
slideInUp:  translateY(16px) → 0, opacity 0 → 1 (300ms)
slideInLeft: translateX(-24px) → 0, opacity 0 → 1 (300ms)
scaleIn:    scale(0.95) → 1, opacity 0 → 1 (300ms)
pulse:      opacity 1 ⇄ 0.5 (2s, infinite)
shimmer:    background-position shift (2s, infinite)
countUp:    number animation 0 → target (800ms)
expandDown: max-height 0 → 500px (300ms)
```

### Stagger Pattern (Used Everywhere)
```javascript
// For lists of items, each enters in sequence
// Base delay + (index * item_delay)

Example:
  Item 0: 150ms + (0 * 100ms) = 150ms
  Item 1: 150ms + (1 * 100ms) = 250ms
  Item 2: 150ms + (2 * 100ms) = 350ms
  Item 3: 150ms + (3 * 100ms) = 450ms

// Feels like a wave, not all at once
```

### Loading States
```css
Skeleton loading:
  background: linear-gradient to right from #f1f5f9 to #e2e8f0 to #f1f5f9
  background-size: 200% 100%
  animation: shimmer 2s cubic-bezier(0.4, 0, 0.6, 1) infinite

Spinner:
  transform: rotate(360deg)
  animation: spin 1s linear infinite

Pulsing badge:
  opacity: 1 → 0.5 → 1
  animation: pulse 2s ease-in-out infinite
```

---

## Component-Specific Animation Rules

### Cards
```
- Default: shadow 0 1px 2px, border slate-200
- Hover: shadow 0 10px 15px, translate -2px, border (primary color)
- Clicked: scale 0.98, duration 200ms
- Animation in: slideInUp 300ms ease-out
```

### Buttons
```
- Default: opacity 1, scale 1
- Hover: opacity 0.9, shadow increases
- Clicked: scale 0.95, duration 200ms
- Loading: icon spins infinitely
- Success: icon animates in with bounce
```

### Forms
```
- Input focus: border color → primary, shadow → subtle glow
- Error state: shake animation (translateX ±4px)
- Validation: checkmark animates in with scaleIn + bounce
- Form submit: button shows spinner, fields disabled
```

### Modals
```
- Open: background fadeIn, content slideInDown (300ms ease-out)
- Close: reverse animations (300ms ease-in)
- Never use position: fixed (causes scroll issues)
- Use display: grid + align-items: center for centering
```

### Tooltips
```
- Show: fadeIn 150ms, scale(0.95) → 1
- Hide: fadeOut 150ms
- Never use pointer-events: none during animation
```

---

## Mobile-Specific Considerations

### Touch Interactions
```
- Buttons: min 44px × 44px (accessibility)
- Tap feedback: opacity 0.7 (no scale on mobile, can cause jank)
- Swipe: detect via touch events, animate slide in direction
- Drawer: slideInRight on open, slideOutRight on close
```

### Performance
```
- Avoid blur() and shadow during animations (GPU cost)
- Use transform and opacity only (GPU-accelerated)
- Keep animations under 500ms on mobile (battery)
- Disable animations if prefers-reduced-motion
```

### Responsive Animations
```
@media (max-width: 640px) {
  /* Faster animations on mobile (150ms faster) */
  animation-duration: 300ms; /* was 400ms */
  
  /* Simpler stagger (50ms, not 100ms) */
  animation-delay: 50ms + (n * 50ms);
  
  /* Smaller translations */
  transform: translateY(12px); /* was 16px */
}
```

---

## Accessibility

### Animations
```css
/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast
```
All text must meet WCAG AA standards (4.5:1 ratio for body text)
Never rely on color alone to convey meaning
Use icons + color together (✓ green checkmark, not just green)
```

### Keyboard Navigation
```
Tab order: left-to-right, top-to-bottom
Focus ring: always visible, at least 2px, high contrast
Modals: trap focus inside
Dropdowns: use arrow keys to navigate
```

---

## Design Tokens (Tailwind Config)

```typescript
// tailwind.config.ts excerpt
theme: {
  extend: {
    colors: {
      primary: { 50: '#f0f7ff', 500: '#0084ff', 900: '#001a33' },
      success: { 50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a' },
      warning: { 50: '#fffbeb', 500: '#eab308', 600: '#ca8a04' },
      error: { 50: '#fef2f2', 500: '#ef4444', 600: '#dc2626' },
    },
    spacing: {
      xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px',
    },
    borderRadius: {
      sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px',
    },
    animation: {
      fadeIn: 'fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      slideInUp: 'slideInUp 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      // ... rest of animations
    },
  },
}
```

---

## Summary: Why This Design Works

1. **Progressive Disclosure** — Users aren't overwhelmed; they learn as they scroll
2. **Visual Hierarchy** — Color + size + position guide attention
3. **Purposeful Motion** — Every animation teaches something or guides attention
4. **Semantic Feedback** — Colors mean things; users learn the language quickly
5. **Mobile-Ready** — Tested on all screen sizes, reduced motion supported
6. **Accessible** — WCAG AA compliant, keyboard navigation throughout
7. **Fast** — Animations are snappy (150-500ms), not sluggish or overdone
8. **Performant** — GPU-accelerated (transform/opacity only), no jank on mobile

**Result:** A premium, professional tool that feels fast, responsive, and thoughtful.

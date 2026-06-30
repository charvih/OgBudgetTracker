# BudgetTracker — CLAUDE.md

## What This Is
RMIT practice project: **Use Case 3 — Smart Expense Tracker**. A full-stack Next.js web app for manual expense tracking, monthly summaries, budget management, and Claude-powered financial insights.

Full implementation plan: `C:\Users\charv\.claude\plans\okay-so-im-trying-reactive-snowglobe.md`

---

## Tech Stack
| Layer | Tool |
|---|---|
| Framework | Next.js 15, App Router, TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Prisma ORM + SQLite (`prisma/schema.prisma`) |
| AI | Anthropic Claude API — `claude-haiku-4-5-20251001` |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Auth | NextAuth.js v5 (credentials provider, bcrypt) |

---

## Key Commands
```bash
npm run dev          # start dev server (localhost:3000)
npx prisma migrate dev --name <name>   # run after schema changes
npx prisma studio    # browse DB visually
npx prisma generate  # regenerate client after schema edit
```

---

## Project Structure (once scaffolded)
```
src/
  app/
    (auth)/login, register
    (main)/dashboard, expenses, insights, budgets, reports
    api/auth, expenses, budgets, insights
  components/
    layout/   — Sidebar, Header
    expenses/ — ExpenseForm, ExpenseList
    dashboard/— SpendingOverview, CategoryPieChart, BudgetProgressBar, RecentExpenses
    insights/ — InsightsPanel, TipCard
  lib/
    db.ts          — Prisma singleton
    ai.ts          — Anthropic client + generateInsights()
    auth.ts        — NextAuth config
    validations.ts — Zod schemas
    utils.ts       — CATEGORIES list, formatters, date helpers
  middleware.ts     — redirect unauthenticated users to /login
prisma/schema.prisma
.env.local         — DATABASE_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY
```

---

## Data Models (summary)
- **User**: id, email (unique), password (bcrypt), name
- **Expense**: amount, category, date, description, userId
- **Budget**: category, limit, month ("2026-06"), userId — unique per (userId, category, month)
- **Insight**: userId (unique), content (Json), generatedAt — one cached AI result per user

---

## AI Insights — Critical Rules
1. **Use Claude tool use**, not "return JSON only" — tool name: `financial_analysis`, forced via `tool_choice`. Result is in `response.content[0].input` (already typed, no JSON.parse needed).
2. **Rate limit**: POST `/api/insights` checks `Insight.generatedAt`. If < 6 hours old, return cached DB record — do NOT call Claude.
3. **Never auto-trigger** on page load. UI has an explicit "Generate Insights" / "Refresh Insights" button with a "Last updated X hours ago" indicator.
4. Insight shape: `{ tips: string[], overspend: string[], forgotten_subscriptions: string[], fraud_flags: string[] }`

---

## Expense Categories (BA-defined, fixed list)
```ts
export const CATEGORIES = [
  "Food & Dining", "Transport", "Shopping", "Entertainment",
  "Bills & Utilities", "Health & Medical", "Travel", "Education", "Other"
]
```
Define once in `src/lib/utils.ts` and import everywhere — never hardcode inline.

---

## Security Rules (non-negotiable)
- Every API route checks `getServerSession()` → 401 if unauthenticated
- Every DB query filters by `userId` from session — never trust client-supplied userId
- Zod validates all inputs at the API boundary
- Passwords hashed with bcrypt (12 rounds)
- No secrets in source — all in `.env.local`, documented in `.env.example`

---

## Design System
- **Primary**: rose-500 | **Accent**: violet-500 | **Success**: emerald-500 | **Background**: stone-50
- Cards: `rounded-2xl shadow-sm bg-white`
- Category emoji map lives in `src/lib/utils.ts` alongside `CATEGORIES`

---

## Build Order
1. Bootstrap (create-next-app + deps + shadcn + prisma init)
2. Schema + migrate
3. Auth (NextAuth + login/register pages)
4. Expense CRUD (API routes + form + list)
5. Dashboard (charts + overview)
6. Budget management
7. AI Insights (tool use + rate limit + UI button)
8. Reports page
9. Polish (skeletons, empty states, toasts, mobile nav)

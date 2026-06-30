# Smart Expense Tracker — Approved Implementation Plan

> **Status:** Approved  
> **Project:** Use Case — Smart Expense Tracker  
> **Date approved:** 2026-06-30

---

## Requirements (from use case docs)

| What                 | Detail                                                                              |
| -------------------- | ----------------------------------------------------------------------------------- |
| Business problem     | Users need simple budget tracking                                                   |
| Solution             | Expense form + monthly summary + AI savings tips                                    |
| Manual expense entry | Amount, category, date, description                                                 |
| Monthly summary      | Category-grouped totals, charts, variance from budget                               |
| AI insights          | Savings tips, overspend alerts, fraud flags, forgotten subscriptions                |
| Security             | Data validation, access controls, no sensitive data exposure, authorised users only |

**Process flow (from diagram):**  
Input (manual form / bank API) → Triage → LOG → AI Agents (Monthly, Overspend, Tips, Docs, Budgets, Fraud, Forgotten Subscriptions) → User

---

## Tech Stack

| Layer     | Tool                                   | Why                                           |
| --------- | -------------------------------------- | --------------------------------------------- |
| Framework | Next.js 15 (App Router)                | Full-stack, API routes built-in               |
| Language  | TypeScript                             | Type safety end-to-end                        |
| Styling   | Tailwind CSS v4 + shadcn/ui            | Cute, accessible, fast                        |
| Database  | Prisma ORM + SQLite                    | Zero config, local, type-safe                 |
| AI        | Claude API `claude-haiku-4-5-20251001` | Insights, tips, fraud, subscription detection |
| Charts    | Recharts                               | React-native charting                         |
| Forms     | React Hook Form + Zod                  | Validation + typed schemas                    |
| Auth      | NextAuth.js v5 (credentials)           | Login/register, session cookies               |
| Dates     | date-fns                               | Month filtering, relative time                |

---

## Data Models

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String    // bcrypt, 12 rounds
  name      String
  expenses  Expense[]
  budgets   Budget[]
  insight   Insight?  // one cached AI result per user
  createdAt DateTime  @default(now())
}

model Expense {
  id          String   @id @default(cuid())
  amount      Float
  category    String
  date        DateTime
  description String   @default("")
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Budget {
  id       String @id @default(cuid())
  category String
  limit    Float
  month    String // "2026-06"
  userId   String
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, category, month])
}

model Insight {
  id          String   @id @default(cuid())
  userId      String   @unique          // one cached result per user
  content     Json     // { tips, overspend, forgotten_subscriptions, fraud_flags }
  generatedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Expense categories (BA-defined, fixed):**  
Food & Dining · Transport · Shopping · Entertainment · Bills & Utilities · Health & Medical · Travel · Education · Other

---

## Project Structure

```
src/
  app/
    (auth)/
      login/page.tsx            ← login form
      register/page.tsx         ← register form
    (main)/
      layout.tsx                ← sidebar + header shell
      dashboard/page.tsx        ← overview, charts, quick-add
      expenses/page.tsx         ← full list + add / edit / delete
      insights/page.tsx         ← AI insights panel
      budgets/page.tsx          ← monthly budget limits per category
      reports/page.tsx          ← monthly summary table + CSV export
    api/
      auth/[...nextauth]/route.ts
      expenses/route.ts         ← GET (list, month filter), POST (create)
      expenses/[id]/route.ts    ← PUT (update), DELETE
      budgets/route.ts          ← GET, POST, PUT
      insights/route.ts         ← GET (cached), POST (generate / refresh)
  components/
    layout/
      Sidebar.tsx
      Header.tsx
    expenses/
      ExpenseForm.tsx
      ExpenseList.tsx
    dashboard/
      SpendingOverview.tsx
      CategoryPieChart.tsx
      BudgetProgressBar.tsx
      RecentExpenses.tsx
    insights/
      InsightsPanel.tsx
      TipCard.tsx
  lib/
    db.ts           ← Prisma client singleton
    ai.ts           ← Anthropic client + generateInsights()
    auth.ts         ← NextAuth config
    validations.ts  ← Zod schemas
    utils.ts        ← CATEGORIES, emoji map, formatters, date helpers
prisma/schema.prisma
.env.local          ← DATABASE_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY
.env.example        ← documented template (committed, no secrets)
```

---

## Design System

- **Primary:** `rose-500` · **Accent:** `violet-500` · **Success:** `emerald-500` · **BG:** `stone-50`
- Cards: `rounded-2xl shadow-sm bg-white`
- Font: Inter via `next/font`
- Icons: Lucide React (via shadcn)
- Category emoji: 🍔 Food · 🚗 Transport · 🛍️ Shopping · 🎭 Entertainment · 💡 Bills · 🏥 Health · ✈️ Travel · 📚 Education · 📦 Other

---

## Build Phases

### Phase 1 — Bootstrap

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
npm install prisma @prisma/client next-auth@beta bcryptjs @anthropic-ai/sdk \
  recharts react-hook-form @hookform/resolvers zod date-fns lucide-react
npx shadcn@latest init
npx shadcn@latest add button card input label select badge progress dialog table toast skeleton
npx prisma init --datasource-provider sqlite
```

### Phase 2 — Auth

- Write `prisma/schema.prisma` (all 4 models), run `npx prisma migrate dev --name init`
- `lib/auth.ts`: NextAuth credentials provider, bcrypt compare
- Login + register pages with React Hook Form + Zod
- `src/middleware.ts`: redirect unauthenticated users to `/login`

### Phase 3 — Expense CRUD

- Zod schema: `amount > 0`, `category` enum, `date` valid, `description` max 200 chars
- API routes: GET with `?month=YYYY-MM` filter, POST, PUT, DELETE — all check session + `userId`
- `ExpenseForm.tsx`: all 4 fields, controlled date input, category dropdown
- `ExpenseList.tsx`: table, month/category filter dropdowns, edit dialog, delete confirmation

### Phase 4 — Dashboard

- Server component fetches current month's expenses + budgets
- `SpendingOverview.tsx`: total spent / total budgeted / % used stat cards
- `CategoryPieChart.tsx`: Recharts PieChart with category breakdown
- `BudgetProgressBar.tsx`: per-category progress bar (green / amber / red thresholds)
- `RecentExpenses.tsx`: last 5 expenses with amount + category + date
- Quick-add button → shadcn Dialog wrapping `ExpenseForm`

### Phase 5 — Budget Management

- API: upsert budget by `(userId, category, month)` unique key
- Page: grid of category cards, each has a limit input field
- Save on blur, optimistic update, toast on success
- Color coding: green < 75% · amber 75–100% · red > 100%

### Phase 6 — AI Insights ⚠️ Critical Architecture

**Rule 1 — Store in DB, not browser cache**  
`generateInsights()` in `lib/ai.ts` calls Claude then upserts the result into the `Insight` table. Page reads from DB directly — Claude is never called on a plain page load.

**Rule 2 — Use Claude tool use, not "return JSON only"**

```typescript
// lib/ai.ts
const tools = [
  {
    name: "financial_analysis",
    description: "Structured financial insights for the user",
    input_schema: {
      type: "object",
      properties: {
        tips: { type: "array", items: { type: "string" } },
        overspend: { type: "array", items: { type: "string" } },
        forgotten_subscriptions: { type: "array", items: { type: "string" } },
        fraud_flags: { type: "array", items: { type: "string" } },
      },
      required: ["tips", "overspend", "forgotten_subscriptions", "fraud_flags"],
    },
  },
];

const response = await anthropic.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 1024,
  tools,
  tool_choice: { type: "tool", name: "financial_analysis" },
  messages: [{ role: "user", content: buildPrompt(expenses, budgets) }],
});
// response.content[0].input is always a valid typed object — no JSON.parse needed
```

**Rule 3 — 6-hour rate limit in POST `/api/insights`**

```typescript
const existing = await db.insight.findUnique({ where: { userId } });
const SIX_HOURS = 6 * 60 * 60 * 1000;
if (existing && Date.now() - existing.generatedAt.getTime() < SIX_HOURS) {
  return Response.json({
    ...existing.content,
    generatedAt: existing.generatedAt,
    cached: true,
  });
}
// Only reaches Claude if stale or no record exists
```

**Rule 4 — Manual trigger UI**

- No auto-fetch on page load
- "Generate Insights" / "Refresh Insights" button triggers POST
- Shows "Last updated X hours ago" via `date-fns formatDistanceToNow`
- Button disabled + "Up to date" label when cache is fresh
- Empty state with CTA on first visit

### Phase 7 — Reports

- Month picker (controlled select, defaults to current month)
- Summary table: Category | Spent | Budget | Variance (+ / -)
- Recharts BarChart: last 6 months total spend side-by-side
- "Export CSV" button: client-side generation, `<a download>` trigger

### Phase 8 — Polish + Security

- shadcn `Skeleton` on all server-fetched sections
- Empty states: emoji + friendly message + CTA for every empty list/chart
- Toasts for every mutation (add, edit, delete, budget save, insights generated)
- Mobile: sidebar collapses to bottom tab bar on `< md` screens
- All form errors shown inline via React Hook Form `formState.errors`

---

## Security Checklist

| Requirement               | Implementation                                                                    |
| ------------------------- | --------------------------------------------------------------------------------- |
| Data validation           | Zod on every API route input                                                      |
| Access controls           | `getServerSession()` checked on every route — 401 if missing                      |
| Financial data protected  | All DB queries filter by `userId` from session, never from request body           |
| No sensitive data exposed | API responses include only the requesting user's records                          |
| Authorised users only     | `src/middleware.ts` redirects unauthenticated requests to `/login`                |
| Passwords hashed          | bcrypt, 12 salt rounds                                                            |
| No secrets in source      | All credentials in `.env.local`, `.env.example` committed with placeholder values |

---

## Verification Checklist

- [ ] Register new user → lands on dashboard
- [ ] Add expenses across multiple categories and months
- [ ] Dashboard totals and charts reflect data correctly
- [ ] Set budgets → progress bars update, colour thresholds apply
- [ ] Visit Insights with no data → empty state shown
- [ ] Click Generate → Claude runs, result saved to DB, "Updated just now" shown
- [ ] Refresh page → cached result shown instantly, no Claude call
- [ ] Click Refresh within 6 hrs → returns cached, button shows "Up to date"
- [ ] Reports month picker filters correctly, bar chart shows 6-month history
- [ ] Export CSV downloads correct data
- [ ] Edit/delete expense → all views recalculate
- [ ] Visit `/dashboard` without session → redirected to `/login`
- [ ] `DELETE /api/expenses/[another-users-id]` → returns 403

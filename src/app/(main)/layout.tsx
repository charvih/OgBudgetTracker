// This layout wraps all the main app pages (dashboard, expenses, budgets, insights, reports).
// It places the sidebar navigation on the left, the header at the top, and the page content
// in the middle, plus a mobile bottom navigation bar for smaller screens.

import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { MobileNav } from "@/components/layout/MobileNav"

// Renders the three-part shell — sidebar, header, main content — that every app page lives inside.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* The sidebar navigation panel shown on desktop screens. */}
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* The top header bar showing the user's name and account menu. */}
        <Header />
        {/* The main content area where each page renders its own content. */}
        <main className="flex-1 p-6 overflow-auto pb-20 md:pb-6">
          {children}
        </main>
      </div>
      {/* The bottom navigation bar shown on mobile screens instead of the sidebar. */}
      <MobileNav />
    </div>
  )
}

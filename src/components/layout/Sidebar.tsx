// This component renders the navigation sidebar shown on desktop screens.
// It lists all the main pages of the app as clickable links, and highlights
// the currently active page so the user knows where they are.

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, PiggyBank, Sparkles, BarChart3, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

// The list of navigation items with their page URL, display name, and icon.
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/reports", label: "Reports", icon: BarChart3 },
]

// Renders the left-side navigation panel with the app logo and page links.
export function Sidebar() {
  // Gets the current page URL so the active link can be highlighted.
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-stone-200 shrink-0">
      {/* The app logo and name at the top of the sidebar. */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-stone-100">
        <div className="bg-rose-500 text-white p-2 rounded-xl">
          <Wallet className="h-5 w-5" />
        </div>
        <span className="font-bold text-stone-800 text-lg">Budget Tracker</span>
      </div>

      {/* Loops through the nav items and renders each one as a styled link. */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              // Applies a highlighted rose colour to the link for the current page.
              pathname === href
                ? "bg-rose-50 text-rose-600"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

    </aside>
  )
}

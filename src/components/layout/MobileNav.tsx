// This component renders a bottom navigation bar for mobile devices.
// It shows icons and labels for all main pages and highlights the currently active one,
// replacing the sidebar that is hidden on small screens.

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, PiggyBank, Sparkles, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

// The list of navigation items with their page URL, display label, and icon.
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/reports", label: "Reports", icon: BarChart3 },
]

// Renders the fixed bottom navigation bar with links to all main pages.
export function MobileNav() {
  // Gets the current page URL so the active link can be highlighted in rose.
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 flex md:hidden border-t border-stone-200 bg-white safe-bottom">
      {/* Loops through the nav items and renders each as a stacked icon-and-label link. */}
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
            // Highlights the active page link in rose colour.
            pathname === href
              ? "text-rose-500"
              : "text-stone-500 hover:text-stone-800"
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  )
}

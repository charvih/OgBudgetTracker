// This is the root layout that wraps every single page in the app.
// It sets up the font, background colour, login session provider, and the toast notification
// system so all pages have access to these features without repeating them.

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/sonner"

// Loads the Inter font and applies it only to Latin characters for performance.
const inter = Inter({ subsets: ["latin"] })

// Sets the browser tab title and description for the whole app.
export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "Smart expense tracking, powered by AI",
}

// Wraps every page with the session provider and toast notifications.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full bg-stone-50">
        {/* SessionProvider makes the user's login state available to all child components. */}
        <SessionProvider>
          {children}
        </SessionProvider>
        {/* Toaster shows success and error pop-up messages in the top-right corner. */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}

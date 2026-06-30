import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "Smart expense tracking, powered by AI",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full bg-stone-50">
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}

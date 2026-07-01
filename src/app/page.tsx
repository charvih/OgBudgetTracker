// This is the home page of the app, which immediately sends visitors to the dashboard.
// There is nothing to show here — the real content starts on the dashboard page.

import { redirect } from "next/navigation"

// Redirects anyone visiting the root URL straight to the dashboard page.
export default function Home() {
  redirect("/dashboard")
}

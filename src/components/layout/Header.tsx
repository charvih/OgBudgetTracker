// This component renders the top navigation bar shown on every main app page.
// It reads the logged-in user's name and email from the server session and passes
// them to the UserMenu so the dropdown can display the right account details.

import { getSession } from "@/lib/session"
import { UserMenu } from "./UserMenu"

// Fetches the current user's session and renders the header bar with their account menu.
export async function Header() {
  const session = await getSession()
  const name = session?.user?.name ?? ""
  const email = session?.user?.email ?? ""

  return (
    <header className="h-14 border-b border-stone-200 bg-white flex items-center justify-end px-6 shrink-0">
      {/* The user avatar and dropdown menu shown in the top-right corner. */}
      <UserMenu name={name} email={email} />
    </header>
  )
}

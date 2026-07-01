// This component renders the user avatar button in the header and a dropdown menu below it.
// Clicking the avatar shows the user's name, email, and a sign-out button.
// The dropdown closes automatically when the user clicks anywhere outside of it.

"use client"

import { useEffect, useRef, useState } from "react"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

interface UserMenuProps {
  name: string
  email: string
}

// Renders the circular avatar button and the dropdown account menu.
export function UserMenu({ name, email }: UserMenuProps) {
  // Tracks whether the dropdown is currently open or closed.
  const [open, setOpen] = useState(false)
  // A reference to the container div used to detect clicks outside the menu.
  const ref = useRef<HTMLDivElement>(null)

  // Adds a global click listener so the dropdown closes when the user clicks outside it.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      {/* The circular avatar button showing the first letter of the user's name. */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm select-none hover:bg-rose-200 transition-colors cursor-pointer"
        aria-label="User menu"
      >
        {name.charAt(0).toUpperCase()}
      </button>

      {/* The dropdown panel shown when the avatar is clicked. */}
      {open && (
        <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-lg ring-1 ring-stone-200 z-50 overflow-hidden">
          {/* Displays the user's name and email at the top of the dropdown. */}
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-sm font-medium text-stone-800 truncate">{name}</p>
            <p className="text-xs text-stone-500 truncate">{email}</p>
          </div>
          <div className="p-1">
            {/* The sign-out button that ends the user's session and goes to the login page. */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-stone-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

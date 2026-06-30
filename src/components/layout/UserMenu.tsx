"use client"

import { useEffect, useRef, useState } from "react"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

interface UserMenuProps {
  name: string
  email: string
}

export function UserMenu({ name, email }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm select-none hover:bg-rose-200 transition-colors cursor-pointer"
        aria-label="User menu"
      >
        {name.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-lg ring-1 ring-stone-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-sm font-medium text-stone-800 truncate">{name}</p>
            <p className="text-xs text-stone-500 truncate">{email}</p>
          </div>
          <div className="p-1">
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

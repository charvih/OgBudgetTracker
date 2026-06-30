"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-stone-400 hover:text-rose-600 hover:bg-rose-50 md:hidden"
      title="Sign out"
    >
      <LogOut className="h-4 w-4" />
    </Button>
  )
}

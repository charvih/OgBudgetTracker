import { auth } from "@/auth"
import { LogoutButton } from "./LogoutButton"

export async function Header() {
  const session = await auth()

  return (
    <header className="h-14 border-b border-stone-200 bg-white flex items-center justify-end px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-stone-800">{session?.user?.name}</p>
          <p className="text-xs text-stone-500">{session?.user?.email}</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm select-none">
          {session?.user?.name?.charAt(0).toUpperCase()}
        </div>
        <LogoutButton />
      </div>
    </header>
  )
}

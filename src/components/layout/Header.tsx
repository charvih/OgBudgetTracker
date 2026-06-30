import { auth } from "@/auth"
import { UserMenu } from "./UserMenu"

export async function Header() {
  const session = await auth()
  const name = session?.user?.name ?? ""
  const email = session?.user?.email ?? ""

  return (
    <header className="h-14 border-b border-stone-200 bg-white flex items-center justify-end px-6 shrink-0">
      <UserMenu name={name} email={email} />
    </header>
  )
}

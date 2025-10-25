"use client"

import { usePathname } from "next/navigation"

import { Logo } from "@/components/logo"
import { RoleSwitcher } from "@/components/role-switcher"
import { UserMenu } from "@/components/user-menu"

interface NavbarProps {
  userEmail?: string | null
}

export function Navbar({ userEmail }: NavbarProps) {
  const pathname = usePathname()
  const isLanding = pathname === "/landing" || pathname === "/"

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      role="banner"
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Logo />
        <div className="flex items-center gap-4">
          {!userEmail && (
            <span className="hidden text-sm text-muted-foreground sm:inline-block">
              {isLanding ? "Choose a view to explore the demo" : "Switch view"}
            </span>
          )}
          {!userEmail && <RoleSwitcher />}
          {userEmail && <UserMenu userEmail={userEmail} />}
        </div>
      </div>
    </header>
  )
}

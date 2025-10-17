"use client"

import { useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/inMemoryStore"

const ROLE_HOME: Record<"student" | "counselor", string> = {
  student: "/student/timeline",
  counselor: "/counselor/dashboard",
}

export function RoleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const role = useAppStore((state) => state.role)
  const setRole = useAppStore((state) => state.setRole)

  const handleChange = (nextRole: "student" | "counselor") => {
    if (role === nextRole && pathname?.startsWith(ROLE_HOME[nextRole])) {
      return
    }

    setRole(nextRole)
    startTransition(() => {
      router.push(ROLE_HOME[nextRole])
    })
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 p-1 shadow-sm">
      {(["student", "counselor"] as const).map((option) => {
        const isActive = role === option
        return (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={isActive ? "default" : "ghost"}
            disabled={isPending}
            className={cn(
              "rounded-full px-4 text-sm capitalize transition-all",
              !isActive && "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => handleChange(option)}
          >
            {option}
          </Button>
        )
      })}
    </div>
  )
}

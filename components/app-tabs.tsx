"use client"

import { useEffect, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppStore } from "@/lib/inMemoryStore"

type TabItem = {
  value: string
  label: string
  href: string
  pattern?: RegExp
}

export function AppTabs() {
  const role = useAppStore((state) => state.role)
  const setRole = useAppStore((state) => state.setRole)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    if (pathname.startsWith("/counselor") && role !== "counselor") {
      setRole("counselor")
    } else if (pathname.startsWith("/student") && role !== "student") {
      setRole("student")
    }
  }, [pathname, role, setRole])

  const tabs = useMemo<TabItem[]>(() => {
    if (role === "counselor") {
      return [
        {
          value: "dashboard",
          label: "Dashboard",
          href: "/counselor/dashboard",
          pattern: /^\/counselor\/(dashboard|students)/,
        },
      ]
    }

    return [
      {
        value: "timeline",
        label: "Timeline",
        href: "/student/timeline",
        pattern: /^\/student\/timeline/,
      },
      {
        value: "profile",
        label: "Profile",
        href: "/student/profile",
        pattern: /^\/student\/profile/,
      },
      {
        value: "calendar",
        label: "Calendar",
        href: "/student/calendar",
        pattern: /^\/student\/calendar/,
      },
      {
        value: "drafts",
        label: "Drafts",
        href: "/student/drafts",
        pattern: /^\/student\/drafts/,
      },
      {
        value: "explore",
        label: "Explore",
        href: "/student/explore",
        pattern: /^\/student\/explore/,
      },
      {
        value: "alerts",
        label: "Alerts",
        href: "/student/alerts",
        pattern: /^\/student\/alerts/,
      },
    ]
  }, [role])

  // Hide tabs on landing and public pages
  if (!pathname || pathname === "/" || pathname.startsWith("/landing")) {
    return null
  }

  if (!tabs.length) {
    return null
  }

  const current =
    tabs.find((tab) => (tab.pattern ? tab.pattern.test(pathname ?? "") : false))
      ?.value ?? tabs[0]?.value

  const handleSelect = (nextValue: string) => {
    const nextTab = tabs.find((tab) => tab.value === nextValue)
    if (!nextTab) return
    router.push(nextTab.href)
  }

  return (
    <div className="border-b border-border/70 bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl px-4">
        <Tabs value={current} className="w-full" onValueChange={handleSelect}>
          <TabsList className="h-12 w-full justify-start gap-2 rounded-2xl bg-muted/60 p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-xl px-4 text-sm font-medium"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}

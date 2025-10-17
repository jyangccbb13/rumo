"use client"

import Link from "next/link"

export function Logo() {
  return (
    <Link href="/landing" className="flex items-center gap-2 text-lg font-semibold">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold">
        r
      </span>
      <span className="tracking-tight text-foreground">rumo</span>
    </Link>
  )
}

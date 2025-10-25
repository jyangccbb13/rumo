import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

import { Providers } from "@/components/providers"
import { Navbar } from "@/components/navbar"
import { AppTabs } from "@/components/app-tabs"
import { getUser } from "@/app/actions/auth"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "rumo — your college journey in one place",
  description:
    "rumo brings timelines, drafts, school research, and counselor visibility into a single, polished workspace.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUser()

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar userEmail={user?.email} />
            <AppTabs />
            <main className="flex-1">
              <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}

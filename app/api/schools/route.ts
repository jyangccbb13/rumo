import { NextResponse } from "next/server"
import { nanoid } from "nanoid"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""

  // Mock placeholder data for demo
  // In Sprint 2, this will call Scorecard API → Wikipedia → scrape
  const mockSchools = [
    {
      id: nanoid(),
      name: "Harvard University",
      acceptanceRate: "3.4%",
      source: "placeholder",
    },
    {
      id: nanoid(),
      name: "Stanford University",
      acceptanceRate: "3.7%",
      source: "placeholder",
    },
    {
      id: nanoid(),
      name: "MIT",
      acceptanceRate: "4.0%",
      source: "placeholder",
    },
    {
      id: nanoid(),
      name: "UC Berkeley",
      acceptanceRate: "11.4%",
      source: "placeholder",
    },
    {
      id: nanoid(),
      name: "UCLA",
      acceptanceRate: "9.0%",
      source: "placeholder",
    },
  ]

  // Simple filter by query
  const results = query
    ? mockSchools.filter((school) =>
        school.name.toLowerCase().includes(query.toLowerCase())
      )
    : mockSchools

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  return NextResponse.json({ schools: results })
}

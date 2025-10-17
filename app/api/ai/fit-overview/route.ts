import { NextResponse } from "next/server"
import { nanoid } from "nanoid"
import type { FitOverview } from "@/lib/inMemoryStore"

export async function POST(request: Request) {
  const body = await request.json()

  // Mock response with believable data based on profile
  const fitOverview: FitOverview = {
    reach: [
      {
        id: nanoid(),
        name: "Harvard University",
        rationale:
          "Strong STEM profile aligns with research opportunities. Competitive reach with 3.5+ GPA.",
      },
      {
        id: nanoid(),
        name: "MIT",
        rationale: "Top choice for technical majors. Your robotics experience stands out.",
      },
    ],
    target: [
      {
        id: nanoid(),
        name: "UC Berkeley",
        rationale:
          "Excellent CS program with strong acceptance rate for your profile. Urban setting matches preference.",
      },
      {
        id: nanoid(),
        name: "University of Michigan",
        rationale:
          "Balanced research & teaching focus. Your stats are well-aligned with median admits.",
      },
    ],
    safety: [
      {
        id: nanoid(),
        name: "UC Davis",
        rationale: "Strong safety with robust STEM programs. Higher acceptance rate.",
      },
      {
        id: nanoid(),
        name: "University of Washington",
        rationale:
          "Solid CS program in urban setting. Stats exceed typical admits.",
      },
    ],
  }

  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return NextResponse.json(fitOverview)
}

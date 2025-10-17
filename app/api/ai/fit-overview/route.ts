import { NextResponse } from "next/server"
import { nanoid } from "nanoid"

import type { FitOverview, StudentProfile } from "@/lib/inMemoryStore"

export async function POST(request: Request) {
  const profile = (await request.json()) as Partial<StudentProfile> | undefined

  const intendedMajor = profile?.intendedMajor?.trim() || "your goals"
  const location = profile?.locationPreference ?? "your preferred campus setting"

  const fitOverview: FitOverview = {
    reach: [
      {
        id: nanoid(),
        name: "Harvard University",
        rationale: `Hyper-selective environment with deep research bench strength that matches ${intendedMajor}. Prepare for intensive essay work.`,
      },
      {
        id: nanoid(),
        name: "MIT",
        rationale: `Project-based engineering culture where your robotics experience would shine. Consider bolstering maker portfolio pieces.`,
      },
    ],
    target: [
      {
        id: nanoid(),
        name: "UC Berkeley",
        rationale: `Flagship public option with top-tier ${intendedMajor} programs and an ${location} vibe.`,
      },
      {
        id: nanoid(),
        name: "University of Michigan",
        rationale: "Balanced research and teaching with strong internship pipelines; stats align with median admits.",
      },
    ],
    safety: [
      {
        id: nanoid(),
        name: "UC Davis",
        rationale: "High match based on GPA rigor. Offers collaborative honors cohort and strong pre-professional advising.",
      },
      {
        id: nanoid(),
        name: "University of Washington",
        rationale: "Urban setting with robust CS and engineering options. Admission odds strengthen with early application.",
      },
    ],
  }

  await new Promise((resolve) => setTimeout(resolve, 800))

  return NextResponse.json(fitOverview)
}

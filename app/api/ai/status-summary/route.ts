import { NextResponse } from "next/server"

type TaskSnapshot = {
  completed: boolean
  category?: string
  title?: string
  dueDate?: string
}

type MilestoneSnapshot = {
  name?: string
  dueDate?: string
  status?: "upcoming" | "at-risk" | "completed"
}

export async function POST(request: Request) {
  const { tasks = [], milestones = [] } = (await request.json()) as {
    tasks?: TaskSnapshot[]
    milestones?: MilestoneSnapshot[]
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0

  const atRiskMilestone = milestones.find((milestone) => milestone.status === "at-risk")

  let summary: string
  if (atRiskMilestone) {
    summary = `At risk for ${atRiskMilestone.name ?? "upcoming milestone"} — suggest immediate follow-up.`
  } else if (completionRate >= 0.7) {
    summary = "On track for key applications. Essays and rec letters trending positive."
  } else if (completionRate >= 0.4) {
    summary = "Progress steady but essay pacing needs support. Check in this week."
  } else {
    summary = "Falling behind overall plan. Schedule working session to reset priorities."
  }

  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json({ summary })
}

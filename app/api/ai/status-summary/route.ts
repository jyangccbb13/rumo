import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { tasks = [], milestones = [] } = body

  // Mock logic based on task completion
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t: { completed: boolean }) => t.completed).length
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0

  let summary = ""
  if (completionRate >= 0.7) {
    summary = "On track for all schools. Great progress on essays and recommendations."
  } else if (completionRate >= 0.4) {
    summary = "Monitoring essay pace. Consider prioritizing Harvard supplements."
  } else {
    summary = "At risk for upcoming deadlines. Reach out to discuss timeline adjustments."
  }

  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json({ summary })
}

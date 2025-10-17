import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { essay_text } = body

  // Mock deterministic improvement
  const revisedParagraph = essay_text
    ? essay_text
        .replace(/I grew up/g, "Growing up")
        .replace(/I fell in love/g, "This ignited my passion for")
        .replace(/making people feel understood/g, "bridging cultural divides through language")
    : "Your revised text will appear here."

  const feedback = {
    strengths: [
      "Strong opening hook with cultural identity",
      "Personal narrative connects to broader impact",
      "Authentic voice and clear passion",
    ],
    issues: [
      "Conclusion could more explicitly tie to your intended major",
      "Consider adding a specific anecdote to illustrate translation work",
      "Check for passive voice in final paragraph",
    ],
    action_items: [
      "Tighten the transition between home and school contexts",
      "Add metrics or outcomes from your translation work",
      "Strengthen the 'why this matters' statement",
    ],
    revised_paragraph: revisedParagraph,
  }

  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return NextResponse.json(feedback)
}

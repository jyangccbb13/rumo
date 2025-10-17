import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = await request.json()
  const { essay_text } = body

  // Check if API key is configured
  const apiKey = process.env.GEMINI_API_KEY
  console.log("API Key loaded:", apiKey ? `${apiKey.substring(0, 10)}...` : "undefined")
  if (!apiKey || apiKey === "your_api_key_here") {
    return NextResponse.json(
      { error: "Gemini API key not configured. Please add your API key to .env.local" },
      { status: 500 }
    )
  }

  try {
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Create a detailed prompt for essay feedback
    const prompt = `You are an expert college essay advisor. Analyze the following college essay and provide detailed feedback in JSON format.

Essay:
"""
${essay_text}
"""

Please provide your response in the following JSON format:
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "issues": ["issue 1", "issue 2", "issue 3"],
  "action_items": ["action 1", "action 2", "action 3"],
  "revised_paragraph": "A revised version of the essay with improvements applied"
}

Focus on:
- Strengths: What works well in the essay (tone, storytelling, authenticity)
- Issues: What could be improved (structure, clarity, impact)
- Action items: Specific, actionable steps to strengthen the essay
- Revised paragraph: A polished version that implements your suggestions

Return ONLY the JSON object, no additional text.`

    // Call Gemini API
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    let feedback
    try {
      // Clean up the response text (remove markdown code blocks if present)
      const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      feedback = JSON.parse(cleanText)
    } catch (parseError) {
      console.error("Failed to parse AI response:", text, parseError)
      throw new Error("Failed to parse AI response as JSON")
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return NextResponse.json(
      { error: "Failed to get AI feedback. Please try again." },
      { status: 500 }
    )
  }
}

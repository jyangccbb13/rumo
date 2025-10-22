import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { StudentProfile, ProfileSummary } from "@/lib/inMemoryStore"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = await request.json()
  const profile = body as Partial<StudentProfile>

  // Check if API key is configured
  const apiKey = process.env.GEMINI_API_KEY
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

    // Create a detailed prompt for student profile analysis
    const prompt = `You are an expert college admissions counselor. Analyze this student profile and provide a comprehensive assessment in JSON format.

Student Profile:
- GPA: ${profile.gpa ?? "Not provided"}
- Test Score (SAT/ACT): ${profile.testScore ?? "Not provided"}
- Intended Major: ${profile.intendedMajor ?? "Undecided"}
- Languages: ${profile.languages?.join(", ") ?? "Not provided"}
- Extracurriculars: ${profile.extracurriculars?.join(", ") ?? "Not provided"}
- Dream Schools: ${profile.dreamSchools?.join(", ") ?? "Not provided"}
- Budget: ${profile.budget ? `$${profile.budget}` : "Not provided"}
- Location Preference: ${profile.locationPreference ?? "Not provided"}
- Research Preference: ${profile.researchPreference ?? "Not provided"}
- Campus Size: ${profile.campusSize ?? "Not provided"}

Please provide your response in the following JSON format:
{
  "summary": "A 2-3 sentence overview of the student's profile and college prospects",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasToImprove": ["area 1", "area 2", "area 3"],
  "schoolAssessments": [
    {
      "school": "School name from their dream schools list",
      "likelihood": "reach" | "target" | "safety",
      "assessment": "1-2 sentence realistic assessment of their chances and what they need to focus on"
    }
  ]
}

Focus on:
- Summary: Brief, honest assessment of their overall competitiveness
- Strengths: Academic achievements, extracurricular standouts, unique qualities
- Areas to Improve: Constructive feedback on what could strengthen their application
- School Assessments: For each of their dream schools, provide realistic likelihood and specific advice

Be honest but encouraging. Use data-driven insights based on typical admission statistics.
Return ONLY the JSON object, no additional text.`

    // Call Gemini API
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    let profileSummary: Omit<ProfileSummary, "generatedAt">
    try {
      // Clean up the response text (remove markdown code blocks if present)
      const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      profileSummary = JSON.parse(cleanText)
    } catch (parseError) {
      console.error("Failed to parse AI response:", text, parseError)
      throw new Error("Failed to parse AI response as JSON")
    }

    // Add timestamp
    const fullProfileSummary: ProfileSummary = {
      ...profileSummary,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(fullProfileSummary)
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return NextResponse.json(
      { error: "Failed to generate profile analysis. Please try again." },
      { status: 500 }
    )
  }
}

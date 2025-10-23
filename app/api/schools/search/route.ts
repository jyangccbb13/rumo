import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import schoolsData from "@/data/schools.json"

export const runtime = "nodejs"

type School = typeof schoolsData.schools[0]

// Tier 1: Search curated database
function searchCuratedDatabase(query: string, filters?: {
  country?: string
  maxTuition?: number
}): School[] {
  const lowercaseQuery = query.toLowerCase()

  let results = schoolsData.schools.filter((school) => {
    const matchesQuery =
      school.name.toLowerCase().includes(lowercaseQuery) ||
      school.shortName.toLowerCase().includes(lowercaseQuery) ||
      school.city.toLowerCase().includes(lowercaseQuery) ||
      school.programs.some((p) => p.toLowerCase().includes(lowercaseQuery))

    if (!matchesQuery) return false

    if (filters?.country && school.country !== filters.country) return false

    if (filters?.maxTuition) {
      const tuition = school.country === "USA" ? school.tuition : school.internationalTuition
      if (tuition > filters.maxTuition) return false
    }

    return true
  })

  // Sort by relevance (exact name match first, then by ranking)
  results = results.sort((a, b) => {
    const aExactMatch = a.name.toLowerCase() === lowercaseQuery || a.shortName.toLowerCase() === lowercaseQuery
    const bExactMatch = b.name.toLowerCase() === lowercaseQuery || b.shortName.toLowerCase() === lowercaseQuery

    if (aExactMatch && !bExactMatch) return -1
    if (!aExactMatch && bExactMatch) return 1

    return a.worldRanking - b.worldRanking
  })

  return results
}

// Tier 2: Search College Scorecard API (US schools only)
async function searchCollegeScorecardAPI(query: string): Promise<School | null> {
  try {
    const apiKey = process.env.COLLEGE_SCORECARD_API_KEY
    if (!apiKey) {
      console.log("College Scorecard API key not configured")
      return null
    }

    const response = await fetch(
      `https://api.data.gov/ed/collegescorecard/v1/schools?school.name=${encodeURIComponent(query)}&api_key=${apiKey}&per_page=1&fields=id,school.name,school.city,school.state,school.school_url,latest.admissions.admission_rate.overall,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.student.size,latest.completion.completion_rate_4yr_150nt,latest.academics.program_percentage`
    )

    if (!response.ok) return null

    const data = await response.json()
    if (!data.results || data.results.length === 0) return null

    const school = data.results[0]

    // Convert to our format
    return {
      id: school.id.toString(),
      name: school["school.name"],
      shortName: school["school.name"],
      country: "USA",
      city: school["school.city"],
      state: school["school.state"],
      acceptanceRate: school["latest.admissions.admission_rate.overall"]
        ? `${(school["latest.admissions.admission_rate.overall"] * 100).toFixed(1)}%`
        : "N/A",
      tuition: school["latest.cost.tuition.in_state"] || 0,
      internationalTuition: school["latest.cost.tuition.out_of_state"] || 0,
      ranking: null as any,
      worldRanking: null as any,
      programs: [],
      internationalStudents: "N/A",
      applicationDeadline: "Varies",
      requiredTests: ["SAT/ACT", "TOEFL/IELTS (international)"],
      averageSAT: null,
      averageGPA: null,
      undergraduateEnrollment: school["latest.student.size"] || null as any,
      graduationRate: school["latest.completion.completion_rate_4yr_150nt"]
        ? `${(school["latest.completion.completion_rate_4yr_150nt"] * 100).toFixed(0)}%`
        : "N/A",
      employmentRate: "N/A",
      scholarships: true,
      needBlindAdmission: false,
      website: school["school.school_url"] || "N/A",
      source: "college-scorecard" as const,
    }
  } catch (error) {
    console.error("Error fetching from College Scorecard:", error)
    return null
  }
}

// Tier 3: Generate using Gemini AI
async function generateWithAI(query: string): Promise<School | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === "your_api_key_here") {
      return null
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `You are a college admissions database. Provide accurate information about this university: "${query}"

Return ONLY a JSON object with the following structure (use null for unknown values):
{
  "name": "Full official university name",
  "shortName": "Common short name or abbreviation",
  "country": "Country name",
  "city": "City name",
  "state": "State/Province (null if not applicable)",
  "acceptanceRate": "X%" or "N/A",
  "tuition": annual domestic tuition in USD (number),
  "internationalTuition": annual international tuition in USD (number),
  "worldRanking": estimated world ranking (number) or null,
  "programs": ["top 5 programs/majors offered"],
  "internationalStudents": "X%" or "N/A",
  "applicationDeadline": "typical deadline" or "Varies",
  "requiredTests": ["required standardized tests"],
  "undergraduateEnrollment": approximate number or null,
  "graduationRate": "X%" or "N/A",
  "employmentRate": "X%" or "N/A",
  "scholarships": true/false,
  "website": "official website URL"
}

If this is not a real university, return: {"error": "University not found"}

Return ONLY valid JSON, no additional text.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const aiData = JSON.parse(cleanText)

    if (aiData.error) {
      return null
    }

    // Convert to our format
    return {
      id: aiData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: aiData.name,
      shortName: aiData.shortName,
      country: aiData.country,
      city: aiData.city,
      state: aiData.state,
      acceptanceRate: aiData.acceptanceRate,
      tuition: aiData.tuition,
      internationalTuition: aiData.internationalTuition,
      ranking: null as any,
      worldRanking: aiData.worldRanking,
      programs: aiData.programs,
      internationalStudents: aiData.internationalStudents,
      applicationDeadline: aiData.applicationDeadline,
      requiredTests: aiData.requiredTests,
      averageSAT: null,
      averageGPA: null,
      undergraduateEnrollment: aiData.undergraduateEnrollment,
      graduationRate: aiData.graduationRate,
      employmentRate: aiData.employmentRate,
      scholarships: aiData.scholarships,
      needBlindAdmission: false,
      website: aiData.website,
      source: "ai-generated" as const,
    }
  } catch (error) {
    console.error("Error generating with AI:", error)
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""
  const country = searchParams.get("country") || undefined
  const maxTuitionStr = searchParams.get("maxTuition")
  const limit = parseInt(searchParams.get("limit") || "20")

  if (!query) {
    return NextResponse.json({ error: "Query parameter required" }, { status: 400 })
  }

  const maxTuition = maxTuitionStr ? parseInt(maxTuitionStr) : undefined

  try {
    // Tier 1: Search curated database
    let results = searchCuratedDatabase(query, { country, maxTuition })

    // If we found results in curated database, return them
    if (results.length > 0) {
      return NextResponse.json({
        results: results.slice(0, limit),
        source: "curated",
        total: results.length,
      })
    }

    // Tier 2: Try College Scorecard API for US schools
    if (!country || country === "USA") {
      const scorecardResult = await searchCollegeScorecardAPI(query)
      if (scorecardResult) {
        return NextResponse.json({
          results: [scorecardResult],
          source: "college-scorecard",
          total: 1,
        })
      }
    }

    // Tier 3: Generate with AI
    const aiResult = await generateWithAI(query)
    if (aiResult) {
      return NextResponse.json({
        results: [aiResult],
        source: "ai-generated",
        total: 1,
      })
    }

    // No results found
    return NextResponse.json({
      results: [],
      source: "none",
      total: 0,
    })
  } catch (error) {
    console.error("Error in school search:", error)
    return NextResponse.json(
      { error: "Failed to search schools" },
      { status: 500 }
    )
  }
}

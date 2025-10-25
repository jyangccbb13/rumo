import { NextResponse } from "next/server"
import { nanoid } from "nanoid"

import type { FitOverview, StudentProfile } from "@/lib/inMemoryStore"

// School database with metadata for intelligent matching
const SCHOOL_DATABASE = [
  // Reach schools
  { name: "Harvard University", tier: "reach", gpaMin: 3.9, satMin: 1480, location: "urban", size: "medium", tuition: 57261, research: "research-heavy" },
  { name: "Stanford University", tier: "reach", gpaMin: 3.9, satMin: 1470, location: "suburban", size: "medium", tuition: 56169, research: "research-heavy" },
  { name: "MIT", tier: "reach", gpaMin: 3.9, satMin: 1510, location: "urban", size: "medium", tuition: 57986, research: "research-heavy" },
  { name: "Yale University", tier: "reach", gpaMin: 3.9, satMin: 1480, location: "urban", size: "medium", tuition: 62250, research: "research-heavy" },
  { name: "Princeton University", tier: "reach", gpaMin: 3.9, satMin: 1470, location: "suburban", size: "small", tuition: 57690, research: "research-heavy" },
  { name: "Columbia University", tier: "reach", gpaMin: 3.9, satMin: 1490, location: "urban", size: "medium", tuition: 65524, research: "research-heavy" },

  // Target schools
  { name: "UC Berkeley", tier: "target", gpaMin: 3.7, satMin: 1330, location: "urban", size: "large", tuition: 44115, research: "research-heavy" },
  { name: "University of Michigan", tier: "target", gpaMin: 3.7, satMin: 1360, location: "suburban", size: "large", tuition: 53232, research: "balanced" },
  { name: "UCLA", tier: "target", gpaMin: 3.7, satMin: 1290, location: "urban", size: "large", tuition: 44130, research: "research-heavy" },
  { name: "NYU", tier: "target", gpaMin: 3.6, satMin: 1370, location: "urban", size: "large", tuition: 58168, research: "teaching-focused" },
  { name: "Boston University", tier: "target", gpaMin: 3.6, satMin: 1340, location: "urban", size: "large", tuition: 60800, research: "balanced" },
  { name: "USC", tier: "target", gpaMin: 3.7, satMin: 1360, location: "urban", size: "large", tuition: 64260, research: "balanced" },

  // Safety schools
  { name: "UC Davis", tier: "safety", gpaMin: 3.4, satMin: 1190, location: "suburban", size: "large", tuition: 44494, research: "research-heavy" },
  { name: "UC Santa Cruz", tier: "safety", gpaMin: 3.4, satMin: 1170, location: "suburban", size: "large", tuition: 44779, research: "research-heavy" },
  { name: "University of Washington", tier: "safety", gpaMin: 3.5, satMin: 1220, location: "urban", size: "large", tuition: 39906, research: "research-heavy" },
  { name: "Penn State", tier: "safety", gpaMin: 3.5, satMin: 1210, location: "rural", size: "large", tuition: 37454, research: "balanced" },
  { name: "UC Irvine", tier: "safety", gpaMin: 3.5, satMin: 1230, location: "suburban", size: "large", tuition: 44707, research: "research-heavy" },
  { name: "Rutgers University", tier: "safety", gpaMin: 3.3, satMin: 1190, location: "suburban", size: "large", tuition: 33963, research: "research-heavy" },
]

function scoreSchool(school: typeof SCHOOL_DATABASE[0], profile: Partial<StudentProfile>): number {
  let score = 0

  // Location preference match (high weight)
  if (profile.locationPreference && school.location === profile.locationPreference) {
    score += 30
  }

  // Campus size match (high weight)
  if (profile.campusSize && school.size === profile.campusSize) {
    score += 25
  }

  // Research preference match (medium weight)
  if (profile.researchPreference && school.research === profile.researchPreference) {
    score += 20
  }

  // Budget match (very high weight)
  if (profile.budget) {
    if (school.tuition <= profile.budget) {
      score += 50
    } else if (school.tuition <= profile.budget * 1.2) {
      // Within 20% of budget
      score += 25
    }
  } else {
    // No budget specified, slight preference for lower cost
    score += Math.max(0, 20 - (school.tuition / 3000))
  }

  // Dream school match (very high weight)
  if (profile.dreamSchools && profile.dreamSchools.some(dream =>
    school.name.toLowerCase().includes(dream.toLowerCase()) ||
    dream.toLowerCase().includes(school.name.toLowerCase())
  )) {
    score += 100
  }

  return score
}

export async function POST(request: Request) {
  const profile = (await request.json()) as Partial<StudentProfile> | undefined

  const intendedMajor = profile?.intendedMajor?.trim() || "your goals"
  const gpa = profile?.gpa || 3.5
  const testScore = profile?.testScore || 1300

  // Score all schools and sort by match quality
  const reachSchools = SCHOOL_DATABASE
    .filter(s => s.tier === "reach" && gpa >= s.gpaMin - 0.3)
    .map(s => ({ ...s, score: scoreSchool(s, profile) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  const targetSchools = SCHOOL_DATABASE
    .filter(s => s.tier === "target" && gpa >= s.gpaMin - 0.2)
    .map(s => ({ ...s, score: scoreSchool(s, profile) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  const safetySchools = SCHOOL_DATABASE
    .filter(s => s.tier === "safety" && gpa >= s.gpaMin)
    .map(s => ({ ...s, score: scoreSchool(s, profile) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  const fitOverview: FitOverview = {
    reach: reachSchools.map(school => ({
      id: nanoid(),
      name: school.name,
      rationale: `Strong program in ${intendedMajor}. ${school.location} campus with ${school.size} student body. Competitive but worth applying with your profile.`,
    })),
    target: targetSchools.map(school => ({
      id: nanoid(),
      name: school.name,
      rationale: `Good match for ${intendedMajor}. ${school.location} setting aligns with your preferences. Your stats are competitive for admission.`,
    })),
    safety: safetySchools.map(school => ({
      id: nanoid(),
      name: school.name,
      rationale: `Solid program in ${intendedMajor}. Your GPA and test scores exceed their averages. ${school.location} campus matches your preferences.`,
    })),
  }

  await new Promise((resolve) => setTimeout(resolve, 800))

  return NextResponse.json(fitOverview)
}

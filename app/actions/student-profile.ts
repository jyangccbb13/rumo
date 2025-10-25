"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type StudentProfileData = {
  countryOfOrigin?: string | null
  currentGrade?: "9th" | "10th" | "11th" | "12th" | null
  applicationCycle?: string | null
  gpa: number
  testScore?: number | null
  intendedMajor: string
  languages: string[]
  extracurriculars: string[]
  dreamSchools: string[]
  budget?: number | null
  locationPreference?: "urban" | "suburban" | "rural" | null
  researchPreference?: "research-heavy" | "teaching-focused" | "balanced" | null
  campusSize?: "small" | "medium" | "large" | null
  profileSummary?: any
}

export async function getStudentProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
    console.error("Error fetching student profile:", error)
    return { error: error.message }
  }

  return { data }
}

export async function createStudentProfile(profileData: StudentProfileData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if profile already exists
  const { data: existing } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (existing) {
    // Update instead
    return updateStudentProfile(profileData)
  }

  const { data, error } = await supabase
    .from("student_profiles")
    .insert({
      user_id: user.id,
      country_of_origin: profileData.countryOfOrigin,
      current_grade: profileData.currentGrade,
      application_cycle: profileData.applicationCycle,
      gpa: profileData.gpa,
      test_score: profileData.testScore,
      intended_major: profileData.intendedMajor,
      languages: profileData.languages,
      extracurriculars: profileData.extracurriculars,
      dream_schools: profileData.dreamSchools,
      budget: profileData.budget,
      location_preference: profileData.locationPreference,
      research_preference: profileData.researchPreference,
      campus_size: profileData.campusSize,
      profile_summary: profileData.profileSummary,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating student profile:", error)
    return { error: error.message }
  }

  revalidatePath("/student/profile")
  return { data }
}

export async function updateStudentProfile(profileData: Partial<StudentProfileData>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const updateData: any = {}

  if (profileData.countryOfOrigin !== undefined) updateData.country_of_origin = profileData.countryOfOrigin
  if (profileData.currentGrade !== undefined) updateData.current_grade = profileData.currentGrade
  if (profileData.applicationCycle !== undefined) updateData.application_cycle = profileData.applicationCycle
  if (profileData.gpa !== undefined) updateData.gpa = profileData.gpa
  if (profileData.testScore !== undefined) updateData.test_score = profileData.testScore
  if (profileData.intendedMajor !== undefined) updateData.intended_major = profileData.intendedMajor
  if (profileData.languages !== undefined) updateData.languages = profileData.languages
  if (profileData.extracurriculars !== undefined) updateData.extracurriculars = profileData.extracurriculars
  if (profileData.dreamSchools !== undefined) updateData.dream_schools = profileData.dreamSchools
  if (profileData.budget !== undefined) updateData.budget = profileData.budget
  if (profileData.locationPreference !== undefined) updateData.location_preference = profileData.locationPreference
  if (profileData.researchPreference !== undefined) updateData.research_preference = profileData.researchPreference
  if (profileData.campusSize !== undefined) updateData.campus_size = profileData.campusSize
  if (profileData.profileSummary !== undefined) updateData.profile_summary = profileData.profileSummary

  const { data, error } = await supabase
    .from("student_profiles")
    .update(updateData)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating student profile:", error)
    return { error: error.message }
  }

  revalidatePath("/student/profile")
  return { data }
}

export async function hasStudentProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return false
  }

  const { data } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  return !!data
}

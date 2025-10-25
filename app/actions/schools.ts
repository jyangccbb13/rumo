"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { School } from "@/lib/inMemoryStore"

export type SchoolData = Omit<School, "id">

export async function getSchools() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching schools:", error)
    return { error: error.message }
  }

  // Map database columns to TypeScript format
  const schools: School[] = (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    country: row.country,
    city: row.city,
    state: row.state,
    acceptanceRate: row.acceptance_rate,
    tuition: row.tuition,
    internationalTuition: row.international_tuition,
    ranking: row.ranking,
    worldRanking: row.world_ranking,
    programs: row.programs,
    internationalStudents: row.international_students,
    applicationDeadline: row.application_deadline,
    requiredTests: row.required_tests,
    averageSAT: row.average_sat,
    averageGPA: row.average_gpa,
    undergraduateEnrollment: row.undergraduate_enrollment,
    graduationRate: row.graduation_rate,
    employmentRate: row.employment_rate,
    scholarships: row.scholarships,
    needBlindAdmission: row.need_blind_admission,
    website: row.website,
    source: row.source,
    location: row.location,
    avgNetPrice: row.avg_net_price,
    satRange: row.sat_range,
    studentFacultyRatio: row.student_faculty_ratio,
    size: row.size,
    url: row.url,
    focus: row.focus,
  }))

  return { data: schools }
}

export async function addSchool(schoolData: SchoolData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("schools")
    .insert({
      user_id: user.id,
      name: schoolData.name,
      short_name: schoolData.shortName,
      country: schoolData.country,
      city: schoolData.city,
      state: schoolData.state,
      acceptance_rate: schoolData.acceptanceRate,
      tuition: schoolData.tuition,
      international_tuition: schoolData.internationalTuition,
      ranking: schoolData.ranking,
      world_ranking: schoolData.worldRanking,
      programs: schoolData.programs,
      international_students: schoolData.internationalStudents,
      application_deadline: schoolData.applicationDeadline,
      required_tests: schoolData.requiredTests,
      average_sat: schoolData.averageSAT,
      average_gpa: schoolData.averageGPA,
      undergraduate_enrollment: schoolData.undergraduateEnrollment,
      graduation_rate: schoolData.graduationRate,
      employment_rate: schoolData.employmentRate,
      scholarships: schoolData.scholarships,
      need_blind_admission: schoolData.needBlindAdmission,
      website: schoolData.website,
      source: schoolData.source,
      location: schoolData.location,
      avg_net_price: schoolData.avgNetPrice,
      sat_range: schoolData.satRange,
      student_faculty_ratio: schoolData.studentFacultyRatio,
      size: schoolData.size,
      url: schoolData.url,
      focus: schoolData.focus,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding school:", error)
    return { error: error.message }
  }

  revalidatePath("/student/explore")
  return { data }
}

export async function removeSchool(schoolId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("schools")
    .delete()
    .eq("id", schoolId)
    .eq("user_id", user.id) // Ensure user can only delete their own schools

  if (error) {
    console.error("Error removing school:", error)
    return { error: error.message }
  }

  revalidatePath("/student/explore")
  return { success: true }
}

export async function clearSchools() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("schools")
    .delete()
    .eq("user_id", user.id)

  if (error) {
    console.error("Error clearing schools:", error)
    return { error: error.message }
  }

  revalidatePath("/student/explore")
  return { success: true }
}

"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Draft } from "@/lib/inMemoryStore"

export type EssayData = Omit<Draft, "id">

export async function getEssays() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("essays")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching essays:", error)
    return { error: error.message }
  }

  // Map database columns to TypeScript format
  const essays: Draft[] = (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    updatedAt: row.updated_at,
  }))

  return { data: essays }
}

export async function createEssay(essayData: EssayData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("essays")
    .insert({
      user_id: user.id,
      title: essayData.title,
      content: essayData.content,
      updated_at: essayData.updatedAt,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating essay:", error)
    return { error: error.message }
  }

  revalidatePath("/student/drafts")
  return { data }
}

export async function updateEssay(essayId: string, updates: Partial<EssayData>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const updateData: any = {}
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.content !== undefined) updateData.content = updates.content
  if (updates.updatedAt !== undefined) updateData.updated_at = updates.updatedAt

  // Always update the updated_at timestamp
  updateData.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from("essays")
    .update(updateData)
    .eq("id", essayId)
    .eq("user_id", user.id) // Ensure user can only update their own essays
    .select()
    .single()

  if (error) {
    console.error("Error updating essay:", error)
    return { error: error.message }
  }

  revalidatePath("/student/drafts")
  return { data }
}

export async function deleteEssay(essayId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("essays")
    .delete()
    .eq("id", essayId)
    .eq("user_id", user.id) // Ensure user can only delete their own essays

  if (error) {
    console.error("Error deleting essay:", error)
    return { error: error.message }
  }

  revalidatePath("/student/drafts")
  return { success: true }
}

"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Task } from "@/lib/inMemoryStore"

export type TaskData = Omit<Task, "id">

export async function getTasks() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true, nullsFirst: false })

  if (error) {
    console.error("Error fetching tasks:", error)
    return { error: error.message }
  }

  // Map database columns to TypeScript format
  const tasks: Task[] = (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    dueDate: row.due_date,
    description: row.description,
    category: row.category,
    source: row.source,
    completed: row.completed,
  }))

  return { data: tasks }
}

export async function createTask(taskData: TaskData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: taskData.title,
      due_date: taskData.dueDate,
      description: taskData.description,
      category: taskData.category,
      source: taskData.source,
      completed: taskData.completed,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating task:", error)
    return { error: error.message }
  }

  revalidatePath("/student/timeline")
  return { data }
}

export async function updateTask(taskId: string, updates: Partial<TaskData>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const updateData: any = {}
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.category !== undefined) updateData.category = updates.category
  if (updates.source !== undefined) updateData.source = updates.source
  if (updates.completed !== undefined) updateData.completed = updates.completed

  const { data, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", taskId)
    .eq("user_id", user.id) // Ensure user can only update their own tasks
    .select()
    .single()

  if (error) {
    console.error("Error updating task:", error)
    return { error: error.message }
  }

  revalidatePath("/student/timeline")
  return { data }
}

export async function toggleTaskCompletion(taskId: string, completed: boolean) {
  return updateTask(taskId, { completed })
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id) // Ensure user can only delete their own tasks

  if (error) {
    console.error("Error deleting task:", error)
    return { error: error.message }
  }

  revalidatePath("/student/timeline")
  return { success: true }
}

export async function clearTasks() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("user_id", user.id)

  if (error) {
    console.error("Error clearing tasks:", error)
    return { error: error.message }
  }

  revalidatePath("/student/timeline")
  return { success: true }
}

export async function createBulkTasks(tasksData: TaskData[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const tasksToInsert = tasksData.map((task) => ({
    user_id: user.id,
    title: task.title,
    due_date: task.dueDate,
    description: task.description,
    category: task.category,
    source: task.source,
    completed: task.completed,
  }))

  const { data, error } = await supabase
    .from("tasks")
    .insert(tasksToInsert)
    .select()

  if (error) {
    console.error("Error creating bulk tasks:", error)
    return { error: error.message }
  }

  revalidatePath("/student/timeline")
  return { data }
}

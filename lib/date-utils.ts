export function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days ago`
  } else if (diffDays === 0) {
    return "Today"
  } else if (diffDays === 1) {
    return "Tomorrow"
  } else if (diffDays < 7) {
    return `in ${diffDays} days`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `in ${weeks} week${weeks > 1 ? "s" : ""}`
  } else {
    const months = Math.floor(diffDays / 30)
    return `in ${months} month${months > 1 ? "s" : ""}`
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

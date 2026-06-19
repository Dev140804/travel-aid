/* eslint-disable @typescript-eslint/no-explicit-any */
export function calculateTimeline(startTime: string, activities: any[]) {

  const timeline:any[] = []

  let current = new Date(`2024-01-01T${startTime}`)

  activities.forEach((activity) => {

    const start = new Date(current)

    const end = new Date(current.getTime() + activity.duration * 60000)

    timeline.push({
      name: activity.name,
      start: start.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
      end: end.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
      duration: activity.duration
    })

    current = end

  })

  return timeline

}
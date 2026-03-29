function parseScheduleDateTimeParts(value) {
  if (!value) {
    return null
  }

  const text = String(value).trim()
  const match = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})[T\s](\d{1,2}):(\d{1,2})(?::\d{1,2})?/)

  if (!match) {
    return null
  }

  return {
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5])
  }
}

export function formatScheduleDateTime(value) {
  const parts = parseScheduleDateTimeParts(value)

  if (!parts) {
    return value ? String(value) : '-'
  }

  return `${parts.month}月${parts.day}日${parts.hour}时${parts.minute}分`
}

export default {
  formatScheduleDateTime
}

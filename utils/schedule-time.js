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
    minute: String(match[5]).padStart(2, '0')
  }
}

function parseFullDateTimeParts(value) {
  if (!value) {
    return null
  }

  const match = String(value).trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+|T)(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/)

  if (!match) {
    return null
  }

  return {
    year: String(match[1]).padStart(4, '0'),
    month: String(match[2]).padStart(2, '0'),
    day: String(match[3]).padStart(2, '0'),
    hour: String(match[4]).padStart(2, '0'),
    minute: String(match[5]).padStart(2, '0'),
    second: String(match[6] || 0).padStart(2, '0')
  }
}

export function formatScheduleDateTime(value) {
  const parts = parseScheduleDateTimeParts(value)

  if (!parts) {
    return value ? String(value) : '-'
  }

  return `${parts.month}\u6708${parts.day}\u65e5${parts.hour}\u65f6${parts.minute}\u5206`
}

export function formatFullDateTime(value) {
  const parts = parseFullDateTimeParts(value)

  if (!parts) {
    return value ? String(value) : '-'
  }

  return `${parts.year}\u5e74${parts.month}\u6708${parts.day}\u65e5${parts.hour}\u65f6${parts.minute}\u5206${parts.second}\u79d2`
}

export default {
  formatScheduleDateTime,
  formatFullDateTime
}

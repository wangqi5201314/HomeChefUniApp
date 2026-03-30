"use strict";
function parseScheduleDateTimeParts(value) {
  if (!value) {
    return null;
  }
  const text = String(value).trim();
  const match = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})[T\s](\d{1,2}):(\d{1,2})(?::\d{1,2})?/);
  if (!match) {
    return null;
  }
  return {
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: String(match[5]).padStart(2, "0")
  };
}
function parseFullDateTimeParts(value) {
  if (!value) {
    return null;
  }
  const match = String(value).trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+|T)(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
  if (!match) {
    return null;
  }
  return {
    year: String(match[1]).padStart(4, "0"),
    month: String(match[2]).padStart(2, "0"),
    day: String(match[3]).padStart(2, "0"),
    hour: String(match[4]).padStart(2, "0"),
    minute: String(match[5]).padStart(2, "0"),
    second: String(match[6] || 0).padStart(2, "0")
  };
}
function formatScheduleDateTime(value) {
  const parts = parseScheduleDateTimeParts(value);
  if (!parts) {
    return value ? String(value) : "-";
  }
  return `${parts.month}月${parts.day}日${parts.hour}时${parts.minute}分`;
}
function formatFullDateTime(value) {
  const parts = parseFullDateTimeParts(value);
  if (!parts) {
    return value ? String(value) : "-";
  }
  return `${parts.year}年${parts.month}月${parts.day}日${parts.hour}时${parts.minute}分${parts.second}秒`;
}
exports.formatFullDateTime = formatFullDateTime;
exports.formatScheduleDateTime = formatScheduleDateTime;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/schedule-time.js.map

"use strict";
const TIME_SLOT_OPTIONS = [
  { label: "早餐", value: "BREAKFAST" },
  { label: "午餐", value: "LUNCH" },
  { label: "晚餐", value: "DINNER" },
  { label: "夜宵", value: "LATE_NIGHT" }
];
const TIME_SLOT_TEXT_MAP = TIME_SLOT_OPTIONS.reduce((result, item) => {
  result[item.value] = item.label;
  return result;
}, {});
const LEGACY_TIME_SLOT_VALUE_MAP = {
  BREAKFAST: "BREAKFAST",
  LUNCH: "LUNCH",
  DINNER: "DINNER",
  LATE_NIGHT: "LATE_NIGHT",
  早餐: "BREAKFAST",
  午餐: "LUNCH",
  晚餐: "DINNER",
  夜宵: "LATE_NIGHT"
};
function normalizeTimeSlot(timeSlot) {
  if (!timeSlot) {
    return "";
  }
  const normalized = LEGACY_TIME_SLOT_VALUE_MAP[String(timeSlot).trim()];
  return normalized || "";
}
function getTimeSlotText(timeSlot) {
  const normalized = normalizeTimeSlot(timeSlot);
  if (!normalized) {
    return timeSlot ? String(timeSlot) : "-";
  }
  return TIME_SLOT_TEXT_MAP[normalized] || "-";
}
function isValidTimeSlot(timeSlot) {
  return Boolean(normalizeTimeSlot(timeSlot));
}
exports.TIME_SLOT_OPTIONS = TIME_SLOT_OPTIONS;
exports.getTimeSlotText = getTimeSlotText;
exports.isValidTimeSlot = isValidTimeSlot;
exports.normalizeTimeSlot = normalizeTimeSlot;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/time-slot.js.map

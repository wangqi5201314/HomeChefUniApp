"use strict";
const userStatusMap = {
  0: "禁用",
  1: "正常"
};
function getUserStatusText(status) {
  return userStatusMap[Number(status)] || "未知状态";
}
exports.getUserStatusText = getUserStatusText;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/user-status.js.map

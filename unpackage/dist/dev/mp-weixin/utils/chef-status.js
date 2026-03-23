"use strict";
const chefStatusMap = {
  0: "停用",
  1: "正常"
};
function getChefStatusText(status) {
  return chefStatusMap[Number(status)] || "未知状态";
}
exports.getChefStatusText = getChefStatusText;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/chef-status.js.map

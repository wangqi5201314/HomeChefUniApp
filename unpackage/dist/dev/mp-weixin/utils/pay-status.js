"use strict";
const payStatusMap = {
  UNPAID: "未支付",
  PAID: "已支付"
};
function getPayStatusText(payStatus) {
  return payStatusMap[payStatus] || "未知状态";
}
exports.getPayStatusText = getPayStatusText;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/pay-status.js.map

"use strict";
const refundStatusMap = {
  NONE: "无退款",
  REFUNDED: "已退款"
};
function getRefundStatusText(refundStatus) {
  return refundStatusMap[refundStatus] || "未知状态";
}
exports.getRefundStatusText = getRefundStatusText;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/refund-status.js.map

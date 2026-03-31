"use strict";
const certStatusMap = {
  0: "待审核",
  1: "已通过",
  2: "已拒绝",
  3: "待上传"
};
function getChefCertStatusText(status) {
  return certStatusMap[Number(status)] || "未知状态";
}
exports.getChefCertStatusText = getChefCertStatusText;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/chef-cert-status.js.map

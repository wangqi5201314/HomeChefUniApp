"use strict";
const serviceModeMap = {
  1: "用户自备食材",
  2: "平台协同采购",
  3: "均支持"
};
const chefServiceModeOptions = [
  {
    label: "用户自备食材",
    value: 1
  },
  {
    label: "平台协同采购",
    value: 2
  },
  {
    label: "均支持",
    value: 3
  }
];
function getChefServiceModeText(mode) {
  return serviceModeMap[Number(mode)] || "未知模式";
}
exports.chefServiceModeOptions = chefServiceModeOptions;
exports.getChefServiceModeText = getChefServiceModeText;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/chef-service-mode.js.map

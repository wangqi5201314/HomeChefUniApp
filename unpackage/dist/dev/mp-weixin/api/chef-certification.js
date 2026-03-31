"use strict";
const common_vendor = require("../common/vendor.js");
const api_request = require("./request.js");
const utils_config = require("../utils/config.js");
const utils_auth = require("../utils/auth.js");
const utils_toastMessage = require("../utils/toast-message.js");
const CHEF_LOGIN_PAGE = "/pages-chef/login/index";
function redirectToChefLogin(message) {
  utils_auth.clearAuth();
  common_vendor.index.showToast({
    title: utils_toastMessage.normalizeToastMessage(message) || "登录已失效",
    icon: "none"
  });
  common_vendor.index.reLaunch({
    url: CHEF_LOGIN_PAGE
  });
}
function getChefCertification() {
  const token = utils_auth.getToken();
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: `${utils_config.BASE_URL}/api/chef/certification/me`,
      method: "GET",
      header: {
        "Content-Type": "application/json",
        ...token ? { Authorization: `Bearer ${token}` } : {}
      },
      success: (response) => {
        const { statusCode, data } = response;
        const code = data && typeof data.code !== "undefined" ? Number(data.code) : null;
        const message = data && data.message ? data.message : "请求失败";
        if (statusCode === 401 || code === 401) {
          redirectToChefLogin(message);
          reject(data || response);
          return;
        }
        if (statusCode >= 200 && statusCode < 300 && code === 200) {
          resolve(data.data || null);
          return;
        }
        if (statusCode >= 200 && statusCode < 300 && code === 404) {
          resolve(null);
          return;
        }
        common_vendor.index.showToast({
          title: utils_toastMessage.normalizeToastMessage(message),
          icon: "none"
        });
        reject(data || response);
      },
      fail: (error) => {
        common_vendor.index.showToast({
          title: "网络异常",
          icon: "none"
        });
        reject(error);
      }
    });
  });
}
function submitChefCertification(data) {
  return api_request.request.post("/api/chef/certification/submit", data);
}
exports.getChefCertification = getChefCertification;
exports.submitChefCertification = submitChefCertification;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chef-certification.js.map

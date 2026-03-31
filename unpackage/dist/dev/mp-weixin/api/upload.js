"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("../utils/config.js");
const utils_auth = require("../utils/auth.js");
const utils_toastMessage = require("../utils/toast-message.js");
const CHEF_LOGIN_PAGE = "/pages-chef/login/index";
let redirectingToLogin = false;
function showToast(message) {
  common_vendor.index.showToast({
    title: utils_toastMessage.normalizeToastMessage(message) || "上传失败",
    icon: "none"
  });
}
function redirectToLogin(message) {
  utils_auth.clearAuth();
  showToast(message || "登录已失效");
  if (redirectingToLogin) {
    return;
  }
  redirectingToLogin = true;
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const currentRoute = currentPage ? `/${currentPage.route}` : "";
  const targetLoginPage = currentRoute.indexOf("/pages-chef/") === 0 ? CHEF_LOGIN_PAGE : utils_config.LOGIN_PAGE;
  common_vendor.index.reLaunch({
    url: targetLoginPage
  });
  setTimeout(() => {
    redirectingToLogin = false;
  }, 300);
}
function uploadImage(filePath) {
  const token = utils_auth.getToken();
  return new Promise((resolve, reject) => {
    common_vendor.index.uploadFile({
      url: `${utils_config.BASE_URL}/api/upload/image`,
      filePath,
      name: "file",
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (response) => {
        let result = null;
        try {
          result = JSON.parse(response.data);
        } catch (error) {
          showToast("返回数据格式错误");
          reject(error);
          return;
        }
        if (response.statusCode === 401 || result.code === 401) {
          redirectToLogin(result.message);
          reject(result);
          return;
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          showToast(result.message || `上传失败(${response.statusCode})`);
          reject(result);
          return;
        }
        if (result.code === 200) {
          resolve(result.data);
          return;
        }
        showToast(result.message || "上传失败");
        reject(result);
      },
      fail: (error) => {
        showToast("网络异常，请稍后重试");
        reject(error);
      }
    });
  });
}
exports.uploadImage = uploadImage;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/upload.js.map

"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("../utils/config.js");
const utils_auth = require("../utils/auth.js");
const CHEF_LOGIN_PAGE = "/pages-chef/login/index";
let redirectingToLogin = false;
function buildUrl(url) {
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  return `${utils_config.BASE_URL}${url}`;
}
function buildHeader(customHeader = {}) {
  const token = utils_auth.getToken();
  const header = {
    "Content-Type": "application/json",
    ...customHeader
  };
  if (token) {
    header.Authorization = `Bearer ${token}`;
  }
  return header;
}
function showToast(message) {
  common_vendor.index.showToast({
    title: message || "请求失败",
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
  if (currentRoute !== targetLoginPage) {
    common_vendor.index.reLaunch({
      url: targetLoginPage
    });
  }
  setTimeout(() => {
    redirectingToLogin = false;
  }, 300);
}
function handleResponse(response, resolve, reject) {
  const { statusCode, data } = response;
  const code = data && typeof data.code !== "undefined" ? data.code : null;
  const message = data && data.message ? data.message : "请求失败";
  if (statusCode === 401 || code === 401) {
    redirectToLogin(message);
    reject(data || response);
    return;
  }
  if (statusCode < 200 || statusCode >= 300) {
    showToast(message || `请求失败(${statusCode})`);
    reject(data || response);
    return;
  }
  if (!data || typeof code === "undefined") {
    showToast("响应数据异常");
    reject(data || response);
    return;
  }
  if (code === 200) {
    resolve(data.data);
    return;
  }
  showToast(message);
  reject(data);
}
function request(options = {}) {
  const {
    url,
    method = "GET",
    data = {},
    header = {}
  } = options;
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: buildUrl(url),
      method,
      data,
      header: buildHeader(header),
      success: (response) => {
        handleResponse(response, resolve, reject);
      },
      fail: (error) => {
        showToast("网络异常");
        reject(error);
      }
    });
  });
}
request.get = function(url, data = {}, header = {}) {
  return request({
    url,
    method: "GET",
    data,
    header
  });
};
request.post = function(url, data = {}, header = {}) {
  return request({
    url,
    method: "POST",
    data,
    header
  });
};
request.put = function(url, data = {}, header = {}) {
  return request({
    url,
    method: "PUT",
    data,
    header
  });
};
request.del = function(url, data = {}, header = {}) {
  return request({
    url,
    method: "DELETE",
    data,
    header
  });
};
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/request.js.map

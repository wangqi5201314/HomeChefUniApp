"use strict";
const common_vendor = require("../common/vendor.js");
const api_request = require("./request.js");
const utils_config = require("../utils/config.js");
const utils_auth = require("../utils/auth.js");
function redirectToLogin(message) {
  utils_auth.clearAuth();
  common_vendor.index.showToast({
    title: message || "登录已失效",
    icon: "none"
  });
  common_vendor.index.reLaunch({
    url: utils_config.LOGIN_PAGE
  });
}
function createOrder(data) {
  const token = utils_auth.getToken();
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: `${utils_config.BASE_URL}/api/order/create`,
      method: "POST",
      data,
      header: {
        "Content-Type": "application/json",
        ...token ? { Authorization: `Bearer ${token}` } : {}
      },
      success: (response) => {
        const { statusCode, data: responseData } = response;
        const code = responseData && typeof responseData.code !== "undefined" ? Number(responseData.code) : null;
        const message = responseData && responseData.message ? responseData.message : "请求失败";
        if (statusCode === 401 || code === 401) {
          redirectToLogin(message);
          reject(responseData || response);
          return;
        }
        if (statusCode >= 200 && statusCode < 300 && code === 200) {
          resolve(responseData.data);
          return;
        }
        reject(responseData || { message });
      },
      fail: (error) => {
        reject({
          message: "网络异常",
          raw: error
        });
      }
    });
  });
}
function getOrderDetail(id) {
  return api_request.request.get(`/api/order/${id}`);
}
function getOrderList(params) {
  return api_request.request.get("/api/order/list", params);
}
function cancelOrder(id, data) {
  return api_request.request.post(`/api/order/${id}/cancel`, data);
}
exports.cancelOrder = cancelOrder;
exports.createOrder = createOrder;
exports.getOrderDetail = getOrderDetail;
exports.getOrderList = getOrderList;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/order.js.map

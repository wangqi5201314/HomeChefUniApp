"use strict";
const common_vendor = require("../common/vendor.js");
const api_request = require("./request.js");
const utils_config = require("../utils/config.js");
const utils_auth = require("../utils/auth.js");
function normalizeAddressPayload(data = {}) {
  const payload = {
    userId: data.userId === 0 || data.userId ? Number(data.userId) : void 0,
    contactName: data.contactName ? String(data.contactName).trim() : "",
    contactPhone: data.contactPhone ? String(data.contactPhone).trim() : "",
    province: data.province ? String(data.province).trim() : "",
    city: data.city ? String(data.city).trim() : "",
    district: data.district ? String(data.district).trim() : "",
    town: data.town ? String(data.town).trim() : "",
    detailAddress: data.detailAddress ? String(data.detailAddress).trim() : "",
    longitude: data.longitude === "" || data.longitude === void 0 || data.longitude === null ? 0 : Number(data.longitude),
    latitude: data.latitude === "" || data.latitude === void 0 || data.latitude === null ? 0 : Number(data.latitude),
    isDefault: Number(data.isDefault) === 1 ? 1 : 0
  };
  if (typeof payload.userId === "undefined") {
    delete payload.userId;
  }
  return payload;
}
function getUserAddressList(params) {
  return api_request.request.get("/api/user/address/list", params);
}
function getDefaultUserAddressSilently(params = {}) {
  return new Promise((resolve) => {
    const token = utils_auth.getToken();
    const header = {
      "Content-Type": "application/json"
    };
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }
    common_vendor.index.request({
      url: `${utils_config.BASE_URL}/api/user/address/default`,
      method: "GET",
      data: params,
      header,
      success: (response) => {
        const data = response && response.data ? response.data : null;
        if (response && response.statusCode >= 200 && response.statusCode < 300 && data && Number(data.code) === 200) {
          resolve(data.data || null);
          return;
        }
        resolve(null);
      },
      fail: () => {
        resolve(null);
      }
    });
  });
}
function getAddressDetail(id) {
  return api_request.request.get(`/api/user/address/${id}`);
}
function createAddress(data) {
  return api_request.request.post("/api/user/address", normalizeAddressPayload(data));
}
function updateAddress(id, data) {
  return api_request.request.put(`/api/user/address/${id}`, normalizeAddressPayload(data));
}
function deleteAddress(id) {
  return api_request.request.del(`/api/user/address/${id}`);
}
function setDefaultAddress(id, data) {
  return api_request.request.post(`/api/user/address/${id}/default`, data);
}
exports.createAddress = createAddress;
exports.deleteAddress = deleteAddress;
exports.getAddressDetail = getAddressDetail;
exports.getDefaultUserAddressSilently = getDefaultUserAddressSilently;
exports.getUserAddressList = getUserAddressList;
exports.setDefaultAddress = setDefaultAddress;
exports.updateAddress = updateAddress;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/address.js.map

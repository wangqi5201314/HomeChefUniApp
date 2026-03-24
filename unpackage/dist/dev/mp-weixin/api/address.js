"use strict";
const api_request = require("./request.js");
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
function getDefaultUserAddress(params) {
  return api_request.request.get("/api/user/address/default", params);
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
exports.getDefaultUserAddress = getDefaultUserAddress;
exports.getUserAddressList = getUserAddressList;
exports.setDefaultAddress = setDefaultAddress;
exports.updateAddress = updateAddress;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/address.js.map

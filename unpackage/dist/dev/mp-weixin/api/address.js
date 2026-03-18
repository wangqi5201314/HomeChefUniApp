"use strict";
const api_request = require("./request.js");
function getUserAddressList(params) {
  return api_request.request.get("/api/user/address/list", params);
}
function getAddressDetail(id) {
  return api_request.request.get(`/api/user/address/${id}`);
}
function createAddress(data) {
  return api_request.request.post("/api/user/address", data);
}
function updateAddress(id, data) {
  return api_request.request.put(`/api/user/address/${id}`, data);
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
exports.getUserAddressList = getUserAddressList;
exports.setDefaultAddress = setDefaultAddress;
exports.updateAddress = updateAddress;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/address.js.map

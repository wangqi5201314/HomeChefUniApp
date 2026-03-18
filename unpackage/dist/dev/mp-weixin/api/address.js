"use strict";
const api_request = require("./request.js");
function getUserAddressList(params) {
  return api_request.request.get("/api/user/address/list", params);
}
function deleteAddress(id) {
  return api_request.request.del(`/api/user/address/${id}`);
}
function setDefaultAddress(id, data) {
  return api_request.request.post(`/api/user/address/${id}/default`, data);
}
exports.deleteAddress = deleteAddress;
exports.getUserAddressList = getUserAddressList;
exports.setDefaultAddress = setDefaultAddress;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/address.js.map

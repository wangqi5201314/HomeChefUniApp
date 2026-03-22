"use strict";
const api_request = require("./request.js");
function getChefOrderList(params) {
  return api_request.request.get("/api/chef/order/list", params);
}
function getChefOrderDetail(id) {
  return api_request.request.get(`/api/chef/order/${id}`);
}
function acceptChefOrder(id) {
  return api_request.request.post(`/api/chef/order/${id}/accept`);
}
function rejectChefOrder(id, data) {
  return api_request.request.post(`/api/chef/order/${id}/reject`, data);
}
function startChefOrder(id) {
  return api_request.request.post(`/api/chef/order/${id}/start`);
}
function finishChefOrder(id) {
  return api_request.request.post(`/api/chef/order/${id}/finish`);
}
exports.acceptChefOrder = acceptChefOrder;
exports.finishChefOrder = finishChefOrder;
exports.getChefOrderDetail = getChefOrderDetail;
exports.getChefOrderList = getChefOrderList;
exports.rejectChefOrder = rejectChefOrder;
exports.startChefOrder = startChefOrder;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chef-order.js.map

"use strict";
const api_request = require("./request.js");
function createOrder(data) {
  return api_request.request.post("/api/order/create", data);
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

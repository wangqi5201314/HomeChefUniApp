"use strict";
const api_request = require("./request.js");
function createOrder(data) {
  return api_request.request.post("/api/order/create", data);
}
function getOrderList(params) {
  return api_request.request.get("/api/order/list", params);
}
exports.createOrder = createOrder;
exports.getOrderList = getOrderList;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/order.js.map

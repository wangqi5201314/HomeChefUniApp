"use strict";
const api_request = require("./request.js");
function createOrder(data) {
  return api_request.request.post("/api/order/create", data);
}
exports.createOrder = createOrder;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/order.js.map

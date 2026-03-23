"use strict";
const api_request = require("./request.js");
function createPayment(data) {
  return api_request.request.post("/api/pay/create", data);
}
function getPaymentStatus(orderId) {
  return api_request.request.get(`/api/pay/status/${orderId}`);
}
function mockPaymentSuccess(orderId) {
  return api_request.request.post(`/api/pay/mock-success/${orderId}`);
}
function refundPayment(data) {
  return api_request.request.post("/api/pay/refund", data);
}
exports.createPayment = createPayment;
exports.getPaymentStatus = getPaymentStatus;
exports.mockPaymentSuccess = mockPaymentSuccess;
exports.refundPayment = refundPayment;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/pay.js.map

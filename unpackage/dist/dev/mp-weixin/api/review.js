"use strict";
const api_request = require("./request.js");
function createReview(data) {
  return api_request.request.post("/api/review/create", data);
}
function getUserReviewList(userId) {
  return api_request.request.get(`/api/review/user/${userId}`);
}
function getMyReviewList(userId) {
  return getUserReviewList(userId);
}
function getChefReviewList(chefId) {
  return api_request.request.get(`/api/review/chef/${chefId}`);
}
function getSingleReview(params = {}) {
  const hasOrderId = params.orderId === 0 || Boolean(params.orderId);
  const hasOrderNo = Boolean(params.orderNo);
  if (hasOrderId && hasOrderNo || !hasOrderId && !hasOrderNo) {
    return Promise.reject(new Error("orderId 和 orderNo 必须二选一"));
  }
  if (hasOrderId) {
    return api_request.request.get("/api/review/single", {
      orderId: params.orderId
    });
  }
  return api_request.request.get("/api/review/single", {
    orderNo: params.orderNo
  });
}
function replyReview(id, data) {
  return api_request.request.post(`/api/review/${id}/reply`, data);
}
exports.createReview = createReview;
exports.getChefReviewList = getChefReviewList;
exports.getMyReviewList = getMyReviewList;
exports.getSingleReview = getSingleReview;
exports.replyReview = replyReview;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/review.js.map

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
exports.createReview = createReview;
exports.getChefReviewList = getChefReviewList;
exports.getMyReviewList = getMyReviewList;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/review.js.map

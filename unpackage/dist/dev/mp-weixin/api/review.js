"use strict";
const api_request = require("./request.js");
function getChefReviewList(chefId) {
  return api_request.request.get(`/api/review/chef/${chefId}`);
}
exports.getChefReviewList = getChefReviewList;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/review.js.map

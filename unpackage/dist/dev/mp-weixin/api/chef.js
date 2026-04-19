"use strict";
const api_request = require("./request.js");
function recommendChefs(data) {
  return api_request.request.post("/api/chef/recommend", data);
}
function getDefaultRecommendChefs(params) {
  return api_request.request.get("/api/chef/recommend/default", params);
}
function getChefDetail(id) {
  return api_request.request.get(`/api/chef/${id}`);
}
function getChefSchedule(chefId, params) {
  return api_request.request.get(`/api/chef/${chefId}/schedule`, params);
}
exports.getChefDetail = getChefDetail;
exports.getChefSchedule = getChefSchedule;
exports.getDefaultRecommendChefs = getDefaultRecommendChefs;
exports.recommendChefs = recommendChefs;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chef.js.map

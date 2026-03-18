"use strict";
const api_request = require("./request.js");
function getChefList(params) {
  return api_request.request.get("/api/chef/list", params);
}
function getChefDetail(id) {
  return api_request.request.get(`/api/chef/${id}`);
}
function getChefSchedule(chefId, params) {
  return api_request.request.get(`/api/chef/${chefId}/schedule`, params);
}
exports.getChefDetail = getChefDetail;
exports.getChefList = getChefList;
exports.getChefSchedule = getChefSchedule;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chef.js.map

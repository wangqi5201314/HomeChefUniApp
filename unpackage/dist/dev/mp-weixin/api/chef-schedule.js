"use strict";
const api_request = require("./request.js");
function getMyChefSchedule(params) {
  return api_request.request.get("/api/chef/schedule/my", params);
}
function createChefSchedule(data) {
  return api_request.request.post("/api/chef/schedule", data);
}
function updateChefSchedule(id, data) {
  return api_request.request.put(`/api/chef/schedule/${id}`, data);
}
function deleteChefSchedule(id) {
  return api_request.request.del(`/api/chef/schedule/${id}`);
}
function updateChefScheduleAvailability(id, data) {
  return api_request.request.post(`/api/chef/schedule/${id}/availability`, data);
}
exports.createChefSchedule = createChefSchedule;
exports.deleteChefSchedule = deleteChefSchedule;
exports.getMyChefSchedule = getMyChefSchedule;
exports.updateChefSchedule = updateChefSchedule;
exports.updateChefScheduleAvailability = updateChefScheduleAvailability;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chef-schedule.js.map

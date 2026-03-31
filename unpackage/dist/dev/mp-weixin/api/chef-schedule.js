"use strict";
const common_vendor = require("../common/vendor.js");
const api_request = require("./request.js");
const utils_config = require("../utils/config.js");
const utils_auth = require("../utils/auth.js");
function getMyChefSchedule(params) {
  return api_request.request.get("/api/chef/schedule/my", params);
}
function getMySchedule(params) {
  return getMyChefSchedule(params);
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
function disableExpiredChefSchedule() {
  return api_request.request.post("/api/chef/schedule/disable-expired");
}
function disableExpiredChefScheduleByChefSilently(chefId) {
  return new Promise((resolve) => {
    if (!chefId) {
      resolve(null);
      return;
    }
    const token = utils_auth.getToken();
    const header = {
      "Content-Type": "application/json"
    };
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }
    common_vendor.index.request({
      url: `${utils_config.BASE_URL}/api/chef/${chefId}/schedule/disable-expired`,
      method: "POST",
      header,
      success: (response) => {
        const data = response && response.data ? response.data : null;
        if (response && response.statusCode >= 200 && response.statusCode < 300 && data && Number(data.code) === 200) {
          resolve(data.data || null);
          return;
        }
        resolve(null);
      },
      fail: () => {
        resolve(null);
      }
    });
  });
}
exports.createChefSchedule = createChefSchedule;
exports.deleteChefSchedule = deleteChefSchedule;
exports.disableExpiredChefSchedule = disableExpiredChefSchedule;
exports.disableExpiredChefScheduleByChefSilently = disableExpiredChefScheduleByChefSilently;
exports.getMyChefSchedule = getMyChefSchedule;
exports.getMySchedule = getMySchedule;
exports.updateChefSchedule = updateChefSchedule;
exports.updateChefScheduleAvailability = updateChefScheduleAvailability;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chef-schedule.js.map

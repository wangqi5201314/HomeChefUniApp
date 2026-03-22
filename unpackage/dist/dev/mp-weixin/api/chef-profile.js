"use strict";
const api_request = require("./request.js");
function getCurrentChefProfile() {
  return api_request.request.get("/api/chef/me");
}
function updateCurrentChefProfile(data) {
  return api_request.request.put("/api/chef/me", data);
}
function changeChefPassword(data) {
  return api_request.request.put("/api/chef/password", data);
}
exports.changeChefPassword = changeChefPassword;
exports.getCurrentChefProfile = getCurrentChefProfile;
exports.updateCurrentChefProfile = updateCurrentChefProfile;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chef-profile.js.map

"use strict";
const api_request = require("./request.js");
function loginUser(data) {
  return api_request.request.post("/api/user/login", data);
}
function getCurrentUserInfo() {
  return api_request.request.get("/api/user/me");
}
function updateCurrentUserInfo(data) {
  return api_request.request.put("/api/user/me", data);
}
exports.getCurrentUserInfo = getCurrentUserInfo;
exports.loginUser = loginUser;
exports.updateCurrentUserInfo = updateCurrentUserInfo;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map

"use strict";
const api_request = require("./request.js");
function chefLogin(data) {
  return api_request.request.post("/api/chef/login", data);
}
function getCurrentChefInfo() {
  return api_request.request.get("/api/chef/me");
}
exports.chefLogin = chefLogin;
exports.getCurrentChefInfo = getCurrentChefInfo;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chef-auth.js.map

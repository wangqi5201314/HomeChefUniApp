"use strict";
const api_request = require("./request.js");
function login(data) {
  return api_request.request.post("/api/user/login", data);
}
function wechatLogin(data) {
  return api_request.request.post("/api/user/login/wechat", data);
}
function register(data) {
  return api_request.request.post("/api/user/register", data);
}
function getUserInfo() {
  return api_request.request.get("/api/user/me");
}
function updateUserInfo(data) {
  return api_request.request.put("/api/user/me", data);
}
function changePassword(data) {
  return api_request.request.put("/api/user/password", data);
}
const getCurrentUserInfo = getUserInfo;
const updateCurrentUserInfo = updateUserInfo;
exports.changePassword = changePassword;
exports.getCurrentUserInfo = getCurrentUserInfo;
exports.getUserInfo = getUserInfo;
exports.login = login;
exports.register = register;
exports.updateCurrentUserInfo = updateCurrentUserInfo;
exports.wechatLogin = wechatLogin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map

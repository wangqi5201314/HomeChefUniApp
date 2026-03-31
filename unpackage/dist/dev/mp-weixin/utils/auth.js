"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("./config.js");
const USER_ID_KEY = "user_id";
const USER_TYPE_KEY = "user_type";
const ADMIN_ID_KEY = "admin_id";
const CHEF_ID_KEY = "chef_id";
const CHEF_INFO_KEY = "chef_info";
const AI_CHAT_HISTORY_KEY = "xiaojia_ai_chat_history";
const CHEF_AI_CHAT_HISTORY_KEY = "chef_xiaojia_ai_chat_history";
function getToken() {
  return common_vendor.index.getStorageSync(utils_config.TOKEN_KEY) || "";
}
function setToken(token) {
  common_vendor.index.setStorageSync(utils_config.TOKEN_KEY, token || "");
}
function removeToken() {
  common_vendor.index.removeStorageSync(utils_config.TOKEN_KEY);
}
function getUserInfo() {
  return common_vendor.index.getStorageSync(utils_config.USER_INFO_KEY) || null;
}
function setUserInfo(userInfo) {
  common_vendor.index.setStorageSync(utils_config.USER_INFO_KEY, userInfo || null);
}
function removeUserInfo() {
  common_vendor.index.removeStorageSync(utils_config.USER_INFO_KEY);
}
function setUserId(userId) {
  common_vendor.index.setStorageSync(USER_ID_KEY, userId || "");
}
function removeUserId() {
  common_vendor.index.removeStorageSync(USER_ID_KEY);
}
function setUserType(userType) {
  common_vendor.index.setStorageSync(USER_TYPE_KEY, userType || "");
}
function removeUserType() {
  common_vendor.index.removeStorageSync(USER_TYPE_KEY);
}
function setAdminId(adminId) {
  common_vendor.index.setStorageSync(ADMIN_ID_KEY, adminId || 0);
}
function removeAdminId() {
  common_vendor.index.removeStorageSync(ADMIN_ID_KEY);
}
function getChefId() {
  return common_vendor.index.getStorageSync(CHEF_ID_KEY) || "";
}
function setChefId(chefId) {
  common_vendor.index.setStorageSync(CHEF_ID_KEY, chefId || "");
}
function removeChefId() {
  common_vendor.index.removeStorageSync(CHEF_ID_KEY);
}
function getChefInfo() {
  return common_vendor.index.getStorageSync(CHEF_INFO_KEY) || null;
}
function setChefInfo(chefInfo) {
  common_vendor.index.setStorageSync(CHEF_INFO_KEY, chefInfo || null);
}
function removeChefInfo() {
  common_vendor.index.removeStorageSync(CHEF_INFO_KEY);
}
function removeAiChatHistory() {
  common_vendor.index.removeStorageSync(AI_CHAT_HISTORY_KEY);
}
function removeChefAiChatHistory() {
  common_vendor.index.removeStorageSync(CHEF_AI_CHAT_HISTORY_KEY);
}
function clearAuth() {
  removeToken();
  removeUserInfo();
  removeUserId();
  removeUserType();
  removeAdminId();
  removeChefId();
  removeChefInfo();
  removeAiChatHistory();
  removeChefAiChatHistory();
}
exports.AI_CHAT_HISTORY_KEY = AI_CHAT_HISTORY_KEY;
exports.CHEF_AI_CHAT_HISTORY_KEY = CHEF_AI_CHAT_HISTORY_KEY;
exports.clearAuth = clearAuth;
exports.getChefId = getChefId;
exports.getChefInfo = getChefInfo;
exports.getToken = getToken;
exports.getUserInfo = getUserInfo;
exports.setAdminId = setAdminId;
exports.setChefId = setChefId;
exports.setChefInfo = setChefInfo;
exports.setToken = setToken;
exports.setUserId = setUserId;
exports.setUserInfo = setUserInfo;
exports.setUserType = setUserType;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/auth.js.map

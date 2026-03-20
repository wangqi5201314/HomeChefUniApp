import { TOKEN_KEY, USER_INFO_KEY } from './config'

export const USER_ID_KEY = 'user_id'
export const USER_TYPE_KEY = 'user_type'
export const ADMIN_ID_KEY = 'admin_id'

export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token) {
  uni.setStorageSync(TOKEN_KEY, token || '')
}

export function removeToken() {
  uni.removeStorageSync(TOKEN_KEY)
}

export function getUserInfo() {
  return uni.getStorageSync(USER_INFO_KEY) || null
}

export function setUserInfo(userInfo) {
  uni.setStorageSync(USER_INFO_KEY, userInfo || null)
}

export function removeUserInfo() {
  uni.removeStorageSync(USER_INFO_KEY)
}

export function getUserId() {
  return uni.getStorageSync(USER_ID_KEY) || ''
}

export function setUserId(userId) {
  uni.setStorageSync(USER_ID_KEY, userId || '')
}

export function removeUserId() {
  uni.removeStorageSync(USER_ID_KEY)
}

export function getUserType() {
  return uni.getStorageSync(USER_TYPE_KEY) || ''
}

export function setUserType(userType) {
  uni.setStorageSync(USER_TYPE_KEY, userType || '')
}

export function removeUserType() {
  uni.removeStorageSync(USER_TYPE_KEY)
}

export function getAdminId() {
  return uni.getStorageSync(ADMIN_ID_KEY) || 0
}

export function setAdminId(adminId) {
  uni.setStorageSync(ADMIN_ID_KEY, adminId || 0)
}

export function removeAdminId() {
  uni.removeStorageSync(ADMIN_ID_KEY)
}

export function clearAuth() {
  removeToken()
  removeUserInfo()
  removeUserId()
  removeUserType()
  removeAdminId()
}

export default {
  getToken,
  setToken,
  removeToken,
  getUserInfo,
  setUserInfo,
  removeUserInfo,
  getUserId,
  setUserId,
  removeUserId,
  getUserType,
  setUserType,
  removeUserType,
  getAdminId,
  setAdminId,
  removeAdminId,
  clearAuth
}

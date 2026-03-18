import { TOKEN_KEY, USER_INFO_KEY } from './config'

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

export function clearAuth() {
  removeToken()
  removeUserInfo()
}

export default {
  getToken,
  setToken,
  removeToken,
  getUserInfo,
  setUserInfo,
  removeUserInfo,
  clearAuth
}

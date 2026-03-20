import request from './request'

export function login(data) {
  return request.post('/api/user/login', data)
}

export function register(data) {
  return request.post('/api/user/register', data)
}

export function getUserInfo() {
  return request.get('/api/user/me')
}

export function updateUserInfo(data) {
  return request.put('/api/user/me', data)
}

export function changePassword(data) {
  return request.put('/api/user/password', data)
}

// Backward-compatible aliases for existing pages.
export const loginUser = login
export const getCurrentUserInfo = getUserInfo
export const updateCurrentUserInfo = updateUserInfo

export default {
  login,
  register,
  getUserInfo,
  updateUserInfo,
  changePassword,
  loginUser,
  getCurrentUserInfo,
  updateCurrentUserInfo
}

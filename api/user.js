import request from './request'

export function loginUser(data) {
  return request.post('/api/user/login', data)
}

export function getCurrentUserInfo() {
  return request.get('/api/user/me')
}

export function updateCurrentUserInfo(data) {
  return request.put('/api/user/me', data)
}

export default {
  loginUser,
  getCurrentUserInfo,
  updateCurrentUserInfo
}

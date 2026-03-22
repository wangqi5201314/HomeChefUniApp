import request from './request'

export function getCurrentChefProfile() {
  return request.get('/api/chef/me')
}

export function updateCurrentChefProfile(data) {
  return request.put('/api/chef/me', data)
}

export function changeChefPassword(data) {
  return request.put('/api/chef/password', data)
}

export default {
  getCurrentChefProfile,
  updateCurrentChefProfile,
  changeChefPassword
}

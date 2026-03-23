import request from './request'

export function chefLogin(data) {
  return request.post('/api/chef/login', data)
}

export function chefRegister(data) {
  return request.post('/api/chef/register', data)
}

export function getCurrentChefInfo() {
  return request.get('/api/chef/me')
}

export default {
  chefLogin,
  chefRegister,
  getCurrentChefInfo
}

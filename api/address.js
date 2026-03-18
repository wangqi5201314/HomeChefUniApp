import request from './request'

export function getUserAddressList(params) {
  return request.get('/api/user/address/list', params)
}

export function getDefaultUserAddress(params) {
  return request.get('/api/user/address/default', params)
}

export function getAddressDetail(id) {
  return request.get(`/api/user/address/${id}`)
}

export function createAddress(data) {
  return request.post('/api/user/address', data)
}

export function updateAddress(id, data) {
  return request.put(`/api/user/address/${id}`, data)
}

export function deleteAddress(id) {
  return request.del(`/api/user/address/${id}`)
}

export function setDefaultAddress(id, data) {
  return request.post(`/api/user/address/${id}/default`, data)
}

export default {
  getUserAddressList,
  getDefaultUserAddress,
  getAddressDetail,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
}

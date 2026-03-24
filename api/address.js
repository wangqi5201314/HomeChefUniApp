import request from './request'

function normalizeAddressPayload(data = {}) {
  const payload = {
    userId: data.userId === 0 || data.userId ? Number(data.userId) : undefined,
    contactName: data.contactName ? String(data.contactName).trim() : '',
    contactPhone: data.contactPhone ? String(data.contactPhone).trim() : '',
    province: data.province ? String(data.province).trim() : '',
    city: data.city ? String(data.city).trim() : '',
    district: data.district ? String(data.district).trim() : '',
    town: data.town ? String(data.town).trim() : '',
    detailAddress: data.detailAddress ? String(data.detailAddress).trim() : '',
    longitude:
      data.longitude === '' || data.longitude === undefined || data.longitude === null
        ? 0
        : Number(data.longitude),
    latitude:
      data.latitude === '' || data.latitude === undefined || data.latitude === null
        ? 0
        : Number(data.latitude),
    isDefault: Number(data.isDefault) === 1 ? 1 : 0
  }

  if (typeof payload.userId === 'undefined') {
    delete payload.userId
  }

  return payload
}

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
  return request.post('/api/user/address', normalizeAddressPayload(data))
}

export function updateAddress(id, data) {
  return request.put(`/api/user/address/${id}`, normalizeAddressPayload(data))
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

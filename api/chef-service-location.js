import request from './request'

function normalizeServiceLocationPayload(data = {}) {
  return {
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
        : Number(data.latitude)
  }
}

export function getChefServiceLocation() {
  return request.get('/api/chef/service-location/me')
}

export function saveChefServiceLocation(data) {
  return request.post('/api/chef/service-location/me', normalizeServiceLocationPayload(data))
}

export default {
  getChefServiceLocation,
  saveChefServiceLocation
}

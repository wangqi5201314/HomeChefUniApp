import request from './request'

function normalizeServiceLocationPayload(data = {}) {
  return {
    locationName: data.locationName ? String(data.locationName).trim() : '',
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

export function getChefServiceLocationList() {
  return request.get('/api/chef/service-location/list')
}

export function getChefServiceLocationDetail(id) {
  return request.get(`/api/chef/service-location/${id}`)
}

export function createChefServiceLocation(data) {
  return request.post('/api/chef/service-location', normalizeServiceLocationPayload(data))
}

export function updateChefServiceLocation(id, data) {
  return request.put(`/api/chef/service-location/${id}`, normalizeServiceLocationPayload(data))
}

export function deleteChefServiceLocation(id) {
  return request.del(`/api/chef/service-location/${id}`)
}

export function activateChefServiceLocation(id) {
  return request.post(`/api/chef/service-location/${id}/activate`)
}

export default {
  getChefServiceLocationList,
  getChefServiceLocationDetail,
  createChefServiceLocation,
  updateChefServiceLocation,
  deleteChefServiceLocation,
  activateChefServiceLocation
}

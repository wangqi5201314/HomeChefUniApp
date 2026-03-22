import request from './request'

export function getChefOrderList(params) {
  return request.get('/api/chef/order/list', params)
}

export function getChefOrderDetail(id) {
  return request.get(`/api/chef/order/${id}`)
}

export function acceptChefOrder(id) {
  return request.post(`/api/chef/order/${id}/accept`)
}

export function rejectChefOrder(id, data) {
  return request.post(`/api/chef/order/${id}/reject`, data)
}

export function startChefOrder(id) {
  return request.post(`/api/chef/order/${id}/start`)
}

export function finishChefOrder(id) {
  return request.post(`/api/chef/order/${id}/finish`)
}

export default {
  getChefOrderList,
  getChefOrderDetail,
  acceptChefOrder,
  rejectChefOrder,
  startChefOrder,
  finishChefOrder
}

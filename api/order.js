import request from './request'

export function createOrder(data) {
  return request.post('/api/order/create', data)
}

export function getOrderDetail(id) {
  return request.get(`/api/order/${id}`)
}

export function getOrderList(params) {
  return request.get('/api/order/list', params)
}

export function cancelOrder(id, data) {
  return request.post(`/api/order/${id}/cancel`, data)
}

export default {
  createOrder,
  getOrderDetail,
  getOrderList,
  cancelOrder
}

import request from './request'

export function createPayment(data) {
  return request.post('/api/pay/create', data)
}

export function getPaymentStatus(orderId) {
  return request.get(`/api/pay/status/${orderId}`)
}

export function mockPaymentSuccess(orderId) {
  return request.post(`/api/pay/mock-success/${orderId}`)
}

export function refundPayment(data) {
  return request.post('/api/pay/refund', data)
}

export default {
  createPayment,
  getPaymentStatus,
  mockPaymentSuccess,
  refundPayment
}

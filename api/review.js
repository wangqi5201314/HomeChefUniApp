import request from './request'

export function createReview(data) {
  return request.post('/api/review/create', data)
}

export function getUserReviewList(userId) {
  return request.get(`/api/review/user/${userId}`)
}

export function getMyReviewList(userId) {
  return getUserReviewList(userId)
}

export function getChefReviewList(chefId) {
  return request.get(`/api/review/chef/${chefId}`)
}

export function getSingleReview(params = {}) {
  const hasOrderId = params.orderId === 0 || Boolean(params.orderId)
  const hasOrderNo = Boolean(params.orderNo)

  if ((hasOrderId && hasOrderNo) || (!hasOrderId && !hasOrderNo)) {
    return Promise.reject(new Error('orderId 和 orderNo 必须二选一'))
  }

  if (hasOrderId) {
    return request.get('/api/review/single', {
      orderId: params.orderId
    })
  }

  return request.get('/api/review/single', {
    orderNo: params.orderNo
  })
}

export function replyReview(id, data) {
  return request.post(`/api/review/${id}/reply`, data)
}

export default {
  createReview,
  getUserReviewList,
  getMyReviewList,
  getChefReviewList,
  getSingleReview,
  replyReview
}

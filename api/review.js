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

export function replyReview(id, data) {
  return request.post(`/api/review/${id}/reply`, data)
}

export default {
  createReview,
  getUserReviewList,
  getMyReviewList,
  getChefReviewList,
  replyReview
}

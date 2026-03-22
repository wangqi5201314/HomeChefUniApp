import request from './request'

export function getMyChefSchedule(params) {
  return request.get('/api/chef/schedule/my', params)
}

export function createChefSchedule(data) {
  return request.post('/api/chef/schedule', data)
}

export function updateChefSchedule(id, data) {
  return request.put(`/api/chef/schedule/${id}`, data)
}

export function deleteChefSchedule(id) {
  return request.del(`/api/chef/schedule/${id}`)
}

export function updateChefScheduleAvailability(id, data) {
  return request.post(`/api/chef/schedule/${id}/availability`, data)
}

export default {
  getMyChefSchedule,
  createChefSchedule,
  updateChefSchedule,
  deleteChefSchedule,
  updateChefScheduleAvailability
}

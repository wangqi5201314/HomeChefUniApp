import request from './request'
import { BASE_URL } from '../utils/config'
import { getToken } from '../utils/auth'

export function getMyChefSchedule(params) {
  return request.get('/api/chef/schedule/my', params)
}

export function getMySchedule(params) {
  return getMyChefSchedule(params)
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

export function disableExpiredChefSchedule() {
  return request.post('/api/chef/schedule/disable-expired')
}

export function disableExpiredChefScheduleByChefSilently(chefId) {
  return new Promise((resolve) => {
    if (!chefId) {
      resolve(null)
      return
    }

    const token = getToken()
    const header = {
      'Content-Type': 'application/json'
    }

    if (token) {
      header.Authorization = `Bearer ${token}`
    }

    uni.request({
      url: `${BASE_URL}/api/chef/${chefId}/schedule/disable-expired`,
      method: 'POST',
      header,
      success: (response) => {
        const data = response && response.data ? response.data : null

        if (
          response &&
          response.statusCode >= 200 &&
          response.statusCode < 300 &&
          data &&
          Number(data.code) === 200
        ) {
          resolve(data.data || null)
          return
        }

        resolve(null)
      },
      fail: () => {
        resolve(null)
      }
    })
  })
}

export default {
  getMySchedule,
  getMyChefSchedule,
  createChefSchedule,
  updateChefSchedule,
  deleteChefSchedule,
  updateChefScheduleAvailability,
  disableExpiredChefSchedule,
  disableExpiredChefScheduleByChefSilently
}

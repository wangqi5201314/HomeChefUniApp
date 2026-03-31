import request from './request'

export function getChefList(params) {
  return request.get('/api/chef/list', params)
}

export function recommendChefs(data) {
  return request.post('/api/chef/recommend', data)
}

export function getChefDetail(id) {
  return request.get(`/api/chef/${id}`)
}

export function getChefSchedule(chefId, params) {
  return request.get(`/api/chef/${chefId}/schedule`, params)
}

export default {
  getChefList,
  recommendChefs,
  getChefDetail,
  getChefSchedule
}

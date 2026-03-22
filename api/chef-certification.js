import request from './request'

export function getChefCertification() {
  return request.get('/api/chef/certification/me')
}

export function submitChefCertification(data) {
  return request.post('/api/chef/certification/submit', data)
}

export default {
  getChefCertification,
  submitChefCertification
}

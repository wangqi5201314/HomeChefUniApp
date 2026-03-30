import request from './request'
import { BASE_URL } from '../utils/config'
import { clearAuth, getToken } from '../utils/auth'

const CHEF_LOGIN_PAGE = '/pages-chef/login/index'

function redirectToChefLogin(message) {
  clearAuth()

  uni.showToast({
    title: message || '登录已失效',
    icon: 'none'
  })

  uni.reLaunch({
    url: CHEF_LOGIN_PAGE
  })
}

export function getChefCertification() {
  const token = getToken()

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/chef/certification/me`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      success: (response) => {
        const { statusCode, data } = response
        const code = data && typeof data.code !== 'undefined' ? Number(data.code) : null
        const message = data && data.message ? data.message : '请求失败'

        if (statusCode === 401 || code === 401) {
          redirectToChefLogin(message)
          reject(data || response)
          return
        }

        if (statusCode >= 200 && statusCode < 300 && code === 200) {
          resolve(data.data || null)
          return
        }

        if (statusCode >= 200 && statusCode < 300 && code === 404) {
          resolve(null)
          return
        }

        uni.showToast({
          title: message,
          icon: 'none'
        })
        reject(data || response)
      },
      fail: (error) => {
        uni.showToast({
          title: '网络异常',
          icon: 'none'
        })
        reject(error)
      }
    })
  })
}

export function submitChefCertification(data) {
  return request.post('/api/chef/certification/submit', data)
}

export default {
  getChefCertification,
  submitChefCertification
}

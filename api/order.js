import request from './request'
import { LOGIN_PAGE, BASE_URL } from '../utils/config'
import { clearAuth, getToken } from '../utils/auth'
import { normalizeToastMessage } from '../utils/toast-message'

function redirectToLogin(message) {
  clearAuth()

  uni.showToast({
    title: normalizeToastMessage(message) || '登录已失效',
    icon: 'none'
  })

  uni.reLaunch({
    url: LOGIN_PAGE
  })
}

export function createOrder(data) {
  const token = getToken()

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/order/create`,
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      success: (response) => {
        const { statusCode, data: responseData } = response
        const code = responseData && typeof responseData.code !== 'undefined' ? Number(responseData.code) : null
        const message = responseData && responseData.message ? responseData.message : '请求失败'

        if (statusCode === 401 || code === 401) {
          redirectToLogin(message)
          reject(responseData || response)
          return
        }

        if (statusCode >= 200 && statusCode < 300 && code === 200) {
          resolve(responseData.data)
          return
        }

        reject(responseData || { message })
      },
      fail: (error) => {
        reject({
          message: normalizeToastMessage('网络异常'),
          raw: error
        })
      }
    })
  })
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

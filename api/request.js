import { BASE_URL, LOGIN_PAGE } from '../utils/config'
import { clearAuth, getToken } from '../utils/auth'

let redirectingToLogin = false

function buildUrl(url) {
  if (/^https?:\/\//.test(url)) {
    return url
  }
  return `${BASE_URL}${url}`
}

function buildHeader(customHeader = {}) {
  const token = getToken()
  const header = {
    'Content-Type': 'application/json',
    ...customHeader
  }

  if (token) {
    header.Authorization = `Bearer ${token}`
  }

  return header
}

function showToast(message) {
  uni.showToast({
    title: message || '请求失败',
    icon: 'none'
  })
}

function redirectToLogin(message) {
  clearAuth()
  showToast(message || '登录已失效')

  if (redirectingToLogin) {
    return
  }

  redirectingToLogin = true

  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const currentRoute = currentPage ? `/${currentPage.route}` : ''

  if (currentRoute !== LOGIN_PAGE) {
    uni.reLaunch({
      url: LOGIN_PAGE
    })
  }

  setTimeout(() => {
    redirectingToLogin = false
  }, 300)
}

function handleResponse(response, resolve, reject) {
  const { statusCode, data } = response
  const code = data && typeof data.code !== 'undefined' ? data.code : null
  const message = data && data.message ? data.message : '请求失败'

  if (statusCode === 401 || code === 401) {
    redirectToLogin(message)
    reject(data || response)
    return
  }

  if (statusCode < 200 || statusCode >= 300) {
    showToast(message || `请求失败(${statusCode})`)
    reject(data || response)
    return
  }

  if (!data || typeof code === 'undefined') {
    showToast('返回数据格式错误')
    reject(data || response)
    return
  }

  if (code === 200) {
    resolve(data.data)
    return
  }

  showToast(message)
  reject(data)
}

export function request(options = {}) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {}
  } = options

  return new Promise((resolve, reject) => {
    uni.request({
      url: buildUrl(url),
      method,
      data,
      header: buildHeader(header),
      success: (response) => {
        handleResponse(response, resolve, reject)
      },
      fail: (error) => {
        showToast('网络异常，请稍后重试')
        reject(error)
      }
    })
  })
}

request.get = function(url, data = {}, header = {}) {
  return request({
    url,
    method: 'GET',
    data,
    header
  })
}

request.post = function(url, data = {}, header = {}) {
  return request({
    url,
    method: 'POST',
    data,
    header
  })
}

request.put = function(url, data = {}, header = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    header
  })
}

request.del = function(url, data = {}, header = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    header
  })
}

export default request

import { BASE_URL } from '../utils/config'
import { clearAuth, getToken } from '../utils/auth'

let redirectingToLogin = false

function showToast(message) {
  uni.showToast({
    title: message || '上传失败',
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

  uni.reLaunch({
    url: '/pages/login/index'
  })

  setTimeout(() => {
    redirectingToLogin = false
  }, 300)
}

export function uploadImage(filePath) {
  const token = getToken()

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${BASE_URL}/api/upload/image`,
      filePath,
      name: 'file',
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (response) => {
        let result = null

        try {
          result = JSON.parse(response.data)
        } catch (error) {
          showToast('返回数据格式错误')
          reject(error)
          return
        }

        if (response.statusCode === 401 || result.code === 401) {
          redirectToLogin(result.message)
          reject(result)
          return
        }

        if (response.statusCode < 200 || response.statusCode >= 300) {
          showToast(result.message || `上传失败(${response.statusCode})`)
          reject(result)
          return
        }

        if (result.code === 200) {
          resolve(result.data)
          return
        }

        showToast(result.message || '上传失败')
        reject(result)
      },
      fail: (error) => {
        showToast('网络异常，请稍后重试')
        reject(error)
      }
    })
  })
}

export default {
  uploadImage
}

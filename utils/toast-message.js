const DIRECT_MESSAGE_MAP = {
  success: '成功',
  failed: '失败',
  failure: '失败',
  'request failed': '请求失败',
  'network error': '网络异常',
  'network exception': '网络异常',
  'response data error': '响应数据异常',
  'response data exception': '响应数据异常',
  'login expired': '登录已失效',
  'upload failed': '上传失败',
  'certification not found': '未找到认证资料',
  'address not found': '未找到服务地址',
  'default address not found': '未找到默认服务地址',
  'chef not found': '未找到厨师',
  'order not found': '未找到订单'
}

function replaceInsensitive(text, pattern, replacement) {
  return text.replace(pattern, replacement)
}

export function normalizeToastMessage(message) {
  const rawText = message ? String(message).trim() : ''

  if (!rawText) {
    return ''
  }

  const normalizedKey = rawText.toLowerCase()

  if (DIRECT_MESSAGE_MAP[normalizedKey]) {
    return DIRECT_MESSAGE_MAP[normalizedKey]
  }

  let text = rawText

  text = replaceInsensitive(text, /network error/gi, '网络异常')
  text = replaceInsensitive(text, /network exception/gi, '网络异常')
  text = replaceInsensitive(text, /request failed/gi, '请求失败')
  text = replaceInsensitive(text, /response data error/gi, '响应数据异常')
  text = replaceInsensitive(text, /response data exception/gi, '响应数据异常')
  text = replaceInsensitive(text, /upload failed/gi, '上传失败')
  text = replaceInsensitive(text, /login expired/gi, '登录已失效')
  text = replaceInsensitive(text, /address not found/gi, '未找到服务地址')
  text = replaceInsensitive(text, /default address not found/gi, '未找到默认服务地址')
  text = replaceInsensitive(text, /chef not found/gi, '未找到厨师')
  text = replaceInsensitive(text, /order not found/gi, '未找到订单')
  text = replaceInsensitive(text, /success/gi, '成功')
  text = replaceInsensitive(text, /failed/gi, '失败')
  text = replaceInsensitive(text, /failure/gi, '失败')

  return text
}

export default {
  normalizeToastMessage
}

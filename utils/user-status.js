export const userStatusMap = {
  0: '禁用',
  1: '正常'
}

export function getUserStatusText(status) {
  return userStatusMap[Number(status)] || '未知状态'
}

export default {
  userStatusMap,
  getUserStatusText
}

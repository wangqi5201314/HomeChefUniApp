export const chefStatusMap = {
  0: '停用',
  1: '正常'
}

export function getChefStatusText(status) {
  return chefStatusMap[Number(status)] || '未知状态'
}

export default {
  chefStatusMap,
  getChefStatusText
}

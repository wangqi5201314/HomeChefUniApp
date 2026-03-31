export const certStatusMap = {
  0: '待审核',
  1: '已通过',
  2: '已拒绝',
  3: '待上传'
}

export function getChefCertStatusText(status) {
  return certStatusMap[Number(status)] || '未知状态'
}

export default {
  certStatusMap,
  getChefCertStatusText
}

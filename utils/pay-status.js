export const payStatusMap = {
  UNPAID: '未支付',
  PAID: '已支付'
}

export function getPayStatusText(payStatus) {
  return payStatusMap[payStatus] || '未知状态'
}

export default {
  payStatusMap,
  getPayStatusText
}

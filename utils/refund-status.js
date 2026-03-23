export const refundStatusMap = {
  NONE: '无退款',
  REFUNDED: '已退款'
}

export function getRefundStatusText(refundStatus) {
  return refundStatusMap[refundStatus] || '未知状态'
}

export default {
  refundStatusMap,
  getRefundStatusText
}

export const ORDER_STATUS = {
  PENDING_CONFIRM: 'PENDING_CONFIRM',
  REJECTED: 'REJECTED',
  WAIT_PAY: 'WAIT_PAY',
  PAID: 'PAID',
  IN_SERVICE: 'IN_SERVICE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
}

export const ORDER_STATUS_LABEL_MAP = {
  [ORDER_STATUS.PENDING_CONFIRM]: '待厨师确认',
  [ORDER_STATUS.REJECTED]: '已拒单',
  [ORDER_STATUS.WAIT_PAY]: '待支付',
  [ORDER_STATUS.PAID]: '已支付',
  [ORDER_STATUS.IN_SERVICE]: '服务中',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REFUNDED]: '已退款'
}

export const USER_ORDER_STATUS_TABS = [
  { label: '全部', value: '' },
  { label: '待厨师确认', value: ORDER_STATUS.PENDING_CONFIRM },
  { label: '待支付', value: ORDER_STATUS.WAIT_PAY },
  { label: '已支付', value: ORDER_STATUS.PAID },
  { label: '服务中', value: ORDER_STATUS.IN_SERVICE },
  { label: '已完成', value: ORDER_STATUS.COMPLETED },
  { label: '厨师已拒单', value: ORDER_STATUS.REJECTED },
  { label: '已取消', value: ORDER_STATUS.CANCELLED },
  { label: '已退款', value: ORDER_STATUS.REFUNDED }
]

export const CHEF_ORDER_STATUS_TABS = [
  { label: '全部', value: '' },
  { label: '待厨师确认', value: ORDER_STATUS.PENDING_CONFIRM },
  { label: '待支付', value: ORDER_STATUS.WAIT_PAY },
  { label: '已支付', value: ORDER_STATUS.PAID },
  { label: '服务中', value: ORDER_STATUS.IN_SERVICE },
  { label: '已完成', value: ORDER_STATUS.COMPLETED },
  { label: '厨师已拒单', value: ORDER_STATUS.REJECTED },
  { label: '已取消', value: ORDER_STATUS.CANCELLED },
  { label: '已退款', value: ORDER_STATUS.REFUNDED }
]

export function getOrderStatusLabel(status) {
  return ORDER_STATUS_LABEL_MAP[status] || status || '-'
}

export function getOrderStatusClass(status) {
  if (status === ORDER_STATUS.PENDING_CONFIRM || status === ORDER_STATUS.WAIT_PAY) {
    return 'pending'
  }

  if (status === ORDER_STATUS.PAID || status === ORDER_STATUS.IN_SERVICE || status === ORDER_STATUS.COMPLETED) {
    return 'success'
  }

  if (status === ORDER_STATUS.REJECTED || status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.REFUNDED) {
    return 'danger'
  }

  return ''
}

export default {
  ORDER_STATUS,
  ORDER_STATUS_LABEL_MAP,
  USER_ORDER_STATUS_TABS,
  CHEF_ORDER_STATUS_TABS,
  getOrderStatusLabel,
  getOrderStatusClass
}

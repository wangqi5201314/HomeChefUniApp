export const SORT_OPTIONS = [
  { label: '综合推荐', value: 'DEFAULT' },
  { label: '距离近优先', value: 'DISTANCE' },
  { label: '评分高优先', value: 'RATING' },
  { label: '订单量高优先', value: 'ORDER_COUNT' },
  { label: '好评率高优先', value: 'GOOD_REVIEW_RATE' }
]

export function getSortTypeText(sortType) {
  const matched = SORT_OPTIONS.find((item) => item.value === sortType)
  return matched ? matched.label : '综合推荐'
}

export default {
  SORT_OPTIONS,
  getSortTypeText
}

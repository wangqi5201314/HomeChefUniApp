<template>
  <view class="page">
    <scroll-view class="tabs-wrap" scroll-x enable-flex>
      <view class="tabs">
        <view
          v-for="item in statusTabs"
          :key="item.value"
          class="tab-item"
          :class="{ active: activeStatus === item.value }"
          @click="changeStatus(item.value)"
        >
          <text class="tab-text">{{ item.label }}</text>
        </view>
      </view>
    </scroll-view>

    <view v-if="loading" class="state-card">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else-if="orderList.length === 0" class="state-card">
      <text class="state-text">暂无订单数据</text>
    </view>

    <view v-else class="list">
      <view
        v-for="item in orderList"
        :key="item.id"
        class="order-card"
        :class="getOrderCardClass(item.orderStatus)"
        @click="goDetail(item.id)"
      >
        <view class="card-head">
          <view class="head-main">
            <text class="order-no">订单号：{{ item.orderNo || '-' }}</text>
            <view class="service-meta">
              <text class="meta-chip">{{ item.serviceDate || '-' }}</text>
              <text class="meta-chip">{{ getTimeSlotText(item.timeSlot) }}</text>
            </view>
          </view>
          <view class="head-side">
            <text class="status-tag" :class="getStatusClass(item.orderStatus)">
              {{ getStatusLabel(item.orderStatus) }}
            </text>
            <text class="amount-label">实付金额</text>
            <text class="amount-value">￥{{ formatAmount(item.payAmount) }}</text>
          </view>
        </view>

        <view class="summary-panel">
          <view class="summary-row">
            <text class="summary-label">联系人</text>
            <text class="summary-value">{{ item.contactName || '-' }}</text>
          </view>
          <view class="summary-row">
            <text class="summary-label">联系电话</text>
            <text class="summary-value">{{ item.contactPhone || '-' }}</text>
          </view>
          <view class="summary-row address-row">
            <text class="summary-label">服务地址</text>
            <text class="summary-address">{{ item.fullAddress || '-' }}</text>
          </view>
          <view class="summary-row">
            <text class="summary-label">创建时间</text>
            <text class="summary-value">{{ formatFullDateTime(item.createdAt) }}</text>
          </view>
        </view>

        <view class="card-footer" @click.stop>
          <text class="footer-tip">{{ getStatusHint(item.orderStatus) }}</text>
          <view v-if="item.orderStatus === ORDER_STATUS.COMPLETED" class="review-row">
            <button
              v-if="isReviewed(item) === false"
              class="review-btn"
              @click="goReview(item)"
            >
              去评价
            </button>
            <text v-else-if="isReviewed(item) === true" class="reviewed-text">已评价</text>
          </view>
          <text v-else class="detail-link">查看详情</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getOrderList } from '../../api/order'
import { ORDER_STATUS, USER_ORDER_STATUS_TABS, getOrderStatusClass, getOrderStatusLabel } from '../../utils/order-status'
import { formatFullDateTime } from '../../utils/schedule-time'
import { getTimeSlotText } from '../../utils/time-slot'

const USER_ID_KEY = 'user_id'

export default {
  name: 'OrderListPage',
  data() {
    return {
      ORDER_STATUS,
      userId: '',
      loading: false,
      activeStatus: '',
      orderList: [],
      statusTabs: USER_ORDER_STATUS_TABS
    }
  },
  onShow() {
    this.userId = uni.getStorageSync(USER_ID_KEY) || ''
    this.fetchOrderList()
  },
  onPullDownRefresh() {
    this.fetchOrderList({
      fromPullDownRefresh: true
    })
  },
  methods: {
    formatFullDateTime,
    getTimeSlotText,
    async fetchOrderList(options = {}) {
      const { fromPullDownRefresh = false } = options

      if (!this.userId) {
        this.orderList = []
        uni.showToast({
          title: '未读取到用户信息',
          icon: 'none'
        })
        if (fromPullDownRefresh) {
          uni.stopPullDownRefresh()
        }
        return
      }

      this.loading = true

      try {
        const params = {
          userId: this.userId
        }

        if (this.activeStatus) {
          params.orderStatus = this.activeStatus
        }

        const data = await getOrderList(params)
        this.orderList = Array.isArray(data) ? data : []
      } catch (error) {
        this.orderList = []
      } finally {
        this.loading = false
        if (fromPullDownRefresh) {
          uni.stopPullDownRefresh()
        }
      }
    },
    changeStatus(status) {
      if (this.activeStatus === status) {
        return
      }

      this.activeStatus = status
      this.fetchOrderList()
    },
    goDetail(id) {
      if (!id) {
        return
      }

      uni.navigateTo({
        url: `/pages/order/detail?id=${id}`
      })
    },
    goReview(item) {
      if (!item || !item.id) {
        return
      }

      uni.navigateTo({
        url: `/pages/review/create?orderId=${item.id}&chefId=${item.chefId}&userId=${item.userId}`
      })
    },
    isReviewed(item) {
      return item && (item.reviewed === true || item.reviewed === 1)
    },
    getStatusLabel(status) {
      return getOrderStatusLabel(status)
    },
    getStatusClass(status) {
      return getOrderStatusClass(status)
    },
    getOrderCardClass(status) {
      if (status === ORDER_STATUS.COMPLETED) {
        return 'completed'
      }

      if (status === ORDER_STATUS.IN_SERVICE || status === ORDER_STATUS.PAID) {
        return 'serving'
      }

      if (status === ORDER_STATUS.PENDING_CONFIRM || status === ORDER_STATUS.WAIT_PAY) {
        return 'pending'
      }

      if (status === ORDER_STATUS.REJECTED || status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.REFUNDED) {
        return 'closed'
      }

      return ''
    },
    getStatusHint(status) {
      if (status === ORDER_STATUS.PENDING_CONFIRM) {
        return '等待厨师确认订单后，将进入支付流程'
      }

      if (status === ORDER_STATUS.WAIT_PAY) {
        return '订单已确认，请尽快完成支付'
      }

      if (status === ORDER_STATUS.PAID) {
        return '订单已支付，等待厨师开始服务'
      }

      if (status === ORDER_STATUS.IN_SERVICE) {
        return '厨师正在上门服务中'
      }

      if (status === ORDER_STATUS.COMPLETED) {
        return '服务已完成，可以查看本单记录'
      }

      if (status === ORDER_STATUS.REJECTED) {
        return '订单已被厨师拒绝'
      }

      if (status === ORDER_STATUS.CANCELLED) {
        return '订单已取消'
      }

      if (status === ORDER_STATUS.REFUNDED) {
        return '订单已退款完成'
      }

      return '查看订单详情'
    },
    formatAmount(value) {
      if (value === 0) {
        return '0'
      }

      return value || '-'
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f6f7fb;
  box-sizing: border-box;
}

.tabs-wrap {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 24rpx;
}

.tabs {
  display: inline-flex;
  gap: 16rpx;
}

.tab-item {
  flex-shrink: 0;
  padding: 16rpx 28rpx;
  border-radius: 999rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(32, 37, 43, 0.05);
}

.tab-item.active {
  background: #d96c3a;
}

.tab-text {
  font-size: 26rpx;
  color: #5f6671;
}

.tab-item.active .tab-text {
  color: #ffffff;
}

.state-card,
.order-card {
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05);
}

.state-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360rpx;
  padding: 40rpx 32rpx;
}

.state-text {
  font-size: 28rpx;
  color: #8a8f99;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.order-card {
  padding: 28rpx;
  border: 2rpx solid #eef0f4;
  box-shadow: 0 14rpx 36rpx rgba(32, 37, 43, 0.06);
}

.order-card.pending {
  border-color: #f5dbc8;
}

.order-card.serving {
  border-color: #d8eadf;
}

.order-card.completed {
  border-color: #dbe7f5;
}

.order-card.closed {
  border-color: #f0e1e1;
}

.card-head,
.summary-row,
.card-footer {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.card-head {
  align-items: flex-start;
  margin-bottom: 22rpx;
}

.head-main {
  flex: 1;
  min-width: 0;
}

.order-no {
  display: block;
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2329;
}

.service-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 14rpx;
}

.meta-chip {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #f7f8fb;
  font-size: 22rpx;
  color: #68707d;
}

.head-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.status-tag {
  flex-shrink: 0;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.status-tag.pending {
  background: #fff2eb;
  color: #c45e31;
}

.status-tag.success {
  background: #edf8f1;
  color: #2f8f55;
}

.status-tag.danger {
  background: #fdeeee;
  color: #d14a4a;
}

.amount-label {
  margin-top: 18rpx;
  font-size: 22rpx;
  color: #8a8f99;
}

.amount-value {
  margin-top: 6rpx;
  font-size: 38rpx;
  font-weight: 700;
  color: #d96c3a;
}

.summary-panel {
  padding: 22rpx 24rpx;
  border-radius: 22rpx;
  background: #f8f9fc;
}

.summary-row {
  align-items: flex-start;
  padding: 10rpx 0;
}

.summary-label {
  flex-shrink: 0;
  font-size: 26rpx;
  color: #8a8f99;
}

.summary-value {
  font-size: 26rpx;
  color: #4f5662;
  text-align: right;
}

.address-row {
  display: block;
}

.summary-address {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #4f5662;
}

.card-footer {
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f1f3f6;
}

.footer-tip {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  line-height: 1.6;
  color: #7b838f;
}

.review-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.review-btn {
  min-width: 160rpx;
  height: 68rpx;
  line-height: 68rpx;
  margin: 0;
  border: none;
  border-radius: 999rpx;
  background: #d96c3a;
  font-size: 26rpx;
  color: #ffffff;
}

.review-btn::after {
  border: none;
}

.reviewed-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #8a8f99;
}

.detail-link {
  flex-shrink: 0;
  font-size: 24rpx;
  font-weight: 600;
  color: #d96c3a;
}
</style>

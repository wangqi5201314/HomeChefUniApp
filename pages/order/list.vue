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
        @click="goDetail(item.id)"
      >
        <view class="card-head">
          <text class="order-no">订单号：{{ item.orderNo || '-' }}</text>
          <text class="status-tag" :class="getStatusClass(item.orderStatus)">
            {{ getStatusLabel(item.orderStatus) }}
          </text>
        </view>

        <view class="info-line">
          <text class="info-label">服务日期</text>
          <text class="info-value">{{ item.serviceDate || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">时间段</text>
          <text class="info-value">{{ item.timeSlot || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">订单金额</text>
          <text class="info-value amount">￥{{ formatAmount(item.payAmount) }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">联系人</text>
          <text class="info-value">{{ item.contactName || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">联系电话</text>
          <text class="info-value">{{ item.contactPhone || '-' }}</text>
        </view>
        <view class="address-line">
          <text class="info-label">服务地址</text>
          <text class="address-value">{{ item.fullAddress || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">创建时间</text>
          <text class="info-value">{{ item.createdAt || '-' }}</text>
        </view>

        <view v-if="item.orderStatus === ORDER_STATUS.COMPLETED" class="review-row" @click.stop>
          <button
            v-if="isReviewed(item) === false"
            class="review-btn"
            @click="goReview(item)"
          >
            去评价
          </button>
          <text v-else-if="isReviewed(item) === true" class="reviewed-text">已评价</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getOrderList } from '../../api/order'
import { ORDER_STATUS, USER_ORDER_STATUS_TABS, getOrderStatusClass, getOrderStatusLabel } from '../../utils/order-status'

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
}

.card-head,
.info-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.card-head {
  margin-bottom: 18rpx;
}

.order-no {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  font-weight: 600;
  color: #1f2329;
}

.status-tag {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
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

.info-line {
  padding: 12rpx 0;
}

.address-line {
  padding: 12rpx 0;
}

.info-label {
  flex-shrink: 0;
  font-size: 26rpx;
  color: #8a8f99;
}

.info-value {
  font-size: 26rpx;
  color: #4f5662;
  text-align: right;
}

.address-value {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #4f5662;
}

.amount {
  color: #d96c3a;
  font-weight: 600;
}

.review-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f1f3f6;
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
</style>

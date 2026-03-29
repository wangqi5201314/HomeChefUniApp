<template>
  <view class="page">
    <scroll-view class="tabs-scroll" scroll-x enable-flex show-scrollbar="false">
      <view class="tabs">
        <view
          v-for="item in tabs"
          :key="item.value"
          class="tab-item"
          :class="{ active: currentStatus === item.value }"
          @click="changeTab(item.value)"
        >
          <text class="tab-text">{{ item.label }}</text>
        </view>
      </view>
    </scroll-view>

    <view v-if="loading" class="state-card">
      <text class="state-text">订单加载中...</text>
    </view>

    <view v-else-if="orderList.length === 0" class="state-card">
      <text class="state-text">当前没有订单</text>
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
          <text class="status" :class="getStatusClass(item.orderStatus)">
            {{ getStatusLabel(item.orderStatus) }}
          </text>
        </view>

        <view class="info-grid">
          <view class="info-row">
            <text class="label">服务日期</text>
            <text class="value">{{ item.serviceDate || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="label">时间段</text>
            <text class="value">{{ getTimeSlotText(item.timeSlot) }}</text>
          </view>
          <view class="info-row">
            <text class="label">人数</text>
            <text class="value">{{ formatPeopleCount(item.peopleCount) }}</text>
          </view>
          <view class="info-row">
            <text class="label">实付金额</text>
            <text class="value amount">¥{{ formatAmount(item.payAmount) }}</text>
          </view>
        </view>

        <view class="contact-box">
          <text class="contact-line">联系人：{{ item.contactName || '-' }}</text>
          <text class="contact-line">联系电话：{{ item.contactPhone || '-' }}</text>
          <text class="address">{{ item.fullAddress || '-' }}</text>
          <text class="contact-line">创建时间：{{ item.createdAt || '-' }}</text>
        </view>
      </view>
    </view>

    <chef-tabbar current="order" />
  </view>
</template>

<script>
import ChefTabbar from '../../components/chef-tabbar.vue'
import { getChefOrderList } from '../../api/chef-order'
import { CHEF_ORDER_STATUS_TABS, getOrderStatusClass, getOrderStatusLabel } from '../../utils/order-status'
import { getTimeSlotText } from '../../utils/time-slot'

export default {
  name: 'ChefOrderListPage',
  components: {
    ChefTabbar
  },
  data() {
    return {
      loading: false,
      currentStatus: '',
      tabs: CHEF_ORDER_STATUS_TABS,
      orderList: []
    }
  },
  onLoad(options) {
    if (options && typeof options.orderStatus !== 'undefined') {
      this.currentStatus = options.orderStatus
    }
    this.fetchOrderList()
  },
  onShow() {
    if (this.orderList.length > 0) {
      this.fetchOrderList(false)
    }
  },
  methods: {
    getTimeSlotText,
    async fetchOrderList(showLoading = true) {
      if (showLoading) {
        this.loading = true
      }

      try {
        const params = {}
        if (this.currentStatus) {
          params.orderStatus = this.currentStatus
        }

        const data = await getChefOrderList(params)
        this.orderList = Array.isArray(data) ? data : []
      } catch (error) {
        this.orderList = []
      } finally {
        this.loading = false
      }
    },
    changeTab(status) {
      if (this.currentStatus === status) {
        return
      }

      this.currentStatus = status
      this.fetchOrderList()
    },
    goDetail(id) {
      uni.navigateTo({
        url: `/pages-chef/order/detail?id=${id}`
      })
    },
    getStatusLabel(status) {
      return getOrderStatusLabel(status)
    },
    getStatusClass(status) {
      return getOrderStatusClass(status)
    },
    formatPeopleCount(value) {
      if (value === 0) {
        return '0人'
      }

      return value ? `${value}人` : '-'
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
  padding: 24rpx 24rpx 190rpx;
  background:
    radial-gradient(circle at top right, rgba(47, 143, 85, 0.14), transparent 34%),
    linear-gradient(180deg, #eef7f1 0%, #f6f7fb 38%, #f6f7fb 100%);
  box-sizing: border-box;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs {
  display: inline-flex;
  gap: 16rpx;
  padding-bottom: 8rpx;
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 172rpx;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 0 0 2rpx #dce8e0;
  box-sizing: border-box;
}

.tab-item.active {
  background: #2f8f55;
  box-shadow: none;
}

.tab-text {
  font-size: 24rpx;
  color: #4a5b4e;
}

.tab-item.active .tab-text {
  color: #ffffff;
}

.state-card {
  margin-top: 28rpx;
  padding: 72rpx 32rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.9);
  text-align: center;
  box-shadow: 0 14rpx 36rpx rgba(28, 39, 31, 0.06);
}

.state-text {
  font-size: 28rpx;
  color: #74807b;
}

.list {
  margin-top: 28rpx;
}

.order-card {
  margin-bottom: 22rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 14rpx 36rpx rgba(28, 39, 31, 0.06);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.order-no {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  font-weight: 600;
  color: #223128;
}

.status {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.status.pending {
  background: #fff2eb;
  color: #c45e31;
}

.status.success {
  background: #edf8f1;
  color: #2f8f55;
}

.status.danger {
  background: #fdeeee;
  color: #d14a4a;
}

.info-grid {
  margin-top: 24rpx;
  padding: 24rpx 0;
  border-top: 2rpx solid #eef1ef;
  border-bottom: 2rpx solid #eef1ef;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.info-row:first-child {
  margin-top: 0;
}

.label {
  font-size: 26rpx;
  color: #7a837d;
}

.value {
  font-size: 26rpx;
  color: #1f2329;
}

.amount {
  color: #d96c3a;
  font-weight: 600;
}

.contact-box {
  margin-top: 24rpx;
}

.contact-line,
.address {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #4e5752;
  line-height: 1.6;
}

.contact-line:first-child,
.address:first-child {
  margin-top: 0;
}
</style>

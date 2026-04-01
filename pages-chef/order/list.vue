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
        :class="getOrderCardTone(item.orderStatus)"
        @click="goDetail(item.id)"
      >
        <view class="status-hero">
          <view class="status-copy">
            <text class="status-caption">{{ getStatusCaption(item.orderStatus) }}</text>
            <text class="status-title">{{ getStatusLabel(item.orderStatus) }}</text>
          </view>
          <view class="amount-box">
            <text class="amount-caption">订单金额</text>
            <text class="amount-strong">￥{{ formatAmount(item.payAmount) }}</text>
          </view>
        </view>

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
          <text class="contact-line">创建时间：{{ formatFullDateTime(item.createdAt) }}</text>
        </view>

        <view class="card-footer">
          <text class="footer-tip">{{ getStatusHint(item.orderStatus) }}</text>
          <text class="detail-link">查看详情</text>
        </view>
      </view>
    </view>

    <chef-tabbar current="order" />
  </view>
</template>

<script>
import ChefTabbar from '../../components/chef-tabbar.vue'
import { getChefOrderList } from '../../api/chef-order'
import { ORDER_STATUS, CHEF_ORDER_STATUS_TABS, getOrderStatusClass, getOrderStatusLabel } from '../../utils/order-status'
import { formatFullDateTime } from '../../utils/schedule-time'
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
  onPullDownRefresh() {
    this.fetchOrderList(false, true)
  },
  methods: {
    formatFullDateTime,
    getTimeSlotText,
    async fetchOrderList(showLoading = true, fromPullDownRefresh = false) {
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
        if (fromPullDownRefresh) {
          uni.stopPullDownRefresh()
        }
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
    getOrderCardTone(status) {
      if (status === ORDER_STATUS.PENDING_CONFIRM || status === ORDER_STATUS.WAIT_PAY) {
        return 'tone-pending'
      }

      if (status === ORDER_STATUS.PAID || status === ORDER_STATUS.IN_SERVICE) {
        return 'tone-serving'
      }

      if (status === ORDER_STATUS.COMPLETED) {
        return 'tone-completed'
      }

      if (status === ORDER_STATUS.REJECTED || status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.REFUNDED) {
        return 'tone-closed'
      }

      return ''
    },
    getStatusCaption(status) {
      if (status === ORDER_STATUS.PENDING_CONFIRM) {
        return '待你处理'
      }

      if (status === ORDER_STATUS.WAIT_PAY) {
        return '等待用户支付'
      }

      if (status === ORDER_STATUS.PAID) {
        return '已准备就绪'
      }

      if (status === ORDER_STATUS.IN_SERVICE) {
        return '正在服务'
      }

      if (status === ORDER_STATUS.COMPLETED) {
        return '服务闭环完成'
      }

      if (status === ORDER_STATUS.REJECTED) {
        return '订单已拒绝'
      }

      if (status === ORDER_STATUS.CANCELLED) {
        return '订单已取消'
      }

      if (status === ORDER_STATUS.REFUNDED) {
        return '订单已退款'
      }

      return '订单状态'
    },
    getStatusHint(status) {
      if (status === ORDER_STATUS.PENDING_CONFIRM) {
        return '请尽快确认订单，避免影响用户支付'
      }

      if (status === ORDER_STATUS.WAIT_PAY) {
        return '订单已确认，等待用户完成支付'
      }

      if (status === ORDER_STATUS.PAID) {
        return '用户已支付，可进入开始服务流程'
      }

      if (status === ORDER_STATUS.IN_SERVICE) {
        return '服务进行中，结束后记得完成订单'
      }

      if (status === ORDER_STATUS.COMPLETED) {
        return '订单已完成，可查看本单评价与服务记录'
      }

      if (status === ORDER_STATUS.REJECTED) {
        return '该订单已拒绝，无需继续处理'
      }

      if (status === ORDER_STATUS.CANCELLED) {
        return '该订单已取消'
      }

      if (status === ORDER_STATUS.REFUNDED) {
        return '退款已处理完成'
      }

      return '查看订单详情'
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

.order-card.tone-pending {
  background:
    linear-gradient(180deg, rgba(255, 245, 239, 0.96) 0%, rgba(255, 255, 255, 0.96) 36%),
    rgba(255, 255, 255, 0.96);
  box-shadow: 0 18rpx 38rpx rgba(196, 94, 49, 0.09);
}

.order-card.tone-serving {
  background:
    linear-gradient(180deg, rgba(238, 249, 242, 0.96) 0%, rgba(255, 255, 255, 0.96) 36%),
    rgba(255, 255, 255, 0.96);
  box-shadow: 0 18rpx 38rpx rgba(47, 143, 85, 0.09);
}

.order-card.tone-completed {
  background:
    linear-gradient(180deg, rgba(241, 246, 255, 0.96) 0%, rgba(255, 255, 255, 0.96) 36%),
    rgba(255, 255, 255, 0.96);
  box-shadow: 0 18rpx 38rpx rgba(70, 112, 170, 0.09);
}

.order-card.tone-closed {
  background:
    linear-gradient(180deg, rgba(252, 242, 242, 0.96) 0%, rgba(255, 255, 255, 0.96) 36%),
    rgba(255, 255, 255, 0.96);
  box-shadow: 0 18rpx 38rpx rgba(190, 88, 88, 0.08);
}

.status-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 22rpx;
}

.status-copy {
  flex: 1;
  min-width: 0;
}

.status-caption,
.status-title,
.amount-caption,
.amount-strong {
  display: block;
}

.status-caption {
  font-size: 22rpx;
  letter-spacing: 2rpx;
  color: #7d8a83;
}

.status-title {
  margin-top: 10rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #223128;
}

.amount-box {
  flex-shrink: 0;
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: inset 0 0 0 2rpx rgba(220, 232, 224, 0.9);
  text-align: right;
}

.amount-caption {
  font-size: 22rpx;
  color: #7a837d;
}

.amount-strong {
  margin-top: 8rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #d96c3a;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid rgba(238, 241, 239, 0.9);
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
  font-weight: 600;
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
  padding: 24rpx 22rpx;
  border-radius: 22rpx;
  background: rgba(248, 250, 249, 0.92);
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
  padding: 20rpx 22rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 0 0 2rpx rgba(236, 241, 237, 0.95);
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

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 22rpx;
}

.footer-tip {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  line-height: 1.6;
  color: #6e7a74;
}

.detail-link {
  flex-shrink: 0;
  font-size: 24rpx;
  font-weight: 600;
  color: #2f8f55;
}
</style>

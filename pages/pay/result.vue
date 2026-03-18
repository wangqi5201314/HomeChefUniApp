<template>
  <view class="page">
    <view v-if="loading" class="state-card">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else class="result-card">
      <view class="icon-wrap" :class="isPaid ? 'success' : 'pending'">
        <text class="icon-text">{{ isPaid ? '√' : '!' }}</text>
      </view>

      <text class="title">{{ isPaid ? '支付成功' : '支付未完成' }}</text>
      <text class="subtitle">
        {{ isPaid ? '订单支付已完成，可返回查看订单详情' : '当前订单尚未完成支付，请稍后重试或返回查看订单' }}
      </text>

      <view class="info-box">
        <view class="info-line">
          <text class="info-label">支付单号</text>
          <text class="info-value">{{ payInfo.payNo || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">支付金额</text>
          <text class="info-value amount">￥{{ formatAmount(payInfo.payAmount) }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">支付状态</text>
          <text class="info-value">{{ payInfo.payStatus || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">支付时间</text>
          <text class="info-value">{{ payInfo.paidAt || '-' }}</text>
        </view>
      </view>

      <view class="button-group">
        <button class="btn primary" type="primary" @click="goOrderDetail">查看订单</button>
        <button class="btn secondary" @click="goOrderList">返回订单列表</button>
      </view>
    </view>
  </view>
</template>

<script>
import { getPaymentStatus } from '../../api/pay'

export default {
  name: 'PayResultPage',
  data() {
    return {
      orderId: '',
      loading: false,
      payInfo: {}
    }
  },
  computed: {
    isPaid() {
      return this.payInfo.payStatus === 'PAID'
    }
  },
  onLoad(options) {
    this.orderId = options && options.orderId ? options.orderId : ''

    if (!this.orderId) {
      uni.showToast({
        title: '缺少订单 id',
        icon: 'none'
      })
      return
    }

    this.loadPayStatus()
  },
  methods: {
    async loadPayStatus() {
      this.loading = true

      try {
        const data = await getPaymentStatus(this.orderId)
        this.payInfo = data || {}
      } catch (error) {
        this.payInfo = {}
      } finally {
        this.loading = false
      }
    },
    formatAmount(value) {
      if (value === 0) {
        return '0'
      }
      return value || '-'
    },
    goOrderDetail() {
      uni.navigateTo({
        url: `/pages/order/detail?id=${this.orderId}`
      })
    },
    goOrderList() {
      uni.switchTab({
        url: '/pages/order/list'
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx 24rpx;
  background: linear-gradient(180deg, #fff8f2 0%, #f6f7fb 38%, #f6f7fb 100%);
  box-sizing: border-box;
}

.state-card,
.result-card {
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 32rpx rgba(32, 37, 43, 0.06);
}

.state-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 420rpx;
}

.state-text {
  font-size: 28rpx;
  color: #8a8f99;
}

.result-card {
  padding: 48rpx 32rpx;
}

.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 128rpx;
  height: 128rpx;
  margin: 0 auto;
  border-radius: 50%;
}

.icon-wrap.success {
  background: #edf8f1;
}

.icon-wrap.pending {
  background: #fff2eb;
}

.icon-text {
  font-size: 64rpx;
  font-weight: 700;
}

.icon-wrap.success .icon-text {
  color: #2f8f55;
}

.icon-wrap.pending .icon-text {
  color: #d96c3a;
}

.title {
  display: block;
  margin-top: 28rpx;
  text-align: center;
  font-size: 40rpx;
  font-weight: 600;
  color: #1f2329;
}

.subtitle {
  display: block;
  margin-top: 18rpx;
  text-align: center;
  font-size: 28rpx;
  line-height: 1.7;
  color: #6b7280;
}

.info-box {
  margin-top: 36rpx;
  padding: 12rpx 0;
  border-radius: 20rpx;
  background: #f8f9fb;
}

.info-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 20rpx 24rpx;
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

.amount {
  color: #d96c3a;
  font-weight: 600;
}

.button-group {
  margin-top: 40rpx;
}

.btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border: none;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 500;
}

.btn + .btn {
  margin-top: 20rpx;
}

.btn::after {
  border: none;
}

.btn.primary {
  background: #d96c3a;
  color: #ffffff;
}

.btn.secondary {
  background: #f2f4f7;
  color: #4f5662;
}
</style>

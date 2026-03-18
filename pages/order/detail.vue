<template>
  <view class="page">
    <view v-if="loading" class="state-card">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else-if="!orderDetail.id" class="state-card">
      <text class="state-text">未找到订单信息</text>
    </view>

    <view v-else>
      <view class="section-card hero-card">
        <view class="hero-head">
          <text class="order-no">订单号：{{ orderDetail.orderNo || '-' }}</text>
          <text class="status-tag" :class="statusClass">{{ orderDetail.orderStatus || '-' }}</text>
        </view>
        <text class="hero-time">创建时间：{{ orderDetail.createdAt || '-' }}</text>
      </view>

      <view class="section-card">
        <text class="section-title">服务信息</text>
        <view class="info-line">
          <text class="info-label">服务日期</text>
          <text class="info-value">{{ orderDetail.serviceDate || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">时间段</text>
          <text class="info-value">{{ orderDetail.timeSlot || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">开始时间</text>
          <text class="info-value">{{ orderDetail.serviceStartTime || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">结束时间</text>
          <text class="info-value">{{ orderDetail.serviceEndTime || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">厨师 ID</text>
          <text class="info-value">{{ orderDetail.chefId || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">地址 ID</text>
          <text class="info-value">{{ orderDetail.addressId || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">确认码</text>
          <text class="info-value">{{ orderDetail.confirmCode || '-' }}</text>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">下单信息</text>
        <view class="info-line">
          <text class="info-label">用餐人数</text>
          <text class="info-value">{{ orderDetail.peopleCount || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">口味偏好</text>
          <text class="info-value">{{ orderDetail.tastePreference || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">忌口食物</text>
          <text class="info-value">{{ orderDetail.tabooFood || '-' }}</text>
        </view>
        <view class="block-line">
          <text class="info-label">特殊要求</text>
          <text class="block-value">{{ orderDetail.specialRequirement || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">食材模式</text>
          <text class="info-value">{{ orderDetail.ingredientMode || '-' }}</text>
        </view>
        <view class="block-line">
          <text class="info-label">食材清单</text>
          <text class="block-value">{{ orderDetail.ingredientList || '-' }}</text>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">联系人信息</text>
        <view class="info-line">
          <text class="info-label">联系人</text>
          <text class="info-value">{{ orderDetail.contactName || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">联系电话</text>
          <text class="info-value">{{ orderDetail.contactPhone || '-' }}</text>
        </view>
        <view class="block-line">
          <text class="info-label">服务地址</text>
          <text class="block-value">{{ orderDetail.fullAddress || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">经度</text>
          <text class="info-value">{{ formatPlain(orderDetail.longitude) }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">纬度</text>
          <text class="info-value">{{ formatPlain(orderDetail.latitude) }}</text>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">费用信息</text>
        <view class="info-line">
          <text class="info-label">总金额</text>
          <text class="info-value amount">￥{{ formatAmount(orderDetail.totalAmount) }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">优惠金额</text>
          <text class="info-value">￥{{ formatAmount(orderDetail.discountAmount) }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">实付金额</text>
          <text class="info-value amount">￥{{ formatAmount(orderDetail.payAmount) }}</text>
        </view>
      </view>

      <view v-if="orderDetail.cancelReason || orderDetail.refundReason" class="section-card">
        <text class="section-title">售后信息</text>
        <view v-if="orderDetail.cancelReason" class="block-line">
          <text class="info-label">取消原因</text>
          <text class="block-value">{{ orderDetail.cancelReason }}</text>
        </view>
        <view v-if="orderDetail.refundReason" class="block-line">
          <text class="info-label">退款原因</text>
          <text class="block-value">{{ orderDetail.refundReason }}</text>
        </view>
      </view>
    </view>

    <view v-if="showActionBar" class="bottom-bar">
      <button
        v-if="showCancelButton"
        class="action-btn secondary"
        :loading="cancelSubmitting"
        :disabled="cancelSubmitting || paying"
        @click="openCancelPopup"
      >
        取消订单
      </button>
      <button
        v-if="showPayButton"
        class="action-btn primary"
        :loading="paying"
        :disabled="paying || cancelSubmitting"
        @click="handlePay"
      >
        立即支付
      </button>
      <button
        v-if="showReviewButton"
        class="action-btn primary"
        @click="goReview"
      >
        去评价
      </button>
    </view>

    <view v-if="showCancelModal" class="modal-mask" @click="closeCancelPopup">
      <view class="modal-card" @click.stop>
        <text class="modal-title">取消订单</text>
        <textarea
          v-model="cancelReason"
          class="modal-textarea"
          placeholder="请输入取消原因"
        />
        <view class="modal-actions">
          <button class="modal-btn plain" @click="closeCancelPopup">再想想</button>
          <button
            class="modal-btn danger"
            :loading="cancelSubmitting"
            :disabled="cancelSubmitting"
            @click="submitCancel"
          >
            确认取消
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { cancelOrder, getOrderDetail } from '../../api/order'
import { createPayment, mockPaymentSuccess } from '../../api/pay'

export default {
  name: 'OrderDetailPage',
  data() {
    return {
      id: '',
      loading: false,
      paying: false,
      cancelSubmitting: false,
      showCancelModal: false,
      cancelReason: '',
      orderDetail: {}
    }
  },
  computed: {
    showCancelButton() {
      return this.orderDetail.orderStatus === 'PENDING_CONFIRM' ||
        this.orderDetail.orderStatus === 'WAIT_PAY' ||
        this.orderDetail.orderStatus === 'PAID'
    },
    showPayButton() {
      return this.orderDetail.orderStatus === 'WAIT_PAY'
    },
    showReviewButton() {
      return this.orderDetail.orderStatus === 'COMPLETED'
    },
    showActionBar() {
      return this.showCancelButton || this.showPayButton || this.showReviewButton
    },
    statusClass() {
      const status = this.orderDetail.orderStatus

      if (status === 'WAIT_PAY' || status === 'PENDING_CONFIRM') {
        return 'pending'
      }

      if (status === 'PAID' || status === 'COMPLETED') {
        return 'success'
      }

      if (status === 'CANCELLED' || status === 'REFUNDED') {
        return 'danger'
      }

      return ''
    }
  },
  onLoad(options) {
    this.id = options && options.id ? options.id : ''

    if (!this.id) {
      uni.showToast({
        title: '缺少订单 id',
        icon: 'none'
      })
      return
    }

    this.loadOrderDetail()
  },
  methods: {
    async loadOrderDetail() {
      this.loading = true

      try {
        const data = await getOrderDetail(this.id)
        this.orderDetail = data || {}
      } catch (error) {
        this.orderDetail = {}
      } finally {
        this.loading = false
      }
    },
    formatPlain(value) {
      if (value === 0) {
        return '0'
      }
      return value || '-'
    },
    formatAmount(value) {
      if (value === 0) {
        return '0'
      }
      return value || '-'
    },
    openCancelPopup() {
      this.cancelReason = ''
      this.showCancelModal = true
    },
    closeCancelPopup() {
      if (this.cancelSubmitting) {
        return
      }
      this.showCancelModal = false
    },
    async submitCancel() {
      if (this.cancelSubmitting) {
        return
      }

      if (!this.cancelReason.trim()) {
        uni.showToast({
          title: '请输入取消原因',
          icon: 'none'
        })
        return
      }

      this.cancelSubmitting = true

      try {
        await cancelOrder(this.id, {
          reason: this.cancelReason.trim()
        })

        uni.showToast({
          title: '取消成功',
          icon: 'success'
        })

        this.showCancelModal = false
        this.loadOrderDetail()
      } catch (error) {
      } finally {
        this.cancelSubmitting = false
      }
    },
    async handlePay() {
      if (this.paying) {
        return
      }

      this.paying = true

      try {
        await createPayment({
          orderId: this.orderDetail.id
        })

        await mockPaymentSuccess(this.orderDetail.id)

        uni.showToast({
          title: '支付成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.navigateTo({
            url: `/pages/pay/result?orderId=${this.orderDetail.id}`
          })
        }, 300)
      } catch (error) {
      } finally {
        this.paying = false
      }
    },
    goReview() {
      uni.navigateTo({
        url: `/pages/review/create?orderId=${this.orderDetail.id}&chefId=${this.orderDetail.chefId}&userId=${this.orderDetail.userId}`
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 180rpx;
  background: #f6f7fb;
  box-sizing: border-box;
}

.state-card,
.section-card,
.modal-card {
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

.section-card {
  margin-bottom: 24rpx;
  padding: 28rpx;
}

.hero-card {
  background: linear-gradient(135deg, #fff7f1 0%, #ffffff 100%);
}

.hero-head,
.info-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.hero-head {
  margin-bottom: 14rpx;
}

.order-no {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2329;
}

.hero-time {
  display: block;
  font-size: 24rpx;
  color: #8a8f99;
}

.status-tag {
  flex-shrink: 0;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: #eef1f5;
  font-size: 22rpx;
  color: #5f6671;
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

.section-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2329;
}

.info-line {
  padding: 12rpx 0;
}

.block-line {
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

.block-value {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #4f5662;
}

.amount {
  color: #d96c3a;
  font-weight: 600;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -8rpx 24rpx rgba(32, 37, 43, 0.06);
  box-sizing: border-box;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border: none;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 500;
}

.action-btn::after,
.modal-btn::after {
  border: none;
}

.action-btn.primary {
  background: #d96c3a;
  color: #ffffff;
}

.action-btn.secondary {
  background: #f2f4f7;
  color: #4f5662;
}

.modal-mask {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background: rgba(15, 23, 42, 0.42);
  box-sizing: border-box;
}

.modal-card {
  width: 100%;
  padding: 32rpx;
}

.modal-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2329;
}

.modal-textarea {
  width: 100%;
  min-height: 180rpx;
  padding: 24rpx;
  border-radius: 18rpx;
  background: #f7f8fb;
  font-size: 28rpx;
  color: #222222;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 28rpx;
}

.modal-btn {
  flex: 1;
  height: 84rpx;
  line-height: 84rpx;
  border: none;
  border-radius: 999rpx;
  font-size: 28rpx;
}

.modal-btn.plain {
  background: #f2f4f7;
  color: #4f5662;
}

.modal-btn.danger {
  background: #d14a4a;
  color: #ffffff;
}
</style>

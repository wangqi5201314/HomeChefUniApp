<template>
  <view class="page">
    <view v-if="loading" class="state-card">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else-if="!orderDetail.id" class="state-card">
      <text class="state-text">未找到订单信息</text>
    </view>

    <view v-else>
      <view class="section-card hero-card" :class="heroToneClass">
        <view class="hero-top">
          <view class="hero-copy">
            <text class="hero-eyebrow">订单状态</text>
            <text class="hero-status-title">{{ statusLabel }}</text>
            <text class="hero-status-desc">{{ statusSummaryText }}</text>
          </view>
          <text class="status-tag" :class="statusClass">{{ statusLabel }}</text>
        </view>
        <view class="hero-meta-grid">
          <view class="hero-meta-item">
            <text class="hero-meta-label">订单号</text>
            <text class="hero-meta-value">{{ orderDetail.orderNo || '-' }}</text>
          </view>
          <view class="hero-meta-item">
            <text class="hero-meta-label">创建时间</text>
            <text class="hero-meta-value">{{ formatFullDateTime(orderDetail.createdAt) }}</text>
          </view>
        </view>
      </view>

      <view class="section-card progress-card">
        <view class="progress-head">
          <text class="section-title progress-title">服务流程</text>
          <text class="progress-caption">当前阶段：{{ statusLabel }}</text>
        </view>
        <view class="progress-track">
          <view
            v-for="(step, index) in progressSteps"
            :key="step.key"
            class="progress-step"
            :class="getProgressStepClass(index)"
          >
            <view class="progress-dot">
              <text class="progress-dot-text">{{ index + 1 }}</text>
            </view>
            <text class="progress-step-label">{{ step.label }}</text>
            <view v-if="index < progressSteps.length - 1" class="progress-line"></view>
          </view>
        </view>
        <view v-if="progressTerminalText" class="progress-terminal" :class="statusClass">
          <text class="progress-terminal-label">流程提示</text>
          <text class="progress-terminal-text">{{ progressTerminalText }}</text>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">服务信息</text>
        <view class="info-line"><text class="info-label">服务日期</text><text class="info-value">{{ orderDetail.serviceDate || '-' }}</text></view>
        <view class="info-line"><text class="info-label">时间段</text><text class="info-value">{{ getTimeSlotText(orderDetail.timeSlot) }}</text></view>
        <view class="info-line"><text class="info-label">开始时间</text><text class="info-value">{{ formatScheduleDateTime(orderDetail.serviceStartTime) }}</text></view>
        <view class="info-line"><text class="info-label">结束时间</text><text class="info-value">{{ formatScheduleDateTime(orderDetail.serviceEndTime) }}</text></view>
      </view>

      <view v-if="showChefInfoSection" class="section-card">
        <text class="section-title">厨师信息</text>
        <view class="chef-card">
          <image
            v-if="chefDisplay.avatar"
            class="chef-avatar"
            :src="chefDisplay.avatar"
            mode="aspectFill"
          />
          <view v-else class="chef-avatar chef-avatar-placeholder">
            <text class="chef-avatar-text">{{ getChefInitial(chefDisplay.name) }}</text>
          </view>
          <view class="chef-meta">
            <text class="chef-name">{{ chefDisplay.name || '未命名厨师' }}</text>
            <text class="chef-desc">{{ chefDisplay.specialtyCuisine || chefDisplay.serviceModeDesc || '已开始为你服务' }}</text>
            <text class="chef-desc">联系电话：{{ chefDisplay.phone || '-' }}</text>
          </view>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">下单信息</text>
        <view class="info-line"><text class="info-label">用餐人数</text><text class="info-value">{{ orderDetail.peopleCount || '-' }}</text></view>
        <view class="info-line"><text class="info-label">口味偏好</text><text class="info-value">{{ orderDetail.tastePreference || '-' }}</text></view>
        <view class="info-line"><text class="info-label">忌口食物</text><text class="info-value">{{ orderDetail.tabooFood || '-' }}</text></view>
        <view class="block-line"><text class="info-label">特殊要求</text><text class="block-value">{{ orderDetail.specialRequirement || '-' }}</text></view>
        <view class="info-line"><text class="info-label">食材模式</text><text class="info-value">{{ getIngredientModeText(orderDetail.ingredientMode) }}</text></view>
        <view class="block-line"><text class="info-label">食材清单</text><text class="block-value">{{ orderDetail.ingredientList || '-' }}</text></view>
      </view>

      <view class="section-card">
        <text class="section-title">联系人信息</text>
        <view class="info-line"><text class="info-label">联系人</text><text class="info-value">{{ orderDetail.contactName || '-' }}</text></view>
        <view class="info-line"><text class="info-label">联系电话</text><text class="info-value">{{ orderDetail.contactPhone || '-' }}</text></view>
        <view class="block-line"><text class="info-label">服务地址</text><text class="block-value">{{ orderDetail.fullAddress || '-' }}</text></view>
      </view>

      <view class="section-card">
        <text class="section-title">费用信息</text>
        <view class="info-line"><text class="info-label">总金额</text><text class="info-value amount">￥{{ formatAmount(orderDetail.totalAmount) }}</text></view>
        <view class="info-line"><text class="info-label">实付金额</text><text class="info-value amount">￥{{ formatAmount(orderDetail.payAmount) }}</text></view>
      </view>

      <view v-if="orderDetail.cancelReason || orderDetail.refundReason" class="section-card">
        <text class="section-title">售后信息</text>
        <view v-if="orderDetail.cancelReason" class="block-line"><text class="info-label">取消原因</text><text class="block-value">{{ orderDetail.cancelReason }}</text></view>
        <view v-if="orderDetail.refundReason" class="block-line"><text class="info-label">退款原因</text><text class="block-value">{{ orderDetail.refundReason }}</text></view>
      </view>

      <view v-if="showReviewSection" class="section-card">
        <view class="review-head">
          <text class="section-title review-title">本单评价</text>
          <text v-if="hasOrderReview" class="review-score">综合评分 {{ formatScore(orderReview.overallScore) }}</text>
        </view>

        <view v-if="reviewLoading" class="review-empty">
          <text class="review-empty-text">评价信息加载中...</text>
        </view>

        <view v-else-if="hasOrderReview">
          <view class="review-meta">
            <text class="review-meta-text">{{ orderReview.isAnonymous === 1 ? '匿名评价' : '实名评价' }}</text>
            <text class="review-meta-text">评价时间：{{ formatFullDateTime(orderReview.createdAt) }}</text>
          </view>

          <view class="review-score-row">
            <text class="review-score-item">菜品 {{ formatScore(orderReview.dishScore) }}</text>
            <text class="review-score-item">服务 {{ formatScore(orderReview.serviceScore) }}</text>
            <text class="review-score-item">技能 {{ formatScore(orderReview.skillScore) }}</text>
            <text class="review-score-item">环境 {{ formatScore(orderReview.environmentScore) }}</text>
          </view>

          <view class="review-block">
            <text class="review-block-title">评价内容</text>
            <text class="review-block-content">{{ orderReview.content || '未填写评价内容' }}</text>
          </view>

          <view v-if="parseImageUrls(orderReview.imageUrls).length" class="review-block">
            <text class="review-block-title">评价图片</text>
            <view class="review-image-list">
              <image
                v-for="(url, index) in parseImageUrls(orderReview.imageUrls)"
                :key="`${orderReview.id}-${index}`"
                class="review-image"
                :src="url"
                mode="aspectFill"
                @click="previewImages(parseImageUrls(orderReview.imageUrls), index)"
              />
            </view>
          </view>

          <view v-if="orderReview.replyContent" class="review-reply-card">
            <text class="review-block-title">厨师回复</text>
            <text class="review-block-content">{{ orderReview.replyContent }}</text>
            <text v-if="orderReview.replyAt" class="review-meta-text">回复时间：{{ formatFullDateTime(orderReview.replyAt) }}</text>
          </view>
        </view>

        <view v-else class="review-empty">
          <text class="review-empty-text">这笔订单还没有评价</text>
          <button class="review-action-btn" @click="goReview">去评价</button>
        </view>
      </view>
    </view>

    <view v-if="showActionBar" class="bottom-bar">
      <view class="action-row">
        <button
          v-if="showCancelButton"
          class="action-btn secondary"
          :loading="cancelSubmitting"
          :disabled="cancelSubmitting || paying || refundSubmitting"
          @click="openCancelPopup"
        >
          取消订单
        </button>
        <button
          v-if="showPayButton"
          class="action-btn primary"
          :loading="paying"
          :disabled="paying || cancelSubmitting || refundSubmitting"
          @click="handlePay"
        >
          立即支付
        </button>
        <button
          v-if="showRefundButton"
          class="action-btn danger"
          :loading="refundSubmitting"
          :disabled="refundSubmitting || paying || cancelSubmitting"
          @click="openRefundPopup"
        >
          申请退款
        </button>
      </view>

      <button v-if="showBackHomeButton" class="home-btn" @click="goHome">返回首页</button>
    </view>

    <view v-if="showCancelModal" class="modal-mask" @click="closeCancelPopup">
      <view class="modal-card" @click.stop>
        <text class="modal-title">取消订单</text>
        <textarea v-model="cancelReason" class="modal-textarea" placeholder="请输入取消原因" />
        <view class="modal-actions">
          <button class="modal-btn plain" @click="closeCancelPopup">再想想</button>
          <button class="modal-btn danger" :loading="cancelSubmitting" :disabled="cancelSubmitting" @click="submitCancel">确认取消</button>
        </view>
      </view>
    </view>

    <view v-if="showRefundModal" class="modal-mask" @click="closeRefundPopup">
      <view class="modal-card" @click.stop>
        <text class="modal-title">申请退款</text>
        <textarea v-model="refundReason" class="modal-textarea" placeholder="请输入退款原因" />
        <view class="modal-actions">
          <button class="modal-btn plain" @click="closeRefundPopup">再想想</button>
          <button class="modal-btn danger" :loading="refundSubmitting" :disabled="refundSubmitting" @click="submitRefund">确认退款</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getChefDetail } from '../../api/chef'
import { cancelOrder, getOrderDetail } from '../../api/order'
import { createPayment, mockPaymentSuccess, refundPayment } from '../../api/pay'
import { getSingleReview } from '../../api/review'
import { ORDER_STATUS, getOrderStatusClass, getOrderStatusLabel } from '../../utils/order-status'
import { formatFullDateTime, formatScheduleDateTime } from '../../utils/schedule-time'
import { getTimeSlotText } from '../../utils/time-slot'

const USER_ID_KEY = 'user_id'

const INGREDIENT_MODE_TEXT_MAP = {
  1: '用户自备食材',
  2: '平台协同采购'
}

export default {
  name: 'OrderDetailPage',
  data() {
    return {
      ORDER_STATUS,
      id: '',
      userId: '',
      loading: false,
      reviewLoading: false,
      paying: false,
      cancelSubmitting: false,
      refundSubmitting: false,
      showCancelModal: false,
      showRefundModal: false,
      cancelReason: '',
      refundReason: '',
      orderDetail: {},
      chefInfo: null,
      orderReview: null
    }
  },
  computed: {
    isReviewed() {
      return this.orderDetail.reviewed === true || this.orderDetail.reviewed === 1
    },
    statusLabel() {
      return getOrderStatusLabel(this.orderDetail.orderStatus)
    },
    statusClass() {
      return getOrderStatusClass(this.orderDetail.orderStatus)
    },
    heroToneClass() {
      if (this.statusClass === 'pending') {
        return 'hero-card--pending'
      }

      if (this.statusClass === 'success') {
        return 'hero-card--success'
      }

      if (this.statusClass === 'danger') {
        return 'hero-card--danger'
      }

      return ''
    },
    statusSummaryText() {
      const status = this.orderDetail.orderStatus

      if (status === ORDER_STATUS.PENDING_CONFIRM) {
        return '订单已创建，正在等待厨师确认是否接单。'
      }

      if (status === ORDER_STATUS.WAIT_PAY) {
        return '厨师已确认订单，请尽快完成支付以锁定档期。'
      }

      if (status === ORDER_STATUS.PAID) {
        return '订单已支付成功，等待厨师按预约时间开始服务。'
      }

      if (status === ORDER_STATUS.IN_SERVICE) {
        return '厨师已开始服务，本单正在进行中。'
      }

      if (status === ORDER_STATUS.COMPLETED) {
        return '本次服务已经完成，可查看评价或补充评价。'
      }

      if (status === ORDER_STATUS.REJECTED) {
        return '厨师未接受本次订单，你可以重新选择其他厨师。'
      }

      if (status === ORDER_STATUS.CANCELLED) {
        return '订单已取消，本次服务流程已终止。'
      }

      if (status === ORDER_STATUS.REFUNDED) {
        return '订单已进入退款完成状态。'
      }

      return '当前订单状态已更新。'
    },
    progressSteps() {
      return [
        { key: ORDER_STATUS.PENDING_CONFIRM, label: '待确认' },
        { key: ORDER_STATUS.WAIT_PAY, label: '待支付' },
        { key: ORDER_STATUS.PAID, label: '已支付' },
        { key: ORDER_STATUS.IN_SERVICE, label: '服务中' },
        { key: ORDER_STATUS.COMPLETED, label: '已完成' }
      ]
    },
    activeProgressIndex() {
      const status = this.orderDetail.orderStatus

      if (status === ORDER_STATUS.PENDING_CONFIRM || status === ORDER_STATUS.REJECTED) {
        return 0
      }

      if (status === ORDER_STATUS.WAIT_PAY || status === ORDER_STATUS.CANCELLED) {
        return 1
      }

      if (status === ORDER_STATUS.PAID || status === ORDER_STATUS.REFUNDED) {
        return 2
      }

      if (status === ORDER_STATUS.IN_SERVICE) {
        return 3
      }

      if (status === ORDER_STATUS.COMPLETED) {
        return 4
      }

      return 0
    },
    progressTerminalText() {
      const status = this.orderDetail.orderStatus

      if (status === ORDER_STATUS.REJECTED) {
        return '订单在待确认阶段被厨师拒绝，本次服务流程未继续推进。'
      }

      if (status === ORDER_STATUS.CANCELLED) {
        return '订单已被取消，服务流程在支付前结束。'
      }

      if (status === ORDER_STATUS.REFUNDED) {
        return '订单已退款，后续服务流程不再继续。'
      }

      return ''
    },
    showCancelButton() {
      return this.orderDetail.orderStatus === ORDER_STATUS.PENDING_CONFIRM || this.orderDetail.orderStatus === ORDER_STATUS.WAIT_PAY
    },
    showPayButton() {
      return this.orderDetail.orderStatus === ORDER_STATUS.WAIT_PAY
    },
    showRefundButton() {
      return this.orderDetail.orderStatus === ORDER_STATUS.PAID
    },
    chefDisplay() {
      return {
        name: this.orderDetail.chefName || (this.chefInfo && this.chefInfo.name) || '',
        avatar: this.orderDetail.chefAvatar || (this.chefInfo && this.chefInfo.avatar) || '',
        phone: this.orderDetail.chefPhone || (this.chefInfo && this.chefInfo.phone) || '',
        specialtyCuisine: this.orderDetail.chefSpecialtyCuisine || (this.chefInfo && this.chefInfo.specialtyCuisine) || '',
        serviceModeDesc: this.orderDetail.chefServiceModeDesc || (this.chefInfo && this.chefInfo.serviceModeDesc) || ''
      }
    },
    showChefInfoSection() {
      const status = this.orderDetail.orderStatus
      return (status === ORDER_STATUS.IN_SERVICE || status === ORDER_STATUS.COMPLETED) && !!this.chefDisplay.name
    },
    showReviewSection() {
      return this.orderDetail.orderStatus === ORDER_STATUS.COMPLETED
    },
    hasOrderReview() {
      return !!(this.orderReview && this.orderReview.id)
    },
    showBackHomeButton() {
      return this.showCancelButton || this.showRefundButton
    },
    showActionBar() {
      return this.showCancelButton ||
        this.showPayButton ||
        this.showRefundButton ||
        this.showBackHomeButton
    }
  },
  onLoad(options) {
    this.userId = uni.getStorageSync(USER_ID_KEY) || ''
    this.id = options && options.id ? options.id : ''
    if (!this.id) {
      uni.showToast({ title: '缺少订单 id', icon: 'none' })
      return
    }
    this.loadOrderDetail()
  },
  onShow() {
    if (this.id) {
      this.loadOrderDetail()
    }
  },
  methods: {
    formatFullDateTime,
    formatScheduleDateTime,
    getTimeSlotText,
    getProgressStepClass(index) {
      if (index < this.activeProgressIndex) {
        return 'done'
      }

      if (index === this.activeProgressIndex) {
        return 'active'
      }

      return 'todo'
    },
    getIngredientModeText(value) {
      const normalizedValue = Number(value)

      if (INGREDIENT_MODE_TEXT_MAP[normalizedValue]) {
        return INGREDIENT_MODE_TEXT_MAP[normalizedValue]
      }

      return value || '-'
    },
    getChefInitial(name) {
      return name ? String(name).slice(0, 1) : '厨'
    },
    async loadOrderDetail() {
      this.loading = true
      try {
        const data = await getOrderDetail(this.id)
        this.orderDetail = data || {}
        if (!this.userId && data && data.userId) {
          this.userId = data.userId
        }
        await Promise.all([
          this.loadChefInfo(),
          this.loadOrderReview()
        ])
      } catch (error) {
        this.orderDetail = {}
        this.chefInfo = null
        this.orderReview = null
      } finally {
        this.loading = false
      }
    },
    async loadChefInfo() {
      this.chefInfo = null

      const status = this.orderDetail.orderStatus
      if (status !== ORDER_STATUS.IN_SERVICE && status !== ORDER_STATUS.COMPLETED) {
        return
      }

      if (this.orderDetail.chefName || this.orderDetail.chefAvatar || this.orderDetail.chefPhone) {
        return
      }

      if (!this.orderDetail.chefId) {
        return
      }

      try {
        this.chefInfo = await getChefDetail(this.orderDetail.chefId)
      } catch (error) {
        this.chefInfo = null
      }
    },
    async loadOrderReview() {
      this.orderReview = null

      if (this.orderDetail.orderStatus !== ORDER_STATUS.COMPLETED) {
        return
      }

      if (!this.orderDetail.id && !this.orderDetail.orderNo) {
        return
      }

      this.reviewLoading = true
      try {
        this.orderReview = await getSingleReview({
          orderId: this.orderDetail.id
        })
      } catch (error) {
        this.orderReview = null
      } finally {
        this.reviewLoading = false
      }
    },
    parseImageUrls(imageUrls) {
      if (!imageUrls) {
        return []
      }

      return String(imageUrls)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    },
    previewImages(urls, currentIndex) {
      uni.previewImage({
        urls,
        current: urls[currentIndex]
      })
    },
    formatScore(score) {
      if (score === 0) {
        return '0'
      }

      return score || '-'
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
        uni.showToast({ title: '请输入取消原因', icon: 'none' })
        return
      }
      this.cancelSubmitting = true
      try {
        await cancelOrder(this.id, { reason: this.cancelReason.trim() })
        uni.showToast({ title: '取消成功', icon: 'success' })
        this.showCancelModal = false
        await this.loadOrderDetail()
      } finally {
        this.cancelSubmitting = false
      }
    },
    openRefundPopup() {
      this.refundReason = ''
      this.showRefundModal = true
    },
    closeRefundPopup() {
      if (this.refundSubmitting) {
        return
      }
      this.showRefundModal = false
    },
    async submitRefund() {
      if (this.refundSubmitting) {
        return
      }
      if (!this.refundReason.trim()) {
        uni.showToast({ title: '请输入退款原因', icon: 'none' })
        return
      }
      this.refundSubmitting = true
      try {
        await refundPayment({
          orderId: Number(this.orderDetail.id),
          refundAmount: Number(this.orderDetail.payAmount || 0),
          refundReason: this.refundReason.trim()
        })
        uni.showToast({ title: '退款申请成功', icon: 'success' })
        this.showRefundModal = false
        await this.loadOrderDetail()
      } finally {
        this.refundSubmitting = false
      }
    },
    async handlePay() {
      if (this.paying) {
        return
      }
      this.paying = true
      try {
        await createPayment({ orderId: this.orderDetail.id })
        await mockPaymentSuccess(this.orderDetail.id)
        uni.showToast({ title: '支付成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateTo({ url: `/pages/pay/result?orderId=${this.orderDetail.id}` })
        }, 300)
      } finally {
        this.paying = false
      }
    },
    goReview() {
      if (this.isReviewed || !this.orderDetail.id) {
        return
      }
      uni.navigateTo({ url: `/pages/review/create?orderId=${this.orderDetail.id}&chefId=${this.orderDetail.chefId}&userId=${this.orderDetail.userId}` })
    },
    goHome() {
      uni.switchTab({ url: '/pages/home/index' })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 220rpx;
  background:
    radial-gradient(circle at top right, rgba(217, 108, 58, 0.12), transparent 30%),
    linear-gradient(180deg, #fff7f1 0%, #f6f7fb 30%, #f6f7fb 100%);
  box-sizing: border-box;
}

.state-card,
.section-card,
.modal-card {
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 14rpx 36rpx rgba(32, 37, 43, 0.06);
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
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.42), transparent 24%),
    linear-gradient(135deg, #f7a97a 0%, #d96c3a 52%, #c3562e 100%);
}

.hero-card--success {
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.36), transparent 24%),
    linear-gradient(135deg, #4fb17a 0%, #2f8f55 55%, #216f40 100%);
}

.hero-card--danger {
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.36), transparent 24%),
    linear-gradient(135deg, #ef8b8b 0%, #d14a4a 55%, #b93737 100%);
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.hero-copy {
  flex: 1;
  min-width: 0;
}

.hero-eyebrow,
.hero-status-title,
.hero-status-desc,
.hero-meta-label,
.hero-meta-value {
  display: block;
}

.hero-eyebrow {
  font-size: 24rpx;
  letter-spacing: 3rpx;
  color: rgba(255, 255, 255, 0.82);
}

.hero-status-title {
  margin-top: 14rpx;
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
}

.hero-status-desc {
  margin-top: 16rpx;
  font-size: 25rpx;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.88);
}

.hero-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 28rpx;
}

.hero-meta-item {
  min-width: 0;
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(10rpx);
}

.hero-meta-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.72);
}

.hero-meta-value {
  margin-top: 8rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #ffffff;
  word-break: break-all;
}

.status-tag {
  flex-shrink: 0;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.18);
}

.status-tag.pending,
.status-tag.success,
.status-tag.danger {
  color: #ffffff;
}

.progress-card {
  background: linear-gradient(180deg, #ffffff 0%, #fffaf6 100%);
}

.progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2329;
}

.progress-title {
  margin-bottom: 0;
}

.progress-caption {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #8a8f99;
}

.progress-track {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
}

.progress-step {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}

.progress-line {
  position: absolute;
  top: 24rpx;
  left: calc(50% + 30rpx);
  width: calc(100% - 60rpx);
  height: 4rpx;
  border-radius: 999rpx;
  background: #e6eaf0;
}

.progress-step.done .progress-line,
.progress-step.active .progress-line {
  background: linear-gradient(90deg, #f0a06c 0%, #d96c3a 100%);
}

.progress-dot {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #edf0f4;
  box-shadow: inset 0 0 0 2rpx #dde3eb;
}

.progress-step.done .progress-dot,
.progress-step.active .progress-dot {
  background: linear-gradient(135deg, #f5a36e 0%, #d96c3a 100%);
  box-shadow: 0 10rpx 20rpx rgba(217, 108, 58, 0.22);
}

.progress-dot-text {
  font-size: 22rpx;
  font-weight: 700;
  color: #7a828f;
}

.progress-step.done .progress-dot-text,
.progress-step.active .progress-dot-text {
  color: #ffffff;
}

.progress-step-label {
  margin-top: 14rpx;
  font-size: 23rpx;
  color: #9198a4;
  text-align: center;
}

.progress-step.done .progress-step-label,
.progress-step.active .progress-step-label {
  color: #1f2329;
  font-weight: 600;
}

.progress-terminal {
  margin-top: 26rpx;
  padding: 22rpx 24rpx;
  border-radius: 22rpx;
}

.progress-terminal.pending {
  background: #fff2eb;
}

.progress-terminal.success {
  background: #edf8f1;
}

.progress-terminal.danger {
  background: #fdeeee;
}

.progress-terminal-label,
.progress-terminal-text {
  display: block;
}

.progress-terminal-label {
  font-size: 22rpx;
  color: #7b838f;
}

.progress-terminal-text {
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #1f2329;
}

.info-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
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

.chef-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  background: #fff8f3;
}

.chef-avatar {
  width: 116rpx;
  height: 116rpx;
  border-radius: 24rpx;
  background: #f1e1d9;
  flex-shrink: 0;
}

.chef-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chef-avatar-text {
  font-size: 40rpx;
  font-weight: 600;
  color: #b96845;
}

.chef-meta {
  flex: 1;
  min-width: 0;
}

.chef-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2329;
}

.chef-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 25rpx;
  line-height: 1.6;
  color: #6b7280;
}

.review-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.review-title {
  margin-bottom: 0;
}

.review-score {
  font-size: 28rpx;
  font-weight: 600;
  color: #d96c3a;
}

.review-meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.review-meta-text {
  font-size: 24rpx;
  color: #8a8f99;
}

.review-score-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 24rpx;
  margin-top: 20rpx;
}

.review-score-item {
  font-size: 26rpx;
  color: #333333;
}

.review-block {
  margin-top: 24rpx;
}

.review-block-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #1f2329;
}

.review-block-content {
  display: block;
  margin-top: 12rpx;
  font-size: 28rpx;
  line-height: 1.7;
  color: #4f5662;
}

.review-image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 12rpx;
}

.review-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 20rpx;
  background: #f3f4f6;
}

.review-reply-card {
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #fff7f1;
}

.review-empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20rpx;
}

.review-empty-text {
  font-size: 26rpx;
  color: #8a8f99;
}

.review-action-btn {
  min-width: 220rpx;
  height: 80rpx;
  line-height: 80rpx;
  margin: 0;
  padding: 0 28rpx;
  border: none;
  border-radius: 999rpx;
  background: #d96c3a;
  font-size: 28rpx;
  color: #ffffff;
}

.review-action-btn::after {
  border: none;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -8rpx 24rpx rgba(32, 37, 43, 0.06);
  box-sizing: border-box;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
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
.modal-btn::after,
.home-btn::after {
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

.action-btn.danger {
  background: #fdeeee;
  color: #d14a4a;
}

.home-btn {
  width: 100%;
  height: 84rpx;
  line-height: 84rpx;
  margin-top: 16rpx;
  border: none;
  border-radius: 999rpx;
  background: #fff2eb;
  font-size: 28rpx;
  color: #c45e31;
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

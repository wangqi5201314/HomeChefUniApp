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
          <text class="status-tag" :class="statusClass">{{ statusLabel }}</text>
        </view>
        <text class="hero-time">创建时间：{{ formatFullDateTime(orderDetail.createdAt) }}</text>
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
        <view v-if="showStatusNotice" class="status-notice-wrap"><text class="status-notice">{{ statusNoticeText }}</text></view>
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
import { getMyReviewList } from '../../api/review'
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
    showStatusNotice() {
      return this.orderDetail.orderStatus === ORDER_STATUS.PAID ||
        this.orderDetail.orderStatus === ORDER_STATUS.IN_SERVICE ||
        this.orderDetail.orderStatus === ORDER_STATUS.COMPLETED ||
        this.orderDetail.orderStatus === ORDER_STATUS.REJECTED ||
        this.orderDetail.orderStatus === ORDER_STATUS.CANCELLED ||
        this.orderDetail.orderStatus === ORDER_STATUS.REFUNDED
    },
    statusNoticeText() {
      const status = this.orderDetail.orderStatus
      if (status === ORDER_STATUS.PAID) return '已支付'
      if (status === ORDER_STATUS.IN_SERVICE) return '服务中'
      if (status === ORDER_STATUS.COMPLETED) return this.isReviewed ? '已评价' : '已完成'
      if (status === ORDER_STATUS.REJECTED) return '厨师已拒单'
      if (status === ORDER_STATUS.CANCELLED) return '已取消'
      if (status === ORDER_STATUS.REFUNDED) return '已退款'
      return ''
    },
    showBackHomeButton() {
      return this.showCancelButton || this.showRefundButton
    },
    showActionBar() {
      return this.showCancelButton ||
        this.showPayButton ||
        this.showRefundButton ||
        this.showStatusNotice ||
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

      if (!this.userId && !this.orderDetail.userId) {
        return
      }

      this.reviewLoading = true
      try {
        const data = await getMyReviewList(this.userId || this.orderDetail.userId)
        const reviewList = Array.isArray(data) ? data : []
        this.orderReview = reviewList.find((item) => {
          if (!item) {
            return false
          }

          const sameOrderId = item.orderId && String(item.orderId) === String(this.orderDetail.id)
          const sameOrderNo = item.orderNo && this.orderDetail.orderNo && String(item.orderNo) === String(this.orderDetail.orderNo)
          return sameOrderId || sameOrderNo
        }) || null
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
.page { min-height: 100vh; padding: 24rpx 24rpx 220rpx; background: #f6f7fb; box-sizing: border-box; }
.state-card, .section-card, .modal-card { border-radius: 24rpx; background: #ffffff; box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05); }
.state-card { display: flex; align-items: center; justify-content: center; min-height: 360rpx; padding: 40rpx 32rpx; }
.state-text { font-size: 28rpx; color: #8a8f99; }
.section-card { margin-bottom: 24rpx; padding: 28rpx; }
.hero-card { background: linear-gradient(135deg, #fff7f1 0%, #ffffff 100%); }
.hero-head, .info-line { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.hero-head { margin-bottom: 14rpx; }
.order-no { flex: 1; min-width: 0; font-size: 28rpx; font-weight: 600; color: #1f2329; }
.hero-time { display: block; font-size: 24rpx; color: #8a8f99; }
.status-tag { flex-shrink: 0; padding: 10rpx 18rpx; border-radius: 999rpx; font-size: 22rpx; }
.status-tag.pending { background: #fff2eb; color: #c45e31; }
.status-tag.success { background: #edf8f1; color: #2f8f55; }
.status-tag.danger { background: #fdeeee; color: #d14a4a; }
.section-title { display: block; margin-bottom: 20rpx; font-size: 30rpx; font-weight: 600; color: #1f2329; }
.info-line { padding: 12rpx 0; }
.block-line { padding: 12rpx 0; }
.info-label { flex-shrink: 0; font-size: 26rpx; color: #8a8f99; }
.info-value { font-size: 26rpx; color: #4f5662; text-align: right; }
.block-value { display: block; margin-top: 10rpx; font-size: 26rpx; line-height: 1.6; color: #4f5662; }
.amount { color: #d96c3a; font-weight: 600; }
.chef-card { display: flex; align-items: center; gap: 24rpx; }
.chef-avatar { width: 116rpx; height: 116rpx; border-radius: 24rpx; background: #f1e1d9; flex-shrink: 0; }
.chef-avatar-placeholder { display: flex; align-items: center; justify-content: center; }
.chef-avatar-text { font-size: 40rpx; font-weight: 600; color: #b96845; }
.chef-meta { flex: 1; min-width: 0; }
.chef-name { display: block; font-size: 30rpx; font-weight: 600; color: #1f2329; }
.chef-desc { display: block; margin-top: 12rpx; font-size: 25rpx; line-height: 1.6; color: #6b7280; }
.review-head { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
.review-title { margin-bottom: 0; }
.review-score { font-size: 28rpx; font-weight: 600; color: #d96c3a; }
.review-meta { display: flex; flex-direction: column; gap: 8rpx; }
.review-meta-text { font-size: 24rpx; color: #8a8f99; }
.review-score-row { display: flex; flex-wrap: wrap; gap: 16rpx 24rpx; margin-top: 20rpx; }
.review-score-item { font-size: 26rpx; color: #333333; }
.review-block { margin-top: 24rpx; }
.review-block-title { display: block; font-size: 26rpx; font-weight: 600; color: #1f2329; }
.review-block-content { display: block; margin-top: 12rpx; font-size: 28rpx; line-height: 1.7; color: #4f5662; }
.review-image-list { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 12rpx; }
.review-image { width: 160rpx; height: 160rpx; border-radius: 20rpx; background: #f3f4f6; }
.review-reply-card { margin-top: 24rpx; padding: 24rpx; border-radius: 20rpx; background: #fff7f1; }
.review-empty { display: flex; flex-direction: column; align-items: flex-start; gap: 20rpx; }
.review-empty-text { font-size: 26rpx; color: #8a8f99; }
.review-action-btn { min-width: 220rpx; height: 80rpx; line-height: 80rpx; margin: 0; padding: 0 28rpx; border: none; border-radius: 999rpx; background: #d96c3a; font-size: 28rpx; color: #ffffff; }
.review-action-btn::after { border: none; }
.bottom-bar { position: fixed; left: 0; right: 0; bottom: 0; padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom)); background: rgba(255, 255, 255, 0.98); box-shadow: 0 -8rpx 24rpx rgba(32, 37, 43, 0.06); box-sizing: border-box; }
.action-row { display: flex; align-items: center; gap: 20rpx; }
.action-btn { flex: 1; height: 88rpx; line-height: 88rpx; border: none; border-radius: 999rpx; font-size: 30rpx; font-weight: 500; }
.action-btn::after, .modal-btn::after, .home-btn::after { border: none; }
.action-btn.primary { background: #d96c3a; color: #ffffff; }
.action-btn.secondary { background: #f2f4f7; color: #4f5662; }
.action-btn.danger { background: #fdeeee; color: #d14a4a; }
.status-notice-wrap { flex: 1; display: flex; justify-content: flex-end; }
.status-notice { padding: 0 28rpx; height: 88rpx; line-height: 88rpx; border-radius: 999rpx; background: #f2f4f7; font-size: 30rpx; font-weight: 500; color: #8a8f99; }
.home-btn { width: 100%; height: 84rpx; line-height: 84rpx; margin-top: 16rpx; border: none; border-radius: 999rpx; background: #fff2eb; font-size: 28rpx; color: #c45e31; }
.modal-mask { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 32rpx; background: rgba(15, 23, 42, 0.42); box-sizing: border-box; }
.modal-card { width: 100%; padding: 32rpx; }
.modal-title { display: block; margin-bottom: 20rpx; font-size: 32rpx; font-weight: 600; color: #1f2329; }
.modal-textarea { width: 100%; min-height: 180rpx; padding: 24rpx; border-radius: 18rpx; background: #f7f8fb; font-size: 28rpx; color: #222222; box-sizing: border-box; }
.modal-actions { display: flex; gap: 20rpx; margin-top: 28rpx; }
.modal-btn { flex: 1; height: 84rpx; line-height: 84rpx; border: none; border-radius: 999rpx; font-size: 28rpx; }
.modal-btn.plain { background: #f2f4f7; color: #4f5662; }
.modal-btn.danger { background: #d14a4a; color: #ffffff; }
</style>

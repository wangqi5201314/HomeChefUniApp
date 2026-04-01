<template>
  <view class="page">
    <view v-if="loading" class="state-card">
      <text class="state-text">订单详情加载中...</text>
    </view>

    <view v-else-if="!orderDetail.id" class="state-card">
      <text class="state-text">未获取到订单详情</text>
      <button class="back-btn" @click="backToList">返回订单列表</button>
    </view>

    <view v-else>
      <view class="hero-card" :class="heroToneClass">
        <view class="hero-top">
          <view class="hero-copy">
            <text class="hero-label">订单状态</text>
            <text class="hero-status">{{ statusLabel }}</text>
            <text class="hero-desc">{{ statusSummaryText }}</text>
          </view>
          <text class="hero-badge" :class="statusClass">{{ statusLabel }}</text>
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

      <view class="detail-card progress-card">
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

      <view class="detail-card">
        <text class="section-title">服务信息</text>
        <view class="row"><text class="label">服务日期</text><text class="value">{{ orderDetail.serviceDate || '-' }}</text></view>
        <view class="row"><text class="label">时间段</text><text class="value">{{ getTimeSlotText(orderDetail.timeSlot) }}</text></view>
        <view class="row"><text class="label">开始时间</text><text class="value">{{ formatScheduleDateTime(orderDetail.serviceStartTime) }}</text></view>
        <view class="row"><text class="label">结束时间</text><text class="value">{{ formatScheduleDateTime(orderDetail.serviceEndTime) }}</text></view>
        <view class="row"><text class="label">服务人数</text><text class="value">{{ formatPeopleCount(orderDetail.peopleCount) }}</text></view>
      </view>

      <view class="detail-card">
        <text class="section-title">口味与需求</text>
        <view class="row"><text class="label">口味偏好</text><text class="value">{{ orderDetail.tastePreference || '-' }}</text></view>
        <view class="row"><text class="label">忌口信息</text><text class="value">{{ orderDetail.tabooFood || '-' }}</text></view>
        <view class="row"><text class="label">特殊要求</text><text class="value">{{ orderDetail.specialRequirement || '-' }}</text></view>
        <view class="row"><text class="label">食材模式</text><text class="value">{{ getIngredientModeText(orderDetail.ingredientMode) }}</text></view>
        <view class="row"><text class="label">食材清单</text><text class="value">{{ orderDetail.ingredientList || '-' }}</text></view>
      </view>

      <view class="detail-card">
        <text class="section-title">联系信息</text>
        <view class="row"><text class="label">联系人</text><text class="value">{{ orderDetail.contactName || '-' }}</text></view>
        <view class="row"><text class="label">联系电话</text><text class="value">{{ orderDetail.contactPhone || '-' }}</text></view>
        <view class="column-row">
          <text class="label">服务地址</text>
          <text class="multiline-value">{{ orderDetail.fullAddress || '-' }}</text>
        </view>
      </view>

      <view class="detail-card">
        <text class="section-title">费用信息</text>
        <view class="row"><text class="label">订单金额</text><text class="value">￥{{ formatAmount(orderDetail.totalAmount) }}</text></view>
        <view class="row"><text class="label">实付金额</text><text class="value highlight">￥{{ formatAmount(orderDetail.payAmount) }}</text></view>
        <view class="row"><text class="label">创建时间</text><text class="value">{{ formatFullDateTime(orderDetail.createdAt) }}</text></view>
      </view>

      <view class="footer-actions">
        <button
          v-if="showAcceptButton"
          class="ghost-btn"
          :disabled="actionLoading"
          @click="openRejectPopup"
        >
          拒单
        </button>
        <button
          v-if="showAcceptButton"
          class="primary-btn"
          :loading="actionLoading && pendingAction === 'accept'"
          :disabled="actionLoading"
          @click="handleAccept"
        >
          接单
        </button>
        <button
          v-if="showStartButton"
          class="primary-btn full-btn"
          :loading="actionLoading && pendingAction === 'start'"
          :disabled="actionLoading"
          @click="handleStart"
        >
          开始服务
        </button>
        <button
          v-if="showNavigateButton"
          class="ghost-btn full-btn"
          :disabled="actionLoading"
          @click="openServiceNavigation"
        >
          地图导航
        </button>
        <button
          v-if="showFinishButton"
          class="primary-btn full-btn"
          :loading="actionLoading && pendingAction === 'finish'"
          :disabled="actionLoading"
          @click="handleFinish"
        >
          完成服务
        </button>
        <view v-if="showStatusNotice" class="status-panel" :class="statusPanelClass">
          <text class="status-panel-label">{{ statusPanelLabel }}</text>
          <text class="status-panel-text">{{ statusNoticeText }}</text>
        </view>
        <button
          v-if="showViewReviewButton"
          class="ghost-btn full-btn"
          :disabled="actionLoading"
          @click="openReviewPopup"
        >
          查看本单评价
        </button>
        <button class="back-btn" :disabled="actionLoading" @click="backToList">返回订单列表</button>
      </view>
    </view>

    <view v-if="showRejectPopup" class="popup-mask" @click="closeRejectPopup">
      <view class="popup-card" @click.stop>
        <text class="popup-title">填写拒单原因</text>
        <textarea
          v-model="rejectReason"
          class="popup-textarea"
          maxlength="200"
          placeholder="请输入拒单原因"
        />
        <view class="popup-actions">
          <button class="ghost-btn popup-btn" :disabled="actionLoading" @click="closeRejectPopup">取消</button>
          <button
            class="primary-btn popup-btn"
            :loading="actionLoading && pendingAction === 'reject'"
            :disabled="actionLoading"
            @click="handleReject"
          >
            提交
          </button>
        </view>
      </view>
    </view>
    <view v-if="showReviewPopup && orderReview && orderReview.id" class="popup-mask" @click="closeReviewPopup">
      <view class="popup-card review-popup-card" @click.stop>
        <view class="review-popup-head">
          <text class="popup-title">本单评价</text>
          <text class="review-popup-score">综合评分 {{ formatScore(orderReview.overallScore) }}</text>
        </view>
        <view class="review-meta">
          <text class="review-meta-text">{{ orderReview.isAnonymous === 1 ? '匿名用户' : getReviewUserName(orderReview) }}</text>
          <text class="review-meta-text">{{ formatFullDateTime(orderReview.createdAt) }}</text>
        </view>
        <view class="review-score-row">
          <text class="review-score-item">菜品 {{ formatScore(orderReview.dishScore) }}</text>
          <text class="review-score-item">服务 {{ formatScore(orderReview.serviceScore) }}</text>
          <text class="review-score-item">技能 {{ formatScore(orderReview.skillScore) }}</text>
          <text class="review-score-item">环境 {{ formatScore(orderReview.environmentScore) }}</text>
        </view>
        <view class="review-block">
          <text class="review-block-title">评价内容</text>
          <text class="review-block-content">{{ orderReview.content || '用户未填写评价内容' }}</text>
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
          <text class="review-block-title">我的回复</text>
          <text class="review-block-content">{{ orderReview.replyContent }}</text>
          <text v-if="orderReview.replyAt" class="review-meta-text review-reply-time">回复时间：{{ formatFullDateTime(orderReview.replyAt) }}</text>
        </view>
        <view v-else class="review-reply-card">
          <text class="review-block-title">回复评价</text>
          <textarea
            v-model="reviewReplyContent"
            class="popup-textarea review-reply-textarea"
            maxlength="300"
            placeholder="请输入回复内容"
          />
          <view class="review-reply-actions">
            <button
              class="primary-btn popup-btn"
              :loading="reviewReplying"
              :disabled="reviewReplying"
              @click="submitOrderReviewReply"
            >
              提交回复
            </button>
          </view>
        </view>
        <button class="back-btn review-close-btn" @click="closeReviewPopup">关闭</button>
      </view>
    </view>
  </view>
</template>

<script>
import {
  acceptChefOrder,
  finishChefOrder,
  getChefOrderDetail,
  rejectChefOrder,
  startChefOrder
} from '../../api/chef-order'
import { getSingleReview, replyReview } from '../../api/review'
import { getChefId, getChefInfo } from '../../utils/auth'
import { ORDER_STATUS, getOrderStatusClass, getOrderStatusLabel } from '../../utils/order-status'
import { formatFullDateTime, formatScheduleDateTime } from '../../utils/schedule-time'
import { getTimeSlotText } from '../../utils/time-slot'

const INGREDIENT_MODE_TEXT_MAP = {
  1: '用户自备食材',
  2: '平台协同采购'
}

export default {
  name: 'ChefOrderDetailPage',
  data() {
    return {
      ORDER_STATUS,
      loading: false,
      actionLoading: false,
      pendingAction: '',
      orderId: '',
      chefId: '',
      orderDetail: {},
      orderReview: null,
      reviewReplyContent: '',
      reviewReplying: false,
      showRejectPopup: false,
      rejectReason: '',
      showReviewPopup: false
    }
  },
  computed: {
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
        return '请尽快处理新订单，确认后用户才能继续支付。'
      }

      if (status === ORDER_STATUS.WAIT_PAY) {
        return '你已确认订单，当前正在等待用户完成支付。'
      }

      if (status === ORDER_STATUS.PAID) {
        return '订单已支付，可以按预约时间开始服务。'
      }

      if (status === ORDER_STATUS.IN_SERVICE) {
        return '服务进行中，完成后记得及时结束订单。'
      }

      if (status === ORDER_STATUS.COMPLETED) {
        return '本单服务已闭环完成，可查看用户评价。'
      }

      if (status === ORDER_STATUS.REJECTED) {
        return '订单已拒绝，本次服务流程不再继续。'
      }

      if (status === ORDER_STATUS.CANCELLED) {
        return '用户已取消订单，本次服务流程结束。'
      }

      if (status === ORDER_STATUS.REFUNDED) {
        return '订单已退款完成，本次服务流程结束。'
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
        return '订单在待确认阶段已拒绝，不再进入后续服务流程。'
      }

      if (status === ORDER_STATUS.CANCELLED) {
        return '订单已被用户取消，服务流程在支付前结束。'
      }

      if (status === ORDER_STATUS.REFUNDED) {
        return '订单已退款，后续不再继续本次服务流程。'
      }

      return ''
    },
    showAcceptButton() {
      return this.orderDetail.orderStatus === ORDER_STATUS.PENDING_CONFIRM
    },
    showStartButton() {
      return this.orderDetail.orderStatus === ORDER_STATUS.PAID
    },
    showFinishButton() {
      return this.orderDetail.orderStatus === ORDER_STATUS.IN_SERVICE
    },
    showNavigateButton() {
      return this.hasValidServiceCoordinate &&
        (
          this.orderDetail.orderStatus === ORDER_STATUS.PAID ||
          this.orderDetail.orderStatus === ORDER_STATUS.IN_SERVICE
        )
    },
    showViewReviewButton() {
      return this.orderDetail.orderStatus === ORDER_STATUS.COMPLETED && Boolean(this.orderReview && this.orderReview.id)
    },
    hasValidServiceCoordinate() {
      const latitude = Number(this.orderDetail.latitude)
      const longitude = Number(this.orderDetail.longitude)

      return Boolean(latitude && longitude)
    },
    showStatusNotice() {
      return this.orderDetail.orderStatus === ORDER_STATUS.WAIT_PAY ||
        this.orderDetail.orderStatus === ORDER_STATUS.COMPLETED ||
        this.orderDetail.orderStatus === ORDER_STATUS.REJECTED ||
        this.orderDetail.orderStatus === ORDER_STATUS.CANCELLED ||
        this.orderDetail.orderStatus === ORDER_STATUS.REFUNDED
    },
    statusNoticeText() {
      const status = this.orderDetail.orderStatus

      if (status === ORDER_STATUS.WAIT_PAY) {
        return '待用户支付'
      }

      if (status === ORDER_STATUS.COMPLETED) {
        return '服务已完成'
      }

      if (status === ORDER_STATUS.REJECTED) {
        return '已拒单'
      }

      if (status === ORDER_STATUS.CANCELLED) {
        return '用户已取消'
      }

      if (status === ORDER_STATUS.REFUNDED) {
        return '已退款'
      }

      return ''
    },
    statusPanelLabel() {
      const status = this.orderDetail.orderStatus

      if (status === ORDER_STATUS.WAIT_PAY) {
        return '订单进度'
      }

      if (status === ORDER_STATUS.COMPLETED) {
        return '当前状态'
      }

      if (status === ORDER_STATUS.REJECTED || status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.REFUNDED) {
        return '处理结果'
      }

      return '状态提示'
    },
    statusPanelClass() {
      const status = this.orderDetail.orderStatus

      if (status === ORDER_STATUS.WAIT_PAY) {
        return 'status-panel--pending'
      }

      if (status === ORDER_STATUS.COMPLETED) {
        return 'status-panel--success'
      }

      return 'status-panel--danger'
    }
  },
  onLoad(options) {
    this.orderId = options && options.id ? options.id : ''
    const cachedChefInfo = getChefInfo()
    this.chefId = getChefId() || (cachedChefInfo && cachedChefInfo.id) || ''
    this.fetchOrderDetail()
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
    formatScore(value) {
      if (value === 0) {
        return '0'
      }

      return value || '-'
    },
    getIngredientModeText(value) {
      const normalizedValue = Number(value)

      if (INGREDIENT_MODE_TEXT_MAP[normalizedValue]) {
        return INGREDIENT_MODE_TEXT_MAP[normalizedValue]
      }

      return value || '-'
    },
    getReviewUserName(item) {
      if (!item) {
        return '-'
      }

      return item.nickname || item.userNickname || item.userName || item.username || item.realName || item.name || `用户${item.userId}`
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
    async fetchOrderReview() {
      if (!this.orderDetail.id || this.orderDetail.orderStatus !== ORDER_STATUS.COMPLETED) {
        this.orderReview = null
        this.reviewReplyContent = ''
        this.showReviewPopup = false
        return
      }

      try {
        this.orderReview = await getSingleReview({
          orderId: this.orderDetail.id
        })
        this.reviewReplyContent = ''
        if (!this.orderReview) {
          this.showReviewPopup = false
        }
      } catch (error) {
        this.orderReview = null
        this.reviewReplyContent = ''
        this.showReviewPopup = false
      }
    },
    async fetchOrderDetail() {
      if (!this.orderId) {
        uni.showToast({
          title: '缺少订单ID',
          icon: 'none'
        })
        return
      }

      this.loading = true
      try {
        const data = await getChefOrderDetail(this.orderId)
        this.orderDetail = data || {}
        if (this.orderDetail && this.orderDetail.chefId) {
          this.chefId = this.orderDetail.chefId
        }
        await this.fetchOrderReview()
      } catch (error) {
        this.orderDetail = {}
        this.orderReview = null
        this.reviewReplyContent = ''
        this.showReviewPopup = false
      } finally {
        this.loading = false
      }
    },
    async handleAccept() {
      await this.runOrderAction('accept', async () => {
        await acceptChefOrder(this.orderId)
      }, '接单成功')
    },
    async handleStart() {
      await this.runOrderAction('start', async () => {
        await startChefOrder(this.orderId)
      }, '已开始服务', false, async () => {
        this.openServiceNavigation()
      })
    },
    async handleFinish() {
      await this.runOrderAction('finish', async () => {
        await finishChefOrder(this.orderId)
      }, '服务已完成')
    },
    async handleReject() {
      if (!this.rejectReason.trim()) {
        uni.showToast({
          title: '请输入拒单原因',
          icon: 'none'
        })
        return
      }

      await this.runOrderAction('reject', async () => {
        await rejectChefOrder(this.orderId, {
          reason: this.rejectReason.trim()
        })
      }, '拒单成功', true)
    },
    async runOrderAction(action, handler, successText, closePopup = false, afterSuccess = null) {
      if (this.actionLoading) {
        return
      }

      this.actionLoading = true
      this.pendingAction = action

      try {
        await handler()
        uni.showToast({
          title: successText,
          icon: 'success'
        })

        if (closePopup) {
          this.closeRejectPopup()
        }

        await this.fetchOrderDetail()

        if (typeof afterSuccess === 'function') {
          await afterSuccess()
        }
      } catch (error) {
      } finally {
        this.actionLoading = false
        this.pendingAction = ''
      }
    },
    openRejectPopup() {
      this.rejectReason = ''
      this.showRejectPopup = true
    },
    closeRejectPopup() {
      this.showRejectPopup = false
      this.rejectReason = ''
    },
    openReviewPopup() {
      if (!this.showViewReviewButton) {
        return
      }

      this.reviewReplyContent = ''
      this.showReviewPopup = true
    },
    closeReviewPopup() {
      if (this.reviewReplying) {
        return
      }

      this.reviewReplyContent = ''
      this.showReviewPopup = false
    },
    async submitOrderReviewReply() {
      if (!this.orderReview || !this.orderReview.id || this.reviewReplying) {
        return
      }

      const replyContent = this.reviewReplyContent.trim()
      if (!replyContent) {
        uni.showToast({
          title: '请输入回复内容',
          icon: 'none'
        })
        return
      }

      this.reviewReplying = true
      try {
        await replyReview(this.orderReview.id, {
          replyContent
        })
        uni.showToast({
          title: '回复成功',
          icon: 'success'
        })
        await this.fetchOrderReview()
      } catch (error) {
      } finally {
        this.reviewReplying = false
      }
    },
    backToList() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack({
          delta: 1
        })
        return
      }

      uni.redirectTo({
        url: '/pages-chef/order/list'
      })
    },
    openServiceNavigation() {
      if (!this.hasValidServiceCoordinate) {
        uni.showToast({
          title: '未获取到服务地址坐标',
          icon: 'none'
        })
        return
      }

      const latitude = Number(this.orderDetail.latitude)
      const longitude = Number(this.orderDetail.longitude)
      const systemInfo = uni.getSystemInfoSync ? uni.getSystemInfoSync() : {}

      if (systemInfo.platform === 'devtools') {
        const addressText = this.orderDetail.fullAddress || `${latitude},${longitude}`

        uni.setClipboardData({
          data: addressText,
          success: () => {
            uni.showModal({
              title: '请在真机导航',
              content: '微信开发者工具里点击“去这里”会尝试打开 qqmap:// 协议，电脑环境无法拉起腾讯地图导航。请在微信真机中测试导航，当前已为你复制服务地址。',
              showCancel: false
            })
          },
          fail: () => {
            uni.showModal({
              title: '请在真机导航',
              content: '微信开发者工具里无法直接拉起腾讯地图导航，请在微信真机中测试。',
              showCancel: false
            })
          }
        })
        return
      }

      uni.openLocation({
        latitude,
        longitude,
        name: this.orderDetail.contactName || '服务地址',
        address: this.orderDetail.fullAddress || '',
        scale: 16
      })
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
  padding: 24rpx 24rpx 40rpx;
  background:
    radial-gradient(circle at top right, rgba(47, 143, 85, 0.14), transparent 34%),
    linear-gradient(180deg, #eef7f1 0%, #f6f7fb 42%, #f6f7fb 100%);
  box-sizing: border-box;
}

.state-card,
.hero-card,
.detail-card {
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 14rpx 36rpx rgba(28, 39, 31, 0.06);
}

.state-card {
  padding: 72rpx 32rpx;
  text-align: center;
}

.state-text {
  display: block;
  font-size: 28rpx;
  color: #74807b;
}

.hero-card {
  padding: 32rpx;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.34), transparent 24%),
    linear-gradient(135deg, #56b57f 0%, #2f8f55 56%, #216f40 100%);
}

.hero-card--pending {
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.34), transparent 24%),
    linear-gradient(135deg, #f2b07c 0%, #d78644 56%, #b9682e 100%);
}

.hero-card--danger {
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.34), transparent 24%),
    linear-gradient(135deg, #ef8b8b 0%, #d14a4a 56%, #b73b3b 100%);
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

.hero-label,
.hero-status,
.hero-desc,
.hero-meta-label,
.hero-meta-value {
  display: block;
}

.hero-label {
  font-size: 24rpx;
  letter-spacing: 3rpx;
  color: rgba(255, 255, 255, 0.8);
}

.hero-status {
  margin-top: 14rpx;
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
}

.hero-desc {
  margin-top: 16rpx;
  font-size: 25rpx;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.88);
}

.hero-badge {
  flex-shrink: 0;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.18);
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

.detail-card {
  margin-top: 20rpx;
  padding: 28rpx;
}

.progress-card {
  background: linear-gradient(180deg, #ffffff 0%, #f7fcf8 100%);
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
  color: #223128;
}

.progress-title {
  margin-bottom: 0;
}

.progress-caption {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #7a837d;
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
  background: #e1e8e3;
}

.progress-step.done .progress-line,
.progress-step.active .progress-line {
  background: linear-gradient(90deg, #70bf92 0%, #2f8f55 100%);
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
  background: #edf2ee;
  box-shadow: inset 0 0 0 2rpx #dfe7e1;
}

.progress-step.done .progress-dot,
.progress-step.active .progress-dot {
  background: linear-gradient(135deg, #5fb684 0%, #2f8f55 100%);
  box-shadow: 0 10rpx 20rpx rgba(47, 143, 85, 0.2);
}

.progress-dot-text {
  font-size: 22rpx;
  font-weight: 700;
  color: #7a837d;
}

.progress-step.done .progress-dot-text,
.progress-step.active .progress-dot-text {
  color: #ffffff;
}

.progress-step-label {
  margin-top: 14rpx;
  font-size: 23rpx;
  color: #919b95;
  text-align: center;
}

.progress-step.done .progress-step-label,
.progress-step.active .progress-step-label {
  color: #223128;
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
  color: #7a837d;
}

.progress-terminal-text {
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #223128;
}

.row,
.column-row {
  display: flex;
  margin-top: 18rpx;
}

.row:first-of-type,
.column-row:first-of-type {
  margin-top: 0;
}

.row {
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.column-row {
  flex-direction: column;
}

.label {
  font-size: 26rpx;
  color: #7a837d;
}

.value,
.multiline-value {
  font-size: 26rpx;
  color: #1f2329;
  text-align: right;
}

.multiline-value {
  margin-top: 10rpx;
  line-height: 1.7;
  text-align: left;
  word-break: break-all;
}

.highlight {
  color: #d96c3a;
  font-weight: 600;
}

.footer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 28rpx;
}

.primary-btn,
.ghost-btn,
.back-btn {
  height: 88rpx;
  line-height: 88rpx;
  border: none;
  border-radius: 18rpx;
  font-size: 30rpx;
}

.primary-btn {
  flex: 1;
  background: #2f8f55;
  color: #ffffff;
}

.ghost-btn {
  flex: 1;
  background: #ffffff;
  box-shadow: inset 0 0 0 2rpx #d6e3da;
  color: #4d5d52;
}

.back-btn {
  width: 100%;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 0 0 2rpx #e3e8e4;
  color: #4d5d52;
}

.full-btn {
  width: 100%;
  flex: none;
}

.status-panel {
  width: 100%;
  padding: 24rpx 26rpx;
  border-radius: 22rpx;
  box-sizing: border-box;
}

.status-panel--pending {
  background: linear-gradient(135deg, #fff8ef 0%, #fff2de 100%);
  box-shadow: inset 0 0 0 2rpx rgba(196, 94, 49, 0.12);
}

.status-panel--success {
  background: linear-gradient(135deg, #f4fbf6 0%, #eaf7ef 100%);
  box-shadow: inset 0 0 0 2rpx rgba(47, 143, 85, 0.12);
}

.status-panel--danger {
  background: linear-gradient(135deg, #fff6f6 0%, #fdeeee 100%);
  box-shadow: inset 0 0 0 2rpx rgba(209, 74, 74, 0.12);
}

.status-panel-label {
  display: block;
  font-size: 22rpx;
  letter-spacing: 2rpx;
  color: #7a837d;
}

.status-panel-text {
  display: block;
  margin-top: 10rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #223128;
  box-sizing: border-box;
}

.review-popup-card {
  max-height: 84vh;
  overflow-y: auto;
}

.review-popup-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.review-popup-score {
  flex-shrink: 0;
  font-size: 26rpx;
  font-weight: 600;
  color: #d96c3a;
}

.review-meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 20rpx;
}

.review-meta-text {
  font-size: 24rpx;
  color: #7a837d;
  line-height: 1.6;
}

.review-score-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx 20rpx;
  margin-top: 22rpx;
}

.review-score-item {
  font-size: 26rpx;
  color: #223128;
}

.review-block,
.review-reply-card {
  margin-top: 24rpx;
  padding: 22rpx 24rpx;
  border-radius: 22rpx;
  background: #f7f9f8;
}

.review-block-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #223128;
}

.review-block-content {
  display: block;
  margin-top: 12rpx;
  font-size: 28rpx;
  line-height: 1.7;
  color: #1f2329;
}

.review-image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}

.review-image {
  width: 176rpx;
  height: 176rpx;
  border-radius: 18rpx;
  background: #eef2ef;
}

.review-reply-time {
  display: block;
  margin-top: 12rpx;
}

.review-reply-textarea {
  height: 180rpx;
  margin-top: 16rpx;
}

.review-reply-actions {
  display: flex;
  margin-top: 20rpx;
}

.review-close-btn {
  margin-top: 28rpx;
}

.primary-btn::after,
.ghost-btn::after,
.back-btn::after,
.popup-btn::after {
  border: none;
}

.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  background: rgba(15, 23, 18, 0.42);
  z-index: 99;
  box-sizing: border-box;
}

.popup-card {
  width: 100%;
  padding: 32rpx 28rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.popup-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #223128;
}

.popup-textarea {
  width: 100%;
  height: 220rpx;
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #f5f7f6;
  font-size: 28rpx;
  color: #1f2329;
  box-sizing: border-box;
}

.popup-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
}

.popup-btn {
  flex: 1;
}
</style>


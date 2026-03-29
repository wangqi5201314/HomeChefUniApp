<template>
  <view class="page">
    <view v-if="loading" class="state-card">
      <text class="state-text">工作台加载中...</text>
    </view>

    <view v-else class="content">
      <view class="hero-card">
        <view class="hero-main">
          <view class="avatar-wrap">
            <image
              v-if="chefInfo.avatar"
              class="avatar"
              :src="chefInfo.avatar"
              mode="aspectFill"
            />
            <view v-else class="avatar avatar-placeholder">
              <text class="avatar-text">{{ avatarText }}</text>
            </view>
          </view>

          <view class="hero-info">
            <view class="name-row">
              <text class="name">{{ chefInfo.name || '未命名厨师' }}</text>
              <text class="cert-tag" :class="certTagClass">{{ certStatusText }}</text>
            </view>
            <text class="info-line">服务模式：{{ serviceModeText }}</text>
            <text class="info-line">评分：{{ formatValue(chefInfo.ratingAvg) }}</text>
            <text class="info-line">完成订单：{{ formatValue(chefInfo.orderCount) }}</text>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head">
          <text class="section-title">今日待办</text>
        </view>
        <view class="stats-grid">
          <view class="stat-card" @click="goPendingOrders">
            <text class="stat-value">{{ pendingConfirmCount }}</text>
            <text class="stat-label">待确认订单</text>
          </view>
          <view class="stat-card" @click="goServiceOrders">
            <text class="stat-value">{{ waitingServiceCount }}</text>
            <text class="stat-label">待服务订单</text>
          </view>
          <view class="stat-card" @click="goSchedulePage">
            <text class="stat-value">{{ todayScheduleCount }}</text>
            <text class="stat-label">今日档期数</text>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head">
          <text class="section-title">快捷入口</text>
        </view>
        <view class="quick-grid">
          <view
            v-for="item in quickActions"
            :key="item.url"
            class="quick-item"
            @click="goPage(item.url)"
          >
            <view class="quick-icon">
              <image class="quick-icon-image" :src="item.icon" mode="aspectFit" />
            </view>
            <text class="quick-text">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head">
          <text class="section-title">最近订单</text>
          <text class="section-link" @click="goPage('/pages-chef/order/list')">查看全部</text>
        </view>

        <view v-if="recentOrders.length === 0" class="empty-box">
          <text class="empty-text">暂无最近订单</text>
        </view>

        <view v-else>
          <view
            v-for="item in recentOrders"
            :key="item.id"
            class="order-card"
            @click="goOrderDetail(item.id)"
          >
            <view class="order-head">
              <text class="order-no">订单号：{{ item.orderNo || '-' }}</text>
              <text class="order-status" :class="getStatusClass(item.orderStatus)">
                {{ getStatusLabel(item.orderStatus) }}
              </text>
            </view>

            <view class="order-info">
              <text class="order-line">服务日期：{{ item.serviceDate || '-' }}</text>
              <text class="order-line">时间段：{{ getTimeSlotText(item.timeSlot) }}</text>
              <text class="order-line">人数：{{ formatPeopleCount(item.peopleCount) }}</text>
              <text class="order-line">联系人：{{ item.contactName || '-' }}</text>
              <text class="order-line">地址：{{ item.fullAddress || '-' }}</text>
            </view>

            <view v-if="getOrderActions(item).length" class="order-actions">
              <button
                v-for="action in getOrderActions(item)"
                :key="action.type"
                class="action-btn"
                :class="action.buttonClass"
                :loading="actionLoadingId === item.id && actionLoadingType === action.type"
                :disabled="actionLoadingId === item.id"
                @click.stop="handleOrderAction(item, action.type)"
              >
                {{ action.label }}
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showRejectModal" class="modal-mask" @click="closeRejectPopup">
      <view class="modal-card" @click.stop>
        <text class="modal-title">拒单原因</text>
        <textarea
          v-model="rejectReason"
          class="modal-textarea"
          placeholder="请输入拒单原因"
        />
        <view class="modal-actions">
          <button class="modal-btn modal-btn--plain" @click="closeRejectPopup">取消</button>
          <button
            class="modal-btn modal-btn--danger"
            :loading="actionLoadingType === 'reject'"
            :disabled="actionLoadingType === 'reject'"
            @click="confirmReject"
          >
            提交
          </button>
        </view>
      </view>
    </view>

    <chef-tabbar current="home" />
  </view>
</template>

<script>
import ChefTabbar from '../../components/chef-tabbar.vue'
import { getCurrentChefInfo } from '../../api/chef-auth'
import {
  acceptChefOrder,
  finishChefOrder,
  getChefOrderList,
  rejectChefOrder,
  startChefOrder
} from '../../api/chef-order'
import { getMyChefSchedule } from '../../api/chef-schedule'
import { setChefInfo } from '../../utils/auth'
import { getChefCertStatusText } from '../../utils/chef-cert-status'
import { getChefServiceModeText } from '../../utils/chef-service-mode'
import { ORDER_STATUS, getOrderStatusClass, getOrderStatusLabel } from '../../utils/order-status'
import { getTimeSlotText } from '../../utils/time-slot'

const QUICK_ACTIONS = [
  {
    icon: '/static/chef-order.png',
    label: '我的订单',
    url: '/pages-chef/order/list'
  },
  {
    icon: '/static/chef-schedule.png',
    label: '我的档期',
    url: '/pages-chef/schedule/index'
  }, 
  {
    icon: '/static/chef-certification.png',
    label: '认证资料',
    url: '/pages-chef/certification/index'
  },
  {
    icon: '/static/chef-profile.png',
    label: '我的资料',
    url: '/pages-chef/mine/profile'
  }
]

export default {
  name: 'ChefHomePage',
  components: {
    ChefTabbar
  },
  data() {
    return {
      loading: true,
      chefInfo: {},
      pendingConfirmCount: 0,
      waitingServiceCount: 0,
      todayScheduleCount: 0,
      recentOrders: [],
      quickActions: QUICK_ACTIONS,
      actionLoadingId: null,
      actionLoadingType: '',
      showRejectModal: false,
      pendingRejectOrderId: null,
      rejectReason: ''
    }
  },
  computed: {
    avatarText() {
      return this.chefInfo.name ? String(this.chefInfo.name).slice(0, 1) : '厨'
    },
    certStatusText() {
      if (this.chefInfo.certStatusDesc) {
        return this.chefInfo.certStatusDesc
      }
      return getChefCertStatusText(this.chefInfo.certStatus)
    },
    certTagClass() {
      const status = Number(this.chefInfo.certStatus)
      if (status === 1) {
        return 'success'
      }
      if (status === 2) {
        return 'danger'
      }
      return 'pending'
    },
    serviceModeText() {
      if (this.chefInfo.serviceModeDesc) {
        return this.chefInfo.serviceModeDesc
      }
      return getChefServiceModeText(this.chefInfo.serviceMode)
    }
  },
  onShow() {
    this.loadWorkbench(false)
  },
  onPullDownRefresh() {
    this.loadWorkbench(true)
  },
  methods: {
    getTimeSlotText,
    async loadWorkbench(fromPullDown = false) {
      if (!fromPullDown) {
        this.loading = true
      }

      const today = this.getTodayDate()

      try {
        const [
          chefData,
          recentOrderData,
          pendingOrderData,
          paidOrderData,
          todayScheduleData
        ] = await Promise.all([
          getCurrentChefInfo(),
          getChefOrderList(),
          getChefOrderList({ orderStatus: ORDER_STATUS.PENDING_CONFIRM }),
          getChefOrderList({ orderStatus: ORDER_STATUS.PAID }),
          getMyChefSchedule({
            startDate: today,
            endDate: today
          })
        ])

        this.chefInfo = chefData || {}
        setChefInfo(this.chefInfo)
        this.pendingConfirmCount = Array.isArray(pendingOrderData) ? pendingOrderData.length : 0
        this.waitingServiceCount = Array.isArray(paidOrderData) ? paidOrderData.length : 0
        this.todayScheduleCount = Array.isArray(todayScheduleData) ? todayScheduleData.length : 0
        this.recentOrders = Array.isArray(recentOrderData) ? recentOrderData.slice(0, 5) : []
      } catch (error) {
        uni.showToast({
          title: '工作台数据加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
        uni.stopPullDownRefresh()
      }
    },
    getTodayDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    formatValue(value) {
      if (value === 0) {
        return '0'
      }
      return value || '-'
    },
    formatPeopleCount(value) {
      if (value === 0) {
        return '0人'
      }
      return value ? `${value}人` : '-'
    },
    getStatusLabel(status) {
      return getOrderStatusLabel(status)
    },
    getStatusClass(status) {
      return getOrderStatusClass(status)
    },
    getOrderActions(order) {
      if (order.orderStatus === ORDER_STATUS.PENDING_CONFIRM) {
        return [
          {
            type: 'accept',
            label: '接单',
            buttonClass: 'primary'
          },
          {
            type: 'reject',
            label: '拒单',
            buttonClass: 'danger'
          }
        ]
      }

      if (order.orderStatus === ORDER_STATUS.PAID) {
        return [
          {
            type: 'start',
            label: '开始服务',
            buttonClass: 'primary'
          }
        ]
      }

      if (order.orderStatus === ORDER_STATUS.IN_SERVICE) {
        return [
          {
            type: 'finish',
            label: '完成服务',
            buttonClass: 'primary'
          }
        ]
      }

      return []
    },
    goPage(url) {
      uni.navigateTo({
        url
      })
    },
    goOrderDetail(id) {
      uni.navigateTo({
        url: `/pages-chef/order/detail?id=${id}`
      })
    },
    goPendingOrders() {
      uni.redirectTo({
        url: '/pages-chef/order/list?orderStatus=PENDING_CONFIRM'
      })
    },
    goServiceOrders() {
      uni.redirectTo({
        url: '/pages-chef/order/list?orderStatus=PAID'
      })
    },
    goSchedulePage() {
      uni.navigateTo({
        url: '/pages-chef/schedule/index'
      })
    },
    async handleOrderAction(order, actionType) {
      if (!order || !order.id || this.actionLoadingId) {
        return
      }

      if (actionType === 'reject') {
        this.pendingRejectOrderId = order.id
        this.rejectReason = ''
        this.showRejectModal = true
        return
      }

      this.actionLoadingId = order.id
      this.actionLoadingType = actionType

      try {
        if (actionType === 'accept') {
          await acceptChefOrder(order.id)
        } else if (actionType === 'start') {
          await startChefOrder(order.id)
        } else if (actionType === 'finish') {
          await finishChefOrder(order.id)
        }

        uni.showToast({
          title: '操作成功',
          icon: 'success'
        })

        await this.loadWorkbench(false)
      } catch (error) {
      } finally {
        this.actionLoadingId = null
        this.actionLoadingType = ''
      }
    },
    closeRejectPopup(force = false) {
      if (!force && this.actionLoadingType === 'reject') {
        return
      }

      this.showRejectModal = false
      this.pendingRejectOrderId = null
      this.rejectReason = ''
    },
    async confirmReject() {
      if (!this.pendingRejectOrderId) {
        return
      }

      if (!this.rejectReason.trim()) {
        uni.showToast({
          title: '请输入拒单原因',
          icon: 'none'
        })
        return
      }

      this.actionLoadingId = this.pendingRejectOrderId
      this.actionLoadingType = 'reject'

      try {
        await rejectChefOrder(this.pendingRejectOrderId, {
          reason: this.rejectReason.trim()
        })

        uni.showToast({
          title: '操作成功',
          icon: 'success'
        })

        this.closeRejectPopup(true)
        await this.loadWorkbench(false)
      } catch (error) {
      } finally {
        this.actionLoadingId = null
        this.actionLoadingType = ''
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 150rpx;
  background:
    radial-gradient(circle at top right, rgba(47, 143, 85, 0.14), transparent 34%),
    linear-gradient(180deg, #eef7f1 0%, #f6f7fb 38%, #f6f7fb 100%);
  box-sizing: border-box;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.hero-card,
.section-card,
.state-card,
.modal-card {
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 14rpx 36rpx rgba(28, 39, 31, 0.06);
}

.hero-card,
.section-card {
  padding: 28rpx;
}

.state-card {
  padding: 72rpx 32rpx;
  text-align: center;
}

.state-text,
.empty-text {
  font-size: 28rpx;
  color: #74807b;
}

.hero-main {
  display: flex;
  align-items: center;
}

.avatar-wrap {
  flex-shrink: 0;
}

.avatar {
  width: 132rpx;
  height: 132rpx;
  border-radius: 50%;
  background: #e5efe8;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 46rpx;
  font-weight: 600;
  color: #2f8f55;
}

.hero-info {
  flex: 1;
  min-width: 0;
  margin-left: 24rpx;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.name {
  font-size: 38rpx;
  font-weight: 600;
  color: #1f2329;
}

.cert-tag {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.cert-tag.pending {
  background: #fff2de;
  color: #b86a1f;
}

.cert-tag.success {
  background: #edf8f1;
  color: #2f8f55;
}

.cert-tag.danger {
  background: #fdeeee;
  color: #d14a4a;
}

.info-line {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #5f6671;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2329;
}

.section-link {
  font-size: 26rpx;
  color: #2f8f55;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18rpx;
}

.stat-card {
  padding: 24rpx 12rpx;
  border-radius: 22rpx;
  background: linear-gradient(180deg, #f8fbf9 0%, #edf7f1 100%);
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #2f8f55;
}

.stat-label {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #5f6671;
  line-height: 1.5;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18rpx;
}

.quick-item {
  padding: 24rpx 12rpx;
  border-radius: 22rpx;
  background: #f8faf9;
  text-align: center;
}

.quick-icon {
  width: 72rpx;
  height: 72rpx;
  margin: 0 auto;
  border-radius: 18rpx;
  background: #e8f3ec;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-icon-image {
  width: 42rpx;
  height: 42rpx;
}

.quick-text {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  color: #1f2329;
}

.empty-box {
  padding: 36rpx 24rpx;
  border-radius: 22rpx;
  background: #f8faf9;
  text-align: center;
}

.order-card {
  margin-top: 20rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #f8faf9;
}

.order-card:first-child {
  margin-top: 0;
}

.order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.order-no {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  font-weight: 600;
  color: #1f2329;
}

.order-status {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.order-status.pending {
  background: #fff2eb;
  color: #c45e31;
}

.order-status.success {
  background: #edf8f1;
  color: #2f8f55;
}

.order-status.danger {
  background: #fdeeee;
  color: #d14a4a;
}

.order-info {
  margin-top: 18rpx;
}

.order-line {
  display: block;
  margin-top: 10rpx;
  font-size: 25rpx;
  color: #55605a;
  line-height: 1.6;
}

.order-line:first-child {
  margin-top: 0;
}

.order-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}

.action-btn {
  flex: 1;
  height: 76rpx;
  line-height: 76rpx;
  border: none;
  border-radius: 999rpx;
  font-size: 28rpx;
}

.action-btn::after,
.modal-btn::after {
  border: none;
}

.action-btn.primary {
  background: #2f8f55;
  color: #ffffff;
}

.action-btn.danger {
  background: #fdeeee;
  color: #d14a4a;
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
  z-index: 120;
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

.modal-btn--plain {
  background: #f2f4f7;
  color: #4f5662;
}

.modal-btn--danger {
  background: #d14a4a;
  color: #ffffff;
}
</style>

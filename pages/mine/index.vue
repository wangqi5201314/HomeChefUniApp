<template>
  <view class="page">
    <view class="profile-card">
      <view class="profile-decor profile-decor-left"></view>
      <view class="profile-decor profile-decor-right"></view>

      <view class="profile-main">
        <view class="avatar-shell">
          <view class="avatar-wrap">
            <image v-if="userInfo.avatar" class="avatar" :src="userInfo.avatar" mode="aspectFill" />
            <view v-else class="avatar avatar-placeholder">
              <text class="avatar-text">{{ avatarText }}</text>
            </view>
          </view>
        </view>

        <view class="profile-info">
          <text class="profile-label">我的主页</text>
          <text class="nickname">{{ displayNickname }}</text>
          <text class="phone">{{ userInfo.phone || '-' }}</text>
          <view class="status-chip-row">
            <text class="status-chip">账号状态 {{ userStatusText }}</text>
          </view>
        </view>
      </view>

      <view class="summary-row">
        <view class="summary-chip">
          <text class="summary-value">{{ orderCount }}</text>
          <text class="summary-label">订单数量</text>
        </view>
        <view class="summary-chip">
          <text class="summary-value">{{ addressCount }}</text>
          <text class="summary-label">地址数量</text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <text class="section-title">常用功能</text>
      <view class="menu-card">
        <view class="menu-item" @click="goOrderList">
          <view class="menu-left">
            <view class="menu-icon warm">
              <image class="menu-icon-image" src="/static/my-order.png" mode="aspectFit" />
            </view>
            <view class="menu-copy">
              <text class="menu-text">我的订单</text>
              <text class="menu-sub">查看历史订单与服务进度</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-badge">{{ orderCount }}</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="goAddressList">
          <view class="menu-left">
            <view class="menu-icon peach">
              <image class="menu-icon-image" src="/static/my-address.png" mode="aspectFit" />
            </view>
            <view class="menu-copy">
              <text class="menu-text">我的地址</text>
              <text class="menu-sub">管理常用服务地址</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-badge">{{ addressCount }}</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>

        <view class="menu-item last" @click="goReviewList">
          <view class="menu-left">
            <view class="menu-icon blue">
              <image class="menu-icon-image" src="/static/my-review.png" mode="aspectFit" />
            </view>
            <view class="menu-copy">
              <text class="menu-text">我的评价</text>
              <text class="menu-sub">查看已发布的订单评价</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <text class="section-title">账号设置</text>
      <view class="menu-card">
        <view class="menu-item" @click="goProfile">
          <view class="menu-left">
            <view class="menu-icon sand">
              <image class="menu-icon-image" src="/static/my-profile.png" mode="aspectFit" />
            </view>
            <view class="menu-copy">
              <text class="menu-text">我的资料</text>
              <text class="menu-sub">修改头像、昵称和手机号</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>

        <view class="menu-item last" @click="goChangePassword">
          <view class="menu-left">
            <view class="menu-icon gray">
              <image class="menu-icon-image" src="/static/my-password.png" mode="aspectFit" />
            </view>
            <view class="menu-copy">
              <text class="menu-text">修改密码</text>
              <text class="menu-sub">定期更新密码更安全</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <button class="logout-btn" @click="handleLogout">退出登录</button>
  </view>
</template>

<script>
import { getUserAddressList } from '../../api/address'
import { getOrderList } from '../../api/order'
import { getCurrentUserInfo } from '../../api/user'
import { clearAuth, getUserInfo, setUserInfo } from '../../utils/auth'
import { getUserStatusText } from '../../utils/user-status'

const USER_ID_KEY = 'user_id'
const USER_TYPE_KEY = 'user_type'
const ADMIN_ID_KEY = 'admin_id'

export default {
  name: 'MinePage',
  data() {
    return {
      userId: '',
      userInfo: {},
      orderCount: 0,
      addressCount: 0
    }
  },
  computed: {
    displayNickname() {
      return this.userInfo.nickname || '未设置昵称'
    },
    avatarText() {
      const name = this.userInfo.nickname || this.userInfo.phone || '我'
      return String(name).slice(0, 1)
    },
    userStatusText() {
      if (this.userInfo.statusDesc) {
        return this.userInfo.statusDesc
      }

      if (this.userInfo.status === 0 || this.userInfo.status) {
        return getUserStatusText(this.userInfo.status)
      }

      return '未知状态'
    }
  },
  onShow() {
    this.userId = uni.getStorageSync(USER_ID_KEY) || ''
    this.loadPageData()
  },
  methods: {
    async loadPageData() {
      const cachedUserInfo = getUserInfo()
      if (cachedUserInfo) {
        this.userInfo = cachedUserInfo
      }

      if (!this.userId) {
        this.userInfo = {}
        this.orderCount = 0
        this.addressCount = 0
        return
      }

      try {
        const [userData, orderData, addressData] = await Promise.all([
          getCurrentUserInfo(),
          getOrderList({ userId: this.userId }),
          getUserAddressList({ userId: this.userId })
        ])

        this.userInfo = userData || {}
        this.orderCount = Array.isArray(orderData) ? orderData.length : 0
        this.addressCount = Array.isArray(addressData) ? addressData.length : 0
        setUserInfo(this.userInfo)
      } catch (error) {
        this.orderCount = 0
        this.addressCount = 0
      }
    },
    goProfile() {
      uni.navigateTo({ url: '/pages/mine/profile' })
    },
    goReviewList() {
      uni.navigateTo({ url: '/pages/review/list' })
    },
    goAddressList() {
      uni.navigateTo({ url: '/pages/address/list' })
    },
    goChangePassword() {
      uni.navigateTo({ url: '/pages/mine/change-password' })
    },
    goOrderList() {
      uni.switchTab({ url: '/pages/order/list' })
    },
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确认退出登录吗？',
        success: (res) => {
          if (!res.confirm) {
            return
          }

          clearAuth()
          uni.removeStorageSync(USER_ID_KEY)
          uni.removeStorageSync(USER_TYPE_KEY)
          uni.removeStorageSync(ADMIN_ID_KEY)
          uni.reLaunch({ url: '/pages/login/index' })
        }
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: linear-gradient(180deg, #fff8f2 0%, #f6f7fb 34%, #f6f7fb 100%);
  box-sizing: border-box;
}

.profile-card,
.menu-card {
  position: relative;
  overflow: hidden;
  border-radius: 30rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 36rpx rgba(32, 37, 43, 0.06);
}

.profile-card {
  padding: 34rpx 32rpx 30rpx;
  background:
    radial-gradient(circle at top right, rgba(255, 241, 232, 0.95), transparent 28%),
    linear-gradient(135deg, #fff9f4 0%, #ffffff 56%);
}

.profile-decor {
  position: absolute;
  border-radius: 50%;
  background: rgba(217, 108, 58, 0.08);
}

.profile-decor-left {
  left: -40rpx;
  top: -50rpx;
  width: 180rpx;
  height: 180rpx;
}

.profile-decor-right {
  right: -36rpx;
  top: 24rpx;
  width: 120rpx;
  height: 120rpx;
}

.profile-main {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
}

.avatar-shell {
  flex-shrink: 0;
  padding: 8rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd8bd 0%, #f3a578 100%);
  box-shadow: 0 16rpx 30rpx rgba(217, 108, 58, 0.16);
}

.avatar-wrap {
  flex-shrink: 0;
}

.avatar {
  width: 136rpx;
  height: 136rpx;
  border-radius: 50%;
  background: #f1e1d9;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 48rpx;
  font-weight: 600;
  color: #b96845;
}

.profile-info {
  flex: 1;
  min-width: 0;
  margin-left: 28rpx;
}

.profile-label {
  display: block;
  font-size: 22rpx;
  letter-spacing: 3rpx;
  color: #b77a5c;
}

.nickname {
  display: block;
  margin-top: 12rpx;
  font-size: 38rpx;
  font-weight: 600;
  color: #1f2329;
}

.phone {
  display: block;
  margin-top: 14rpx;
  font-size: 28rpx;
  color: #6b7280;
}

.status-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.status-chip {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #fff1e8;
  font-size: 22rpx;
  color: #c76335;
}

.summary-row {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 28rpx;
}

.summary-chip {
  padding: 20rpx 22rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: inset 0 0 0 2rpx #f5e6db;
}

.summary-value,
.summary-label {
  display: block;
}

.summary-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #d96c3a;
}

.summary-label {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #8a8f99;
}

.menu-section {
  margin-top: 24rpx;
}

.section-title {
  display: block;
  margin: 0 0 16rpx 6rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #6b7280;
}

.menu-card {
  padding: 0 28rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 118rpx;
  border-bottom: 2rpx solid #f1f3f6;
}

.menu-item.last {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.menu-icon.warm {
  background: #fff1e8;
}

.menu-icon.peach {
  background: #fff4ef;
}

.menu-icon.blue {
  background: #eef4ff;
}

.menu-icon.sand {
  background: #f8f1ea;
}

.menu-icon.gray {
  background: #f2f4f7;
}

.menu-icon-image {
  width: 36rpx;
  height: 36rpx;
}

.menu-copy {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
}

.menu-text {
  display: block;
  font-size: 30rpx;
  color: #1f2329;
}

.menu-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #8a8f99;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex-shrink: 0;
}

.menu-badge {
  min-width: 44rpx;
  padding: 0 14rpx;
  height: 44rpx;
  line-height: 44rpx;
  border-radius: 999rpx;
  background: #fff1e8;
  font-size: 22rpx;
  text-align: center;
  color: #c76335;
}

.menu-arrow {
  font-size: 32rpx;
  color: #b0b7c3;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  margin-top: 36rpx;
  line-height: 88rpx;
  border: none;
  border-radius: 999rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 32rpx rgba(32, 37, 43, 0.06);
  font-size: 30rpx;
  color: #d14a4a;
}

.logout-btn::after {
  border: none;
}
</style>

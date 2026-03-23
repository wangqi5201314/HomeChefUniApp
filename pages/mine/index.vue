<template>
  <view class="page">
    <view class="profile-card">
      <view class="avatar-wrap">
        <image
          v-if="userInfo.avatar"
          class="avatar"
          :src="userInfo.avatar"
          mode="aspectFill"
        />
        <view v-else class="avatar avatar-placeholder">
          <text class="avatar-text">{{ avatarText }}</text>
        </view>
      </view>

      <view class="profile-info">
        <text class="nickname">{{ displayNickname }}</text>
        <text class="phone">{{ userInfo.phone || '-' }}</text>
      </view>
    </view>

    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ orderCount }}</text>
        <text class="stat-label">订单数量</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ addressCount }}</text>
        <text class="stat-label">地址数量</text>
      </view>
    </view>

    <view class="menu-card">
      <view class="menu-item" @click="goProfile">
        <text class="menu-text">我的资料</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goReviewList">
        <text class="menu-text">我的评价</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goChangePassword">
        <text class="menu-text">修改密码</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goAddressList">
        <text class="menu-text">我的地址</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item last" @click="goOrderList">
        <text class="menu-text">我的订单</text>
        <text class="menu-arrow">›</text>
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
          getOrderList({
            userId: this.userId
          }),
          getUserAddressList({
            userId: this.userId
          })
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
      uni.navigateTo({
        url: '/pages/mine/profile'
      })
    },
    goReviewList() {
      uni.navigateTo({
        url: '/pages/review/list'
      })
    },
    goAddressList() {
      uni.navigateTo({
        url: '/pages/address/list'
      })
    },
    goChangePassword() {
      uni.navigateTo({
        url: '/pages/mine/change-password'
      })
    },
    goOrderList() {
      uni.switchTab({
        url: '/pages/order/list'
      })
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

          uni.reLaunch({
            url: '/pages/login/index'
          })
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
.stats-card,
.menu-card {
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 32rpx rgba(32, 37, 43, 0.06);
}

.profile-card {
  display: flex;
  align-items: center;
  padding: 36rpx 32rpx;
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

.nickname {
  display: block;
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

.stats-card {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding: 18rpx 0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #d96c3a;
}

.stat-label {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #8a8f99;
}

.stat-divider {
  width: 2rpx;
  height: 64rpx;
  background: #f0f2f5;
}

.menu-card {
  margin-top: 24rpx;
  padding: 0 28rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 108rpx;
  border-bottom: 2rpx solid #f1f3f6;
}

.menu-item.last {
  border-bottom: none;
}

.menu-text {
  font-size: 30rpx;
  color: #1f2329;
}

.menu-arrow {
  font-size: 30rpx;
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

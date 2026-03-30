<template>
  <view class="page">
    <view class="profile-card">
      <view class="avatar-wrap">
        <image v-if="chefInfo.avatar" class="avatar" :src="chefInfo.avatar" mode="aspectFill" />
        <view v-else class="avatar avatar-placeholder">
          <text class="avatar-text">{{ avatarText }}</text>
        </view>
      </view>

      <view class="profile-info">
        <text class="name">{{ chefInfo.name || '未命名厨师' }}</text>
        <text class="phone">{{ chefInfo.phone || '-' }}</text>
        <text class="summary">认证状态：{{ certStatusText }} · 账号状态：{{ chefStatusText }}</text>
        <text class="summary">评分：{{ formatValue(chefInfo.ratingAvg) }} · 完成订单：{{ formatValue(chefInfo.orderCount) }}</text>
      </view>
    </view>

    <view class="menu-card">
      <view class="menu-item" @click="goPage('/pages-chef/mine/profile')">
        <text class="menu-text">我的资料</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('/pages-chef/mine/change-password')">
        <text class="menu-text">修改密码</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('/pages-chef/certification/index')">
        <view class="menu-main">
          <text class="menu-text">认证资料</text>
          <text class="menu-sub">{{ certStatusText }}</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('/pages-chef/review/list')">
        <text class="menu-text">我的评价</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item last" @click="goPage('/pages-chef/schedule/index')">
        <text class="menu-text">我的档期</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <button class="logout-btn" @click="handleLogout">退出登录</button>

    <chef-tabbar current="mine" />
  </view>
</template>

<script>
import ChefTabbar from '../../components/chef-tabbar.vue'
import { getCurrentChefProfile } from '../../api/chef-profile'
import { clearAuth, getChefInfo, setChefInfo } from '../../utils/auth'
import { getChefCertStatusText } from '../../utils/chef-cert-status'
import { getChefStatusText } from '../../utils/chef-status'

export default {
  name: 'ChefMinePage',
  components: {
    ChefTabbar
  },
  data() {
    return {
      chefInfo: {}
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
      if (this.chefInfo.certStatus === 0 || this.chefInfo.certStatus) {
        return getChefCertStatusText(this.chefInfo.certStatus)
      }
      return '未知状态'
    },
    chefStatusText() {
      if (this.chefInfo.statusDesc) {
        return this.chefInfo.statusDesc
      }
      if (this.chefInfo.status === 0 || this.chefInfo.status) {
        return getChefStatusText(this.chefInfo.status)
      }
      return '未知状态'
    }
  },
  onShow() {
    const cachedInfo = getChefInfo()
    if (cachedInfo) {
      this.chefInfo = cachedInfo
    }
    this.loadChefInfo()
  },
  methods: {
    async loadChefInfo() {
      try {
        const data = await getCurrentChefProfile()
        this.chefInfo = data || {}
        setChefInfo(this.chefInfo)
      } catch (error) {
      }
    },
    formatValue(value) {
      if (value === 0) {
        return '0'
      }
      return value || '-'
    },
    goPage(url) {
      uni.navigateTo({ url })
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
          uni.reLaunch({ url: '/pages-chef/login/index' })
        }
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 190rpx;
  background: linear-gradient(180deg, #edf7f0 0%, #f6f7fb 36%, #f6f7fb 100%);
  box-sizing: border-box;
}

.profile-card,
.menu-card {
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 36rpx rgba(28, 39, 31, 0.06);
}

.profile-card {
  display: flex;
  padding: 32rpx;
}

.avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  background: #e5efe8;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 44rpx;
  font-weight: 600;
  color: #2f8f55;
}

.profile-info {
  flex: 1;
  margin-left: 24rpx;
}

.name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #1f2329;
}

.phone {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #67716c;
}

.summary {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #738078;
  line-height: 1.7;
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
  border-bottom: 2rpx solid #eef1ef;
}

.menu-item.last {
  border-bottom: none;
}

.menu-main {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.menu-text {
  font-size: 30rpx;
  color: #1f2329;
}

.menu-sub {
  font-size: 24rpx;
  color: #738078;
}

.menu-arrow {
  font-size: 30rpx;
  color: #b0b7c3;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  margin-top: 32rpx;
  line-height: 88rpx;
  border: none;
  border-radius: 999rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 36rpx rgba(28, 39, 31, 0.06);
  font-size: 30rpx;
  color: #d14a4a;
}

.logout-btn::after {
  border: none;
}
</style>

<template>
  <view class="page">
    <view class="profile-card">
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

      <view class="profile-info">
        <view class="name-row">
          <text class="name">{{ chefInfo.name || '未命名厨师' }}</text>
          <text class="cert-tag">{{ certStatusText }}</text>
        </view>
        <text class="phone">{{ chefInfo.phone || '-' }}</text>
        <text class="summary">
          评分 {{ formatValue(chefInfo.ratingAvg) }} · 完成订单 {{ formatValue(chefInfo.orderCount) }}
        </text>
      </view>
    </view>

    <view class="menu-card">
      <view class="menu-item" @click="goPage('/pages-chef/order/list')">
        <text class="menu-text">我的订单</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('/pages-chef/schedule/index')">
        <text class="menu-text">我的档期</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('/pages-chef/certification/index')">
        <text class="menu-text">认证资料</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item last" @click="goPage('/pages-chef/mine/profile')">
        <text class="menu-text">我的资料</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getCurrentChefInfo } from '../../api/chef-auth'
import { getChefInfo, setChefInfo } from '../../utils/auth'

export default {
  name: 'ChefHomePage',
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
      const certStatus = this.chefInfo.certStatus

      if (certStatus === 1) {
        return '已认证'
      }

      if (certStatus === 0) {
        return '未认证'
      }

      return String(certStatus || '认证状态未知')
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
        const data = await getCurrentChefInfo()
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
      uni.navigateTo({
        url
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: linear-gradient(180deg, #eef7f1 0%, #f6f7fb 34%, #f6f7fb 100%);
  box-sizing: border-box;
}

.profile-card,
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
  background: #e5efe8;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 48rpx;
  font-weight: 600;
  color: #2f8f55;
}

.profile-info {
  flex: 1;
  min-width: 0;
  margin-left: 28rpx;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.name {
  font-size: 38rpx;
  font-weight: 600;
  color: #1f2329;
}

.cert-tag {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #edf8f1;
  font-size: 22rpx;
  color: #2f8f55;
}

.phone {
  display: block;
  margin-top: 14rpx;
  font-size: 28rpx;
  color: #6b7280;
}

.summary {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  color: #5f6671;
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
</style>

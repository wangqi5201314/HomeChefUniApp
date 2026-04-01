<template>
  <view class="page">
    <view class="profile-card">
      <view class="profile-decor profile-decor-left"></view>
      <view class="profile-decor profile-decor-right"></view>

      <view class="profile-main">
        <view class="avatar-shell">
          <view class="avatar-wrap">
            <image v-if="chefInfo.avatar" class="avatar" :src="chefInfo.avatar" mode="aspectFill" />
            <view v-else class="avatar avatar-placeholder">
              <text class="avatar-text">{{ avatarText }}</text>
            </view>
          </view>
        </view>

        <view class="profile-info">
          <text class="profile-label">厨师中心</text>
          <text class="name">{{ chefInfo.name || '未命名厨师' }}</text>
          <text class="phone">{{ chefInfo.phone || '-' }}</text>
          <view class="status-chip-row">
            <text class="status-chip status-chip--green">认证 {{ certStatusText }}</text>
            <text class="status-chip status-chip--blue">账号 {{ chefStatusText }}</text>
          </view>
        </view>
      </view>

      <view class="summary-row">
        <view class="summary-chip">
          <text class="summary-value">{{ formatValue(chefInfo.ratingAvg) }}</text>
          <text class="summary-label">综合评分</text>
        </view>
        <view class="summary-chip">
          <text class="summary-value">{{ formatValue(chefInfo.orderCount) }}</text>
          <text class="summary-label">完成订单</text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <text class="section-title">服务管理</text>
      <view class="menu-card">
        <view class="menu-item" @click="goPage('/pages-chef/certification/index')">
          <view class="menu-left">
            <view class="menu-icon green">
              <image class="menu-icon-image" src="/static/my-profile.png" mode="aspectFit" />
            </view>
            <view class="menu-copy">
              <text class="menu-text">认证资料</text>
              <text class="menu-sub">提交并维护认证所需材料</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-badge menu-badge--green">{{ certStatusText }}</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="goPage('/pages-chef/mine/service-location-list')">
          <view class="menu-left">
            <view class="menu-icon mint">
              <image class="menu-icon-image" src="/static/my-address.png" mode="aspectFit" />
            </view>
            <view class="menu-copy">
              <text class="menu-text">服务位置</text>
              <text class="menu-sub">维护服务出发地与覆盖范围</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="goPage('/pages-chef/review/list')">
          <view class="menu-left">
            <view class="menu-icon blue">
              <image class="menu-icon-image" src="/static/my-review.png" mode="aspectFit" />
            </view>
            <view class="menu-copy">
              <text class="menu-text">我的评价</text>
              <text class="menu-sub">查看用户评价并及时回复</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>

        <view class="menu-item last" @click="goPage('/pages-chef/schedule/index')">
          <view class="menu-left">
            <view class="menu-icon sand">
              <image class="menu-icon-image" src="/static/my-order.png" mode="aspectFit" />
            </view>
            <view class="menu-copy">
              <text class="menu-text">我的档期</text>
              <text class="menu-sub">管理可预约时间和备注信息</text>
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
        <view class="menu-item" @click="goPage('/pages-chef/mine/profile')">
          <view class="menu-left">
            <view class="menu-icon warm">
              <image class="menu-icon-image" src="/static/my-profile.png" mode="aspectFit" />
            </view>
            <view class="menu-copy">
              <text class="menu-text">我的资料</text>
              <text class="menu-sub">更新头像、姓名和联系方式</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>

        <view class="menu-item last" @click="goPage('/pages-chef/mine/change-password')">
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

    <chef-tabbar current="mine" />
  </view>
</template>

<script>
import { getChefCertification } from '../../api/chef-certification'
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
      chefInfo: {},
      hasCertificationRecord: true
    }
  },
  computed: {
    avatarText() {
      return this.chefInfo.name ? String(this.chefInfo.name).slice(0, 1) : '厨'
    },
    certStatusText() {
      if (!this.hasCertificationRecord || Number(this.chefInfo.certStatus) === 3) {
        return '待上传'
      }

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
  onPullDownRefresh() {
    this.loadChefInfo(true)
  },
  methods: {
    async loadChefInfo(fromPullDownRefresh = false) {
      try {
        const [chefData, certificationData] = await Promise.all([
          getCurrentChefProfile(),
          getChefCertification()
        ])

        this.chefInfo = chefData || {}
        this.hasCertificationRecord = Boolean(
          certificationData && (
            certificationData.realName ||
            certificationData.idCardNo ||
            certificationData.healthCertUrl ||
            certificationData.skillCertUrl ||
            certificationData.serviceCertUrl ||
            certificationData.advancedCertUrl
          )
        )
        setChefInfo(this.chefInfo)
      } catch (error) {
        this.hasCertificationRecord = true
      } finally {
        if (fromPullDownRefresh) {
          uni.stopPullDownRefresh()
        }
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
  position: relative;
  overflow: hidden;
  border-radius: 30rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 36rpx rgba(28, 39, 31, 0.06);
}

.profile-card {
  padding: 32rpx;
  background:
    radial-gradient(circle at top right, rgba(234, 247, 239, 0.98), transparent 30%),
    linear-gradient(135deg, #f5fbf7 0%, #ffffff 56%);
}

.profile-decor {
  position: absolute;
  border-radius: 50%;
  background: rgba(47, 143, 85, 0.08);
}

.profile-decor-left {
  left: -36rpx;
  top: -44rpx;
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
  background: linear-gradient(135deg, #a8dfbf 0%, #4caf74 100%);
  box-shadow: 0 16rpx 30rpx rgba(47, 143, 85, 0.14);
}

.avatar-wrap {
  flex-shrink: 0;
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
  min-width: 0;
  margin-left: 24rpx;
}

.profile-label {
  display: block;
  font-size: 22rpx;
  letter-spacing: 3rpx;
  color: #5f7d69;
}

.name {
  display: block;
  margin-top: 12rpx;
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

.status-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.status-chip {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #f2f4f7;
  font-size: 22rpx;
  color: #66707c;
}

.status-chip--green {
  background: #eaf7ef;
  color: #2f8f55;
}

.status-chip--blue {
  background: #eef4ff;
  color: #4c6fbf;
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
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 0 0 2rpx #e2f0e7;
}

.summary-value,
.summary-label {
  display: block;
}

.summary-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #2f8f55;
}

.summary-label {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #7a837d;
}

.menu-section {
  margin-top: 24rpx;
}

.section-title {
  display: block;
  margin: 0 0 16rpx 6rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #6d7872;
}

.menu-card {
  padding: 0 28rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 118rpx;
  border-bottom: 2rpx solid #eef1ef;
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

.menu-icon.green {
  background: #eaf7ef;
}

.menu-icon.mint {
  background: #eff8f2;
}

.menu-icon.blue {
  background: #eef4ff;
}

.menu-icon.sand {
  background: #f5f0e8;
}

.menu-icon.warm {
  background: #fff2e8;
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
  color: #738078;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex-shrink: 0;
}

.menu-badge {
  padding: 0 16rpx;
  min-width: 72rpx;
  height: 44rpx;
  line-height: 44rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  text-align: center;
  color: #6b7280;
  background: #f2f4f7;
}

.menu-badge--green {
  background: #eaf7ef;
  color: #2f8f55;
}

.menu-arrow {
  font-size: 32rpx;
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

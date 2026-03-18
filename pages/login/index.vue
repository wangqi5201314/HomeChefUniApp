<template>
  <view class="page">
    <view class="header">
      <text class="title">私房菜上门服务</text>
      <text class="subtitle">请输入手机号登录</text>
    </view>

    <view class="form-card">
      <view class="form-item">
        <text class="label">手机号</text>
        <input
          v-model="phone"
          class="input"
          type="number"
          maxlength="11"
          placeholder="请输入 11 位手机号"
          :disabled="loading"
        />
      </view>

      <button
        class="login-btn"
        type="primary"
        :loading="loading"
        :disabled="loading"
        @click="handleLogin"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </view>
  </view>
</template>

<script>
import { getCurrentUserInfo, loginUser } from '../../api/user'
import { clearAuth, setToken, setUserInfo } from '../../utils/auth'

const USER_ID_KEY = 'user_id'
const USER_TYPE_KEY = 'user_type'
const ADMIN_ID_KEY = 'admin_id'

export default {
  data() {
    return {
      phone: '',
      loading: false
    }
  },
  methods: {
    validatePhone() {
      const phone = (this.phone || '').trim()

      if (!phone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return false
      }

      if (!/^1\d{10}$/.test(phone)) {
        uni.showToast({
          title: '请输入正确的 11 位手机号',
          icon: 'none'
        })
        return false
      }

      return true
    },
    async handleLogin() {
      if (this.loading || !this.validatePhone()) {
        return
      }

      this.loading = true

      try {
        const loginData = await loginUser({
          phone: this.phone.trim()
        })

        if (!loginData || !loginData.token) {
          throw new Error('登录返回缺少 token')
        }

        setToken(loginData.token)
        uni.setStorageSync(USER_ID_KEY, loginData.userId || '')
        uni.setStorageSync(USER_TYPE_KEY, loginData.userType || '')
        uni.setStorageSync(ADMIN_ID_KEY, loginData.adminId || 0)

        const profile = await getCurrentUserInfo()
        setUserInfo(profile || {})

        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.switchTab({
            url: '/pages/home/index'
          })
        }, 300)
      } catch (error) {
        clearAuth()
        uni.removeStorageSync(USER_ID_KEY)
        uni.removeStorageSync(USER_TYPE_KEY)
        uni.removeStorageSync(ADMIN_ID_KEY)

        if (error && error.message) {
          uni.showToast({
            title: error.message,
            icon: 'none'
          })
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 120rpx 40rpx 40rpx;
  background: linear-gradient(180deg, #fff7f0 0%, #f7f8fa 45%, #f7f8fa 100%);
  box-sizing: border-box;
}

.header {
  margin-bottom: 60rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: 600;
  color: #2f2f2f;
  line-height: 1.4;
}

.subtitle {
  display: block;
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #8a8f99;
}

.form-card {
  padding: 40rpx 32rpx;
  border-radius: 24rpx;
  background-color: #ffffff;
  box-shadow: 0 12rpx 36rpx rgba(25, 31, 37, 0.06);
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  margin-bottom: 20rpx;
  font-size: 28rpx;
  color: #333333;
}

.input {
  height: 88rpx;
  padding: 0 24rpx;
  border: 2rpx solid #eceef2;
  border-radius: 16rpx;
  background-color: #fafbfc;
  font-size: 30rpx;
  color: #222222;
  box-sizing: border-box;
}

.login-btn {
  height: 88rpx;
  line-height: 88rpx;
  border: none;
  border-radius: 16rpx;
  background: #d96c3a;
  font-size: 32rpx;
  font-weight: 500;
}

.login-btn::after {
  border: none;
}
</style>

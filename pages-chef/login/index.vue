<template>
  <view class="page">
    <view class="header">
      <text class="title">厨师端登录</text>
      <text class="subtitle">手机号 + 密码登录</text>
    </view>

    <view class="form-card">
      <view class="form-item">
        <text class="label">手机号</text>
        <input
          v-model="form.phone"
          class="input"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
          :disabled="loading"
        />
      </view>

      <view class="form-item">
        <text class="label">密码</text>
        <input
          v-model="form.password"
          class="input"
          password
          placeholder="请输入密码"
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
import { chefLogin, getCurrentChefInfo } from '../../api/chef-auth'
import { clearAuth, setChefId, setChefInfo, setToken, setUserType } from '../../utils/auth'

export default {
  name: 'ChefLoginPage',
  data() {
    return {
      loading: false,
      form: {
        phone: '',
        password: ''
      }
    }
  },
  methods: {
    validateForm() {
      const phone = this.form.phone.trim()
      const password = this.form.password.trim()

      if (!phone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return false
      }

      if (!/^1\d{10}$/.test(phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return false
      }

      if (!password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        })
        return false
      }

      return true
    },
    async handleLogin() {
      if (this.loading || !this.validateForm()) {
        return
      }

      this.loading = true

      try {
        const loginData = await chefLogin({
          phone: this.form.phone.trim(),
          password: this.form.password
        })

        if (!loginData || !loginData.token) {
          throw new Error('登录返回缺少 token')
        }

        setToken(loginData.token)
        setUserType(loginData.userType || 'CHEF')
        setChefId(loginData.chefId || '')

        const chefInfo = await getCurrentChefInfo()
        setChefInfo(chefInfo || {})

        uni.redirectTo({
          url: '/pages-chef/home/index'
        })
      } catch (error) {
        clearAuth()
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
  background: linear-gradient(180deg, #eef7f1 0%, #f6f7fb 45%, #f6f7fb 100%);
  box-sizing: border-box;
}

.header {
  margin-bottom: 60rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: 600;
  color: #243126;
}

.subtitle {
  display: block;
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #7d8895;
}

.form-card {
  padding: 40rpx 32rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 36rpx rgba(25, 31, 37, 0.06);
}

.form-item {
  margin-bottom: 32rpx;
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
  border: 2rpx solid #e7ece8;
  border-radius: 16rpx;
  background: #fafcfa;
  font-size: 30rpx;
  color: #222222;
  box-sizing: border-box;
}

.login-btn {
  height: 88rpx;
  line-height: 88rpx;
  margin-top: 16rpx;
  border: none;
  border-radius: 16rpx;
  background: #2f8f55;
  font-size: 32rpx;
  font-weight: 500;
}

.login-btn::after {
  border: none;
}
</style>

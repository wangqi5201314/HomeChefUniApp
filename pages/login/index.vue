<template>
  <view class="page">
    <view class="header">
      <text class="title">私房菜上门服务</text>
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
        :loading="loading || wechatLoading"
        :disabled="loading || wechatLoading"
        @click="handleLogin"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <button
        class="wechat-btn"
        :loading="wechatLoading"
        :disabled="loading || wechatLoading"
        @click="handleWechatLogin"
      >
        {{ wechatLoading ? '微信登录中...' : '微信快捷登录' }}
      </button>

      <view class="footer">
        <text class="footer-text">还没有账号？</text>
        <text class="footer-link" @click="goRegister">去注册</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInfo, login, wechatLogin } from '../../api/user'
import { clearAuth, setAdminId, setToken, setUserId, setUserInfo, setUserType } from '../../utils/auth'

export default {
  name: 'LoginPage',
  data() {
    return {
      loading: false,
      wechatLoading: false,
      redirecting: false,
      form: {
        phone: '',
        password: ''
      }
    }
  },
  methods: {
    async handleLoginSuccess(loginData) {
      if (!loginData || !loginData.token) {
        throw new Error('登录返回缺少 token')
      }

      this.redirecting = true
      setToken(loginData.token)
      setUserId(loginData.userId || '')
      setUserType(loginData.userType || '')
      setAdminId(loginData.adminId || 0)

      const profile = await getUserInfo()
      setUserInfo(profile || {})
      uni.switchTab({
        url: '/pages/home/index'
      })
    },
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
        const loginData = await login({
          phone: this.form.phone.trim(),
          password: this.form.password
        })
        await this.handleLoginSuccess(loginData)
      } catch (error) {
        clearAuth()
        this.redirecting = false

        if (error && error.message) {
          uni.showToast({
            title: error.message,
            icon: 'none'
          })
        }
      } finally {
        this.loading = false
      }
    },
    handleWechatLogin() {
      if (this.loading || this.wechatLoading) {
        return
      }

      this.wechatLoading = true

      wx.login({
        success: async (res) => {
          if (!res.code) {
            uni.showToast({
              title: '微信登录未获取到 code',
              icon: 'none'
            })
            this.wechatLoading = false
            return
          }

          try {
            const loginData = await wechatLogin({
              code: res.code
            })
            await this.handleLoginSuccess(loginData)
          } catch (error) {
            clearAuth()
            this.redirecting = false

            if (error && error.message) {
              uni.showToast({
                title: error.message,
                icon: 'none'
              })
            }
          } finally {
            this.wechatLoading = false
          }
        },
        fail: () => {
          uni.showToast({
            title: '微信登录失败，请稍后重试',
            icon: 'none'
          })
          this.redirecting = false
          this.wechatLoading = false
        }
      })
    },
    goRegister() {
      if (this.loading || this.wechatLoading) {
        return
      }

      uni.navigateTo({
        url: '/pages/register/index'
      })
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
  margin-top: 16rpx;
  border: none;
  border-radius: 16rpx;
  background: #d96c3a;
  font-size: 32rpx;
  font-weight: 500;
}

.login-btn::after {
  border: none;
}

.wechat-btn {
  height: 88rpx;
  line-height: 88rpx;
  margin-top: 20rpx;
  border: 2rpx solid #d7e7da;
  border-radius: 16rpx;
  background: #f2fbf4;
  font-size: 30rpx;
  font-weight: 500;
  color: #2f8f55;
}

.wechat-btn::after {
  border: none;
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
  margin-top: 32rpx;
}

.footer-text {
  font-size: 26rpx;
  color: #8a8f99;
}

.footer-link {
  font-size: 26rpx;
  color: #d96c3a;
}
</style>

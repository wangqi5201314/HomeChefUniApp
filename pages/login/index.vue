<template>
  <view class="page">
    <view class="role-card">
      <text class="role-title">请选择登录身份</text>
      <view class="role-actions">
        <button class="role-btn active" @click="stayOnUserLogin">用户登录</button>
        <button class="role-btn chef" @click="goChefLogin">厨师登录</button>
      </view>
    </view>

    <view class="header">
      <text class="title">私房菜上门服务</text>
      <text class="subtitle">用户端登录</text>
    </view>

    <view class="form-card">
      <view class="login-tabs">
        <button
          class="tab-btn"
          :class="{ active: loginMode === 'phone' }"
          :disabled="loading || wechatLoading || emailLoading || codeLoading"
          @click="switchLoginMode('phone')"
        >
          手机号登录
        </button>
        <button
          class="tab-btn"
          :class="{ active: loginMode === 'email' }"
          :disabled="loading || wechatLoading || emailLoading || codeLoading"
          @click="switchLoginMode('email')"
        >
          邮箱登录
        </button>
      </view>

      <template v-if="loginMode === 'phone'">
        <view class="form-item">
          <text class="label">手机号</text>
          <input
            v-model="form.phone"
            class="input"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            :disabled="loading || wechatLoading"
          />
        </view>

        <view class="form-item">
          <text class="label">密码</text>
          <input
            v-model="form.password"
            class="input"
            password
            placeholder="请输入密码"
            :disabled="loading || wechatLoading"
          />
        </view>
      </template>

      <template v-else>
        <view class="form-item">
          <text class="label">邮箱</text>
          <input
            v-model="emailForm.email"
            class="input"
            type="text"
            maxlength="128"
            placeholder="请输入邮箱"
            :disabled="emailLoading || codeLoading"
          />
        </view>

        <view class="form-item">
          <text class="label">验证码</text>
          <view class="code-row">
            <input
              v-model="emailForm.code"
              class="input code-input"
              type="number"
              maxlength="6"
              placeholder="请输入验证码"
              :disabled="emailLoading"
            />
            <button
              class="code-btn"
              :loading="codeLoading"
              :disabled="emailLoading || codeLoading || codeCountdown > 0"
              @click="handleSendEmailCode"
            >
              {{ codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码' }}
            </button>
          </view>
        </view>
      </template>

      <button
        class="login-btn"
        type="primary"
        :loading="currentLoginLoading"
        :disabled="loading || wechatLoading || emailLoading || codeLoading"
        @click="handlePrimaryLogin"
      >
        {{ currentLoginLoading ? '登录中...' : '登录' }}
      </button>

      <button
        class="wechat-btn"
        :loading="wechatLoading"
        :disabled="loading || wechatLoading"
        @click="handleWechatLogin"
      >
        {{ wechatLoading ? '登录中...' : '微信快捷登录' }}
      </button>

      <view class="footer">
        <text class="footer-text">还没有账号？</text>
        <text class="footer-link" @click="goRegister">去注册</text>
      </view>
    </view>
  </view>
</template>

<script>
import { emailLogin, getUserInfo, login, sendEmailCode, wechatLogin } from '../../api/user'
import { clearAuth, setAdminId, setToken, setUserId, setUserInfo, setUserType } from '../../utils/auth'

export default {
  name: 'LoginPage',
  data() {
    return {
      loading: false,
      wechatLoading: false,
      emailLoading: false,
      codeLoading: false,
      codeCountdown: 0,
      codeTimer: null,
      loginMode: 'phone',
      form: {
        phone: '',
        password: ''
      },
      emailForm: {
        email: '',
        code: ''
      }
    }
  },
  computed: {
    currentLoginLoading() {
      return this.loginMode === 'email' ? this.emailLoading : this.loading
    }
  },
  beforeDestroy() {
    this.clearCodeTimer()
  },
  onUnload() {
    this.clearCodeTimer()
  },
  methods: {
    async handleLoginSuccess(loginData) {
      if (!loginData || !loginData.token) {
        throw new Error('登录返回缺少 token')
      }

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
        uni.showToast({ title: '请输入手机号', icon: 'none' })
        return false
      }

      if (!/^1\d{10}$/.test(phone)) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return false
      }

      if (!password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return false
      }

      return true
    },
    switchLoginMode(mode) {
      if (this.loading || this.wechatLoading || this.emailLoading || this.codeLoading) {
        return
      }
      this.loginMode = mode
    },
    handlePrimaryLogin() {
      if (this.loginMode === 'email') {
        this.handleEmailLogin()
        return
      }
      this.handleLogin()
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
      } finally {
        this.loading = false
      }
    },
    validateEmail() {
      const email = this.emailForm.email.trim()

      if (!email) {
        uni.showToast({ title: '请输入邮箱', icon: 'none' })
        return false
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        uni.showToast({ title: '请输入正确的邮箱', icon: 'none' })
        return false
      }

      return true
    },
    validateEmailLoginForm() {
      if (!this.validateEmail()) {
        return false
      }

      const code = this.emailForm.code.trim()
      if (!/^\d{6}$/.test(code)) {
        uni.showToast({ title: '请输入6位验证码', icon: 'none' })
        return false
      }

      return true
    },
    async handleSendEmailCode() {
      if (this.codeLoading || this.codeCountdown > 0 || !this.validateEmail()) {
        return
      }

      this.codeLoading = true

      try {
        await sendEmailCode({
          email: this.emailForm.email.trim()
        })
        uni.showToast({ title: '验证码已发送', icon: 'none' })
        this.startCodeCountdown()
      } finally {
        this.codeLoading = false
      }
    },
    async handleEmailLogin() {
      if (this.emailLoading || !this.validateEmailLoginForm()) {
        return
      }

      this.emailLoading = true

      try {
        const loginData = await emailLogin({
          email: this.emailForm.email.trim(),
          code: this.emailForm.code.trim()
        })
        await this.handleLoginSuccess(loginData)
      } catch (error) {
        clearAuth()
      } finally {
        this.emailLoading = false
      }
    },
    startCodeCountdown() {
      this.clearCodeTimer()
      this.codeCountdown = 60
      this.codeTimer = setInterval(() => {
        if (this.codeCountdown <= 1) {
          this.clearCodeTimer()
          return
        }
        this.codeCountdown -= 1
      }, 1000)
    },
    clearCodeTimer() {
      if (this.codeTimer) {
        clearInterval(this.codeTimer)
        this.codeTimer = null
      }
      this.codeCountdown = 0
    },
    handleWechatLogin() {
      if (this.loading || this.wechatLoading) {
        return
      }

      this.wechatLoading = true

      wx.login({
        success: async (res) => {
          if (!res.code) {
            uni.showToast({ title: '微信登录失败', icon: 'none' })
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
          } finally {
            this.wechatLoading = false
          }
        },
        fail: () => {
          uni.showToast({ title: '微信登录失败', icon: 'none' })
          this.wechatLoading = false
        }
      })
    },
    goRegister() {
      uni.navigateTo({
        url: '/pages/register/index'
      })
    },
    goChefLogin() {
      uni.navigateTo({
        url: '/pages-chef/login/index'
      })
    },
    stayOnUserLogin() {
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 72rpx 40rpx 40rpx;
  background: linear-gradient(180deg, #fff7f0 0%, #f7f8fa 45%, #f7f8fa 100%);
  box-sizing: border-box;
}

.role-card,
.form-card {
  padding: 32rpx;
  border-radius: 24rpx;
  background-color: #ffffff;
  box-shadow: 0 12rpx 36rpx rgba(25, 31, 37, 0.06);
}

.role-card {
  margin-bottom: 40rpx;
}

.role-title {
  display: block;
  font-size: 28rpx;
  color: #4d5562;
}

.role-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
}

.role-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border: none;
  border-radius: 18rpx;
  background: #f6f7fb;
  color: #3b4250;
  font-size: 28rpx;
}

.role-btn.active {
  background: #d96c3a;
  color: #ffffff;
}

.role-btn.chef {
  background: #edf8f1;
  color: #2f8f55;
}

.role-btn::after {
  border: none;
}

.header {
  margin-bottom: 40rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: 600;
  color: #2f2f2f;
}

.subtitle {
  display: block;
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #8a8f99;
}

.login-tabs {
  display: flex;
  gap: 16rpx;
  padding: 8rpx;
  margin-bottom: 32rpx;
  border-radius: 18rpx;
  background: #f6f7fb;
}

.tab-btn {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  border: none;
  border-radius: 14rpx;
  background: transparent;
  color: #69707d;
  font-size: 28rpx;
}

.tab-btn.active {
  background: #ffffff;
  color: #d96c3a;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(217, 108, 58, 0.12);
}

.tab-btn::after {
  border: none;
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
  width: 100%;
  padding: 0 24rpx;
  border: 2rpx solid #eceef2;
  border-radius: 16rpx;
  background-color: #fafbfc;
  font-size: 30rpx;
  color: #222222;
  box-sizing: border-box;
}

.code-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.code-input {
  flex: 1;
}

.code-btn {
  width: 196rpx;
  height: 88rpx;
  line-height: 88rpx;
  margin: 0;
  border: 2rpx solid #f0c5af;
  border-radius: 16rpx;
  background: #fff7f0;
  color: #d96c3a;
  font-size: 26rpx;
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

.login-btn::after,
.wechat-btn::after,
.code-btn::after {
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

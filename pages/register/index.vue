<template>
  <view class="page">
    <view class="header">
      <text class="title">注册账号</text>
      <text class="subtitle">填写手机号和密码完成注册</text>
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
        <text class="label">昵称</text>
        <input
          v-model="form.nickname"
          class="input"
          placeholder="请输入昵称"
          :disabled="loading"
        />
      </view>

      <view class="form-item">
        <text class="label">密码</text>
        <input
          v-model="form.password"
          class="input"
          password
          placeholder="请输入至少 6 位密码"
          :disabled="loading"
        />
      </view>

      <view class="form-item">
        <text class="label">确认密码</text>
        <input
          v-model="form.confirmPassword"
          class="input"
          password
          placeholder="请再次输入密码"
          :disabled="loading"
        />
      </view>

      <button
        class="register-btn"
        type="primary"
        :loading="loading"
        :disabled="loading"
        @click="handleRegister"
      >
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </view>
  </view>
</template>

<script>
import { register } from '../../api/user'

export default {
  name: 'RegisterPage',
  data() {
    return {
      loading: false,
      form: {
        phone: '',
        password: '',
        confirmPassword: '',
        nickname: ''
      }
    }
  },
  methods: {
    validateForm() {
      const phone = this.form.phone.trim()
      const password = this.form.password
      const confirmPassword = this.form.confirmPassword

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

      if (password.length < 6) {
        uni.showToast({
          title: '密码至少 6 位',
          icon: 'none'
        })
        return false
      }

      if (confirmPassword !== password) {
        uni.showToast({
          title: '两次密码输入不一致',
          icon: 'none'
        })
        return false
      }

      return true
    },
    async handleRegister() {
      if (this.loading || !this.validateForm()) {
        return
      }

      this.loading = true

      try {
        await register({
          phone: this.form.phone.trim(),
          password: this.form.password,
          confirmPassword: this.form.confirmPassword,
          nickname: this.form.nickname.trim()
        })

        uni.showToast({
          title: '注册成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.navigateBack({
            delta: 1
          })
        }, 300)
      } catch (error) {
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
  padding: 100rpx 40rpx 40rpx;
  background: linear-gradient(180deg, #fff7f0 0%, #f7f8fa 45%, #f7f8fa 100%);
  box-sizing: border-box;
}

.header {
  margin-bottom: 48rpx;
}

.title {
  display: block;
  font-size: 46rpx;
  font-weight: 600;
  color: #2f2f2f;
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
  background: #ffffff;
  box-shadow: 0 12rpx 36rpx rgba(25, 31, 37, 0.06);
}

.form-item {
  margin-bottom: 28rpx;
}

.label {
  display: block;
  margin-bottom: 18rpx;
  font-size: 28rpx;
  color: #333333;
}

.input {
  height: 88rpx;
  padding: 0 24rpx;
  border: 2rpx solid #eceef2;
  border-radius: 16rpx;
  background: #fafbfc;
  font-size: 30rpx;
  color: #222222;
  box-sizing: border-box;
}

.register-btn {
  height: 88rpx;
  line-height: 88rpx;
  margin-top: 12rpx;
  border: none;
  border-radius: 16rpx;
  background: #d96c3a;
  font-size: 32rpx;
  font-weight: 500;
}

.register-btn::after {
  border: none;
}
</style>

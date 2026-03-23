<template>
  <view class="page">
    <view class="header">
      <text class="title">厨师注册</text>
      <text class="subtitle">创建厨师端账号</text>
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
        <text class="label">姓名</text>
        <input
          v-model="form.name"
          class="input"
          placeholder="请输入厨师姓名"
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

      <button class="register-btn" type="primary" :loading="loading" :disabled="loading" @click="handleRegister">
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </view>
  </view>
</template>

<script>
import { chefRegister } from '../../api/chef-auth'

export default {
  name: 'ChefRegisterPage',
  data() {
    return {
      loading: false,
      form: {
        phone: '',
        password: '',
        confirmPassword: '',
        name: ''
      }
    }
  },
  methods: {
    validateForm() {
      if (!this.form.phone.trim()) {
        uni.showToast({ title: '请输入手机号', icon: 'none' })
        return false
      }

      if (!/^1\d{10}$/.test(this.form.phone.trim())) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return false
      }

      if (!this.form.name.trim()) {
        uni.showToast({ title: '请输入姓名', icon: 'none' })
        return false
      }

      if (!this.form.password || this.form.password.length < 6) {
        uni.showToast({ title: '密码至少 6 位', icon: 'none' })
        return false
      }

      if (this.form.password !== this.form.confirmPassword) {
        uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
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
        await chefRegister({
          phone: this.form.phone.trim(),
          password: this.form.password,
          confirmPassword: this.form.confirmPassword,
          name: this.form.name.trim()
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

.register-btn {
  height: 88rpx;
  line-height: 88rpx;
  margin-top: 16rpx;
  border: none;
  border-radius: 16rpx;
  background: #2f8f55;
  font-size: 32rpx;
  font-weight: 500;
}

.register-btn::after {
  border: none;
}
</style>

<template>
  <view class="page">
    <view class="form-card">
      <view class="form-item">
        <text class="label">旧密码</text>
        <input
          v-model="form.oldPassword"
          class="input"
          password
          placeholder="请输入旧密码"
          :disabled="loading"
        />
      </view>

      <view class="form-item">
        <text class="label">新密码</text>
        <input
          v-model="form.newPassword"
          class="input"
          password
          placeholder="请输入至少 6 位新密码"
          :disabled="loading"
        />
      </view>

      <view class="form-item">
        <text class="label">确认新密码</text>
        <input
          v-model="form.confirmPassword"
          class="input"
          password
          placeholder="请再次输入新密码"
          :disabled="loading"
        />
      </view>

      <button
        class="submit-btn"
        type="primary"
        :loading="loading"
        :disabled="loading"
        @click="handleSubmit"
      >
        {{ loading ? '提交中...' : '确认修改' }}
      </button>
    </view>
  </view>
</template>

<script>
import { changePassword } from '../../api/user'
import { clearAuth } from '../../utils/auth'

export default {
  name: 'ChangePasswordPage',
  data() {
    return {
      loading: false,
      form: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    validateForm() {
      const { oldPassword, newPassword, confirmPassword } = this.form

      if (!oldPassword) {
        uni.showToast({
          title: '请输入旧密码',
          icon: 'none'
        })
        return false
      }

      if (!newPassword) {
        uni.showToast({
          title: '请输入新密码',
          icon: 'none'
        })
        return false
      }

      if (newPassword.length < 6) {
        uni.showToast({
          title: '新密码至少 6 位',
          icon: 'none'
        })
        return false
      }

      if (!confirmPassword) {
        uni.showToast({
          title: '请输入确认密码',
          icon: 'none'
        })
        return false
      }

      if (confirmPassword !== newPassword) {
        uni.showToast({
          title: '两次密码输入不一致',
          icon: 'none'
        })
        return false
      }

      return true
    },
    async handleSubmit() {
      if (this.loading || !this.validateForm()) {
        return
      }

      this.loading = true

      try {
        await changePassword({
          oldPassword: this.form.oldPassword,
          newPassword: this.form.newPassword,
          confirmPassword: this.form.confirmPassword
        })

        uni.showToast({
          title: '修改成功，请重新登录',
          icon: 'success'
        })

        clearAuth()

        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/login/index'
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
  padding: 40rpx 24rpx;
  background: #f6f7fb;
  box-sizing: border-box;
}

.form-card {
  padding: 32rpx 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05);
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
  border-radius: 16rpx;
  background: #f7f8fb;
  font-size: 30rpx;
  color: #222222;
  box-sizing: border-box;
}

.submit-btn {
  height: 88rpx;
  line-height: 88rpx;
  margin-top: 12rpx;
  border: none;
  border-radius: 16rpx;
  background: #d96c3a;
  font-size: 32rpx;
  font-weight: 500;
}

.submit-btn::after {
  border: none;
}
</style>

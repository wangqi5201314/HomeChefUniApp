<template>
  <view class="page">
    <view class="section-card">
      <view class="avatar-row">
        <text class="label">头像</text>
        <view class="avatar-area" @click="chooseAvatar">
          <image v-if="form.avatar" class="avatar" :src="form.avatar" mode="aspectFill" />
          <view v-else class="avatar avatar-placeholder">
            <text class="avatar-text">{{ avatarText }}</text>
          </view>
          <text class="upload-text">{{ avatarUploading ? '上传中...' : '更换头像' }}</text>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="form-item readonly-item">
        <text class="label">手机号</text>
        <text class="readonly-value">{{ phoneDisplay }}</text>
      </view>
      <view class="form-item readonly-item no-border">
        <text class="label">状态</text>
        <text class="readonly-value">{{ statusDisplay }}</text>
      </view>
    </view>

    <view class="section-card">
      <view class="form-item">
        <text class="label">昵称</text>
        <input v-model="form.nickname" class="input" placeholder="请输入昵称" />
      </view>
      <view class="form-item">
        <text class="label">性别</text>
        <picker :range="genderOptions" range-key="label" :value="genderIndex" @change="handleGenderChange">
          <view class="picker-value">{{ genderLabel }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">生日</text>
        <picker mode="date" :value="form.birthday" @change="handleBirthdayChange">
          <view class="picker-value">{{ form.birthday || '请选择生日' }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">口味偏好</text>
        <input v-model="form.tastePreference" class="input" placeholder="请输入口味偏好" />
      </view>
      <view class="form-item">
        <text class="label">过敏信息</text>
        <textarea v-model="form.allergyInfo" class="textarea" placeholder="请输入过敏信息" />
      </view>
      <view class="form-item">
        <text class="label">紧急联系人</text>
        <input v-model="form.emergencyContactName" class="input" placeholder="请输入紧急联系人姓名" />
      </view>
      <view class="form-item no-border">
        <text class="label">紧急联系人电话</text>
        <input v-model="form.emergencyContactPhone" class="input" type="number" maxlength="11" placeholder="请输入紧急联系人电话" />
      </view>
    </view>

    <view class="bottom-bar">
      <button class="save-btn" type="primary" :loading="saving" :disabled="saving || avatarUploading" @click="submitProfile">
        {{ saving ? '保存中...' : '保存资料' }}
      </button>
    </view>
  </view>
</template>

<script>
import { getCurrentUserInfo, updateCurrentUserInfo } from '../../api/user'
import { clearAuth, getToken, setUserInfo } from '../../utils/auth'
import { BASE_URL } from '../../utils/config'
import { normalizeToastMessage } from '../../utils/toast-message'
import { getUserStatusText } from '../../utils/user-status'

function createDefaultForm() {
  return {
    phone: '',
    status: '',
    statusDesc: '',
    nickname: '',
    avatar: '',
    gender: 0,
    birthday: '',
    tastePreference: '',
    allergyInfo: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  }
}

export default {
  name: 'MineProfilePage',
  data() {
    return {
      saving: false,
      avatarUploading: false,
      genderOptions: [
        { label: '未知', value: 0 },
        { label: '男', value: 1 },
        { label: '女', value: 2 }
      ],
      form: createDefaultForm()
    }
  },
  computed: {
    avatarText() {
      const text = this.form.nickname || this.form.phone || '我'
      return String(text).slice(0, 1)
    },
    genderIndex() {
      const index = this.genderOptions.findIndex((item) => item.value === Number(this.form.gender))
      return index === -1 ? 0 : index
    },
    genderLabel() {
      const current = this.genderOptions.find((item) => item.value === Number(this.form.gender))
      return current ? current.label : '未知'
    },
    phoneDisplay() {
      return this.form.phone || '-'
    },
    statusDisplay() {
      if (this.form.statusDesc) {
        return this.form.statusDesc
      }
      if (this.form.status === 0 || this.form.status) {
        return getUserStatusText(this.form.status)
      }
      return '未知状态'
    }
  },
  onLoad() {
    this.loadUserProfile()
  },
  methods: {
    async loadUserProfile() {
      try {
        const data = await getCurrentUserInfo()
        this.form = {
          phone: data.phone || '',
          status: data.status,
          statusDesc: data.statusDesc || '',
          nickname: data.nickname || '',
          avatar: data.avatar || '',
          gender: data.gender === 0 || data.gender ? Number(data.gender) : 0,
          birthday: data.birthday || '',
          tastePreference: data.tastePreference || '',
          allergyInfo: data.allergyInfo || '',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactPhone: data.emergencyContactPhone || ''
        }
        setUserInfo(data || {})
      } catch (error) {
      }
    },
    handleGenderChange(event) {
      const index = Number(event.detail.value)
      const current = this.genderOptions[index]
      this.form.gender = current ? current.value : 0
    },
    handleBirthdayChange(event) {
      this.form.birthday = event.detail.value || ''
    },
    async handleAvatarUploaded(fileUrl) {
      await updateCurrentUserInfo({
        nickname: this.form.nickname.trim(),
        avatar: fileUrl || '',
        gender: Number(this.form.gender),
        birthday: this.form.birthday || '',
        tastePreference: this.form.tastePreference.trim(),
        allergyInfo: this.form.allergyInfo.trim(),
        emergencyContactName: this.form.emergencyContactName.trim(),
        emergencyContactPhone: this.form.emergencyContactPhone.trim()
      })
      this.form.avatar = fileUrl || ''
      const latestUserInfo = await getCurrentUserInfo()
      this.form.status = latestUserInfo.status
      this.form.statusDesc = latestUserInfo.statusDesc || ''
      setUserInfo(latestUserInfo || {})
    },
    chooseAvatar() {
      if (this.avatarUploading) {
        return
      }
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const filePath = res.tempFilePaths && res.tempFilePaths[0]
          if (!filePath) {
            return
          }
          this.avatarUploading = true
          wx.uploadFile({
            url: `${BASE_URL}/api/upload/image`,
            filePath,
            name: 'file',
            header: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
            success: async (uploadRes) => {
              let result = null
              try {
                result = JSON.parse(uploadRes.data)
              } catch (error) {
                uni.showToast({ title: '上传返回格式错误', icon: 'none' })
                return
              }
              if (uploadRes.statusCode === 401 || result.code === 401) {
                clearAuth()
                uni.reLaunch({ url: '/pages/login/index' })
                return
              }
              if (uploadRes.statusCode < 200 || uploadRes.statusCode >= 300 || result.code !== 200) {
                uni.showToast({ title: normalizeToastMessage(result.message) || '上传失败', icon: 'none' })
                return
              }
              const fileUrl = result.data && result.data.fileUrl ? result.data.fileUrl : ''
              if (!fileUrl) {
                uni.showToast({ title: '未获取到头像地址', icon: 'none' })
                return
              }
              try {
                await this.handleAvatarUploaded(fileUrl)
                uni.showToast({ title: '头像已更新', icon: 'success' })
              } catch (error) {
              }
            },
            fail: () => {
              uni.showToast({ title: '上传失败，请稍后重试', icon: 'none' })
            },
            complete: () => {
              this.avatarUploading = false
            }
          })
        }
      })
    },
    buildPayload() {
      return {
        nickname: this.form.nickname.trim(),
        avatar: this.form.avatar || '',
        gender: Number(this.form.gender),
        birthday: this.form.birthday || '',
        tastePreference: this.form.tastePreference.trim(),
        allergyInfo: this.form.allergyInfo.trim(),
        emergencyContactName: this.form.emergencyContactName.trim(),
        emergencyContactPhone: this.form.emergencyContactPhone.trim()
      }
    },
    async submitProfile() {
      if (this.saving || this.avatarUploading) {
        return
      }
      this.saving = true
      try {
        await updateCurrentUserInfo(this.buildPayload())
        const latestUserInfo = await getCurrentUserInfo()
        this.form.status = latestUserInfo.status
        this.form.statusDesc = latestUserInfo.statusDesc || ''
        setUserInfo(latestUserInfo || {})
        uni.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack({ delta: 1 })
        }, 300)
      } catch (error) {
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; padding: 24rpx 24rpx 160rpx; background: #f6f7fb; box-sizing: border-box; }
.section-card { margin-bottom: 24rpx; padding: 28rpx; border-radius: 24rpx; background: #ffffff; box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05); }
.avatar-row { display: flex; align-items: center; justify-content: space-between; gap: 24rpx; }
.avatar-area { display: flex; align-items: center; gap: 20rpx; }
.avatar { width: 116rpx; height: 116rpx; border-radius: 50%; background: #f1e1d9; }
.avatar-placeholder { display: flex; align-items: center; justify-content: center; }
.avatar-text { font-size: 42rpx; font-weight: 600; color: #b96845; }
.upload-text { font-size: 26rpx; color: #d96c3a; }
.form-item { padding: 20rpx 0; border-bottom: 2rpx solid #f1f3f6; }
.form-item.no-border { border-bottom: none; padding-bottom: 0; }
.readonly-item { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
.label { display: block; margin-bottom: 16rpx; font-size: 28rpx; color: #1f2329; }
.readonly-item .label { margin-bottom: 0; }
.readonly-value, .picker-value { font-size: 28rpx; color: #4f5662; text-align: right; }
.input, .textarea, .picker-value { width: 100%; border-radius: 16rpx; background: #f7f8fb; box-sizing: border-box; }
.input { height: 84rpx; padding: 0 24rpx; font-size: 28rpx; color: #222222; }
.textarea { min-height: 160rpx; padding: 22rpx 24rpx; font-size: 28rpx; color: #222222; }
.picker-value { min-height: 84rpx; padding: 24rpx; color: #4f5662; }
.bottom-bar { position: fixed; left: 0; right: 0; bottom: 0; padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom)); background: rgba(255, 255, 255, 0.98); box-shadow: 0 -8rpx 24rpx rgba(32, 37, 43, 0.06); box-sizing: border-box; }
.save-btn { width: 100%; height: 88rpx; line-height: 88rpx; border: none; border-radius: 999rpx; background: #d96c3a; font-size: 30rpx; font-weight: 500; }
.save-btn::after { border: none; }
</style>

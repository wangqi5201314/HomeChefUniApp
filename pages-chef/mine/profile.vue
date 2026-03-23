<template>
  <view class="page">
    <view class="section-card">
      <view class="avatar-row">
        <text class="label label-inline">头像</text>
        <view class="avatar-area" @click="chooseAvatar">
          <image
            v-if="form.avatar"
            class="avatar"
            :src="form.avatar"
            mode="aspectFill"
          />
          <view v-else class="avatar avatar-placeholder">
            <text class="avatar-text">{{ avatarText }}</text>
          </view>
          <text class="upload-text">{{ avatarUploading ? '上传中...' : '更换头像' }}</text>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="form-item readonly-item">
        <text class="label label-inline">手机号</text>
        <text class="readonly-value">{{ phoneDisplay }}</text>
      </view>
      <view class="form-item readonly-item no-border">
        <text class="label label-inline">认证状态</text>
        <text class="readonly-value">{{ certStatusText }}</text>
      </view>
    </view>

    <view class="section-card">
      <view class="form-item">
        <text class="label">姓名</text>
        <input v-model="form.name" class="input" placeholder="请输入姓名" />
      </view>

      <view class="form-item">
        <text class="label">性别</text>
        <input v-model="form.gender" class="input" type="number" placeholder="请输入性别数值" />
      </view>

      <view class="form-item">
        <text class="label">年龄</text>
        <input v-model="form.age" class="input" type="number" placeholder="请输入年龄" />
      </view>

      <view class="form-item">
        <text class="label">个人介绍</text>
        <textarea v-model="form.introduction" class="textarea" maxlength="500" placeholder="请输入个人介绍" />
      </view>

      <view class="form-item">
        <text class="label">擅长菜系</text>
        <input v-model="form.specialtyCuisine" class="input" placeholder="请输入擅长菜系" />
      </view>

      <view class="form-item">
        <text class="label">技能标签</text>
        <input v-model="form.specialtyTags" class="input" placeholder="请输入技能标签，多个可用逗号分隔" />
      </view>

      <view class="form-item">
        <text class="label">从业年限</text>
        <input v-model="form.yearsOfExperience" class="input" type="number" placeholder="请输入从业年限" />
      </view>

      <view class="form-item">
        <text class="label">服务半径</text>
        <input v-model="form.serviceRadiusKm" class="input" type="number" placeholder="请输入服务半径（公里）" />
      </view>

      <view class="form-item no-border">
        <text class="label">服务模式</text>
        <picker
          class="picker-wrap"
          mode="selector"
          :range="serviceModeRange"
          :value="serviceModeIndex"
          @change="handleServiceModeChange"
        >
          <view class="picker-value">
            <text>{{ currentServiceModeText }}</text>
          </view>
        </picker>
      </view>
    </view>

    <view class="bottom-bar">
      <button class="save-btn" :loading="saving" :disabled="saving || avatarUploading" @click="submitProfile">
        保存资料
      </button>
    </view>
  </view>
</template>

<script>
import { getCurrentChefProfile, updateCurrentChefProfile } from '../../api/chef-profile'
import { uploadImage } from '../../api/upload'
import { getChefInfo, setChefInfo } from '../../utils/auth'
import { chefServiceModeOptions, getChefServiceModeText } from '../../utils/chef-service-mode'

function createDefaultForm() {
  return {
    phone: '',
    certStatus: '',
    name: '',
    avatar: '',
    gender: '0',
    age: '',
    introduction: '',
    specialtyCuisine: '',
    specialtyTags: '',
    yearsOfExperience: '',
    serviceRadiusKm: '',
    serviceMode: '1',
    serviceModeDesc: ''
  }
}

export default {
  name: 'ChefProfilePage',
  data() {
    return {
      saving: false,
      avatarUploading: false,
      form: createDefaultForm(),
      serviceModeOptions: chefServiceModeOptions
    }
  },
  computed: {
    avatarText() {
      const text = this.form.name || this.form.phone || '厨'
      return String(text).slice(0, 1)
    },
    phoneDisplay() {
      return this.form.phone || '-'
    },
    certStatusText() {
      if (Number(this.form.certStatus) === 1) {
        return '已认证'
      }

      if (Number(this.form.certStatus) === 0) {
        return '未认证'
      }

      return this.form.certStatus || '-'
    },
    serviceModeRange() {
      return this.serviceModeOptions.map((item) => item.label)
    },
    serviceModeIndex() {
      const index = this.serviceModeOptions.findIndex((item) => item.value === Number(this.form.serviceMode))
      return index < 0 ? 0 : index
    },
    currentServiceModeText() {
      if (this.form.serviceModeDesc) {
        return this.form.serviceModeDesc
      }

      return getChefServiceModeText(this.form.serviceMode)
    }
  },
  onLoad() {
    const cachedInfo = getChefInfo()
    if (cachedInfo) {
      this.fillForm(cachedInfo)
    }

    this.loadChefProfile()
  },
  methods: {
    fillForm(data) {
      const normalizedServiceMode = [1, 2, 3].includes(Number(data.serviceMode)) ? String(Number(data.serviceMode)) : '1'

      this.form = {
        phone: data.phone || '',
        certStatus: data.certStatus === 0 || data.certStatus ? String(data.certStatus) : '',
        name: data.name || '',
        avatar: data.avatar || '',
        gender: data.gender === 0 || data.gender ? String(data.gender) : '0',
        age: data.age === 0 || data.age ? String(data.age) : '',
        introduction: data.introduction || '',
        specialtyCuisine: data.specialtyCuisine || '',
        specialtyTags: data.specialtyTags || '',
        yearsOfExperience: data.yearsOfExperience === 0 || data.yearsOfExperience ? String(data.yearsOfExperience) : '',
        serviceRadiusKm: data.serviceRadiusKm === 0 || data.serviceRadiusKm ? String(data.serviceRadiusKm) : '',
        serviceMode: normalizedServiceMode,
        serviceModeDesc: data.serviceModeDesc || ''
      }
    },
    async loadChefProfile() {
      try {
        const data = await getCurrentChefProfile()
        this.fillForm(data || {})
        setChefInfo(data || {})
      } catch (error) {
      }
    },
    buildPayload() {
      return {
        name: this.form.name.trim(),
        avatar: this.form.avatar || '',
        gender: Number(this.form.gender || 0),
        age: Number(this.form.age || 0),
        introduction: this.form.introduction.trim(),
        specialtyCuisine: this.form.specialtyCuisine.trim(),
        specialtyTags: this.form.specialtyTags.trim(),
        yearsOfExperience: Number(this.form.yearsOfExperience || 0),
        serviceRadiusKm: Number(this.form.serviceRadiusKm || 0),
        serviceMode: Number(this.form.serviceMode || 1)
      }
    },
    handleServiceModeChange(event) {
      const index = Number(event.detail.value)
      const selected = this.serviceModeOptions[index]

      if (!selected) {
        return
      }

      this.form.serviceMode = String(selected.value)
      this.form.serviceModeDesc = selected.label
    },
    chooseAvatar() {
      if (this.avatarUploading) {
        return
      }

      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const filePath = res.tempFilePaths && res.tempFilePaths[0]
          if (!filePath) {
            return
          }

          this.avatarUploading = true

          try {
            const uploadData = await uploadImage(filePath)
            this.form.avatar = uploadData && uploadData.fileUrl ? uploadData.fileUrl : ''
          } catch (error) {
          } finally {
            this.avatarUploading = false
          }
        }
      })
    },
    async submitProfile() {
      if (this.saving || this.avatarUploading) {
        return
      }

      this.saving = true

      try {
        await updateCurrentChefProfile(this.buildPayload())

        const latestInfo = await getCurrentChefProfile()
        this.fillForm(latestInfo || {})
        setChefInfo(latestInfo || {})

        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.navigateBack({
            delta: 1
          })
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
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 160rpx;
  background: linear-gradient(180deg, #edf7f0 0%, #f6f7fb 36%, #f6f7fb 100%);
  box-sizing: border-box;
}

.section-card {
  margin-bottom: 24rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05);
}

.avatar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.avatar-area {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 116rpx;
  height: 116rpx;
  border-radius: 50%;
  background: #e5efe8;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 42rpx;
  font-weight: 600;
  color: #2f8f55;
}

.upload-text {
  font-size: 26rpx;
  color: #2f8f55;
}

.form-item {
  padding: 20rpx 0;
  border-bottom: 2rpx solid #eef1ef;
}

.form-item.no-border {
  border-bottom: none;
  padding-bottom: 0;
}

.readonly-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.label {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #1f2329;
}

.label-inline {
  margin-bottom: 0;
}

.readonly-item .label {
  margin-bottom: 0;
}

.readonly-value,
.input,
.textarea,
.picker-value {
  font-size: 28rpx;
  color: #1f2329;
}

.input,
.textarea,
.picker-value {
  width: 100%;
  border-radius: 16rpx;
  background: #f5f7f6;
  box-sizing: border-box;
}

.input {
  min-height: 84rpx;
  padding: 24rpx;
}

.textarea {
  min-height: 180rpx;
  padding: 24rpx;
}

.picker-wrap {
  width: 100%;
}

.picker-value {
  min-height: 84rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -8rpx 24rpx rgba(32, 37, 43, 0.06);
  box-sizing: border-box;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border: none;
  border-radius: 999rpx;
  background: #2f8f55;
  font-size: 30rpx;
  color: #ffffff;
}

.save-btn::after {
  border: none;
}
</style>

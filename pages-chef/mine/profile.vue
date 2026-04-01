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
      <view class="form-item">
        <text class="label label-inline">手机号</text>
        <input
          v-model="form.phone"
          class="input"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
        />
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
        <picker
          class="picker-wrap"
          mode="selector"
          :range="genderRange"
          :value="genderIndex"
          @change="handleGenderChange"
        >
          <view class="picker-value">
            <text>{{ currentGenderText }}</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">年龄</text>
        <picker
          class="picker-wrap"
          mode="selector"
          :range="ageRange"
          :value="ageIndex"
          @change="handleAgeChange"
        >
          <view class="picker-value">
            <text>{{ currentAgeText }}</text>
          </view>
        </picker>
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
        <picker
          class="picker-wrap"
          mode="selector"
          :range="experienceRange"
          :value="experienceIndex"
          @change="handleExperienceChange"
        >
          <view class="picker-value">
            <text>{{ currentExperienceText }}</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">服务半径</text>
        <picker
          class="picker-wrap"
          mode="selector"
          :range="serviceRadiusRange"
          :value="serviceRadiusIndex"
          @change="handleServiceRadiusChange"
        >
          <view class="picker-value">
            <text>{{ currentServiceRadiusText }}</text>
          </view>
        </picker>
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
import { getChefCertStatusText } from '../../utils/chef-cert-status'

const GENDER_OPTIONS = [
  { label: '女', value: 0 },
  { label: '男', value: 1 }
]

const AGE_OPTIONS = Array.from({ length: 56 }, (_, index) => {
  const value = index + 15
  return {
    label: `${value}岁`,
    value
  }
})

const EXPERIENCE_OPTIONS = Array.from({ length: 56 }, (_, index) => ({
  label: `${index}年`,
  value: index
}))

const SERVICE_RADIUS_OPTIONS = Array.from({ length: 51 }, (_, index) => ({
  label: `${index}km`,
  value: index
}))

function createDefaultForm() {
  return {
    phone: '',
    certStatus: '',
    certStatusDesc: '',
    name: '',
    avatar: '',
    gender: '0',
    age: '15',
    introduction: '',
    specialtyCuisine: '',
    specialtyTags: '',
    yearsOfExperience: '0',
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
      genderOptions: GENDER_OPTIONS,
      ageOptions: AGE_OPTIONS,
      experienceOptions: EXPERIENCE_OPTIONS,
      serviceRadiusOptions: SERVICE_RADIUS_OPTIONS,
      serviceModeOptions: chefServiceModeOptions
    }
  },
  computed: {
    avatarText() {
      const text = this.form.name || this.form.phone || '厨'
      return String(text).slice(0, 1)
    },
    certStatusText() {
      if (this.form.certStatusDesc) {
        return this.form.certStatusDesc
      }

      if (this.form.certStatus === '0' || this.form.certStatus) {
        return getChefCertStatusText(this.form.certStatus)
      }

      return '未知状态'
    },
    genderRange() {
      return this.genderOptions.map((item) => item.label)
    },
    genderIndex() {
      const index = this.genderOptions.findIndex((item) => item.value === Number(this.form.gender))
      return index < 0 ? 0 : index
    },
    currentGenderText() {
      const current = this.genderOptions.find((item) => item.value === Number(this.form.gender))
      return current ? current.label : '请选择性别'
    },
    ageRange() {
      return this.ageOptions.map((item) => item.label)
    },
    ageIndex() {
      const index = this.ageOptions.findIndex((item) => item.value === Number(this.form.age))
      return index < 0 ? 0 : index
    },
    currentAgeText() {
      const current = this.ageOptions.find((item) => item.value === Number(this.form.age))
      return current ? current.label : '请选择年龄'
    },
    experienceRange() {
      return this.experienceOptions.map((item) => item.label)
    },
    experienceIndex() {
      const index = this.experienceOptions.findIndex((item) => item.value === Number(this.form.yearsOfExperience))
      return index < 0 ? 0 : index
    },
    currentExperienceText() {
      const current = this.experienceOptions.find((item) => item.value === Number(this.form.yearsOfExperience))
      return current ? current.label : '请选择从业年限'
    },
    serviceRadiusRange() {
      return this.serviceRadiusOptions.map((item) => item.label)
    },
    serviceRadiusIndex() {
      const index = this.serviceRadiusOptions.findIndex((item) => item.value === Number(this.form.serviceRadiusKm))
      return index < 0 ? 0 : index
    },
    currentServiceRadiusText() {
      const current = this.serviceRadiusOptions.find((item) => item.value === Number(this.form.serviceRadiusKm))
      return current ? current.label : '请选择服务半径'
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
      const normalizedGender = [0, 1].includes(Number(data.gender)) ? String(Number(data.gender)) : '0'
      const normalizedAge = Number(data.age)
      const normalizedExperience = Number(data.yearsOfExperience)

      this.form = {
        phone: data.phone || '',
        certStatus: data.certStatus === 0 || data.certStatus ? String(data.certStatus) : '',
        certStatusDesc: data.certStatusDesc || '',
        name: data.name || '',
        avatar: data.avatar || '',
        gender: normalizedGender,
        age: normalizedAge >= 15 && normalizedAge <= 70 ? String(normalizedAge) : '15',
        introduction: data.introduction || '',
        specialtyCuisine: data.specialtyCuisine || '',
        specialtyTags: data.specialtyTags || '',
        yearsOfExperience: normalizedExperience >= 0 && normalizedExperience <= 55 ? String(normalizedExperience) : '0',
        serviceRadiusKm: Number(data.serviceRadiusKm) >= 0 && Number(data.serviceRadiusKm) <= 50
          ? String(Number(data.serviceRadiusKm))
          : '0',
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
        phone: this.form.phone.trim(),
        name: this.form.name.trim(),
        avatar: this.form.avatar || '',
        gender: Number(this.form.gender || 0),
        age: Number(this.form.age || 15),
        introduction: this.form.introduction.trim(),
        specialtyCuisine: this.form.specialtyCuisine.trim(),
        specialtyTags: this.form.specialtyTags.trim(),
        yearsOfExperience: Number(this.form.yearsOfExperience || 0),
        serviceRadiusKm: Number(this.form.serviceRadiusKm || 0),
        serviceMode: Number(this.form.serviceMode || 1)
      }
    },
    handleGenderChange(event) {
      const index = Number(event.detail.value)
      const selected = this.genderOptions[index]

      if (selected) {
        this.form.gender = String(selected.value)
      }
    },
    handleAgeChange(event) {
      const index = Number(event.detail.value)
      const selected = this.ageOptions[index]

      if (selected) {
        this.form.age = String(selected.value)
      }
    },
    handleExperienceChange(event) {
      const index = Number(event.detail.value)
      const selected = this.experienceOptions[index]

      if (selected) {
        this.form.yearsOfExperience = String(selected.value)
      }
    },
    handleServiceRadiusChange(event) {
      const index = Number(event.detail.value)
      const selected = this.serviceRadiusOptions[index]

      if (selected) {
        this.form.serviceRadiusKm = String(selected.value)
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

      const phone = this.form.phone.trim()
      if (!phone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return
      }

      if (!/^1\d{10}$/.test(phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
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

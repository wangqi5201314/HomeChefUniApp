<template>
  <view class="page">
    <view class="status-card">
      <view class="status-head">
        <text class="status-title">当前认证状态</text>
        <text class="status-tag">{{ certStatusText }}</text>
      </view>
      <text class="status-tip">{{ certStatusTip }}</text>
    </view>

    <view class="section-card">
      <view class="form-item">
        <text class="label">真实姓名</text>
        <input v-model="form.realName" class="input" placeholder="请输入真实姓名" />
      </view>

      <view class="form-item no-border">
        <text class="label">身份证号</text>
        <input v-model="form.idCardNo" class="input" placeholder="请输入身份证号" />
      </view>
    </view>

    <view class="section-card">
      <view class="upload-item" v-for="item in uploadFields" :key="item.key">
        <text class="label">{{ item.label }}</text>
        <view class="upload-box" @click="chooseCertImage(item.key)">
          <image
            v-if="form[item.key]"
            class="upload-image"
            :src="form[item.key]"
            mode="aspectFill"
          />
          <view v-else class="upload-placeholder">
            <text class="upload-placeholder-text">
              {{ uploadingKey === item.key ? '上传中...' : '点击上传图片' }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <button
      class="submit-btn"
      :loading="saving"
      :disabled="saving || !!uploadingKey"
      @click="submitCertification"
    >
      提交认证资料
    </button>
  </view>
</template>

<script>
import { getChefCertification, submitChefCertification } from '../../api/chef-certification'
import { getCurrentChefProfile } from '../../api/chef-profile'
import { uploadImage } from '../../api/upload'
import { getChefInfo, setChefInfo } from '../../utils/auth'
import { getChefCertStatusText } from '../../utils/chef-cert-status'

function createDefaultForm() {
  return {
    realName: '',
    idCardNo: '',
    healthCertUrl: '',
    skillCertUrl: '',
    serviceCertUrl: '',
    advancedCertUrl: ''
  }
}

function isValidChineseIdCard(idCardNo) {
  const value = String(idCardNo || '').trim().toUpperCase()

  if (!/^\d{17}[\dX]$/.test(value)) {
    return false
  }

  const year = Number(value.slice(6, 10))
  const month = Number(value.slice(10, 12))
  const day = Number(value.slice(12, 14))
  const birthday = new Date(year, month - 1, day)

  if (
    birthday.getFullYear() !== year
    || birthday.getMonth() + 1 !== month
    || birthday.getDate() !== day
  ) {
    return false
  }

  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const codes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  const sum = value
    .slice(0, 17)
    .split('')
    .reduce((total, current, index) => total + Number(current) * weights[index], 0)

  return codes[sum % 11] === value[17]
}

export default {
  name: 'ChefCertificationPage',
  data() {
    return {
      loaded: false,
      skipNextOnShowReload: false,
      saving: false,
      uploadingKey: '',
      form: createDefaultForm(),
      chefInfo: {},
      uploadFields: [
        { key: 'healthCertUrl', label: '健康证' },
        { key: 'skillCertUrl', label: '技能证书' },
        { key: 'serviceCertUrl', label: '服务认证' },
        { key: 'advancedCertUrl', label: '高级认证' }
      ]
    }
  },
  computed: {
    certStatusText() {
      if (this.chefInfo.certStatusDesc) {
        return this.chefInfo.certStatusDesc
      }

      if (this.chefInfo.certStatus === 0 || this.chefInfo.certStatus) {
        return getChefCertStatusText(this.chefInfo.certStatus)
      }

      return '未知状态'
    },
    certStatusTip() {
      const status = Number(this.chefInfo.certStatus)

      if (status === 2) {
        return '认证已被拒绝，请检查资料后重新提交。'
      }

      if (status === 1) {
        return '认证已通过。'
      }

      if (status === 0) {
        return '审核中，请耐心等待。'
      }

      return '请完善并提交认证资料。'
    }
  },
  onLoad() {
    const cachedInfo = getChefInfo()
    if (cachedInfo) {
      this.chefInfo = cachedInfo
    }

    this.loadPageData()
  },
  onShow() {
    if (this.skipNextOnShowReload) {
      this.skipNextOnShowReload = false
      return
    }

    if (!this.loaded) {
      const cachedInfo = getChefInfo()
      if (cachedInfo) {
        this.chefInfo = cachedInfo
      }
      this.loadPageData()
    }
  },
  methods: {
    validateForm() {
      if (!this.form.realName.trim()) {
        uni.showToast({
          title: '请输入真实姓名',
          icon: 'none'
        })
        return false
      }

      if (!this.form.idCardNo.trim()) {
        uni.showToast({
          title: '请输入身份证号',
          icon: 'none'
        })
        return false
      }

      if (!isValidChineseIdCard(this.form.idCardNo)) {
        uni.showToast({
          title: '请输入正确的身份证号',
          icon: 'none'
        })
        return false
      }

      return true
    },
    async loadPageData() {
      try {
        const [certificationData, chefData] = await Promise.all([
          getChefCertification(),
          getCurrentChefProfile()
        ])

        this.form = {
          ...createDefaultForm(),
          ...(certificationData || {})
        }
        this.chefInfo = chefData || {}
        setChefInfo(this.chefInfo)
      } catch (error) {
      } finally {
        this.loaded = true
      }
    },
    chooseCertImage(field) {
      if (this.uploadingKey) {
        return
      }

      // 从相册或相机返回时会触发 onShow，这里跳过那一次重载，避免把未提交表单覆盖掉。
      this.skipNextOnShowReload = true

      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const filePath = res.tempFilePaths && res.tempFilePaths[0]
          if (!filePath) {
            return
          }

          this.uploadingKey = field

          try {
            const uploadData = await uploadImage(filePath)
            this.form[field] = uploadData && uploadData.fileUrl ? uploadData.fileUrl : ''
          } catch (error) {
          } finally {
            this.uploadingKey = ''
          }
        }
      })
    },
    async submitCertification() {
      if (this.saving || this.uploadingKey || !this.validateForm()) {
        return
      }

      this.saving = true

      try {
        await submitChefCertification({
          realName: this.form.realName.trim(),
          idCardNo: this.form.idCardNo.trim(),
          healthCertUrl: this.form.healthCertUrl || '',
          skillCertUrl: this.form.skillCertUrl || '',
          serviceCertUrl: this.form.serviceCertUrl || '',
          advancedCertUrl: this.form.advancedCertUrl || ''
        })

        uni.showToast({
          title: '提交成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.redirectTo({
            url: '/pages-chef/mine/index'
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
  padding: 24rpx;
  background: linear-gradient(180deg, #edf7f0 0%, #f6f7fb 36%, #f6f7fb 100%);
  box-sizing: border-box;
}

.status-card,
.section-card {
  margin-bottom: 24rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 36rpx rgba(28, 39, 31, 0.06);
}

.status-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.status-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2329;
}

.status-tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #edf8f1;
  font-size: 24rpx;
  color: #2f8f55;
}

.status-tip {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #5d6873;
}

.form-item {
  margin-bottom: 20rpx;
}

.form-item.no-border {
  margin-bottom: 0;
}

.label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 26rpx;
  color: #4d5d52;
}

.input {
  width: 100%;
  min-height: 84rpx;
  padding: 24rpx;
  border-radius: 18rpx;
  background: #f5f7f6;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #1f2329;
}

.upload-item {
  margin-bottom: 24rpx;
}

.upload-item:last-child {
  margin-bottom: 0;
}

.upload-box {
  overflow: hidden;
  border-radius: 22rpx;
  background: #f5f7f6;
}

.upload-image,
.upload-placeholder {
  width: 100%;
  height: 260rpx;
}

.upload-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-placeholder-text {
  font-size: 28rpx;
  color: #7a837d;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border: none;
  border-radius: 20rpx;
  background: #2f8f55;
  font-size: 30rpx;
  color: #ffffff;
}

.submit-btn::after {
  border: none;
}
</style>

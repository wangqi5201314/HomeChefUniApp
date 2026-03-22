<template>
  <view class="page">
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
            <text class="upload-placeholder-text">点击上传图片</text>
          </view>
        </view>
      </view>
    </view>

    <button class="submit-btn" :loading="saving" :disabled="saving || uploadingKey" @click="submitCertification">
      提交认证资料
    </button>
  </view>
</template>

<script>
import { getChefCertification, submitChefCertification } from '../../api/chef-certification'
import { uploadImage } from '../../api/upload'

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

export default {
  name: 'ChefCertificationPage',
  data() {
    return {
      saving: false,
      uploadingKey: '',
      form: createDefaultForm(),
      uploadFields: [
        { key: 'healthCertUrl', label: '健康证' },
        { key: 'skillCertUrl', label: '技能证书' },
        { key: 'serviceCertUrl', label: '服务认证' },
        { key: 'advancedCertUrl', label: '高级认证' }
      ]
    }
  },
  onShow() {
    this.loadCertification()
  },
  methods: {
    async loadCertification() {
      try {
        const data = await getChefCertification()
        this.form = {
          ...createDefaultForm(),
          ...(data || {})
        }
      } catch (error) {
        this.form = createDefaultForm()
      }
    },
    chooseCertImage(field) {
      if (this.uploadingKey) {
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
      if (this.saving || this.uploadingKey) {
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

        await this.loadCertification()
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

.section-card {
  margin-bottom: 24rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 36rpx rgba(28, 39, 31, 0.06);
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

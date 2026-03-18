<template>
  <view class="page">
    <view class="section-card">
      <text class="section-title">评分</text>

      <view class="score-row">
        <text class="score-label">菜品评分</text>
        <view class="score-options">
          <text
            v-for="item in scoreOptions"
            :key="`dish-${item}`"
            class="score-item"
            :class="{ active: form.dishScore === item }"
            @click="setScore('dishScore', item)"
          >
            {{ item }}
          </text>
        </view>
      </view>

      <view class="score-row">
        <text class="score-label">服务评分</text>
        <view class="score-options">
          <text
            v-for="item in scoreOptions"
            :key="`service-${item}`"
            class="score-item"
            :class="{ active: form.serviceScore === item }"
            @click="setScore('serviceScore', item)"
          >
            {{ item }}
          </text>
        </view>
      </view>

      <view class="score-row">
        <text class="score-label">技能评分</text>
        <view class="score-options">
          <text
            v-for="item in scoreOptions"
            :key="`skill-${item}`"
            class="score-item"
            :class="{ active: form.skillScore === item }"
            @click="setScore('skillScore', item)"
          >
            {{ item }}
          </text>
        </view>
      </view>

      <view class="score-row no-border">
        <text class="score-label">环境评分</text>
        <view class="score-options">
          <text
            v-for="item in scoreOptions"
            :key="`environment-${item}`"
            class="score-item"
            :class="{ active: form.environmentScore === item }"
            @click="setScore('environmentScore', item)"
          >
            {{ item }}
          </text>
        </view>
      </view>
    </view>

    <view class="section-card">
      <text class="section-title">评价内容</text>
      <textarea
        v-model="form.content"
        class="textarea"
        placeholder="请输入评价内容"
      />

      <view class="switch-row">
        <text class="switch-label">匿名评价</text>
        <switch
          :checked="Number(form.isAnonymous) === 1"
          color="#d96c3a"
          @change="handleAnonymousChange"
        />
      </view>
    </view>

    <view class="section-card">
      <view class="upload-head">
        <text class="section-title">评价图片</text>
        <text class="upload-tip">最多 9 张</text>
      </view>

      <view class="image-grid">
        <view
          v-for="(item, index) in imageList"
          :key="`${item.fileUrl || item.localPath}-${index}`"
          class="image-item"
        >
          <image class="image-preview" :src="item.localPath" mode="aspectFill" />
          <view v-if="item.uploading" class="image-mask">
            <text class="image-mask-text">上传中</text>
          </view>
          <text class="delete-btn" @click="removeImage(index)">×</text>
        </view>

        <view
          v-if="imageList.length < 9"
          class="upload-box"
          :class="{ disabled: uploading }"
          @click="chooseImages"
        >
          <text class="upload-plus">+</text>
          <text class="upload-text">{{ uploading ? '上传中' : '上传图片' }}</text>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <button
        class="submit-btn"
        type="primary"
        :loading="submitting"
        :disabled="submitting || uploading"
        @click="submitReview"
      >
        {{ submitting ? '提交中...' : '提交评价' }}
      </button>
    </view>
  </view>
</template>

<script>
import { createReview } from '../../api/review'
import { uploadImage } from '../../api/upload'

function createDefaultForm() {
  return {
    dishScore: 5,
    serviceScore: 5,
    skillScore: 5,
    environmentScore: 5,
    content: '',
    isAnonymous: 0
  }
}

export default {
  name: 'ReviewCreatePage',
  data() {
    return {
      orderId: '',
      userId: '',
      chefId: '',
      uploading: false,
      submitting: false,
      scoreOptions: [1, 2, 3, 4, 5],
      form: createDefaultForm(),
      imageList: []
    }
  },
  onLoad(options) {
    this.orderId = options && options.orderId ? options.orderId : ''
    this.userId = options && options.userId ? options.userId : ''
    this.chefId = options && options.chefId ? options.chefId : ''

    if (!this.orderId || !this.userId || !this.chefId) {
      uni.showToast({
        title: '评价参数不完整',
        icon: 'none'
      })
    }
  },
  methods: {
    setScore(field, value) {
      this.form[field] = value
    },
    handleAnonymousChange(event) {
      this.form.isAnonymous = event.detail.value ? 1 : 0
    },
    chooseImages() {
      if (this.uploading) {
        return
      }

      const remainCount = 9 - this.imageList.length

      if (remainCount <= 0) {
        uni.showToast({
          title: '最多上传 9 张图片',
          icon: 'none'
        })
        return
      }

      uni.chooseImage({
        count: remainCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempFilePaths = res.tempFilePaths || []
          if (!tempFilePaths.length) {
            return
          }

          this.uploading = true

          try {
            for (const filePath of tempFilePaths) {
              const imageItem = {
                localPath: filePath,
                fileUrl: '',
                uploading: true
              }

              this.imageList.push(imageItem)
              const currentIndex = this.imageList.length - 1

              try {
                const uploadResult = await uploadImage(filePath)
                this.imageList.splice(currentIndex, 1, {
                  localPath: filePath,
                  fileUrl: uploadResult.fileUrl || '',
                  uploading: false
                })
              } catch (error) {
                this.imageList.splice(currentIndex, 1)
              }
            }
          } finally {
            this.uploading = false
          }
        }
      })
    },
    removeImage(index) {
      if (this.uploading && this.imageList[index] && this.imageList[index].uploading) {
        return
      }
      this.imageList.splice(index, 1)
    },
    validateForm() {
      if (!this.orderId || !this.userId || !this.chefId) {
        uni.showToast({
          title: '评价参数不完整',
          icon: 'none'
        })
        return false
      }

      if (this.imageList.some((item) => item.uploading)) {
        uni.showToast({
          title: '图片上传中，请稍后提交',
          icon: 'none'
        })
        return false
      }

      return true
    },
    buildPayload() {
      const imageUrls = this.imageList
        .map((item) => item.fileUrl)
        .filter(Boolean)
        .join(',')

      return {
        orderId: Number(this.orderId),
        userId: Number(this.userId),
        chefId: Number(this.chefId),
        dishScore: Number(this.form.dishScore),
        serviceScore: Number(this.form.serviceScore),
        skillScore: Number(this.form.skillScore),
        environmentScore: Number(this.form.environmentScore),
        content: this.form.content.trim(),
        imageUrls,
        isAnonymous: Number(this.form.isAnonymous) === 1 ? 1 : 0
      }
    },
    async submitReview() {
      if (this.submitting || this.uploading || !this.validateForm()) {
        return
      }

      this.submitting = true

      try {
        await createReview(this.buildPayload())

        uni.showToast({
          title: '评价成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.navigateBack({
            delta: 1
          })
        }, 300)
      } catch (error) {
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 160rpx;
  background: #f6f7fb;
  box-sizing: border-box;
}

.section-card {
  margin-bottom: 24rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05);
}

.section-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2329;
}

.score-row {
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f1f3f6;
}

.score-row.no-border {
  padding-bottom: 0;
  border-bottom: none;
}

.score-label {
  display: block;
  margin-bottom: 18rpx;
  font-size: 28rpx;
  color: #1f2329;
}

.score-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.score-item {
  width: 72rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 50%;
  background: #f3f5f8;
  text-align: center;
  font-size: 28rpx;
  color: #5f6671;
}

.score-item.active {
  background: #d96c3a;
  color: #ffffff;
}

.textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 24rpx;
  border-radius: 18rpx;
  background: #f7f8fb;
  font-size: 28rpx;
  color: #222222;
  box-sizing: border-box;
}

.switch-row,
.upload-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.switch-row {
  margin-top: 28rpx;
}

.switch-label,
.upload-tip {
  font-size: 26rpx;
  color: #8a8f99;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item,
.upload-box {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.image-item {
  background: #f3f5f8;
}

.image-preview {
  width: 100%;
  height: 100%;
}

.image-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.45);
}

.image-mask-text {
  font-size: 24rpx;
  color: #ffffff;
}

.delete-btn {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.65);
  text-align: center;
  font-size: 28rpx;
  color: #ffffff;
}

.upload-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #d7dce3;
  background: #fafbfd;
}

.upload-box.disabled {
  opacity: 0.6;
}

.upload-plus {
  font-size: 54rpx;
  line-height: 1;
  color: #a0a8b3;
}

.upload-text {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #8a8f99;
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

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border: none;
  border-radius: 999rpx;
  background: #d96c3a;
  font-size: 30rpx;
  font-weight: 500;
}

.submit-btn::after {
  border: none;
}
</style>

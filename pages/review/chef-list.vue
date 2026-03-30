<template>
  <view class="page">
    <view v-if="loading" class="state-card">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else-if="reviewList.length === 0" class="state-card">
      <text class="state-text">暂无评价</text>
    </view>

    <view v-else class="review-list">
      <view v-for="item in reviewList" :key="item.id" class="review-card">
        <view class="review-head">
          <text class="review-user">{{ item.isAnonymous === 1 ? '匿名用户' : `用户${item.userId}` }}</text>
          <text class="review-score">评分 {{ formatPlain(item.overallScore) }}</text>
        </view>

        <view class="score-row">
          <text class="score-item">菜品 {{ formatPlain(item.dishScore) }}</text>
          <text class="score-item">服务 {{ formatPlain(item.serviceScore) }}</text>
          <text class="score-item">技能 {{ formatPlain(item.skillScore) }}</text>
          <text class="score-item">环境 {{ formatPlain(item.environmentScore) }}</text>
        </view>

        <text class="review-content">{{ item.content || '用户未填写评价内容' }}</text>
        <text class="review-time">{{ formatFullDateTime(item.createdAt) }}</text>

        <view v-if="parseImageUrls(item.imageUrls).length" class="image-list">
          <image
            v-for="(url, index) in parseImageUrls(item.imageUrls)"
            :key="`${item.id}-${index}`"
            class="review-image"
            :src="url"
            mode="aspectFill"
            @click="previewImages(parseImageUrls(item.imageUrls), index)"
          />
        </view>

        <view v-if="item.replyContent" class="reply-box">
          <text class="reply-text">厨师回复：{{ item.replyContent }}</text>
          <text v-if="item.replyAt" class="reply-time">回复时间：{{ formatFullDateTime(item.replyAt) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getChefReviewList } from '../../api/review'
import { formatFullDateTime } from '../../utils/schedule-time'

export default {
  name: 'ChefReviewListPage',
  data() {
    return {
      chefId: '',
      loading: false,
      reviewList: []
    }
  },
  onLoad(options) {
    this.chefId = options && options.chefId ? options.chefId : ''

    if (!this.chefId) {
      uni.showToast({
        title: '缺少厨师 id',
        icon: 'none'
      })
      return
    }

    this.loadReviewList()
  },
  methods: {
    formatFullDateTime,
    async loadReviewList() {
      this.loading = true

      try {
        const data = await getChefReviewList(this.chefId)
        this.reviewList = Array.isArray(data) ? data : []
      } catch (error) {
        this.reviewList = []
      } finally {
        this.loading = false
      }
    },
    parseImageUrls(imageUrls) {
      if (!imageUrls) {
        return []
      }

      return String(imageUrls)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    },
    previewImages(urls, currentIndex) {
      uni.previewImage({
        urls,
        current: urls[currentIndex]
      })
    },
    formatPlain(value) {
      if (value === 0) {
        return '0'
      }

      return value || '-'
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f6f7fb;
  box-sizing: border-box;
}

.state-card,
.review-card {
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05);
}

.state-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320rpx;
  padding: 32rpx;
}

.state-text {
  font-size: 28rpx;
  color: #8a8f99;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.review-card {
  padding: 28rpx;
}

.review-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.review-user {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2329;
}

.review-score,
.review-time,
.reply-time {
  font-size: 24rpx;
  color: #8a8f99;
}

.score-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 20rpx;
  margin-top: 16rpx;
}

.score-item {
  font-size: 26rpx;
  color: #4f5662;
}

.review-content {
  display: block;
  margin-top: 16rpx;
  font-size: 28rpx;
  line-height: 1.7;
  color: #333333;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 18rpx;
}

.review-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 16rpx;
  background: #f3f4f6;
}

.reply-box {
  margin-top: 18rpx;
  padding: 18rpx 20rpx;
  border-radius: 18rpx;
  background: #f8f9fb;
}

.reply-text {
  display: block;
  font-size: 26rpx;
  line-height: 1.7;
  color: #5f6671;
}

.reply-time {
  display: block;
  margin-top: 10rpx;
}
</style>

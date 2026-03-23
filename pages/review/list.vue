<template>
  <view class="page">
    <view v-if="loading" class="state-card">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else-if="reviewList.length === 0" class="state-card">
      <text class="state-text">暂无评价记录</text>
    </view>

    <view v-else class="review-list">
      <view v-for="item in reviewList" :key="item.id" class="review-card">
        <view class="card-header">
          <text class="order-no">订单号：{{ item.orderId || '-' }}</text>
          <text class="overall-score">综合评分 {{ formatScore(item.overallScore) }}</text>
        </view>

        <view class="score-row">
          <text class="score-item">菜品 {{ formatScore(item.dishScore) }}</text>
          <text class="score-item">服务 {{ formatScore(item.serviceScore) }}</text>
          <text class="score-item">技能 {{ formatScore(item.skillScore) }}</text>
          <text class="score-item">环境 {{ formatScore(item.environmentScore) }}</text>
        </view>

        <view class="meta-row">
          <text class="meta-text">{{ item.isAnonymous === 1 ? '匿名评价' : '实名评价' }}</text>
          <text class="meta-text">评价时间：{{ item.createdAt || '-' }}</text>
        </view>

        <view class="content-block">
          <text class="block-title">评价内容</text>
          <text class="content-text">{{ item.content || '未填写评价内容' }}</text>
        </view>

        <view v-if="parseImageUrls(item.imageUrls).length" class="content-block">
          <text class="block-title">评价图片</text>
          <view class="image-list">
            <image
              v-for="(url, index) in parseImageUrls(item.imageUrls)"
              :key="`${item.id}-${index}`"
              class="review-image"
              :src="url"
              mode="aspectFill"
              @click="previewImages(parseImageUrls(item.imageUrls), index)"
            />
          </view>
        </view>

        <view v-if="item.replyContent" class="reply-card">
          <text class="reply-title">厨师回复</text>
          <text class="reply-content">{{ item.replyContent }}</text>
          <text class="reply-time">回复时间：{{ item.replyAt || '-' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getMyReviewList } from '../../api/review'

const USER_ID_KEY = 'user_id'

export default {
  name: 'ReviewListPage',
  data() {
    return {
      loading: true,
      userId: '',
      reviewList: []
    }
  },
  onLoad() {
    this.userId = uni.getStorageSync(USER_ID_KEY) || ''
    this.loadReviewList()
  },
  methods: {
    async loadReviewList() {
      if (!this.userId) {
        this.loading = false
        this.reviewList = []
        return
      }

      this.loading = true

      try {
        const data = await getMyReviewList(this.userId)
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
    formatScore(score) {
      if (score === 0) {
        return '0'
      }

      return score || '-'
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
  box-shadow: 0 12rpx 32rpx rgba(32, 37, 43, 0.06);
}

.state-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220rpx;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
}

.order-no {
  font-size: 26rpx;
  color: #5f6671;
}

.overall-score {
  font-size: 28rpx;
  font-weight: 600;
  color: #d96c3a;
}

.score-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 24rpx;
  margin-top: 20rpx;
}

.score-item {
  font-size: 26rpx;
  color: #333333;
}

.meta-row {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 20rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #8a8f99;
}

.content-block {
  margin-top: 24rpx;
}

.block-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #1f2329;
}

.content-text {
  display: block;
  margin-top: 12rpx;
  font-size: 28rpx;
  line-height: 1.7;
  color: #333333;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}

.review-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 16rpx;
  background: #f3f4f6;
}

.reply-card {
  margin-top: 24rpx;
  padding: 20rpx;
  border-radius: 18rpx;
  background: #fff6ef;
}

.reply-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #b96845;
}

.reply-content {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #5a3d2f;
}

.reply-time {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #8f7466;
}
</style>

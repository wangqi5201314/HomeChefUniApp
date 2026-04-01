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
          <view class="header-main">
            <text class="order-no">订单号：{{ item.orderNo || item.orderId || '-' }}</text>
            <view class="identity-row">
              <text class="identity-tag" :class="{ anonymous: item.isAnonymous === 1 }">
                {{ item.isAnonymous === 1 ? '匿名评价' : '实名评价' }}
              </text>
              <text class="meta-text">评价时间：{{ formatFullDateTime(item.createdAt) }}</text>
            </view>
          </view>
          <view class="overall-box">
            <text class="overall-label">综合评分</text>
            <text class="overall-score">{{ formatScore(item.overallScore) }}</text>
            <text class="overall-stars">{{ renderStars(item.overallScore) }}</text>
          </view>
        </view>

        <view class="score-grid">
          <view class="score-item-card">
            <text class="score-name">菜品</text>
            <text class="score-stars">{{ renderStars(item.dishScore) }}</text>
            <text class="score-value">{{ formatScore(item.dishScore) }}</text>
          </view>
          <view class="score-item-card">
            <text class="score-name">服务</text>
            <text class="score-stars">{{ renderStars(item.serviceScore) }}</text>
            <text class="score-value">{{ formatScore(item.serviceScore) }}</text>
          </view>
          <view class="score-item-card">
            <text class="score-name">技能</text>
            <text class="score-stars">{{ renderStars(item.skillScore) }}</text>
            <text class="score-value">{{ formatScore(item.skillScore) }}</text>
          </view>
          <view class="score-item-card">
            <text class="score-name">环境</text>
            <text class="score-stars">{{ renderStars(item.environmentScore) }}</text>
            <text class="score-value">{{ formatScore(item.environmentScore) }}</text>
          </view>
        </view>

        <view class="content-block">
          <text class="block-title">评价内容</text>
          <text class="content-text">{{ item.content || '未填写评价内容' }}</text>
        </view>

        <view v-if="parseImageUrls(item.imageUrls).length" class="gallery-block">
          <view class="gallery-head">
            <text class="block-title">评价图片</text>
            <text class="gallery-count">共 {{ parseImageUrls(item.imageUrls).length }} 张</text>
          </view>
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
          <view class="reply-accent"></view>
          <text class="reply-title">厨师回复</text>
          <text class="reply-content">{{ item.replyContent }}</text>
          <text class="reply-time">回复时间：{{ formatFullDateTime(item.replyAt) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getMyReviewList } from '../../api/review'
import { formatFullDateTime } from '../../utils/schedule-time'

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
    formatFullDateTime,
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
    },
    renderStars(score) {
      const numericScore = Number(score)

      if (!Number.isFinite(numericScore) || numericScore <= 0) {
        return '☆☆☆☆☆'
      }

      const fullStars = Math.max(0, Math.min(5, Math.round(numericScore)))
      return `${'★'.repeat(fullStars)}${'☆'.repeat(5 - fullStars)}`
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
  border: 2rpx solid #f1e7df;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
}

.header-main {
  flex: 1;
  min-width: 0;
}

.order-no {
  font-size: 26rpx;
  font-weight: 600;
  color: #374151;
}

.identity-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx 16rpx;
  margin-top: 14rpx;
}

.identity-tag {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: #eef5ff;
  font-size: 22rpx;
  font-weight: 600;
  color: #5678a6;
}

.identity-tag.anonymous {
  background: #f4f5f7;
  color: #7b838f;
}

.overall-box {
  flex-shrink: 0;
  min-width: 176rpx;
  padding: 18rpx 20rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #fff8ef 0%, #fff2de 100%);
  text-align: right;
}

.overall-label,
.overall-score,
.overall-stars {
  display: block;
}

.overall-label {
  font-size: 22rpx;
  color: #8a735f;
}

.overall-score {
  margin-top: 8rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #d96c3a;
}

.overall-stars {
  margin-top: 8rpx;
  font-size: 22rpx;
  letter-spacing: 2rpx;
  color: #f0a34a;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 22rpx;
}

.score-item-card {
  padding: 18rpx 20rpx;
  border-radius: 20rpx;
  background: #faf7f4;
}

.score-name,
.score-stars,
.score-value {
  display: block;
}

.score-name {
  font-size: 24rpx;
  color: #6b7280;
}

.score-stars {
  margin-top: 10rpx;
  font-size: 24rpx;
  letter-spacing: 2rpx;
  color: #f0a34a;
}

.score-value {
  margin-top: 8rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #2f3743;
}

.meta-text {
  font-size: 24rpx;
  color: #8a8f99;
}

.content-block,
.gallery-block {
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
  margin-top: 14rpx;
  font-size: 28rpx;
  line-height: 1.8;
  color: #333333;
}

.gallery-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16rpx;
}

.gallery-count {
  font-size: 24rpx;
  color: #8a8f99;
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
  border-radius: 20rpx;
  background: #f3f4f6;
  box-shadow: 0 10rpx 24rpx rgba(32, 37, 43, 0.08);
}

.reply-card {
  position: relative;
  margin-top: 24rpx;
  padding: 24rpx 24rpx 24rpx 34rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #fff8f1 0%, #fff3e7 100%);
}

.reply-accent {
  position: absolute;
  left: 18rpx;
  top: 24rpx;
  bottom: 24rpx;
  width: 6rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #f1a45f 0%, #d96c3a 100%);
}

.reply-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #b96845;
}

.reply-content {
  display: block;
  margin-top: 12rpx;
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

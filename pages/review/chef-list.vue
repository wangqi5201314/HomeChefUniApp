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
          <view class="review-user-wrap">
            <text class="review-user">{{ item.isAnonymous === 1 ? '匿名用户' : getReviewUserName(item) }}</text>
            <view class="review-meta-row">
              <text class="identity-tag" :class="{ anonymous: item.isAnonymous === 1 }">
                {{ item.isAnonymous === 1 ? '匿名评价' : '实名评价' }}
              </text>
              <text class="review-time">{{ formatFullDateTime(item.createdAt) }}</text>
            </view>
          </view>
          <view class="overall-box">
            <text class="overall-label">综合评分</text>
            <text class="review-score">{{ formatPlain(item.overallScore) }}</text>
            <text class="overall-stars">{{ renderStars(item.overallScore) }}</text>
          </view>
        </view>

        <view class="score-grid">
          <view class="score-item-card">
            <text class="score-name">菜品</text>
            <text class="score-stars">{{ renderStars(item.dishScore) }}</text>
            <text class="score-value">{{ formatPlain(item.dishScore) }}</text>
          </view>
          <view class="score-item-card">
            <text class="score-name">服务</text>
            <text class="score-stars">{{ renderStars(item.serviceScore) }}</text>
            <text class="score-value">{{ formatPlain(item.serviceScore) }}</text>
          </view>
          <view class="score-item-card">
            <text class="score-name">技能</text>
            <text class="score-stars">{{ renderStars(item.skillScore) }}</text>
            <text class="score-value">{{ formatPlain(item.skillScore) }}</text>
          </view>
          <view class="score-item-card">
            <text class="score-name">环境</text>
            <text class="score-stars">{{ renderStars(item.environmentScore) }}</text>
            <text class="score-value">{{ formatPlain(item.environmentScore) }}</text>
          </view>
        </view>

        <view class="content-block">
          <text class="block-title">评价内容</text>
          <text class="review-content">{{ item.content || '用户未填写评价内容' }}</text>
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

        <view v-if="item.replyContent" class="reply-box">
          <view class="reply-accent"></view>
          <text class="reply-title">厨师回复</text>
          <text class="reply-text">{{ item.replyContent }}</text>
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
    getReviewUserName(item) {
      if (!item) {
        return '-'
      }

      return item.nickname || item.userNickname || item.userName || item.username || item.realName || item.name || `用户${item.userId}`
    },
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
  border: 2rpx solid #edf0f5;
}

.review-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.review-user-wrap {
  flex: 1;
  min-width: 0;
}

.review-user {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2329;
}

.review-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx 16rpx;
  margin-top: 12rpx;
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
  background: linear-gradient(135deg, #eff8ff 0%, #e4f0ff 100%);
  text-align: right;
}

.overall-label,
.review-score,
.overall-stars {
  display: block;
}

.overall-label {
  font-size: 22rpx;
  color: #6a7d98;
}

.review-score {
  margin-top: 8rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #4c74a6;
}

.overall-stars {
  margin-top: 8rpx;
  font-size: 22rpx;
  letter-spacing: 2rpx;
  color: #f0a34a;
}

.review-time,
.reply-time {
  font-size: 24rpx;
  color: #8a8f99;
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
  background: #f7f9fc;
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

.content-block,
.gallery-block {
  margin-top: 22rpx;
}

.block-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #1f2329;
}

.review-content {
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
  margin-top: 18rpx;
}

.review-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 20rpx;
  background: #f3f4f6;
  box-shadow: 0 10rpx 24rpx rgba(32, 37, 43, 0.08);
}

.reply-box {
  position: relative;
  margin-top: 18rpx;
  padding: 22rpx 22rpx 22rpx 32rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #f6f9fd 0%, #eef4fc 100%);
}

.reply-accent {
  position: absolute;
  left: 16rpx;
  top: 22rpx;
  bottom: 22rpx;
  width: 6rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #81a8d9 0%, #4c74a6 100%);
}

.reply-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #4c74a6;
}

.reply-text {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #5f6671;
}

.reply-time {
  display: block;
  margin-top: 10rpx;
}
</style>

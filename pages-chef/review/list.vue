<template>
  <view class="page">
    <view v-if="loading" class="state-card">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else-if="reviewList.length === 0" class="state-card">
      <text class="state-text">暂无用户评价</text>
    </view>

    <view v-else class="review-list">
      <view v-for="item in reviewList" :key="item.id" class="review-card">
        <view class="card-head">
          <text class="order-text">订单号：{{ item.orderId || '-' }}</text>
          <text class="score-text">综合评分 {{ formatScore(item.overallScore) }}</text>
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
          <text class="reply-title">我的回复</text>
          <text class="reply-content">{{ item.replyContent }}</text>
          <text class="reply-time">回复时间：{{ item.replyAt || '-' }}</text>
        </view>

        <view v-else class="reply-action">
          <button
            class="reply-btn"
            :loading="replyingId === String(item.id)"
            :disabled="replyingId === String(item.id)"
            @click="openReplyPopup(item)"
          >
            回复评价
          </button>
        </view>
      </view>
    </view>

    <view v-if="showReplyModal" class="modal-mask" @click="closeReplyPopup">
      <view class="modal-card" @click.stop>
        <text class="modal-title">回复评价</text>
        <textarea
          v-model="replyContent"
          class="modal-textarea"
          placeholder="请输入回复内容"
        />
        <view class="modal-actions">
          <button class="modal-btn plain" @click="closeReplyPopup">取消</button>
          <button
            class="modal-btn primary"
            :loading="replyingId !== ''"
            :disabled="replyingId !== ''"
            @click="submitReply"
          >
            提交回复
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getChefReviewList, replyReview } from '../../api/review'
import { getChefId, getChefInfo } from '../../utils/auth'

export default {
  name: 'ChefReviewListPage',
  data() {
    return {
      chefId: '',
      loading: false,
      reviewList: [],
      showReplyModal: false,
      currentReviewId: '',
      replyContent: '',
      replyingId: ''
    }
  },
  onShow() {
    const cachedChefId = getChefId()
    const cachedChefInfo = getChefInfo()
    this.chefId = cachedChefId || (cachedChefInfo && cachedChefInfo.id) || ''
    this.loadReviewList()
  },
  methods: {
    async loadReviewList() {
      if (!this.chefId) {
        this.reviewList = []
        return
      }

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
    formatScore(score) {
      if (score === 0) {
        return '0'
      }

      return score || '-'
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
    openReplyPopup(item) {
      if (!item || !item.id || item.replyContent) {
        return
      }

      this.currentReviewId = item.id
      this.replyContent = ''
      this.showReplyModal = true
    },
    closeReplyPopup() {
      if (this.replyingId !== '') {
        return
      }

      this.showReplyModal = false
      this.currentReviewId = ''
      this.replyContent = ''
    },
    async submitReply() {
      if (!this.currentReviewId || this.replyingId !== '') {
        return
      }

      if (!this.replyContent.trim()) {
        uni.showToast({
          title: '请输入回复内容',
          icon: 'none'
        })
        return
      }

      this.replyingId = String(this.currentReviewId)

      try {
        await replyReview(this.currentReviewId, {
          replyContent: this.replyContent.trim()
        })

        uni.showToast({
          title: '回复成功',
          icon: 'success'
        })

        this.showReplyModal = false
        this.currentReviewId = ''
        this.replyContent = ''
        await this.loadReviewList()
      } catch (error) {
      } finally {
        this.replyingId = ''
      }
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
.review-card,
.modal-card {
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05);
}

.state-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260rpx;
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

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.order-text {
  font-size: 26rpx;
  color: #5f6671;
}

.score-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #2f8f55;
}

.score-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 20rpx;
  margin-top: 18rpx;
}

.score-item {
  font-size: 26rpx;
  color: #333333;
}

.meta-row {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 18rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #8a8f99;
}

.content-block {
  margin-top: 22rpx;
}

.block-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #1f2329;
}

.content-text {
  display: block;
  margin-top: 10rpx;
  font-size: 28rpx;
  line-height: 1.7;
  color: #333333;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 14rpx;
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
  background: #edf8f1;
}

.reply-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #2f8f55;
}

.reply-content {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #27533b;
}

.reply-time {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #5e7c69;
}

.reply-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 24rpx;
}

.reply-btn {
  min-width: 180rpx;
  height: 72rpx;
  line-height: 72rpx;
  margin: 0;
  border: none;
  border-radius: 999rpx;
  background: #2f8f55;
  font-size: 28rpx;
  color: #ffffff;
}

.reply-btn::after,
.modal-btn::after {
  border: none;
}

.modal-mask {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background: rgba(15, 23, 42, 0.42);
  box-sizing: border-box;
}

.modal-card {
  width: 100%;
  padding: 32rpx;
}

.modal-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2329;
}

.modal-textarea {
  width: 100%;
  min-height: 180rpx;
  padding: 24rpx;
  border-radius: 18rpx;
  background: #f7f8fb;
  font-size: 28rpx;
  color: #222222;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 28rpx;
}

.modal-btn {
  flex: 1;
  height: 84rpx;
  line-height: 84rpx;
  border: none;
  border-radius: 999rpx;
  font-size: 28rpx;
}

.modal-btn.plain {
  background: #f2f4f7;
  color: #4f5662;
}

.modal-btn.primary {
  background: #2f8f55;
  color: #ffffff;
}
</style>

<template>
  <view class="page">
    <view v-if="loading" class="state-card">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else>
      <view class="hero-card">
        <view class="hero-top">
          <image v-if="chef.avatar" class="avatar" :src="chef.avatar" mode="aspectFill" />
          <view v-else class="avatar avatar-placeholder">
            <text class="avatar-text">{{ getNameInitial(chef.name) }}</text>
          </view>

          <view class="hero-info">
            <view class="name-row">
              <text class="name">{{ chef.name || '未命名厨师' }}</text>
              <text class="cert-tag">{{ certStatusText }}</text>
            </view>
            <text class="summary">厨师状态：{{ chefStatusText }}</text>
            <text class="summary">擅长菜系：{{ chef.specialtyCuisine || '-' }}</text>
            <text class="summary">服务模式：{{ serviceModeText }}</text>
          </view>
        </view>

        <text class="intro">{{ chef.introduction || '暂无介绍' }}</text>

        <view class="stat-grid">
          <view class="stat-item">
            <text class="stat-value">{{ formatValue(chef.yearsOfExperience, '年') }}</text>
            <text class="stat-label">从业年限</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ formatPlain(chef.ratingAvg) }}</text>
            <text class="stat-label">评分</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ formatPlain(chef.orderCount) }}</text>
            <text class="stat-label">订单数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ certStatusText }}</text>
            <text class="stat-label">认证状态</text>
          </view>
        </view>

        <view class="tags-section">
          <text class="section-title">技能标签</text>
          <view v-if="tagList.length" class="tag-list">
            <text v-for="(tag, index) in tagList" :key="index" class="tag">{{ tag }}</text>
          </view>
          <text v-else class="empty-inline">暂无标签</text>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">未来 7 天可预约档期</text>
        <view v-if="availableScheduleList.length" class="schedule-list">
          <view v-for="item in availableScheduleList" :key="item.id" class="schedule-item" :class="{ active: selectedScheduleId === item.id }" @click="selectSchedule(item)">
            <text class="schedule-date">{{ item.serviceDate }}</text>
            <text class="schedule-time">{{ item.timeSlot }}</text>
            <text class="schedule-range">{{ item.startTime }} - {{ item.endTime }}</text>
          </view>
        </view>
        <text v-else class="empty-inline">暂无可预约档期</text>
      </view>

      <view class="section-card">
        <view class="section-head">
          <text class="section-title no-margin">用户评价</text>
          <text v-if="reviewList.length > displayReviewList.length" class="more-link" @click="goAllReviews">全部评价</text>
        </view>

        <view v-if="displayReviewList.length" class="review-list">
          <view v-for="item in displayReviewList" :key="item.id" class="review-item">
            <view class="review-head">
              <text class="review-user">{{ item.isAnonymous === 1 ? '匿名用户' : `用户${item.userId}` }}</text>
              <text class="review-score">评分 {{ formatPlain(item.overallScore) }}</text>
            </view>
            <text class="review-content">{{ item.content || '用户未填写评价内容' }}</text>
            <text class="review-time">{{ item.createdAt || '-' }}</text>
            <view v-if="parseImageUrls(item.imageUrls).length" class="review-image-list">
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
            </view>
          </view>
        </view>
        <text v-else class="empty-inline">暂无评价</text>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="selected-info">
        <text class="selected-title">已选档期</text>
        <text class="selected-text">{{ selectedScheduleText }}</text>
      </view>
      <button class="book-btn" type="primary" @click="handleBook">立即预约</button>
    </view>
  </view>
</template>

<script>
import { getChefDetail, getChefSchedule } from '../../api/chef'
import { getChefReviewList } from '../../api/review'
import { getChefServiceModeText } from '../../utils/chef-service-mode'
import { getChefCertStatusText } from '../../utils/chef-cert-status'
import { getChefStatusText } from '../../utils/chef-status'

export default {
  name: 'ChefDetailPage',
  data() {
    return {
      chefId: '',
      chef: {},
      reviewList: [],
      availableScheduleList: [],
      selectedScheduleId: null,
      selectedSchedule: null,
      loading: true
    }
  },
  computed: {
    tagList() {
      if (!this.chef.specialtyTags) {
        return []
      }
      return String(this.chef.specialtyTags).split(',').map((item) => item.trim()).filter(Boolean)
    },
    displayReviewList() {
      return this.reviewList.slice(0, 3)
    },
    selectedScheduleText() {
      if (!this.selectedSchedule) {
        return '请选择一个可预约档期'
      }
      return `${this.selectedSchedule.serviceDate} ${this.selectedSchedule.timeSlot} ${this.selectedSchedule.startTime}-${this.selectedSchedule.endTime}`
    },
    serviceModeText() {
      if (this.chef.serviceModeDesc) {
        return this.chef.serviceModeDesc
      }
      if (this.chef.serviceMode === 0 || this.chef.serviceMode) {
        return getChefServiceModeText(this.chef.serviceMode)
      }
      return '-'
    },
    certStatusText() {
      if (this.chef.certStatusDesc) {
        return this.chef.certStatusDesc
      }
      if (this.chef.certStatus === 0 || this.chef.certStatus) {
        return getChefCertStatusText(this.chef.certStatus)
      }
      return '未知状态'
    },
    chefStatusText() {
      if (this.chef.statusDesc) {
        return this.chef.statusDesc
      }
      if (this.chef.status === 0 || this.chef.status) {
        return getChefStatusText(this.chef.status)
      }
      return '未知状态'
    }
  },
  onLoad(options) {
    const { id = '' } = options || {}
    this.chefId = id
    if (!this.chefId) {
      uni.showToast({ title: '缺少厨师 id', icon: 'none' })
      return
    }
    this.loadPageData()
  },
  methods: {
    async loadPageData() {
      this.loading = true
      try {
        const dateRange = this.getNextSevenDaysRange()
        const [chefData, scheduleData, reviewData] = await Promise.all([
          getChefDetail(this.chefId),
          getChefSchedule(this.chefId, dateRange),
          getChefReviewList(this.chefId)
        ])
        this.chef = chefData || {}
        this.availableScheduleList = Array.isArray(scheduleData) ? scheduleData.filter((item) => item && (item.isAvailable === 1 || item.isAvailable === true)) : []
        this.reviewList = Array.isArray(reviewData) ? reviewData : []
        if (this.availableScheduleList.length) {
          this.selectSchedule(this.availableScheduleList[0])
        }
      } catch (error) {
        this.chef = {}
        this.availableScheduleList = []
        this.reviewList = []
      } finally {
        this.loading = false
      }
    },
    getNextSevenDaysRange() {
      const start = new Date()
      const end = new Date()
      end.setDate(end.getDate() + 6)
      return {
        startDate: this.formatDate(start),
        endDate: this.formatDate(end)
      }
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      const day = `${date.getDate()}`.padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    selectSchedule(item) {
      this.selectedScheduleId = item.id
      this.selectedSchedule = item
    },
    handleBook() {
      if (!this.selectedSchedule) {
        uni.showToast({ title: '请先选择档期', icon: 'none' })
        return
      }
      uni.navigateTo({
        url: `/pages/order/confirm?chefId=${this.chefId}&serviceDate=${encodeURIComponent(this.selectedSchedule.serviceDate || '')}&timeSlot=${encodeURIComponent(this.selectedSchedule.timeSlot || '')}&serviceStartTime=${encodeURIComponent(this.selectedSchedule.startTime || '')}&serviceEndTime=${encodeURIComponent(this.selectedSchedule.endTime || '')}`
      })
    },
    goAllReviews() {
      uni.navigateTo({ url: `/pages/review/chef-list?chefId=${this.chefId}` })
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
    getNameInitial(name) {
      return name ? String(name).slice(0, 1) : '厨'
    },
    formatValue(value, suffix) {
      if (value === 0) {
        return `0${suffix}`
      }
      return value || value === 0 ? `${value}${suffix}` : '-'
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
.page { min-height: 100vh; padding: 24rpx 24rpx 180rpx; background: #f6f7fb; box-sizing: border-box; }
.state-card, .hero-card, .section-card { padding: 28rpx; border-radius: 24rpx; background: #ffffff; box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05); }
.state-card { display: flex; align-items: center; justify-content: center; min-height: 360rpx; }
.state-text, .empty-inline { font-size: 28rpx; color: #8a8f99; }
.hero-card { margin-bottom: 24rpx; }
.hero-top { display: flex; align-items: center; }
.avatar { width: 156rpx; height: 156rpx; border-radius: 24rpx; background: #f1e1d9; flex-shrink: 0; }
.avatar-placeholder { display: flex; align-items: center; justify-content: center; }
.avatar-text { font-size: 52rpx; font-weight: 600; color: #b96845; }
.hero-info { flex: 1; min-width: 0; margin-left: 24rpx; }
.name-row { display: flex; align-items: center; gap: 16rpx; flex-wrap: wrap; }
.name { display: block; font-size: 40rpx; font-weight: 600; color: #1f2329; }
.cert-tag { padding: 8rpx 18rpx; border-radius: 999rpx; background: #edf8f1; font-size: 24rpx; color: #2f8f55; }
.summary { display: block; margin-top: 12rpx; font-size: 28rpx; color: #636c78; line-height: 1.5; }
.intro { display: block; margin-top: 24rpx; font-size: 28rpx; line-height: 1.7; color: #4f5662; }
.stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20rpx; margin-top: 28rpx; }
.stat-item { padding: 24rpx; border-radius: 20rpx; background: #f7f8fb; }
.stat-value { display: block; font-size: 34rpx; font-weight: 600; color: #d96c3a; }
.stat-label { display: block; margin-top: 10rpx; font-size: 24rpx; color: #8a8f99; }
.tags-section { margin-top: 28rpx; }
.section-card { margin-bottom: 24rpx; }
.section-head { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; margin-bottom: 20rpx; }
.section-title { display: block; margin-bottom: 20rpx; font-size: 30rpx; font-weight: 600; color: #1f2329; }
.section-title.no-margin { margin-bottom: 0; }
.more-link { flex-shrink: 0; font-size: 26rpx; color: #d96c3a; }
.tag-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.tag { padding: 12rpx 20rpx; border-radius: 999rpx; background: #fff2eb; font-size: 24rpx; color: #c55f32; }
.schedule-list { display: flex; flex-direction: column; gap: 18rpx; }
.schedule-item { padding: 24rpx; border: 2rpx solid #eceff4; border-radius: 20rpx; background: #fafbfc; }
.schedule-item.active { border-color: #d96c3a; background: #fff6f1; }
.schedule-date, .schedule-time, .schedule-range { display: block; }
.schedule-date { font-size: 30rpx; font-weight: 600; color: #1f2329; }
.schedule-time, .schedule-range { margin-top: 10rpx; font-size: 26rpx; color: #68707d; }
.review-list { display: flex; flex-direction: column; gap: 20rpx; }
.review-item { padding: 24rpx; border-radius: 20rpx; background: #f8f9fb; }
.review-head { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.review-user { font-size: 28rpx; font-weight: 600; color: #1f2329; }
.review-score, .review-time { font-size: 24rpx; color: #8a8f99; }
.review-content { display: block; margin-top: 16rpx; font-size: 28rpx; line-height: 1.6; color: #4f5662; }
.review-image-list { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 18rpx; }
.review-image { width: 180rpx; height: 180rpx; border-radius: 16rpx; background: #f3f4f6; }
.reply-box { margin-top: 16rpx; padding: 16rpx 20rpx; border-radius: 16rpx; background: #ffffff; }
.reply-text { font-size: 26rpx; line-height: 1.6; color: #68707d; }
.bottom-bar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 20rpx; padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom)); background: rgba(255, 255, 255, 0.98); box-shadow: 0 -8rpx 24rpx rgba(32, 37, 43, 0.06); box-sizing: border-box; }
.selected-info { flex: 1; min-width: 0; }
.selected-title { display: block; font-size: 24rpx; color: #8a8f99; }
.selected-text { display: block; margin-top: 8rpx; font-size: 26rpx; color: #1f2329; line-height: 1.5; }
.book-btn { margin: 0; width: 220rpx; height: 84rpx; line-height: 84rpx; border: none; border-radius: 999rpx; background: #d96c3a; font-size: 30rpx; font-weight: 500; }
.book-btn::after { border: none; }
</style>

<template>
  <view class="page">
    <swiper
      class="banner-swiper"
      indicator-dots
      autoplay
      circular
      :interval="3000"
      :duration="500"
    >
      <swiper-item
        v-for="item in bannerList"
        :key="item.id || item.title"
        class="banner-item"
      >
        <image
          v-if="item.imageUrl"
          class="banner-image"
          :src="item.imageUrl"
          mode="aspectFill"
        />
        <view v-else class="banner-panel banner-placeholder">
          <text class="banner-placeholder-text">请在全局配置中补充 OSS 访问域名</text>
        </view>
      </swiper-item>
    </swiper>

    <view class="intro-card">
      <view class="intro-header">
        <text class="intro-title">精选上门私厨</text>
        <text class="intro-tag">智能推荐</text>
      </view>
      <text class="intro-text">根据你的服务地址、食材模式、预约日期和时间段，为你推荐更合适的上门厨师。</text>
      <view class="feature-list">
        <view class="feature-item">
          <view class="feature-icon">
            <text class="iconfont feature-iconfont icon-shicai"></text>
          </view>
          <text class="feature-label">按食材匹配</text>
        </view>
        <view class="feature-item">
          <view class="feature-icon">
            <text class="iconfont feature-iconfont icon-chushi"></text>
          </view>
          <text class="feature-label">按评分推荐</text>
        </view>
        <view class="feature-item">
          <view class="feature-icon">
            <text class="iconfont feature-iconfont icon-shangmen"></text>
          </view>
          <text class="feature-label">按距离排序</text>
        </view>
      </view>
    </view>

    <view class="address-card" @click="goSelectAddress">
      <view class="card-head">
        <text class="card-title">当前服务地址</text>
        <text class="card-link">切换地址</text>
      </view>
      <text v-if="hasAddress" class="address-text">{{ selectedAddressText }}</text>
      <text v-else class="address-empty">请先选择服务地址</text>
    </view>

    <view class="filter-card">
      <view class="filter-section">
        <text class="filter-title">食材模式</text>
        <view class="option-row">
          <view
            v-for="item in ingredientModeOptions"
            :key="item.value"
            class="option-chip"
            :class="{ active: form.ingredientMode === item.value }"
            @click="handleIngredientModeChange(item.value)"
          >
            <text
              class="option-chip-text"
              :class="{ active: form.ingredientMode === item.value }"
            >
              {{ item.label }}
            </text>
          </view>
        </view>
      </view>

      <view class="filter-section">
        <text class="filter-title">预约时间</text>
        <view class="picker-stack">
          <picker mode="date" class="picker-box" :value="form.serviceDate" @change="handleDateChange">
            <view class="picker-value">{{ form.serviceDate || '请选择服务日期' }}</view>
          </picker>
          <picker
            class="picker-box"
            :range="timeSlotRange"
            :value="timeSlotIndex"
            @change="handleTimeSlotChange"
          >
            <view class="picker-value">{{ timeSlotText }}</view>
          </picker>
        </view>
      </view>

      <view class="filter-section no-margin">
        <text class="filter-title">排序方式</text>
        <picker
          class="picker-box"
          :range="sortTypeRange"
          :value="sortTypeIndex"
          @change="handleSortTypeChange"
        >
          <view class="picker-value">{{ sortTypeText }}</view>
        </picker>
      </view>
    </view>

    <view v-if="!hasAddress" class="state-wrap">
      <text class="state-text">请先选择服务地址</text>
      <button class="state-btn" type="primary" @click="goSelectAddress">选择地址</button>
    </view>

    <view v-else-if="loading && !chefList.length" class="loading-card">
      <view class="loading-block large"></view>
      <view class="loading-block medium"></view>
      <view class="loading-block short"></view>
    </view>

    <view v-else-if="!loading && chefList.length === 0" class="state-wrap">
      <text class="state-text">暂无符合条件的厨师</text>
    </view>

    <view v-else class="list-wrap">
      <view v-if="loading" class="inline-loading">
        <text class="inline-loading-text">正在刷新推荐列表...</text>
      </view>

      <view class="list">
        <view
          v-for="item in chefList"
          :key="item.id"
          class="chef-card"
          @click="goToDetail(item.id)"
        >
          <view class="avatar-wrap">
            <image
              v-if="item.avatar"
              class="avatar"
              :src="item.avatar"
              mode="aspectFill"
            />
            <view v-else class="avatar avatar-placeholder">
              <text class="avatar-text">{{ getNameInitial(item.name) }}</text>
            </view>
          </view>

          <view class="chef-info">
            <view class="chef-header">
              <view class="chef-title-wrap">
                <text class="chef-name">{{ item.name || '未命名厨师' }}</text>
                <text class="chef-cuisine">擅长菜系：{{ item.specialtyCuisine || '-' }}</text>
              </view>
              <text class="distance-tag">{{ formatDistance(item.distanceKm) }}</text>
            </view>
            <text class="chef-address">当前服务地址：{{ item.serviceAreaText || '暂未设置服务地址' }}</text>
            <view class="stats-row">
              <view class="stat-badge rating">
                <text class="stat-label">评分</text>
                <text class="stat-value">{{ formatNumber(item.ratingAvg) }}</text>
              </view>
              <view class="stat-badge orders">
                <text class="stat-label">订单量</text>
                <text class="stat-value">{{ formatCount(item.orderCount) }}</text>
              </view>
              <view class="stat-badge reviews">
                <text class="stat-label">好评率</text>
                <text class="stat-value">{{ formatRate(item.goodReviewRate) }}</text>
              </view>
            </view>
            <view class="tag-row">
              <text class="data-tag">{{ item.serviceModeDesc || getChefServiceModeText(item.serviceMode) }}</text>
              <text class="data-tag">服务半径 {{ formatRadius(item.serviceRadiusKm) }}</text>
            </view>
            <view class="card-foot">
              <text class="experience-text">从业 {{ formatExperience(item.yearsOfExperience) }}</text>
              <text class="detail-text">查看详情</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getDefaultUserAddressSilently } from '../../api/address'
import { recommendChefs } from '../../api/chef'
import { getChefServiceModeText } from '../../utils/chef-service-mode'
import { OSS_PUBLIC_BASE_URL } from '../../utils/config'
import { SORT_OPTIONS, getSortTypeText } from '../../utils/sort-options'
import { TIME_SLOT_OPTIONS, getTimeSlotText } from '../../utils/time-slot'

const USER_ID_KEY = 'user_id'
const SELECTED_ADDRESS_KEY = 'selected_address'
const HOME_BANNER_PATHS = ['/banner/dish1.png', '/banner/dish2.png', '/banner/dish3.png']

const INGREDIENT_MODE_OPTIONS = [
  { label: '用户自备食材', value: 1 },
  { label: '平台协同采购', value: 2 }
]

function getTodayDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildOssImageUrl(path) {
  if (!path) {
    return ''
  }

  if (/^https?:\/\//.test(path)) {
    return path
  }

  const baseUrl = `${OSS_PUBLIC_BASE_URL || ''}`.trim().replace(/\/+$/, '')
  if (!baseUrl) {
    return ''
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}

export default {
  name: 'HomePage',
  data() {
    return {
      bannerList: [
        {
          kicker: '同城精选',
          title: '上门私厨 更省心',
          desc: '按地址、时段和食材模式智能推荐更合适的厨师。',
          themeClass: 'banner-theme-warm'
        },
        {
          kicker: '预约灵活',
          title: '早餐午餐晚餐都可约',
          desc: '支持按日期和时间段筛选，快速找到可服务档期。',
          themeClass: 'banner-theme-fresh'
        },
        {
          kicker: '安心下单',
          title: '评分、订单量、距离一目了然',
          desc: '结合服务半径和当前地址，挑选更适合你的厨师。',
          themeClass: 'banner-theme-sun'
        }
      ],
      userId: '',
      loading: false,
      chefList: [],
      selectedAddress: null,
      form: {
        ingredientMode: 1,
        serviceDate: getTodayDate(),
        timeSlot: 'DINNER',
        sortType: 'DEFAULT'
      }
    }
  },
  computed: {
    ingredientModeOptions() {
      return INGREDIENT_MODE_OPTIONS
    },
    hasAddress() {
      return Boolean(this.selectedAddress && this.selectedAddress.id)
    },
    selectedAddressText() {
      if (!this.hasAddress) {
        return ''
      }

      const address = this.selectedAddress || {}
      return [
        address.province,
        address.city,
        address.district,
        address.town,
        address.detailAddress
      ]
        .filter(Boolean)
        .join('')
    },
    timeSlotRange() {
      return TIME_SLOT_OPTIONS.map((item) => item.label)
    },
    timeSlotIndex() {
      const index = TIME_SLOT_OPTIONS.findIndex((item) => item.value === this.form.timeSlot)
      return index >= 0 ? index : 0
    },
    timeSlotText() {
      return getTimeSlotText(this.form.timeSlot)
    },
    sortTypeRange() {
      return SORT_OPTIONS.map((item) => item.label)
    },
    sortTypeIndex() {
      const index = SORT_OPTIONS.findIndex((item) => item.value === this.form.sortType)
      return index >= 0 ? index : 0
    },
    sortTypeText() {
      return getSortTypeText(this.form.sortType)
    }
  },
  onLoad() {
    this.resetBannerList()
    this.userId = uni.getStorageSync(USER_ID_KEY) || ''
  },
  onShow() {
    this.initializePage()
  },
  onPullDownRefresh() {
    this.initializePage({
      fromPullDownRefresh: true
    })
  },
  methods: {
    getChefServiceModeText,
    resetBannerList() {
      this.bannerList = HOME_BANNER_PATHS.map((path, index) => ({
        id: index + 1,
        imageUrl: buildOssImageUrl(path)
      }))
    },
    async initializePage(options = {}) {
      const { fromPullDownRefresh = false } = options

      try {
        await this.loadCurrentAddress()
        await this.fetchRecommendList({
          silent: !this.hasAddress
        })
      } finally {
        if (fromPullDownRefresh) {
          uni.stopPullDownRefresh()
        }
      }
    },
    async loadCurrentAddress() {
      const selectedAddress = uni.getStorageSync(SELECTED_ADDRESS_KEY)

      if (selectedAddress && selectedAddress.id) {
        this.selectedAddress = selectedAddress
        return
      }

      if (!this.userId) {
        this.selectedAddress = null
        this.chefList = []
        return
      }

      try {
        const data = await getDefaultUserAddressSilently({
          userId: this.userId
        })
        this.selectedAddress = data && data.id ? data : null
      } catch (error) {
        this.selectedAddress = null
      }
    },
    async fetchRecommendList(options = {}) {
      const { silent = false } = options

      if (!this.userId || !this.hasAddress) {
        this.chefList = []
        this.loading = false
        return
      }

      this.loading = true

      try {
        const data = await recommendChefs({
          userId: Number(this.userId),
          addressId: Number(this.selectedAddress.id),
          ingredientMode: Number(this.form.ingredientMode),
          serviceDate: this.form.serviceDate,
          timeSlot: this.form.timeSlot,
          sortType: this.form.sortType
        })
        this.chefList = Array.isArray(data) ? data : []
      } catch (error) {
        this.chefList = []
        if (!silent) {
          // request.js already handles toast
        }
      } finally {
        this.loading = false
      }
    },
    goSelectAddress() {
      uni.navigateTo({
        url: '/pages/address/list?mode=select'
      })
    },
    handleIngredientModeChange(value) {
      if (this.form.ingredientMode === value) {
        return
      }

      this.form.ingredientMode = value
      this.fetchRecommendList()
    },
    handleDateChange(event) {
      const value = event && event.detail ? event.detail.value : ''
      if (!value || value === this.form.serviceDate) {
        return
      }

      this.form.serviceDate = value
      this.fetchRecommendList()
    },
    handleTimeSlotChange(event) {
      const index = Number(event.detail.value)
      const selected = TIME_SLOT_OPTIONS[index]

      if (!selected || selected.value === this.form.timeSlot) {
        return
      }

      this.form.timeSlot = selected.value
      this.fetchRecommendList()
    },
    handleSortTypeChange(event) {
      const index = Number(event.detail.value)
      const selected = SORT_OPTIONS[index]

      if (!selected || selected.value === this.form.sortType) {
        return
      }

      this.form.sortType = selected.value
      this.fetchRecommendList()
    },
    goToDetail(id) {
      if (!id) {
        return
      }

      uni.navigateTo({
        url: `/pages/chef/detail?id=${id}`
      })
    },
    getNameInitial(name) {
      return name ? String(name).slice(0, 1) : '厨'
    },
    formatExperience(value) {
      if (value === 0) {
        return '0 年'
      }
      return value || value === 0 ? `${value} 年` : '-'
    },
    formatNumber(value) {
      if (value === 0) {
        return '0'
      }
      return value || '-'
    },
    formatCount(value) {
      if (value === 0) {
        return '0'
      }
      return value || '-'
    },
    formatRate(value) {
      if (value === 0) {
        return '0%'
      }

      if (!value) {
        return '-'
      }

      const numericValue = Number(value)
      if (Number.isNaN(numericValue)) {
        return String(value)
      }

      return numericValue > 1 ? `${numericValue.toFixed(2)}%` : `${(numericValue * 100).toFixed(2)}%`
    },
    formatRadius(value) {
      if (value === 0) {
        return '0 km'
      }

      return value || value === 0 ? `${Number(value).toFixed(2).replace(/\.00$/, '')} km` : '-'
    },
    formatDistance(value) {
      if (value === 0) {
        return '距离你 0 km'
      }

      if (!value && value !== 0) {
        return '距离信息暂缺'
      }

      return `距离你 ${Number(value).toFixed(2)} km`
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

.banner-swiper {
  height: 320rpx;
  margin-bottom: 24rpx;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 12rpx 32rpx rgba(32, 37, 43, 0.08);
}

.banner-item {
  width: 100%;
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-panel {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  padding: 32rpx 30rpx;
  box-sizing: border-box;
}

.banner-placeholder {
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f2a061 0%, #f6c38d 100%);
}

.banner-placeholder-text {
  font-size: 28rpx;
  color: #ffffff;
}

.banner-theme-warm {
  background:
    radial-gradient(circle at 80% 22%, rgba(255, 255, 255, 0.35), transparent 18%),
    linear-gradient(135deg, #d96c3a 0%, #f29a52 52%, #ffd4a8 100%);
}

.banner-theme-fresh {
  background:
    radial-gradient(circle at 18% 24%, rgba(255, 255, 255, 0.34), transparent 18%),
    linear-gradient(135deg, #2f8f55 0%, #6dc38a 52%, #d7f0dc 100%);
}

.banner-theme-sun {
  background:
    radial-gradient(circle at 78% 26%, rgba(255, 255, 255, 0.36), transparent 18%),
    linear-gradient(135deg, #385170 0%, #5f86a8 52%, #f6d9a2 100%);
}

.banner-kicker,
.banner-title,
.banner-desc {
  display: block;
  color: #ffffff;
}

.banner-kicker {
  font-size: 24rpx;
  letter-spacing: 4rpx;
  opacity: 0.88;
}

.banner-title {
  margin-top: 14rpx;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.25;
}

.banner-desc {
  margin-top: 14rpx;
  max-width: 78%;
  font-size: 24rpx;
  line-height: 1.7;
  opacity: 0.92;
}

.intro-card,
.address-card,
.filter-card,
.loading-card,
.state-wrap,
.chef-card,
.inline-loading {
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05);
}

.intro-card {
  margin-bottom: 24rpx;
  padding: 24rpx 26rpx;
  background: linear-gradient(135deg, #fff7f0 0%, #fff1e6 100%);
  box-shadow: 0 10rpx 28rpx rgba(217, 108, 58, 0.08);
}

.intro-header,
.card-head,
.chef-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.intro-header {
  margin-bottom: 14rpx;
}

.intro-title,
.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2a2d33;
}

.intro-tag {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(217, 108, 58, 0.12);
  font-size: 22rpx;
  color: #c76335;
}

.intro-text {
  font-size: 26rpx;
  line-height: 1.7;
  color: #6a7280;
}

.feature-list {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
}

.feature-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 18rpx;
  background: rgba(217, 108, 58, 0.12);
}

.iconfont {
  font-style: normal;
}

.feature-iconfont {
  font-size: 30rpx;
  line-height: 1;
  color: #c76335;
}

.icon-shicai::before {
  content: '🥬';
}

.icon-chushi::before {
  content: '👨‍🍳';
}

.icon-shangmen::before {
  content: '🏠';
}

.feature-label {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #666f7c;
}

.address-card,
.filter-card {
  margin-bottom: 24rpx;
  padding: 24rpx;
}

.card-link {
  font-size: 26rpx;
  color: #d96c3a;
}

.address-text,
.address-empty {
  display: block;
  margin-top: 16rpx;
  font-size: 28rpx;
  line-height: 1.7;
}

.address-text {
  color: #4f5662;
}

.address-empty {
  color: #8a8f99;
}

.filter-section {
  margin-bottom: 28rpx;
}

.filter-section.no-margin {
  margin-bottom: 0;
}

.filter-title {
  display: block;
  margin-bottom: 18rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2329;
}

.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
}

.option-chip {
  padding: 18rpx 26rpx;
  border: 2rpx solid #eceff4;
  border-radius: 999rpx;
  background: #fafbfc;
}

.option-chip.active {
  border-color: #d96c3a;
  background: #fff2eb;
}

.option-chip-text {
  font-size: 26rpx;
  color: #68707d;
}

.option-chip-text.active {
  color: #c76335;
  font-weight: 600;
}

.picker-stack {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.picker-box {
  width: 100%;
}

.picker-value {
  width: 100%;
  min-height: 84rpx;
  padding: 0 24rpx;
  border-radius: 18rpx;
  background: #f7f8fb;
  box-sizing: border-box;
  font-size: 28rpx;
  line-height: 84rpx;
  color: #222222;
}

.state-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320rpx;
  padding: 40rpx 32rpx;
}

.state-text {
  font-size: 28rpx;
  color: #8a8f99;
}

.state-btn {
  margin-top: 28rpx;
  width: 220rpx;
  height: 80rpx;
  line-height: 80rpx;
  border: none;
  border-radius: 999rpx;
  background: #d96c3a;
  font-size: 28rpx;
}

.state-btn::after {
  border: none;
}

.loading-card {
  padding: 28rpx 24rpx;
}

.loading-block {
  height: 28rpx;
  margin-bottom: 22rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #f1f3f6 25%, #f7f8fa 37%, #f1f3f6 63%);
  background-size: 400% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
}

.loading-block.large {
  width: 92%;
}

.loading-block.medium {
  width: 68%;
}

.loading-block.short {
  width: 44%;
  margin-bottom: 0;
}

.list-wrap {
  position: relative;
}

.inline-loading {
  margin-bottom: 16rpx;
  padding: 14rpx 20rpx;
  background: #fff5ee;
}

.inline-loading-text {
  font-size: 24rpx;
  color: #c66a42;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.chef-card {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  border: 2rpx solid rgba(233, 222, 213, 0.8);
  box-shadow: 0 16rpx 36rpx rgba(32, 37, 43, 0.06);
}

.avatar-wrap {
  flex-shrink: 0;
  margin-right: 24rpx;
}

.avatar {
  width: 132rpx;
  height: 132rpx;
  border-radius: 24rpx;
  background: #f1e1d9;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 44rpx;
  font-weight: 600;
  color: #b96845;
}

.chef-info {
  flex: 1;
  min-width: 0;
}

.chef-title-wrap {
  flex: 1;
  min-width: 0;
}

.chef-name {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #222222;
}

.chef-cuisine {
  display: block;
  margin-top: 8rpx;
  font-size: 25rpx;
  color: #6f7784;
}

.distance-tag {
  flex-shrink: 0;
  padding: 10rpx 18rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #fff1e8 0%, #ffe5d5 100%);
  font-size: 22rpx;
  font-weight: 600;
  color: #c76335;
  box-shadow: inset 0 0 0 2rpx rgba(217, 108, 58, 0.08);
}

.chef-address {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #5c6470;
}

.stats-row {
  display: flex;
  gap: 14rpx;
  margin-top: 18rpx;
}

.stat-badge {
  flex: 1;
  min-width: 0;
  padding: 16rpx 14rpx;
  border-radius: 20rpx;
}

.stat-badge.rating {
  background: linear-gradient(135deg, #fff7ea 0%, #fff0d2 100%);
}

.stat-badge.orders {
  background: linear-gradient(135deg, #f3f8ff 0%, #e8f1ff 100%);
}

.stat-badge.reviews {
  background: linear-gradient(135deg, #eefaf2 0%, #e1f3e8 100%);
}

.stat-label,
.stat-value {
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: #7c8693;
}

.stat-value {
  margin-top: 8rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #24303b;
}

.tag-row,
.card-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx 16rpx;
}

.tag-row {
  margin-top: 16rpx;
}

.data-tag {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: #f7f8fb;
  font-size: 22rpx;
  color: #6d7581;
  box-shadow: inset 0 0 0 2rpx #edf0f4;
}

.card-foot {
  align-items: center;
  justify-content: space-between;
  margin-top: 18rpx;
}

.experience-text {
  font-size: 24rpx;
  color: #8a8f99;
}

.detail-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #c76335;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: 0 0;
  }
}
</style>

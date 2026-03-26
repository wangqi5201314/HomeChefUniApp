<template>
  <view class="page">
    <swiper
      class="banner-swiper"
      indicator-dots
      autoplay
      circular
      :interval="2000"
      :duration="500"
    >
      <swiper-item
        v-for="item in bannerList"
        :key="item"
        class="banner-item"
      >
        <image class="banner-image" :src="item" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <view class="search-bar">
      <input
        v-model="searchName"
        class="search-input"
        type="text"
        placeholder="搜索厨师姓名"
        confirm-type="search"
        @confirm="handleSearch"
      />
      <button class="search-btn" size="mini" @click="handleSearch">搜索</button>
    </view>

    <view v-if="loading && !chefList.length" class="loading-card">
      <view class="loading-block large"></view>
      <view class="loading-block medium"></view>
      <view class="loading-block short"></view>
    </view>

    <view v-else-if="!loading && chefList.length === 0" class="state-wrap">
      <text class="state-text">暂无厨师数据</text>
    </view>

    <view v-else class="list-wrap">
      <view v-if="loading" class="inline-loading">
        <text class="inline-loading-text">正在刷新列表...</text>
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
            <text class="chef-name">{{ item.name || '未命名厨师' }}</text>
          </view>
          <text class="chef-cuisine">擅长菜系：{{ item.specialtyCuisine || '-' }}</text>
          <view class="meta-row">
            <text class="meta-text">从业 {{ formatExperience(item.yearsOfExperience) }}</text>
            <text class="meta-text">评分 {{ formatNumber(item.ratingAvg) }}</text>
            <text class="meta-text">接单 {{ formatCount(item.orderCount) }}</text>
          </view>
        </view>
      </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getChefList } from '../../api/chef'

export default {
  name: 'HomePage',
  data() {
    return {
      bannerList: [
        '/static/dish1.png',
        '/static/dish2.png',
        '/static/dish3.png'
      ],
      searchName: '',
      chefList: [],
      loading: false
    }
  },
  onLoad() {
    this.fetchChefList()
  },
  onPullDownRefresh() {
    this.fetchChefList({
      fromPullDownRefresh: true
    })
  },
  methods: {
    async fetchChefList(options = {}) {
      const { fromPullDownRefresh = false } = options

      this.loading = true

      try {
        const params = {}

        if (this.searchName.trim()) {
          params.name = this.searchName.trim()
        }

        const data = await getChefList(params)
        this.chefList = Array.isArray(data) ? data : []
      } catch (error) {
        this.chefList = []
      } finally {
        this.loading = false
        if (fromPullDownRefresh) {
          uni.stopPullDownRefresh()
        }
      }
    },
    handleSearch() {
      this.fetchChefList()
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
      return value ? `${value} 年` : '-'
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

.search-bar {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05);
}

.search-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #f3f5f8;
  font-size: 28rpx;
  color: #222222;
}

.search-btn {
  margin: 0;
  padding: 0 28rpx;
  height: 72rpx;
  line-height: 72rpx;
  border: none;
  border-radius: 999rpx;
  background: #d96c3a;
  color: #ffffff;
  font-size: 28rpx;
}

.search-btn::after {
  border: none;
}

.state-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360rpx;
  border-radius: 24rpx;
  background: #ffffff;
}

.state-text {
  font-size: 28rpx;
  color: #8a8f99;
}

.loading-card {
  padding: 28rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
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
  border-radius: 16rpx;
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
  align-items: center;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05);
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

.chef-header {
  margin-bottom: 12rpx;
}

.chef-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #222222;
}

.chef-cuisine {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #5c6470;
  line-height: 1.5;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx 24rpx;
}

.meta-text {
  font-size: 26rpx;
  color: #8a8f99;
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

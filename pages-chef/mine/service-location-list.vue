<template>
  <view class="page">
    <view class="page-head">
      <view>
        <text class="page-title">服务位置管理</text>
        <text class="page-tip">可维护多个服务出发地，但同一时间只能启用一个。</text>
      </view>
      <button class="add-btn" type="primary" @click="goAdd">新增服务位置</button>
    </view>

    <view v-if="loading" class="state-card">
      <text class="state-text">服务位置加载中...</text>
    </view>

    <view v-else-if="locationList.length === 0" class="state-card empty-card">
      <text class="state-text">暂未添加服务位置</text>
      <button class="empty-btn" type="primary" @click="goAdd">去新增</button>
    </view>

    <view v-else class="list">
      <view v-for="item in locationList" :key="item.id" class="location-card">
        <view class="card-head">
          <view class="card-title-wrap">
            <text class="location-name">{{ item.locationName || '未命名位置' }}</text>
            <text class="status-tag" :class="item.isActive === 1 ? 'active' : 'inactive'">
              {{ item.isActive === 1 ? '已启用' : '未启用' }}
            </text>
          </view>
          <text class="location-region">{{ formatRegion(item) }}</text>
        </view>

        <text class="location-address">{{ item.detailAddress || '暂无详细地址' }}</text>

        <view class="action-row">
          <button class="ghost-btn action-btn" @click="goEdit(item.id)">编辑</button>
          <button class="ghost-btn action-btn danger" @click="confirmDelete(item)">删除</button>
          <button
            v-if="item.isActive !== 1"
            class="primary-btn action-btn"
            :loading="activatingId === String(item.id)"
            :disabled="activatingId === String(item.id)"
            @click="confirmActivate(item)"
          >
            启用
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  activateChefServiceLocation,
  deleteChefServiceLocation,
  getChefServiceLocationList
} from '../../api/chef-service-location'

export default {
  name: 'ChefServiceLocationListPage',
  data() {
    return {
      loading: false,
      activatingId: '',
      deletingId: '',
      locationList: []
    }
  },
  onShow() {
    this.loadLocationList()
  },
  methods: {
    formatRegion(item) {
      if (!item) {
        return '-'
      }

      return [
        item.province,
        item.city,
        item.district,
        item.town
      ].filter(Boolean).join('')
    },
    async loadLocationList() {
      this.loading = true

      try {
        const data = await getChefServiceLocationList()
        this.locationList = Array.isArray(data) ? data : []
      } catch (error) {
        this.locationList = []
      } finally {
        this.loading = false
      }
    },
    goAdd() {
      uni.navigateTo({
        url: '/pages-chef/mine/service-location-edit'
      })
    },
    goEdit(id) {
      uni.navigateTo({
        url: `/pages-chef/mine/service-location-edit?id=${id}`
      })
    },
    confirmDelete(item) {
      if (!item || !item.id || this.deletingId) {
        return
      }

      uni.showModal({
        title: '删除确认',
        content: `确定删除“${item.locationName || '该服务位置'}”吗？`,
        success: async (res) => {
          if (!res.confirm) {
            return
          }

          this.deletingId = String(item.id)
          try {
            await deleteChefServiceLocation(item.id)
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            await this.loadLocationList()
          } catch (error) {
          } finally {
            this.deletingId = ''
          }
        }
      })
    },
    confirmActivate(item) {
      if (!item || !item.id || this.activatingId) {
        return
      }

      uni.showModal({
        title: '启用确认',
        content: `确定启用“${item.locationName || '该服务位置'}”吗？`,
        success: async (res) => {
          if (!res.confirm) {
            return
          }

          this.activatingId = String(item.id)
          try {
            await activateChefServiceLocation(item.id)
            uni.showToast({
              title: '启用成功',
              icon: 'success'
            })
            await this.loadLocationList()
          } catch (error) {
          } finally {
            this.activatingId = ''
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  background:
    radial-gradient(circle at top right, rgba(47, 143, 85, 0.12), transparent 34%),
    linear-gradient(180deg, #edf7f0 0%, #f6f7fb 36%, #f6f7fb 100%);
  box-sizing: border-box;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.page-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #1f2329;
}

.page-tip {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #738078;
}

.add-btn,
.empty-btn,
.primary-btn,
.ghost-btn {
  border: none;
}

.add-btn {
  min-width: 236rpx;
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 26rpx;
  border-radius: 999rpx;
  background: #2f8f55;
  font-size: 26rpx;
  white-space: nowrap;
  box-sizing: border-box;
}

.add-btn::after,
.empty-btn::after,
.primary-btn::after,
.ghost-btn::after {
  border: none;
}

.state-card,
.location-card {
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 14rpx 36rpx rgba(28, 39, 31, 0.06);
}

.state-card {
  padding: 88rpx 32rpx;
  text-align: center;
}

.state-text {
  font-size: 28rpx;
  color: #738078;
}

.empty-btn {
  width: 280rpx;
  height: 84rpx;
  margin-top: 28rpx;
  line-height: 84rpx;
  border-radius: 999rpx;
  background: #2f8f55;
  font-size: 28rpx;
  color: #ffffff;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.location-card {
  padding: 28rpx;
}

.card-head {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.card-title-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.location-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2329;
}

.status-tag {
  flex-shrink: 0;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
}

.status-tag.active {
  background: #edf8f1;
  color: #2f8f55;
}

.status-tag.inactive {
  background: #f3f4f6;
  color: #7a837d;
}

.location-region {
  font-size: 26rpx;
  color: #58636f;
  line-height: 1.6;
}

.location-address {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  line-height: 1.7;
  color: #4f5662;
}

.action-row {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.action-btn {
  flex: 1;
  height: 82rpx;
  line-height: 82rpx;
  border-radius: 18rpx;
  font-size: 28rpx;
}

.primary-btn {
  background: #2f8f55;
  color: #ffffff;
}

.ghost-btn {
  background: #ffffff;
  box-shadow: inset 0 0 0 2rpx #dbe6df;
  color: #4d5d52;
}

.ghost-btn.danger {
  box-shadow: inset 0 0 0 2rpx rgba(209, 74, 74, 0.18);
  color: #c14a4a;
}
</style>

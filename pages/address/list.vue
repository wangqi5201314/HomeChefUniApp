<template>
  <view class="page">
    <view v-if="mode === 'select'" class="select-tip">
      <text class="select-tip-text">请选择一个服务地址，返回下单页后会自动带入。</text>
    </view>

    <view v-if="loading" class="state-card">
      <text class="state-text">地址加载中...</text>
    </view>

    <view v-else-if="addressList.length === 0" class="state-card">
      <text class="state-text">暂无地址，先新增一个吧。</text>
      <button class="empty-btn" type="primary" @click="goAddAddress">新增地址</button>
    </view>

    <view v-else class="list">
      <view
        v-for="item in addressList"
        :key="item.id"
        class="address-card"
        @click="handleSelectAddress(item)"
      >
        <view class="card-head">
          <view class="user-line">
            <text class="contact-name">{{ item.contactName || '-' }}</text>
            <text class="contact-phone">{{ item.contactPhone || '-' }}</text>
          </view>
          <text v-if="isDefaultAddress(item)" class="default-tag">默认地址</text>
        </view>

        <text class="address-text">{{ getFullAddress(item) || '暂无地址信息' }}</text>

        <view class="card-actions">
          <text
            v-if="!isDefaultAddress(item)"
            class="action-text primary"
            @click.stop="handleSetDefault(item)"
          >
            设为默认
          </text>
          <text class="action-text" @click.stop="goEditAddress(item.id)">编辑</text>
          <text class="action-text danger" @click.stop="handleDeleteAddress(item)">删除</text>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <button class="add-btn" type="primary" @click="goAddAddress">新增地址</button>
    </view>
  </view>
</template>

<script>
import { deleteAddress, getUserAddressList, setDefaultAddress } from '../../api/address'

const USER_ID_KEY = 'user_id'
const SELECTED_ADDRESS_KEY = 'selected_address'

export default {
  name: 'AddressListPage',
  data() {
    return {
      userId: '',
      mode: '',
      loading: false,
      addressList: []
    }
  },
  onLoad(options) {
    this.mode = options && options.mode ? options.mode : ''
    this.userId = uni.getStorageSync(USER_ID_KEY) || ''
  },
  onShow() {
    this.loadAddressList()
  },
  methods: {
    async loadAddressList() {
      if (!this.userId) {
        this.addressList = []
        uni.showToast({
          title: '未读取到用户信息',
          icon: 'none'
        })
        return
      }

      this.loading = true

      try {
        const data = await getUserAddressList({
          userId: this.userId
        })
        this.addressList = Array.isArray(data) ? data : []
      } catch (error) {
        this.addressList = []
      } finally {
        this.loading = false
      }
    },
    isDefaultAddress(item) {
      return item && (item.isDefault === 1 || item.isDefault === true)
    },
    getFullAddress(item) {
      return [
        item.province,
        item.city,
        item.district,
        item.town,
        item.detailAddress
      ]
        .filter(Boolean)
        .join('')
    },
    goAddAddress() {
      uni.navigateTo({
        url: '/pages/address/edit'
      })
    },
    goEditAddress(id) {
      if (!id) {
        return
      }

      uni.navigateTo({
        url: `/pages/address/edit?id=${id}`
      })
    },
    handleDeleteAddress(item) {
      if (!item || !item.id) {
        return
      }

      uni.showModal({
        title: '提示',
        content: '确认删除这条地址吗？',
        success: async (res) => {
          if (!res.confirm) {
            return
          }

          try {
            await deleteAddress(item.id)
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            this.loadAddressList()
          } catch (error) {}
        }
      })
    },
    async handleSetDefault(item) {
      if (!item || !item.id) {
        return
      }

      try {
        await setDefaultAddress(item.id, {
          userId: Number(this.userId)
        })
        uni.showToast({
          title: '设置成功',
          icon: 'success'
        })
        this.loadAddressList()
      } catch (error) {}
    },
    handleSelectAddress(item) {
      if (this.mode !== 'select') {
        return
      }

      uni.setStorageSync(SELECTED_ADDRESS_KEY, item)
      uni.showToast({
        title: '已选择地址',
        icon: 'success'
      })

      setTimeout(() => {
        uni.navigateBack({
          delta: 1
        })
      }, 300)
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

.select-tip,
.state-card,
.address-card {
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05);
}

.select-tip {
  margin-bottom: 24rpx;
  padding: 24rpx;
  background: #fff5ee;
}

.select-tip-text {
  font-size: 26rpx;
  line-height: 1.6;
  color: #b85d33;
}

.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 360rpx;
  padding: 40rpx 32rpx;
}

.state-text {
  font-size: 28rpx;
  color: #8a8f99;
}

.empty-btn {
  margin-top: 28rpx;
  width: 240rpx;
  height: 80rpx;
  line-height: 80rpx;
  border: none;
  border-radius: 999rpx;
  background: #d96c3a;
  font-size: 28rpx;
}

.empty-btn::after,
.add-btn::after {
  border: none;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.address-card {
  padding: 28rpx;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.user-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16rpx;
}

.contact-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2329;
}

.contact-phone {
  font-size: 28rpx;
  color: #5e6672;
}

.default-tag {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #fff2eb;
  font-size: 22rpx;
  color: #c45e31;
}

.address-text {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #4f5662;
}

.card-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 28rpx;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f1f3f6;
}

.action-text {
  font-size: 26rpx;
  color: #68707d;
}

.action-text.primary {
  color: #d96c3a;
}

.action-text.danger {
  color: #d14a4a;
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

.add-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border: none;
  border-radius: 999rpx;
  background: #d96c3a;
  font-size: 30rpx;
  font-weight: 500;
}
</style>

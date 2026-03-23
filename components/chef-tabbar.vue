<template>
  <view class="chef-tabbar">
    <view class="tabbar-inner">
      <view
        v-for="item in items"
        :key="item.key"
        class="tab-item"
        :class="{ active: current === item.key }"
        @click="handleClick(item)"
      >
        <text class="tab-text">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
const TAB_ITEMS = [
  {
    key: 'home',
    label: '首页',
    url: '/pages-chef/home/index'
  },
  {
    key: 'order',
    label: '订单',
    url: '/pages-chef/order/list'
  },
  {
    key: 'mine',
    label: '我的',
    url: '/pages-chef/mine/index'
  }
]

export default {
  name: 'ChefTabbar',
  props: {
    current: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      items: TAB_ITEMS
    }
  },
  methods: {
    handleClick(item) {
      if (!item || this.current === item.key) {
        return
      }

      uni.redirectTo({
        url: item.url
      })
    }
  }
}
</script>

<style scoped>
.chef-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -10rpx 24rpx rgba(24, 34, 28, 0.08);
  box-sizing: border-box;
}

.tabbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14rpx 24rpx calc(14rpx + env(safe-area-inset-bottom));
}

.tab-item {
  flex: 1;
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
}

.tab-item.active {
  background: #2f8f55;
}

.tab-text {
  font-size: 28rpx;
  color: #5d675f;
  font-weight: 500;
}

.tab-item.active .tab-text {
  color: #ffffff;
}
</style>

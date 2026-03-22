<template>
  <view class="page">
    <view class="card">
      <text class="title">我的档期</text>
      <text class="desc">厨师端档期管理页待开发</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ChefSchedulePage'
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f6f7fb;
  box-sizing: border-box;
}

.card {
  padding: 40rpx 32rpx;
  border-radius: 24rpx;
  background: #ffffff;
}

.title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #222222;
}

.desc {
  display: block;
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #8a8f99;
}
</style>

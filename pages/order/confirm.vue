<template>
  <view class="page">
    <view v-if="loading" class="state-card">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else>
      <view class="section-card address-card" @click="goSelectAddress">
        <view class="section-head">
          <text class="section-title">服务地址</text>
          <text class="section-link">选择地址</text>
        </view>

        <view v-if="selectedAddress && selectedAddress.id">
          <view class="address-user">
            <text class="address-name">{{ selectedAddress.contactName || '-' }}</text>
            <text class="address-phone">{{ selectedAddress.contactPhone || '-' }}</text>
          </view>
          <text class="address-detail">{{ fullAddress || '暂无地址信息' }}</text>
        </view>
        <text v-else class="empty-text">请先选择服务地址</text>
      </view>

      <view class="section-card">
        <text class="section-title">厨师信息</text>
        <view class="chef-box">
          <image
            v-if="chef.avatar"
            class="chef-avatar"
            :src="chef.avatar"
            mode="aspectFill"
          />
          <view v-else class="chef-avatar chef-avatar-placeholder">
            <text class="chef-avatar-text">{{ getNameInitial(chef.name) }}</text>
          </view>
          <view class="chef-info">
            <text class="chef-name">{{ chef.name || '未命名厨师' }}</text>
            <text class="chef-text">擅长菜系：{{ chef.specialtyCuisine || '-' }}</text>
            <text class="chef-text">服务模式：{{ chefServiceModeText }}</text>
          </view>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">服务时间</text>
        <view class="info-line">
          <text class="info-label">服务日期</text>
          <text class="info-value">{{ orderInfo.serviceDate || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">时间段</text>
          <text class="info-value">{{ timeSlotText }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">开始时间</text>
          <text class="info-value">{{ formatScheduleDateTime(orderInfo.serviceStartTime) }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">结束时间</text>
          <text class="info-value">{{ formatScheduleDateTime(orderInfo.serviceEndTime) }}</text>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">下单信息</text>

        <view class="form-item">
          <text class="label">用餐人数</text>
          <input
            v-model="form.peopleCount"
            class="input"
            type="number"
            placeholder="请输入用餐人数"
          />
        </view>

        <view class="form-item">
          <text class="label">口味偏好</text>
          <input
            v-model="form.tastePreference"
            class="input"
            placeholder="请输入口味偏好"
          />
        </view>

        <view class="form-item">
          <text class="label">忌口食物</text>
          <input
            v-model="form.tabooFood"
            class="input"
            placeholder="请输入忌口食物"
          />
        </view>

        <view class="form-item">
          <text class="label">特殊要求</text>
          <textarea
            v-model="form.specialRequirement"
            class="textarea"
            placeholder="请输入特殊要求"
          />
        </view>

        <view class="form-item">
          <text class="label">食材模式</text>
          <picker
            v-if="canSelectIngredientMode"
            class="picker"
            :range="ingredientModeRange"
            :value="ingredientModeIndex"
            @change="handleIngredientModeChange"
          >
            <view class="picker-value">{{ ingredientModeText }}</view>
          </picker>
          <view v-else class="picker-value picker-value--readonly">{{ ingredientModeText }}</view>
          <text v-if="!canSelectIngredientMode" class="helper-text">
            当前厨师仅支持该食材模式，不能修改
          </text>
        </view>

        <view class="form-item">
          <text class="label">食材清单</text>
          <textarea
            v-model="form.ingredientList"
            class="textarea"
            placeholder="请输入食材清单"
          />
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">联系人</text>
        <view class="info-line">
          <text class="info-label">联系人</text>
          <text class="info-value">{{ selectedAddress.contactName || '-' }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">联系电话</text>
          <text class="info-value">{{ selectedAddress.contactPhone || '-' }}</text>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">费用信息</text>
        <view class="info-line">
          <text class="info-label">总金额</text>
          <text class="info-value amount">¥{{ totalAmount }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">优惠金额</text>
          <text class="info-value">¥{{ discountAmount }}</text>
        </view>
        <view class="info-line">
          <text class="info-label">应付金额</text>
          <text class="info-value amount">¥{{ payAmount }}</text>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="price-box">
        <text class="price-label">应付</text>
        <text class="price-value">¥{{ payAmount }}</text>
      </view>
      <button class="submit-btn" type="primary" :loading="submitting" :disabled="submitting" @click="submitOrder">
        {{ submitting ? '提交中...' : '提交订单' }}
      </button>
    </view>
  </view>
</template>

<script>
import { getDefaultUserAddress } from '../../api/address'
import { getChefDetail } from '../../api/chef'
import { createOrder } from '../../api/order'
import { getChefServiceModeText } from '../../utils/chef-service-mode'
import { formatScheduleDateTime } from '../../utils/schedule-time'
import { getTimeSlotText, isValidTimeSlot, normalizeTimeSlot } from '../../utils/time-slot'

const USER_ID_KEY = 'user_id'
const SELECTED_ADDRESS_KEY = 'selected_address'
const FIXED_TOTAL_AMOUNT = 299
const FIXED_DISCOUNT_AMOUNT = 0
const FIXED_PAY_AMOUNT = 299

const INGREDIENT_MODE_OPTIONS = [
  {
    label: '用户自备食材',
    value: 1
  },
  {
    label: '平台协同采购',
    value: 2
  }
]

function createDefaultForm() {
  return {
    peopleCount: '1',
    tastePreference: '',
    tabooFood: '',
    specialRequirement: '',
    ingredientMode: '1',
    ingredientList: ''
  }
}

export default {
  name: 'OrderConfirmPage',
  data() {
    return {
      loading: true,
      submitting: false,
      userId: '',
      chef: {},
      selectedAddress: {},
      orderInfo: {
        chefId: '',
        serviceDate: '',
        timeSlot: '',
        serviceStartTime: '',
        serviceEndTime: ''
      },
      form: createDefaultForm(),
      totalAmount: FIXED_TOTAL_AMOUNT,
      discountAmount: FIXED_DISCOUNT_AMOUNT,
      payAmount: FIXED_PAY_AMOUNT
    }
  },
  computed: {
    fullAddress() {
      const address = this.selectedAddress || {}
      return [
        address.province,
        address.city,
        address.district,
        address.detailAddress,
        address.doorplate
      ]
        .filter(Boolean)
        .join('')
    },
    chefServiceModeValue() {
      return Number(this.chef.serviceMode)
    },
    chefServiceModeText() {
      if (this.chef.serviceModeDesc) {
        return this.chef.serviceModeDesc
      }

      if (this.chef.serviceMode === 0 || this.chef.serviceMode) {
        return getChefServiceModeText(this.chef.serviceMode)
      }

      return '-'
    },
    canSelectIngredientMode() {
      return this.chefServiceModeValue === 3
    },
    ingredientModeOptions() {
      if (this.canSelectIngredientMode) {
        return INGREDIENT_MODE_OPTIONS
      }

      if (this.chefServiceModeValue === 1 || this.chefServiceModeValue === 2) {
        return [
          {
            label: getChefServiceModeText(this.chefServiceModeValue),
            value: this.chefServiceModeValue
          }
        ]
      }

      return INGREDIENT_MODE_OPTIONS
    },
    ingredientModeRange() {
      return this.ingredientModeOptions.map((item) => item.label)
    },
    ingredientModeIndex() {
      const currentValue = Number(this.form.ingredientMode)
      const index = this.ingredientModeOptions.findIndex((item) => item.value === currentValue)
      return index >= 0 ? index : 0
    },
    ingredientModeText() {
      const currentValue = Number(this.form.ingredientMode)
      const matched = this.ingredientModeOptions.find((item) => item.value === currentValue)
      return matched ? matched.label : '请选择食材模式'
    },
    timeSlotText() {
      return getTimeSlotText(this.orderInfo.timeSlot)
    }
  },
  onLoad(options) {
    this.userId = uni.getStorageSync(USER_ID_KEY) || ''
    this.orderInfo.chefId = options && options.chefId ? options.chefId : ''
    this.orderInfo.serviceDate = options && options.serviceDate ? decodeURIComponent(options.serviceDate) : ''
    this.orderInfo.timeSlot = normalizeTimeSlot(options && options.timeSlot ? decodeURIComponent(options.timeSlot) : '')
    this.orderInfo.serviceStartTime = this.normalizeServiceTime(
      options && options.serviceStartTime ? decodeURIComponent(options.serviceStartTime) : '',
      this.orderInfo.serviceDate
    )
    this.orderInfo.serviceEndTime = this.normalizeServiceTime(
      options && options.serviceEndTime ? decodeURIComponent(options.serviceEndTime) : '',
      this.orderInfo.serviceDate
    )

    this.loadPageData()
  },
  onShow() {
    this.consumeSelectedAddress()
  },
  methods: {
    formatScheduleDateTime,
    getTimeSlotText,
    async loadPageData() {
      if (!this.userId) {
        this.loading = false
        uni.showToast({
          title: '未读取到用户信息',
          icon: 'none'
        })
        return
      }

      if (!this.orderInfo.chefId) {
        this.loading = false
        uni.showToast({
          title: '缺少厨师信息',
          icon: 'none'
        })
        return
      }

      this.loading = true

      try {
        const [chefData, addressData] = await Promise.all([
          getChefDetail(this.orderInfo.chefId),
          getDefaultUserAddress({
            userId: this.userId
          })
        ])

        this.chef = chefData || {}
        this.syncIngredientModeWithChef()

        if (addressData && addressData.id) {
          this.selectedAddress = addressData
        }

        this.consumeSelectedAddress()
      } catch (error) {
        this.chef = {}
      } finally {
        this.loading = false
      }
    },
    consumeSelectedAddress() {
      const address = uni.getStorageSync(SELECTED_ADDRESS_KEY)

      if (address && address.id) {
        this.selectedAddress = address
        uni.removeStorageSync(SELECTED_ADDRESS_KEY)
      }
    },
    syncIngredientModeWithChef() {
      if (this.chefServiceModeValue === 1 || this.chefServiceModeValue === 2) {
        this.form.ingredientMode = String(this.chefServiceModeValue)
        return
      }

      if (Number(this.form.ingredientMode) !== 1 && Number(this.form.ingredientMode) !== 2) {
        this.form.ingredientMode = '1'
      }
    },
    normalizeServiceTime(value, serviceDate) {
      if (!value) {
        return ''
      }

      if (value.includes('T')) {
        return value
      }

      const pureTime = value.length === 5 ? `${value}:00` : value
      return serviceDate ? `${serviceDate}T${pureTime}` : value
    },
    getNameInitial(name) {
      return name ? String(name).slice(0, 1) : '厨'
    },
    handleIngredientModeChange(event) {
      const index = Number(event.detail.value)
      const selected = this.ingredientModeOptions[index]

      if (selected) {
        this.form.ingredientMode = String(selected.value)
      }
    },
    goSelectAddress() {
      uni.navigateTo({
        url: '/pages/address/list?mode=select'
      })
    },
    validateForm() {
      if (!this.selectedAddress || !this.selectedAddress.id) {
        uni.showToast({
          title: '请选择服务地址',
          icon: 'none'
        })
        return false
      }

      if (!this.orderInfo.serviceDate || !isValidTimeSlot(this.orderInfo.timeSlot) || !this.orderInfo.serviceStartTime || !this.orderInfo.serviceEndTime) {
        uni.showToast({
          title: '服务时间信息不完整',
          icon: 'none'
        })
        return false
      }

      if (!this.form.peopleCount || Number(this.form.peopleCount) <= 0) {
        uni.showToast({
          title: '请输入正确的用餐人数',
          icon: 'none'
        })
        return false
      }

      if (Number(this.form.ingredientMode) !== 1 && Number(this.form.ingredientMode) !== 2) {
        uni.showToast({
          title: '请选择正确的食材模式',
          icon: 'none'
        })
        return false
      }

      return true
    },
    buildPayload() {
      return {
        userId: Number(this.userId),
        chefId: Number(this.orderInfo.chefId),
        addressId: this.selectedAddress.id,
        serviceDate: this.orderInfo.serviceDate,
        timeSlot: normalizeTimeSlot(this.orderInfo.timeSlot),
        serviceStartTime: this.orderInfo.serviceStartTime,
        serviceEndTime: this.orderInfo.serviceEndTime,
        peopleCount: Number(this.form.peopleCount),
        tastePreference: this.form.tastePreference.trim(),
        tabooFood: this.form.tabooFood.trim(),
        specialRequirement: this.form.specialRequirement.trim(),
        ingredientMode: Number(this.form.ingredientMode),
        ingredientList: this.form.ingredientList.trim(),
        contactName: this.selectedAddress.contactName || '',
        contactPhone: this.selectedAddress.contactPhone || '',
        fullAddress: this.fullAddress,
        longitude: this.selectedAddress.longitude === 0 || this.selectedAddress.longitude ? Number(this.selectedAddress.longitude) : 0,
        latitude: this.selectedAddress.latitude === 0 || this.selectedAddress.latitude ? Number(this.selectedAddress.latitude) : 0,
        totalAmount: this.totalAmount,
        discountAmount: this.discountAmount,
        payAmount: this.payAmount
      }
    },
    async submitOrder() {
      if (this.submitting || !this.validateForm()) {
        return
      }

      this.submitting = true

      try {
        const result = await createOrder(this.buildPayload())
        const orderId = result && result.id ? result.id : ''

        uni.showToast({
          title: '下单成功',
          icon: 'success'
        })

        setTimeout(() => {
          if (orderId) {
            uni.navigateTo({
              url: `/pages/order/detail?id=${orderId}`
            })
          }
        }, 300)
      } catch (error) {
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 170rpx;
  background: #f6f7fb;
  box-sizing: border-box;
}

.state-card,
.section-card {
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05);
}

.state-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360rpx;
}

.state-text,
.empty-text {
  font-size: 28rpx;
  color: #8a8f99;
}

.section-card {
  margin-bottom: 24rpx;
}

.address-card {
  position: relative;
}

.section-head,
.info-line,
.address-user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.section-head {
  margin-bottom: 20rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2329;
}

.section-link {
  font-size: 26rpx;
  color: #d96c3a;
}

.address-name,
.chef-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2329;
}

.address-phone,
.chef-text,
.info-label,
.info-value {
  font-size: 26rpx;
  color: #626b77;
}

.address-detail {
  display: block;
  margin-top: 16rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #4f5662;
}

.chef-box {
  display: flex;
  align-items: center;
}

.chef-avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 20rpx;
  background: #f1e1d9;
  flex-shrink: 0;
}

.chef-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chef-avatar-text {
  font-size: 44rpx;
  font-weight: 600;
  color: #b96845;
}

.chef-info {
  flex: 1;
  min-width: 0;
  margin-left: 22rpx;
}

.chef-text {
  display: block;
  margin-top: 10rpx;
}

.info-line {
  padding: 14rpx 0;
}

.info-value {
  text-align: right;
}

.amount {
  color: #d96c3a;
  font-weight: 600;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.label {
  display: block;
  margin-bottom: 14rpx;
  font-size: 28rpx;
  color: #1f2329;
}

.input,
.textarea,
.picker-value {
  width: 100%;
  border-radius: 16rpx;
  background: #f7f8fb;
  font-size: 28rpx;
  color: #222222;
  box-sizing: border-box;
}

.input,
.picker-value {
  height: 84rpx;
  line-height: 84rpx;
  padding: 0 24rpx;
}

.textarea {
  min-height: 160rpx;
  padding: 22rpx 24rpx;
}

.picker-value--readonly {
  color: #4f5662;
}

.helper-text {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #8a8f99;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -8rpx 24rpx rgba(32, 37, 43, 0.06);
  box-sizing: border-box;
}

.price-box {
  flex: 1;
}

.price-label {
  display: block;
  font-size: 24rpx;
  color: #8a8f99;
}

.price-value {
  display: block;
  margin-top: 8rpx;
  font-size: 38rpx;
  font-weight: 700;
  color: #d96c3a;
}

.submit-btn {
  margin: 0;
  width: 240rpx;
  height: 88rpx;
  line-height: 88rpx;
  border: none;
  border-radius: 999rpx;
  background: #d96c3a;
  font-size: 30rpx;
  font-weight: 500;
}

.submit-btn::after {
  border: none;
}
</style>

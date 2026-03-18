<template>
  <view class="page">
    <view class="form-card">
      <view class="form-item">
        <text class="label">联系人</text>
        <input v-model="form.contactName" class="input" placeholder="请输入联系人姓名" />
      </view>

      <view class="form-item">
        <text class="label">联系电话</text>
        <input
          v-model="form.contactPhone"
          class="input"
          type="number"
          maxlength="11"
          placeholder="请输入联系电话"
        />
      </view>

      <view class="form-item">
        <text class="label">省</text>
        <input v-model="form.province" class="input" placeholder="请输入省" />
      </view>

      <view class="form-item">
        <text class="label">市</text>
        <input v-model="form.city" class="input" placeholder="请输入市" />
      </view>

      <view class="form-item">
        <text class="label">区</text>
        <input v-model="form.district" class="input" placeholder="请输入区" />
      </view>

      <view class="form-item">
        <text class="label">详细地址</text>
        <input v-model="form.detailAddress" class="input" placeholder="请输入详细地址" />
      </view>

      <view class="form-item">
        <text class="label">门牌号</text>
        <input v-model="form.doorplate" class="input" placeholder="请输入门牌号" />
      </view>

      <view class="form-item">
        <text class="label">经度</text>
        <input v-model="form.longitude" class="input" type="digit" placeholder="请输入经度" />
      </view>

      <view class="form-item">
        <text class="label">纬度</text>
        <input v-model="form.latitude" class="input" type="digit" placeholder="请输入纬度" />
      </view>

      <view class="switch-item">
        <text class="label">设为默认地址</text>
        <switch :checked="Number(form.isDefault) === 1" color="#d96c3a" @change="handleDefaultChange" />
      </view>
    </view>

    <view class="bottom-bar">
      <button class="save-btn" type="primary" :loading="saving" :disabled="saving" @click="handleSubmit">
        {{ saving ? '保存中...' : '保存地址' }}
      </button>
    </view>
  </view>
</template>

<script>
import { createAddress, getAddressDetail, updateAddress } from '../../api/address'

const USER_ID_KEY = 'user_id'

function createDefaultForm() {
  return {
    contactName: '',
    contactPhone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    longitude: '',
    latitude: '',
    doorplate: '',
    isDefault: 0
  }
}

export default {
  name: 'AddressEditPage',
  data() {
    return {
      id: '',
      userId: '',
      saving: false,
      form: createDefaultForm()
    }
  },
  onLoad(options) {
    this.id = options && options.id ? options.id : ''
    this.userId = uni.getStorageSync(USER_ID_KEY) || ''

    if (this.id) {
      uni.setNavigationBarTitle({
        title: '编辑地址'
      })
      this.loadAddressDetail()
    } else {
      uni.setNavigationBarTitle({
        title: '新增地址'
      })
    }
  },
  methods: {
    async loadAddressDetail() {
      try {
        const data = await getAddressDetail(this.id)
        this.form = {
          contactName: data.contactName || '',
          contactPhone: data.contactPhone || '',
          province: data.province || '',
          city: data.city || '',
          district: data.district || '',
          detailAddress: data.detailAddress || '',
          longitude: data.longitude === 0 || data.longitude ? String(data.longitude) : '',
          latitude: data.latitude === 0 || data.latitude ? String(data.latitude) : '',
          doorplate: data.doorplate || '',
          isDefault: data.isDefault === 1 || data.isDefault === true ? 1 : 0
        }
      } catch (error) {}
    },
    handleDefaultChange(event) {
      this.form.isDefault = event.detail.value ? 1 : 0
    },
    validateForm() {
      if (!this.form.contactName.trim()) {
        uni.showToast({
          title: '请输入联系人',
          icon: 'none'
        })
        return false
      }

      if (!this.form.contactPhone.trim()) {
        uni.showToast({
          title: '请输入联系电话',
          icon: 'none'
        })
        return false
      }

      if (!/^1\d{10}$/.test(this.form.contactPhone.trim())) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return false
      }

      if (!this.form.province.trim()) {
        uni.showToast({
          title: '请输入省',
          icon: 'none'
        })
        return false
      }

      if (!this.form.city.trim()) {
        uni.showToast({
          title: '请输入市',
          icon: 'none'
        })
        return false
      }

      if (!this.form.district.trim()) {
        uni.showToast({
          title: '请输入区',
          icon: 'none'
        })
        return false
      }

      if (!this.form.detailAddress.trim()) {
        uni.showToast({
          title: '请输入详细地址',
          icon: 'none'
        })
        return false
      }

      return true
    },
    buildPayload() {
      return {
        contactName: this.form.contactName.trim(),
        contactPhone: this.form.contactPhone.trim(),
        province: this.form.province.trim(),
        city: this.form.city.trim(),
        district: this.form.district.trim(),
        detailAddress: this.form.detailAddress.trim(),
        longitude: this.form.longitude === '' ? 0 : Number(this.form.longitude),
        latitude: this.form.latitude === '' ? 0 : Number(this.form.latitude),
        doorplate: this.form.doorplate.trim(),
        isDefault: Number(this.form.isDefault) === 1 ? 1 : 0
      }
    },
    async handleSubmit() {
      if (this.saving || !this.validateForm()) {
        return
      }

      if (!this.id && !this.userId) {
        uni.showToast({
          title: '未读取到用户信息',
          icon: 'none'
        })
        return
      }

      this.saving = true

      try {
        const payload = this.buildPayload()

        if (this.id) {
          await updateAddress(this.id, payload)
        } else {
          await createAddress({
            userId: this.userId,
            ...payload
          })
        }

        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.navigateBack({
            delta: 1
          })
        }, 300)
      } catch (error) {
      } finally {
        this.saving = false
      }
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

.form-card {
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05);
}

.form-item,
.switch-item {
  margin-bottom: 24rpx;
}

.form-item:last-child,
.switch-item:last-child {
  margin-bottom: 0;
}

.label {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #1f2329;
}

.input {
  height: 84rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: #f7f8fb;
  font-size: 28rpx;
  color: #222222;
  box-sizing: border-box;
}

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.switch-item .label {
  margin-bottom: 0;
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

.save-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border: none;
  border-radius: 999rpx;
  background: #d96c3a;
  font-size: 30rpx;
  font-weight: 500;
}

.save-btn::after {
  border: none;
}
</style>

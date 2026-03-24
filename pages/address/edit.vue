<template>
  <view class="page">
    <view class="form-card">
      <view class="form-item">
        <text class="label">联系人</text>
        <input
          v-model="form.contactName"
          class="input"
          maxlength="20"
          placeholder="请输入联系人姓名"
        />
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
        <text class="label">省份</text>
        <picker class="picker" :range="provinceRange" :value="provinceIndex" @change="handleProvinceChange">
          <view class="picker-value">{{ form.province || '请选择省份' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">城市</text>
        <picker class="picker" :range="cityRange" :value="cityIndex" @change="handleCityChange">
          <view class="picker-value" :class="{ 'picker-placeholder': !form.city }">
            {{ form.city || '请选择城市' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">区县</text>
        <picker class="picker" :range="districtRange" :value="districtIndex" @change="handleDistrictChange">
          <view class="picker-value" :class="{ 'picker-placeholder': !form.district }">
            {{ form.district || '请选择区县' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">镇 / 街道</text>
        <picker class="picker" :range="townRange" :value="townIndex" @change="handleTownChange">
          <view class="picker-value" :class="{ 'picker-placeholder': !form.town }">
            {{ form.town || '请选择镇 / 街道' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">详细地址</text>
        <textarea
          v-model="form.detailAddress"
          class="textarea"
          maxlength="120"
          placeholder="请输入门牌号、楼栋号、房号等详细信息"
        />
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
import { loadProvinceRegion, provinceList } from '../../data/address/regions'

const USER_ID_KEY = 'user_id'

function createDefaultForm() {
  return {
    contactName: '',
    contactPhone: '',
    province: '',
    city: '',
    district: '',
    town: '',
    detailAddress: '',
    longitude: 0,
    latitude: 0,
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
      provinceOptions: provinceList,
      currentProvinceCode: '',
      currentProvinceRegion: null,
      form: createDefaultForm()
    }
  },
  computed: {
    provinceRange() {
      return this.provinceOptions.map((item) => item.name)
    },
    provinceIndex() {
      const index = this.provinceOptions.findIndex((item) => item.name === this.form.province)
      return index >= 0 ? index : 0
    },
    cityOptions() {
      return this.currentProvinceRegion && Array.isArray(this.currentProvinceRegion.cities)
        ? this.currentProvinceRegion.cities
        : []
    },
    cityRange() {
      return this.cityOptions.map((item) => item.name)
    },
    cityIndex() {
      const index = this.cityOptions.findIndex((item) => item.name === this.form.city)
      return index >= 0 ? index : 0
    },
    currentCity() {
      return this.cityOptions.find((item) => item.name === this.form.city) || this.cityOptions[0] || null
    },
    districtOptions() {
      if (!this.currentCity || !Array.isArray(this.currentCity.districts)) {
        return []
      }

      const usableDistricts = this.currentCity.districts.filter(
        (item) => Array.isArray(item.towns) && item.towns.length > 0
      )

      return usableDistricts.length > 0 ? usableDistricts : this.currentCity.districts
    },
    districtRange() {
      return this.districtOptions.map((item) => item.name)
    },
    districtIndex() {
      const index = this.districtOptions.findIndex((item) => item.name === this.form.district)
      return index >= 0 ? index : 0
    },
    currentDistrict() {
      return this.districtOptions.find((item) => item.name === this.form.district) || this.districtOptions[0] || null
    },
    townOptions() {
      return this.currentDistrict && Array.isArray(this.currentDistrict.towns)
        ? this.currentDistrict.towns
        : []
    },
    townRange() {
      return this.townOptions
    },
    townIndex() {
      const index = this.townOptions.findIndex((item) => item === this.form.town)
      return index >= 0 ? index : 0
    }
  },
  onLoad(options) {
    this.id = options && options.id ? options.id : ''
    this.userId = uni.getStorageSync(USER_ID_KEY) || ''

    uni.setNavigationBarTitle({
      title: this.id ? '编辑地址' : '新增地址'
    })

    if (this.id) {
      this.loadAddressDetail()
      return
    }

    this.initDefaultRegion()
  },
  methods: {
    getProvinceByName(name) {
      return this.provinceOptions.find((item) => item.name === name) || null
    },
    loadProvinceData(provinceCode) {
      if (!provinceCode) {
        this.currentProvinceCode = ''
        this.currentProvinceRegion = null
        return
      }

      this.currentProvinceCode = String(provinceCode)
      this.currentProvinceRegion = loadProvinceRegion(this.currentProvinceCode) || {
        code: this.currentProvinceCode,
        name: '',
        cities: []
      }
    },
    applyRegionValues(cityName, districtName, townName) {
      const city = this.cityOptions.find((item) => item.name === cityName) || this.cityOptions[0] || null
      this.form.city = city ? city.name : ''

      const districtOptions = city && Array.isArray(city.districts) ? city.districts : []
      const usableDistricts = districtOptions.filter(
        (item) => Array.isArray(item.towns) && item.towns.length > 0
      )
      const availableDistricts = usableDistricts.length > 0 ? usableDistricts : districtOptions
      const district =
        availableDistricts.find((item) => item.name === districtName) || availableDistricts[0] || null
      this.form.district = district ? district.name : ''

      const townOptions = district && Array.isArray(district.towns) ? district.towns : []
      const town = townOptions.find((item) => item === townName) || townOptions[0] || ''
      this.form.town = town
    },
    initDefaultRegion() {
      const firstProvince = this.provinceOptions[0]
      if (!firstProvince) {
        return
      }

      this.form.province = firstProvince.name
      this.loadProvinceData(firstProvince.code)
      this.applyRegionValues('', '', '')
    },
    syncRegionByForm() {
      const province = this.getProvinceByName(this.form.province) || this.provinceOptions[0] || null

      if (!province) {
        this.currentProvinceCode = ''
        this.currentProvinceRegion = null
        return
      }

      this.form.province = province.name
      this.loadProvinceData(province.code)
      this.applyRegionValues(this.form.city, this.form.district, this.form.town)
    },
    async loadAddressDetail() {
      try {
        const data = await getAddressDetail(this.id)
        this.form = {
          contactName: data.contactName || '',
          contactPhone: data.contactPhone || '',
          province: data.province || '',
          city: data.city || '',
          district: data.district || '',
          town: data.town || '',
          detailAddress: data.detailAddress || '',
          longitude: data.longitude === 0 || data.longitude ? Number(data.longitude) : 0,
          latitude: data.latitude === 0 || data.latitude ? Number(data.latitude) : 0,
          isDefault: data.isDefault === 1 || data.isDefault === true ? 1 : 0
        }
        this.syncRegionByForm()
      } catch (error) {
        this.initDefaultRegion()
      }
    },
    handleProvinceChange(event) {
      const index = Number(event.detail.value)
      const province = this.provinceOptions[index]

      if (!province) {
        return
      }

      this.form.province = province.name
      this.loadProvinceData(province.code)
      this.applyRegionValues('', '', '')
    },
    handleCityChange(event) {
      const index = Number(event.detail.value)
      const city = this.cityOptions[index]

      if (!city) {
        return
      }

      this.form.city = city.name
      this.applyRegionValues(city.name, '', '')
    },
    handleDistrictChange(event) {
      const index = Number(event.detail.value)
      const district = this.districtOptions[index]

      if (!district) {
        return
      }

      this.form.district = district.name
      this.applyRegionValues(this.form.city, district.name, '')
    },
    handleTownChange(event) {
      const index = Number(event.detail.value)
      const town = this.townOptions[index]

      if (!town) {
        return
      }

      this.form.town = town
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

      if (!this.form.province) {
        uni.showToast({
          title: '请选择省份',
          icon: 'none'
        })
        return false
      }

      if (!this.form.city) {
        uni.showToast({
          title: '请选择城市',
          icon: 'none'
        })
        return false
      }

      if (!this.form.district) {
        uni.showToast({
          title: '请选择区县',
          icon: 'none'
        })
        return false
      }

      if (!this.form.town) {
        uni.showToast({
          title: '请选择镇 / 街道',
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
        userId: Number(this.userId),
        contactName: this.form.contactName.trim(),
        contactPhone: this.form.contactPhone.trim(),
        province: this.form.province,
        city: this.form.city,
        district: this.form.district,
        town: this.form.town,
        detailAddress: this.form.detailAddress.trim(),
        longitude:
          this.form.longitude === '' || this.form.longitude === undefined || this.form.longitude === null
            ? 0
            : Number(this.form.longitude),
        latitude:
          this.form.latitude === '' || this.form.latitude === undefined || this.form.latitude === null
            ? 0
            : Number(this.form.latitude),
        isDefault: Number(this.form.isDefault) === 1 ? 1 : 0
      }
    },
    async handleSubmit() {
      if (this.saving || !this.validateForm()) {
        return
      }

      if (!this.userId) {
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
          await createAddress(payload)
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

.input,
.picker-value,
.textarea {
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

.picker-placeholder {
  color: #9aa1ad;
}

.textarea {
  min-height: 168rpx;
  padding: 22rpx 24rpx;
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

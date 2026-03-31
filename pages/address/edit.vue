<template>
  <view class="page">
    <view class="form-card">
      <view class="section-title">联系人信息</view>

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
    </view>

    <view class="form-card">
      <view class="section-head">
        <text class="section-title">地图选址</text>
        <text class="section-tip">搜索地址、点击地图或拖动地图后松手，都可自动回填地址。</text>
      </view>

      <view class="search-bar">
        <input
          v-model="searchKeyword"
          class="search-input"
          confirm-type="search"
          placeholder="搜索小区、写字楼、街道等地址"
          @input="handleKeywordInput"
          @confirm="handleSearch"
        />
        <button class="search-btn" size="mini" type="primary" :loading="searching" @click="handleSearch">
          搜索
        </button>
      </view>

      <view v-if="searchResults.length > 0" class="search-result-list">
        <view
          v-for="(item, index) in searchResults"
          :key="item.id || `${item.title}-${index}`"
          class="search-result-item"
          @click="handleSelectSearchResult(item)"
        >
          <text class="result-title">{{ item.title || '未命名地点' }}</text>
          <text class="result-address">{{ item.address || '暂无详细地址' }}</text>
        </view>
      </view>

      <view class="map-wrapper">
        <map
          id="addressMap"
          class="map"
          :latitude="mapLatitude"
          :longitude="mapLongitude"
          :scale="16"
          :show-location="true"
          @regionchange="handleMapRegionChange"
          @tap="handleMapTap"
        />
        <view class="map-center-pin">
          <image class="map-center-pin-image" :src="markerIcon" mode="aspectFit" />
        </view>
      </view>

      <view class="selected-location">
        <text class="selected-location-label">当前选点</text>
        <text class="selected-location-text">{{ selectedLocationText }}</text>
      </view>
    </view>

    <view class="form-card">
      <view class="section-title">地址信息</view>

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
import { buildLocationPayloadByGeocoder, reverseGeocoder, searchAddress, suggestAddress } from '../../utils/tencent-map'

const USER_ID_KEY = 'user_id'
const DEFAULT_LATITUDE = 39.90469
const DEFAULT_LONGITUDE = 116.40717
const MARKER_ICON = '/static/service-location-marker.png'

function createDefaultForm() {
  return {
    contactName: '',
    contactPhone: '',
    province: '',
    city: '',
    district: '',
    town: '',
    detailAddress: '',
    longitude: DEFAULT_LONGITUDE,
    latitude: DEFAULT_LATITUDE,
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
      searching: false,
      provinceOptions: provinceList,
      currentProvinceCode: '',
      currentProvinceRegion: null,
      searchKeyword: '',
      searchResults: [],
      mapLatitude: DEFAULT_LATITUDE,
      mapLongitude: DEFAULT_LONGITUDE,
      markerIcon: MARKER_ICON,
      mapContext: null,
      regionChangeTimer: null,
      suggestTimer: null,
      ignoreNextRegionChange: false,
      form: createDefaultForm()
    }
  },
  computed: {
    selectedLocationText() {
      const parts = [
        this.form.province,
        this.form.city,
        this.form.district,
        this.form.town,
        this.form.detailAddress
      ].filter(Boolean)

      return parts.length > 0 ? parts.join('') : '暂未选择具体位置'
    },
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
  onUnload() {
    if (this.regionChangeTimer) {
      clearTimeout(this.regionChangeTimer)
      this.regionChangeTimer = null
    }

    if (this.suggestTimer) {
      clearTimeout(this.suggestTimer)
      this.suggestTimer = null
    }
  },
  methods: {
    getMapContext() {
      if (!this.mapContext) {
        this.mapContext = uni.createMapContext('addressMap', this)
      }

      return this.mapContext
    },
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
      const exactTown = townOptions.find((item) => item === townName)
      const fuzzyTown = townOptions.find((item) => townName && (item.includes(townName) || townName.includes(item)))
      const town = exactTown || fuzzyTown || townOptions[0] || townName || ''
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
      this.setMapCenter(DEFAULT_LATITUDE, DEFAULT_LONGITUDE)
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
    setMapCenter(latitude, longitude) {
      this.ignoreNextRegionChange = true
      this.mapLatitude = Number(latitude) || DEFAULT_LATITUDE
      this.mapLongitude = Number(longitude) || DEFAULT_LONGITUDE
      this.form.latitude = this.mapLatitude
      this.form.longitude = this.mapLongitude
    },
    applyLocationPayload(locationData = {}) {
      const province = this.getProvinceByName(locationData.province) || this.provinceOptions[0] || null

      if (province) {
        this.form.province = province.name
        this.loadProvinceData(province.code)
        this.applyRegionValues(locationData.city, locationData.district, locationData.town)
      } else {
        this.syncRegionByForm()
      }

      this.form.detailAddress = locationData.detailAddress || ''
      this.setMapCenter(locationData.latitude, locationData.longitude)
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
          longitude: data.longitude === 0 || data.longitude ? Number(data.longitude) : DEFAULT_LONGITUDE,
          latitude: data.latitude === 0 || data.latitude ? Number(data.latitude) : DEFAULT_LATITUDE,
          isDefault: data.isDefault === 1 || data.isDefault === true ? 1 : 0
        }
        this.setMapCenter(this.form.latitude, this.form.longitude)
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
    handleKeywordInput(event) {
      const value = event && event.detail ? String(event.detail.value || '') : ''
      this.searchKeyword = value

      if (this.suggestTimer) {
        clearTimeout(this.suggestTimer)
      }

      if (!value.trim()) {
        this.searchResults = []
        return
      }

      this.suggestTimer = setTimeout(() => {
        this.loadSuggestionList(value)
      }, 260)
    },
    async loadSuggestionList(keyword) {
      const normalizedKeyword = keyword ? String(keyword).trim() : ''

      if (!normalizedKeyword) {
        this.searchResults = []
        return
      }

      try {
        const list = await suggestAddress(normalizedKeyword, {
          region: this.form.city || this.form.province || '',
          location: {
            latitude: this.mapLatitude,
            longitude: this.mapLongitude
          }
        })

        if (normalizedKeyword !== String(this.searchKeyword || '').trim()) {
          return
        }

        this.searchResults = Array.isArray(list) ? list : []
      } catch (error) {
        if (normalizedKeyword === String(this.searchKeyword || '').trim()) {
          this.searchResults = []
        }
      }
    },
    async handleSearch() {
      const keyword = this.searchKeyword.trim()

      if (!keyword || this.searching) {
        if (!keyword) {
          uni.showToast({
            title: '请输入地址关键词',
            icon: 'none'
          })
        }
        return
      }

      this.searching = true

      try {
        const list = await searchAddress(keyword, {
          region: this.form.city || this.form.province || '',
          location: {
            latitude: this.mapLatitude,
            longitude: this.mapLongitude
          },
          pageSize: 10
        })
        this.searchResults = Array.isArray(list) ? list : []

        if (this.searchResults.length === 0) {
          uni.showToast({
            title: '未找到相关地址',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: '地址搜索失败',
          icon: 'none'
        })
      } finally {
        this.searching = false
      }
    },
    async handleSelectSearchResult(item) {
      if (!item) {
        return
      }

      this.searchKeyword = item.title || item.address || ''
      this.searchResults = []
      await this.fillFormByCoordinate(item.latitude, item.longitude, {
        title: item.title || '',
        address: item.address || ''
      })
    },
    async handleMapTap(event) {
      const detail = event && event.detail ? event.detail : {}
      const latitude = Number(detail.latitude)
      const longitude = Number(detail.longitude)

      if (!latitude || !longitude) {
        return
      }

      await this.fillFormByCoordinate(latitude, longitude)
    },
    handleMapRegionChange(event) {
      const detail = event && event.detail ? event.detail : {}

      if (detail.type !== 'end') {
        return
      }

      if (this.ignoreNextRegionChange) {
        this.ignoreNextRegionChange = false
        return
      }

      if (this.regionChangeTimer) {
        clearTimeout(this.regionChangeTimer)
      }

      this.regionChangeTimer = setTimeout(() => {
        const mapContext = this.getMapContext()

        if (!mapContext || typeof mapContext.getCenterLocation !== 'function') {
          return
        }

        mapContext.getCenterLocation({
          success: ({ latitude, longitude }) => {
            const nextLatitude = Number(latitude)
            const nextLongitude = Number(longitude)
            const currentLatitude = Number(this.form.latitude)
            const currentLongitude = Number(this.form.longitude)

            if (!nextLatitude || !nextLongitude) {
              return
            }

            if (
              Math.abs(nextLatitude - currentLatitude) < 0.00005
              && Math.abs(nextLongitude - currentLongitude) < 0.00005
            ) {
              return
            }

            this.fillFormByCoordinate(nextLatitude, nextLongitude)
          }
        })
      }, 260)
    },
    async fillFormByCoordinate(latitude, longitude, fallback = {}) {
      try {
        const geocoderResult = await reverseGeocoder(latitude, longitude)
        const payload = buildLocationPayloadByGeocoder(geocoderResult, {
          detailAddress: fallback.title || fallback.address || '',
          latitude,
          longitude
        })
        this.applyLocationPayload(payload)

        uni.showToast({
          title: '地址已回填',
          icon: 'success'
        })
      } catch (error) {
        uni.showToast({
          title: '地址解析失败',
          icon: 'none'
        })
      }
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
        longitude: Number(this.form.longitude) || 0,
        latitude: Number(this.form.latitude) || 0,
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
  margin-bottom: 24rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(32, 37, 43, 0.05);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.section-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2329;
}

.section-head .section-title {
  margin-bottom: 0;
}

.section-tip {
  font-size: 24rpx;
  color: #8a8f99;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.search-input {
  flex: 1;
  height: 84rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: #f7f8fb;
  font-size: 28rpx;
  color: #222222;
  box-sizing: border-box;
}

.search-btn {
  margin: 0;
  width: 140rpx;
  height: 84rpx;
  line-height: 84rpx;
  border: none;
  border-radius: 16rpx;
  background: #d96c3a;
  font-size: 28rpx;
}

.search-btn::after,
.save-btn::after {
  border: none;
}

.search-result-list {
  margin-top: 20rpx;
  border: 2rpx solid #f1f3f6;
  border-radius: 20rpx;
  overflow: hidden;
}

.search-result-item {
  padding: 22rpx 24rpx;
  border-bottom: 2rpx solid #f1f3f6;
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-title {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #1f2329;
}

.result-address {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #7a818d;
}

.map-wrapper {
  position: relative;
  margin-top: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 360rpx;
}

.map-center-pin {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 68rpx;
  height: 68rpx;
  transform: translate(-50%, -100%);
  pointer-events: none;
  z-index: 2;
}

.map-center-pin-image {
  width: 100%;
  height: 100%;
}

.selected-location {
  margin-top: 18rpx;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  background: #fff5ee;
}

.selected-location-label {
  display: block;
  font-size: 24rpx;
  color: #b85d33;
}

.selected-location-text {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #4f5662;
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
</style>

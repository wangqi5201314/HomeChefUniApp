<template>
  <view class="page">
    <view v-if="loading && !pageReady" class="state-card">
      <text class="state-text">服务位置加载中...</text>
    </view>

    <view v-else>
      <view class="intro-card">
        <text class="intro-title">{{ pageTitle }}</text>
        <text class="intro-text">服务位置仅用于系统内部判断服务范围和距离，不会作为家庭住址对外展示。</text>
      </view>

      <view class="form-card">
        <view class="section-head">
          <text class="section-title">基础信息</text>
          <text class="section-desc">先给这个服务位置起个名字，方便后续切换和管理。</text>
        </view>
        <view class="form-item first-item">
          <text class="label">位置名称</text>
          <input
            v-model="form.locationName"
            class="input"
            maxlength="20"
            placeholder="例如：家、工作室、大学城服务点"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <view class="form-card">
        <view class="section-head">
          <text class="section-title">地图搜索</text>
          <text class="section-tip">搜索地址、点击地图或拖动地图后松手，都可自动回填结构化地址和坐标。</text>
        </view>

        <view class="search-bar">
          <input
            v-model="searchKeyword"
            class="search-input"
            confirm-type="search"
            placeholder="搜索小区、街道、写字楼等地址"
            placeholder-class="input-placeholder"
            @confirm="handleSearch"
          />
          <button class="search-btn" type="primary" size="mini" :loading="searching" @click="handleSearch">
            搜索
          </button>
        </view>

        <scroll-view v-if="searchResults.length" class="search-result-list" scroll-y>
          <view
            v-for="(item, index) in searchResults"
            :key="item.id || `${item.title || 'poi'}-${index}`"
            class="search-result-item"
            @click="handleSelectSearchResult(item)"
          >
            <text class="result-title">{{ item.title || '未命名地点' }}</text>
            <text class="result-address">{{ item.address || '暂无详细地址' }}</text>
          </view>
        </scroll-view>

        <view class="map-wrapper">
          <view class="map-guide-banner">
            <text class="map-guide-text">拖动地图，让中心图钉对准你的服务出发地</text>
          </view>
          <map
            id="serviceLocationMap"
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
          <text class="selected-label">当前选中的服务位置</text>
          <text class="selected-text">{{ selectedLocationText }}</text>
        </view>
      </view>

      <view class="form-card">
        <view class="section-head">
          <text class="section-title">结构化地址</text>
          <text class="section-desc">重要字段放在前面，详细说明放在最后补充即可。</text>
        </view>

        <view class="form-item">
          <text class="label">省份</text>
          <picker class="picker" :range="provinceRange" :value="provinceIndex" @change="handleProvinceChange">
            <view class="picker-value" :class="{ 'picker-placeholder': !form.province }">
              {{ form.province || '请选择省份' }}
            </view>
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
          <text class="label">镇/街道</text>
          <picker class="picker" :range="townRange" :value="townIndex" @change="handleTownChange">
            <view class="picker-value" :class="{ 'picker-placeholder': !form.town }">
              {{ form.town || (townOptions.length ? '请选择镇/街道' : '暂无可选镇街') }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">详细地址</text>
          <textarea
            v-model="form.detailAddress"
            class="textarea"
            maxlength="120"
            placeholder="请输入更具体的位置说明，例如某路口、某楼栋、某园区入口"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <view class="bottom-bar">
        <button class="save-btn" type="primary" :loading="saving" :disabled="saving || loading" @click="handleSubmit">
          {{ saving ? '保存中...' : '保存服务位置' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import {
  createChefServiceLocation,
  getChefServiceLocationDetail,
  updateChefServiceLocation
} from '../../api/chef-service-location'
import { getDistrictChildren, getDistrictTree } from '../../utils/tencent-district'
import { buildLocationPayloadByGeocoder, reverseGeocoder, searchAddress } from '../../utils/tencent-map'

const DEFAULT_LATITUDE = 23.12911
const DEFAULT_LONGITUDE = 113.264385
const MARKER_ICON = '/static/service-location-marker.png'

function createDefaultForm() {
  return {
    locationName: '',
    province: '',
    city: '',
    district: '',
    town: '',
    detailAddress: '',
    longitude: DEFAULT_LONGITUDE,
    latitude: DEFAULT_LATITUDE
  }
}

export default {
  name: 'ChefServiceLocationEditPage',
  data() {
    return {
      id: '',
      pageReady: false,
      loading: false,
      saving: false,
      searching: false,
      searchKeyword: '',
      searchResults: [],
      provinceOptions: [],
      currentProvinceCode: '',
      currentProvinceRegion: null,
      mapLatitude: DEFAULT_LATITUDE,
      mapLongitude: DEFAULT_LONGITUDE,
      markerIcon: MARKER_ICON,
      mapContext: null,
      regionChangeTimer: null,
      ignoreNextRegionChange: false,
      form: createDefaultForm()
    }
  },
  computed: {
    pageTitle() {
      return this.id ? '编辑服务位置' : '新增服务位置'
    },
    selectedLocationText() {
      const parts = [
        this.form.province,
        this.form.city,
        this.form.district,
        this.form.town,
        this.form.detailAddress
      ].filter(Boolean)

      return parts.length ? parts.join('') : '暂未设置服务位置'
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
      return this.currentCity.districts
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
    this.id = options && options.id ? String(options.id) : ''
    uni.setNavigationBarTitle({
      title: this.pageTitle
    })

    this.bootstrapPage()
  },
  onUnload() {
    if (this.regionChangeTimer) {
      clearTimeout(this.regionChangeTimer)
      this.regionChangeTimer = null
    }
  },
  methods: {
    async bootstrapPage() {
      try {
        await this.ensureDistrictTreeLoaded()
        await this.initDefaultRegion()

        if (this.id) {
          await this.loadLocationDetail()
        }
      } catch (error) {
        uni.showToast({
          title: '行政区划加载失败',
          icon: 'none'
        })
      } finally {
        this.pageReady = true
      }
    },
    getMapContext() {
      if (!this.mapContext) {
        this.mapContext = uni.createMapContext('serviceLocationMap', this)
      }

      return this.mapContext
    },
    async ensureDistrictTreeLoaded() {
      if (this.provinceOptions.length > 0) {
        return
      }

      const tree = await getDistrictTree()
      this.provinceOptions = tree && Array.isArray(tree.provinces) ? tree.provinces : []
    },
    findOptionByName(list, name) {
      const normalizedName = name ? String(name).trim() : ''

      if (!Array.isArray(list) || !list.length || !normalizedName) {
        return null
      }

      return (
        list.find((item) => item && item.name === normalizedName)
        || list.find((item) => item && item.name && (item.name.includes(normalizedName) || normalizedName.includes(item.name)))
        || null
      )
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
      this.currentProvinceRegion = this.provinceOptions.find((item) => String(item.code) === this.currentProvinceCode) || {
        code: this.currentProvinceCode,
        name: '',
        cities: []
      }
    },
    async ensureTownOptionsLoaded(district) {
      if (!district || !district.code) {
        return []
      }

      if (!district._townsLoaded) {
        try {
          const townList = await getDistrictChildren(district.code)
          district.towns = townList.map((item) => item.name).filter(Boolean)
        } catch (error) {
          district.towns = Array.isArray(district.towns) ? district.towns : []
        }

        district._townsLoaded = true
      }

      return Array.isArray(district.towns) ? district.towns : []
    },
    async applyRegionValues(cityName, districtName, townName) {
      const city = this.findOptionByName(this.cityOptions, cityName) || this.cityOptions[0] || null
      this.form.city = city ? city.name : ''

      const districtOptions = city && Array.isArray(city.districts) ? city.districts : []
      const district =
        this.findOptionByName(districtOptions, districtName) || districtOptions[0] || null
      this.form.district = district ? district.name : ''

      const townOptions = district ? await this.ensureTownOptionsLoaded(district) : []
      const exactTown = townOptions.find((item) => item === townName)
      const fuzzyTown = townOptions.find((item) => townName && (item.includes(townName) || townName.includes(item)))

      if (townOptions.length > 0) {
        this.form.town = exactTown || fuzzyTown || townOptions[0] || ''
      } else {
        this.form.town = townName || ''
      }
    },
    async initDefaultRegion() {
      const firstProvince = this.provinceOptions[0]
      if (!firstProvince) {
        return
      }

      this.form = {
        ...createDefaultForm(),
        locationName: this.form.locationName || '',
        province: firstProvince.name
      }
      this.loadProvinceData(firstProvince.code)
      await this.applyRegionValues('', '', '')
      this.setMapCenter(DEFAULT_LATITUDE, DEFAULT_LONGITUDE)
    },
    async syncRegionByForm() {
      const province = this.getProvinceByName(this.form.province) || this.provinceOptions[0] || null

      if (!province) {
        this.currentProvinceCode = ''
        this.currentProvinceRegion = null
        return
      }

      this.form.province = province.name
      this.loadProvinceData(province.code)
      await this.applyRegionValues(this.form.city, this.form.district, this.form.town)
    },
    setMapCenter(latitude, longitude) {
      this.ignoreNextRegionChange = true
      this.mapLatitude = Number(latitude) || DEFAULT_LATITUDE
      this.mapLongitude = Number(longitude) || DEFAULT_LONGITUDE
      this.form.latitude = this.mapLatitude
      this.form.longitude = this.mapLongitude
    },
    async applyLocationPayload(locationData = {}) {
      const province = this.getProvinceByName(locationData.province) || this.provinceOptions[0] || null

      if (province) {
        this.form.province = province.name
        this.loadProvinceData(province.code)
        await this.applyRegionValues(locationData.city, locationData.district, locationData.town)
      } else {
        await this.syncRegionByForm()
      }

      this.form.detailAddress = locationData.detailAddress || ''
      this.setMapCenter(locationData.latitude, locationData.longitude)
    },
    async loadLocationDetail() {
      this.loading = true

      try {
        const data = await getChefServiceLocationDetail(this.id)
        this.form = {
          locationName: data.locationName || '',
          province: data.province || '',
          city: data.city || '',
          district: data.district || '',
          town: data.town || '',
          detailAddress: data.detailAddress || '',
          longitude: data.longitude === 0 || data.longitude ? Number(data.longitude) : DEFAULT_LONGITUDE,
          latitude: data.latitude === 0 || data.latitude ? Number(data.latitude) : DEFAULT_LATITUDE
        }
        this.setMapCenter(this.form.latitude, this.form.longitude)
        await this.syncRegionByForm()
      } catch (error) {
      } finally {
        this.loading = false
      }
    },
    async handleProvinceChange(event) {
      const index = Number(event.detail.value)
      const province = this.provinceOptions[index]

      if (!province) {
        return
      }

      this.form.province = province.name
      this.loadProvinceData(province.code)
      await this.applyRegionValues('', '', '')
    },
    async handleCityChange(event) {
      const index = Number(event.detail.value)
      const city = this.cityOptions[index]

      if (!city) {
        return
      }

      await this.applyRegionValues(city.name, '', '')
    },
    async handleDistrictChange(event) {
      const index = Number(event.detail.value)
      const district = this.districtOptions[index]

      if (!district) {
        return
      }

      await this.applyRegionValues(this.form.city, district.name, '')
    },
    handleTownChange(event) {
      const index = Number(event.detail.value)
      const town = this.townOptions[index]

      if (!town) {
        return
      }

      this.form.town = town
    },
    async handleSearch() {
      const keyword = this.searchKeyword ? String(this.searchKeyword).trim() : ''

      if (!keyword) {
        uni.showToast({
          title: '请输入搜索关键词',
          icon: 'none'
        })
        return
      }

      this.searching = true
      try {
        const data = await searchAddress(keyword, {
          pageSize: 10,
          region: this.form.city || this.form.province || '',
          location: {
            latitude: this.form.latitude,
            longitude: this.form.longitude
          }
        })
        this.searchResults = Array.isArray(data) ? data : []

        if (!this.searchResults.length) {
          uni.showToast({
            title: '未搜索到相关地点',
            icon: 'none'
          })
        }
      } catch (error) {
        this.searchResults = []
      } finally {
        this.searching = false
      }
    },
    async fillLocationByCoordinate(latitude, longitude, options = {}) {
      uni.showLoading({
        title: '定位中...',
        mask: true
      })

      try {
        const geocoderResult = await reverseGeocoder(latitude, longitude)
        const payload = buildLocationPayloadByGeocoder(geocoderResult, {
          detailAddress: options.detailAddress,
          latitude,
          longitude
        })
        await this.applyLocationPayload(payload)
      } catch (error) {
        if (options.fallback) {
          await this.applyLocationPayload({
            province: options.fallback.province || '',
            city: options.fallback.city || '',
            district: options.fallback.district || '',
            town: '',
            detailAddress: options.detailAddress || options.fallback.detailAddress || '',
            latitude,
            longitude
          })
        } else {
          this.setMapCenter(latitude, longitude)
        }
      } finally {
        uni.hideLoading()
      }
    },
    async handleSelectSearchResult(item) {
      if (!item) {
        return
      }

      this.searchKeyword = item.title || this.searchKeyword
      this.searchResults = []
      await this.fillLocationByCoordinate(item.latitude, item.longitude, {
        detailAddress: item.title || item.address || '',
        fallback: {
          province: item.province || '',
          city: item.city || '',
          district: item.district || '',
          detailAddress: item.title || item.address || ''
        }
      })
    },
    async handleMapTap(event) {
      const detail = event && event.detail ? event.detail : {}
      const latitude = Number(detail.latitude)
      const longitude = Number(detail.longitude)

      if (!latitude || !longitude) {
        return
      }

      await this.fillLocationByCoordinate(latitude, longitude)
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

            this.fillLocationByCoordinate(nextLatitude, nextLongitude)
          }
        })
      }, 260)
    },
    validateForm() {
      if (!this.form.locationName.trim()) {
        uni.showToast({
          title: '请输入位置名称',
          icon: 'none'
        })
        return false
      }

      if (!this.form.province || !this.form.city || !this.form.district) {
        uni.showToast({
          title: '请先选择完整的省市区',
          icon: 'none'
        })
        return false
      }

      if (this.townOptions.length > 0 && !this.form.town) {
        uni.showToast({
          title: '请选择镇或街道',
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

      if (!this.form.latitude || !this.form.longitude) {
        uni.showToast({
          title: '请先通过地图选择服务位置',
          icon: 'none'
        })
        return false
      }

      return true
    },
    buildSubmitPayload() {
      return {
        locationName: this.form.locationName.trim(),
        province: this.form.province,
        city: this.form.city,
        district: this.form.district,
        town: this.form.town || '',
        detailAddress: this.form.detailAddress.trim(),
        longitude: Number(this.form.longitude),
        latitude: Number(this.form.latitude)
      }
    },
    async handleSubmit() {
      if (!this.validateForm() || this.saving) {
        return
      }

      this.saving = true
      try {
        if (this.id) {
          await updateChefServiceLocation(this.id, this.buildSubmitPayload())
        } else {
          await createChefServiceLocation(this.buildSubmitPayload())
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
  padding: 24rpx 24rpx 180rpx;
  background:
    radial-gradient(circle at top right, rgba(47, 143, 85, 0.12), transparent 34%),
    linear-gradient(180deg, #edf7f0 0%, #f6f7fb 36%, #f6f7fb 100%);
  box-sizing: border-box;
}

.state-card,
.intro-card,
.form-card {
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 14rpx 36rpx rgba(28, 39, 31, 0.06);
}

.state-card {
  padding: 96rpx 32rpx;
  text-align: center;
}

.state-text {
  font-size: 28rpx;
  color: #74807b;
}

.intro-card {
  padding: 28rpx;
}

.intro-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2329;
}

.intro-text {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #738078;
}

.form-card {
  margin-top: 24rpx;
  padding: 28rpx;
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #223128;
}

.section-desc {
  font-size: 24rpx;
  line-height: 1.6;
  color: #7a837d;
}

.section-tip {
  font-size: 24rpx;
  color: #7a837d;
  line-height: 1.6;
}

.first-item {
  margin-top: 0;
}

.form-item {
  margin-top: 22rpx;
}

.label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 26rpx;
  color: #738078;
}

.input,
.picker-value,
.textarea,
.search-input {
  width: 100%;
  border-radius: 20rpx;
  background: #f4f7f5;
  box-sizing: border-box;
}

.input,
.picker-value,
.search-input {
  min-height: 84rpx;
  padding: 0 24rpx;
  line-height: 84rpx;
  font-size: 28rpx;
  color: #1f2329;
}

.textarea {
  height: 180rpx;
  padding: 22rpx 24rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #1f2329;
}

.input-placeholder {
  color: #9ea8a2;
}

.picker-placeholder {
  color: #a0a9a4;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 24rpx;
}

.search-btn,
.save-btn {
  border: none;
}

.search-btn {
  min-width: 132rpx;
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 20rpx;
  background: #2f8f55;
  font-size: 28rpx;
}

.search-btn::after,
.save-btn::after {
  border: none;
}

.search-result-list {
  max-height: 320rpx;
  margin-top: 18rpx;
  border-radius: 22rpx;
  background: #f8faf9;
}

.search-result-item {
  padding: 22rpx 24rpx;
  border-bottom: 2rpx solid #edf1ee;
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-title {
  display: block;
  font-size: 28rpx;
  color: #1f2329;
}

.result-address {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #7a837d;
}

.map-wrapper {
  margin-top: 22rpx;
  position: relative;
  overflow: hidden;
  border-radius: 24rpx;
}

.map-guide-banner {
  position: absolute;
  left: 20rpx;
  right: 20rpx;
  top: 20rpx;
  z-index: 3;
  padding: 12rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(31, 35, 41, 0.7);
}

.map-guide-text {
  display: block;
  font-size: 22rpx;
  text-align: center;
  color: #ffffff;
}

.map {
  width: 100%;
  height: 420rpx;
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
  margin-top: 20rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #f7fbf8 0%, #eef7f1 100%);
  box-shadow: inset 0 0 0 2rpx #e3efe7;
}

.selected-label {
  display: block;
  font-size: 24rpx;
  color: #7a837d;
}

.selected-text {
  display: block;
  margin-top: 10rpx;
  font-size: 28rpx;
  line-height: 1.7;
  color: #1f2329;
  word-break: break-all;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 22rpx 24rpx calc(26rpx + env(safe-area-inset-bottom));
  background: rgba(246, 247, 251, 0.96);
  backdrop-filter: blur(10rpx);
  box-sizing: border-box;
}

.save-btn {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 999rpx;
  background: #2f8f55;
  font-size: 30rpx;
  color: #ffffff;
  box-shadow: 0 12rpx 30rpx rgba(47, 143, 85, 0.22);
}
</style>

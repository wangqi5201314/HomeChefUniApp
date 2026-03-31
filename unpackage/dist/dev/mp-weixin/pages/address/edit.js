"use strict";
const common_vendor = require("../../common/vendor.js");
const api_address = require("../../api/address.js");
const utils_tencentDistrict = require("../../utils/tencent-district.js");
const utils_tencentMap = require("../../utils/tencent-map.js");
const USER_ID_KEY = "user_id";
const DEFAULT_LATITUDE = 39.90469;
const DEFAULT_LONGITUDE = 116.40717;
const MARKER_ICON = "/static/service-location-marker.png";
function createDefaultForm() {
  return {
    contactName: "",
    contactPhone: "",
    province: "",
    city: "",
    district: "",
    town: "",
    detailAddress: "",
    longitude: DEFAULT_LONGITUDE,
    latitude: DEFAULT_LATITUDE,
    isDefault: 0
  };
}
const _sfc_main = {
  name: "AddressEditPage",
  data() {
    return {
      id: "",
      userId: "",
      saving: false,
      searching: false,
      provinceOptions: [],
      currentProvinceCode: "",
      currentProvinceRegion: null,
      searchKeyword: "",
      searchResults: [],
      mapLatitude: DEFAULT_LATITUDE,
      mapLongitude: DEFAULT_LONGITUDE,
      markerIcon: MARKER_ICON,
      mapContext: null,
      regionChangeTimer: null,
      suggestTimer: null,
      ignoreNextRegionChange: false,
      form: createDefaultForm()
    };
  },
  computed: {
    selectedLocationText() {
      const parts = [
        this.form.province,
        this.form.city,
        this.form.district,
        this.form.town,
        this.form.detailAddress
      ].filter(Boolean);
      return parts.length > 0 ? parts.join("") : "暂未选择具体位置";
    },
    provinceRange() {
      return this.provinceOptions.map((item) => item.name);
    },
    provinceIndex() {
      const index = this.provinceOptions.findIndex((item) => item.name === this.form.province);
      return index >= 0 ? index : 0;
    },
    cityOptions() {
      return this.currentProvinceRegion && Array.isArray(this.currentProvinceRegion.cities) ? this.currentProvinceRegion.cities : [];
    },
    cityRange() {
      return this.cityOptions.map((item) => item.name);
    },
    cityIndex() {
      const index = this.cityOptions.findIndex((item) => item.name === this.form.city);
      return index >= 0 ? index : 0;
    },
    currentCity() {
      return this.cityOptions.find((item) => item.name === this.form.city) || this.cityOptions[0] || null;
    },
    districtOptions() {
      if (!this.currentCity || !Array.isArray(this.currentCity.districts)) {
        return [];
      }
      return this.currentCity.districts;
    },
    districtRange() {
      return this.districtOptions.map((item) => item.name);
    },
    districtIndex() {
      const index = this.districtOptions.findIndex((item) => item.name === this.form.district);
      return index >= 0 ? index : 0;
    },
    currentDistrict() {
      return this.districtOptions.find((item) => item.name === this.form.district) || this.districtOptions[0] || null;
    },
    townOptions() {
      return this.currentDistrict && Array.isArray(this.currentDistrict.towns) ? this.currentDistrict.towns : [];
    },
    townRange() {
      return this.townOptions;
    },
    townIndex() {
      const index = this.townOptions.findIndex((item) => item === this.form.town);
      return index >= 0 ? index : 0;
    }
  },
  onLoad(options) {
    this.id = options && options.id ? options.id : "";
    this.userId = common_vendor.index.getStorageSync(USER_ID_KEY) || "";
    common_vendor.index.setNavigationBarTitle({
      title: this.id ? "编辑地址" : "新增地址"
    });
    this.bootstrapPage();
  },
  onUnload() {
    if (this.regionChangeTimer) {
      clearTimeout(this.regionChangeTimer);
      this.regionChangeTimer = null;
    }
    if (this.suggestTimer) {
      clearTimeout(this.suggestTimer);
      this.suggestTimer = null;
    }
  },
  methods: {
    async bootstrapPage() {
      try {
        await this.ensureDistrictTreeLoaded();
        if (this.id) {
          await this.loadAddressDetail();
          return;
        }
        await this.initDefaultRegion();
      } catch (error) {
        common_vendor.index.showToast({
          title: "行政区划加载失败",
          icon: "none"
        });
      }
    },
    getMapContext() {
      if (!this.mapContext) {
        this.mapContext = common_vendor.index.createMapContext("addressMap", this);
      }
      return this.mapContext;
    },
    async ensureDistrictTreeLoaded() {
      if (this.provinceOptions.length > 0) {
        return;
      }
      const tree = await utils_tencentDistrict.getDistrictTree();
      this.provinceOptions = tree && Array.isArray(tree.provinces) ? tree.provinces : [];
    },
    findOptionByName(list, name) {
      const normalizedName = name ? String(name).trim() : "";
      if (!Array.isArray(list) || !list.length || !normalizedName) {
        return null;
      }
      return list.find((item) => item && item.name === normalizedName) || list.find((item) => item && item.name && (item.name.includes(normalizedName) || normalizedName.includes(item.name))) || null;
    },
    getProvinceByName(name) {
      return this.provinceOptions.find((item) => item.name === name) || null;
    },
    loadProvinceData(provinceCode) {
      if (!provinceCode) {
        this.currentProvinceCode = "";
        this.currentProvinceRegion = null;
        return;
      }
      this.currentProvinceCode = String(provinceCode);
      this.currentProvinceRegion = this.provinceOptions.find((item) => String(item.code) === this.currentProvinceCode) || {
        code: this.currentProvinceCode,
        name: "",
        cities: []
      };
    },
    async ensureTownOptionsLoaded(district) {
      if (!district || !district.code) {
        return [];
      }
      if (!district._townsLoaded) {
        try {
          const townList = await utils_tencentDistrict.getDistrictChildren(district.code);
          district.towns = townList.map((item) => item.name).filter(Boolean);
        } catch (error) {
          district.towns = Array.isArray(district.towns) ? district.towns : [];
        }
        district._townsLoaded = true;
      }
      return Array.isArray(district.towns) ? district.towns : [];
    },
    async applyRegionValues(cityName, districtName, townName) {
      const city = this.findOptionByName(this.cityOptions, cityName) || this.cityOptions[0] || null;
      this.form.city = city ? city.name : "";
      const districtOptions = city && Array.isArray(city.districts) ? city.districts : [];
      const district = this.findOptionByName(districtOptions, districtName) || districtOptions[0] || null;
      this.form.district = district ? district.name : "";
      const townOptions = district ? await this.ensureTownOptionsLoaded(district) : [];
      const exactTown = townOptions.find((item) => item === townName);
      const fuzzyTown = townOptions.find((item) => townName && (item.includes(townName) || townName.includes(item)));
      if (townOptions.length > 0) {
        this.form.town = exactTown || fuzzyTown || townOptions[0] || "";
      } else {
        this.form.town = townName || "";
      }
    },
    async initDefaultRegion() {
      const firstProvince = this.provinceOptions[0];
      if (!firstProvince) {
        return;
      }
      this.form.province = firstProvince.name;
      this.loadProvinceData(firstProvince.code);
      await this.applyRegionValues("", "", "");
      this.setMapCenter(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
    },
    async syncRegionByForm() {
      const province = this.getProvinceByName(this.form.province) || this.provinceOptions[0] || null;
      if (!province) {
        this.currentProvinceCode = "";
        this.currentProvinceRegion = null;
        return;
      }
      this.form.province = province.name;
      this.loadProvinceData(province.code);
      await this.applyRegionValues(this.form.city, this.form.district, this.form.town);
    },
    setMapCenter(latitude, longitude) {
      this.ignoreNextRegionChange = true;
      this.mapLatitude = Number(latitude) || DEFAULT_LATITUDE;
      this.mapLongitude = Number(longitude) || DEFAULT_LONGITUDE;
      this.form.latitude = this.mapLatitude;
      this.form.longitude = this.mapLongitude;
    },
    async applyLocationPayload(locationData = {}) {
      const province = this.getProvinceByName(locationData.province) || this.provinceOptions[0] || null;
      if (province) {
        this.form.province = province.name;
        this.loadProvinceData(province.code);
        await this.applyRegionValues(locationData.city, locationData.district, locationData.town);
      } else {
        await this.syncRegionByForm();
      }
      this.form.detailAddress = locationData.detailAddress || "";
      this.setMapCenter(locationData.latitude, locationData.longitude);
    },
    async loadAddressDetail() {
      try {
        const data = await api_address.getAddressDetail(this.id);
        this.form = {
          contactName: data.contactName || "",
          contactPhone: data.contactPhone || "",
          province: data.province || "",
          city: data.city || "",
          district: data.district || "",
          town: data.town || "",
          detailAddress: data.detailAddress || "",
          longitude: data.longitude === 0 || data.longitude ? Number(data.longitude) : DEFAULT_LONGITUDE,
          latitude: data.latitude === 0 || data.latitude ? Number(data.latitude) : DEFAULT_LATITUDE,
          isDefault: data.isDefault === 1 || data.isDefault === true ? 1 : 0
        };
        this.setMapCenter(this.form.latitude, this.form.longitude);
        await this.syncRegionByForm();
      } catch (error) {
        await this.initDefaultRegion();
      }
    },
    async handleProvinceChange(event) {
      const index = Number(event.detail.value);
      const province = this.provinceOptions[index];
      if (!province) {
        return;
      }
      this.form.province = province.name;
      this.loadProvinceData(province.code);
      await this.applyRegionValues("", "", "");
    },
    async handleCityChange(event) {
      const index = Number(event.detail.value);
      const city = this.cityOptions[index];
      if (!city) {
        return;
      }
      this.form.city = city.name;
      await this.applyRegionValues(city.name, "", "");
    },
    async handleDistrictChange(event) {
      const index = Number(event.detail.value);
      const district = this.districtOptions[index];
      if (!district) {
        return;
      }
      this.form.district = district.name;
      await this.applyRegionValues(this.form.city, district.name, "");
    },
    handleTownChange(event) {
      const index = Number(event.detail.value);
      const town = this.townOptions[index];
      if (!town) {
        return;
      }
      this.form.town = town;
    },
    handleDefaultChange(event) {
      this.form.isDefault = event.detail.value ? 1 : 0;
    },
    handleKeywordInput(event) {
      const value = event && event.detail ? String(event.detail.value || "") : "";
      this.searchKeyword = value;
      if (this.suggestTimer) {
        clearTimeout(this.suggestTimer);
      }
      if (!value.trim()) {
        this.searchResults = [];
        return;
      }
      this.suggestTimer = setTimeout(() => {
        this.loadSuggestionList(value);
      }, 260);
    },
    async loadSuggestionList(keyword) {
      const normalizedKeyword = keyword ? String(keyword).trim() : "";
      if (!normalizedKeyword) {
        this.searchResults = [];
        return;
      }
      try {
        const list = await utils_tencentMap.suggestAddress(normalizedKeyword, {
          region: this.form.city || this.form.province || "",
          location: {
            latitude: this.mapLatitude,
            longitude: this.mapLongitude
          }
        });
        if (normalizedKeyword !== String(this.searchKeyword || "").trim()) {
          return;
        }
        this.searchResults = Array.isArray(list) ? list : [];
      } catch (error) {
        if (normalizedKeyword === String(this.searchKeyword || "").trim()) {
          this.searchResults = [];
        }
      }
    },
    async handleSearch() {
      const keyword = this.searchKeyword.trim();
      if (!keyword || this.searching) {
        if (!keyword) {
          common_vendor.index.showToast({
            title: "请输入地址关键词",
            icon: "none"
          });
        }
        return;
      }
      this.searching = true;
      try {
        const list = await utils_tencentMap.searchAddress(keyword, {
          region: this.form.city || this.form.province || "",
          location: {
            latitude: this.mapLatitude,
            longitude: this.mapLongitude
          },
          pageSize: 10
        });
        this.searchResults = Array.isArray(list) ? list : [];
        if (this.searchResults.length === 0) {
          common_vendor.index.showToast({
            title: "未找到相关地址",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "地址搜索失败",
          icon: "none"
        });
      } finally {
        this.searching = false;
      }
    },
    async handleSelectSearchResult(item) {
      if (!item) {
        return;
      }
      this.searchKeyword = item.title || item.address || "";
      this.searchResults = [];
      await this.fillFormByCoordinate(item.latitude, item.longitude, {
        title: item.title || "",
        address: item.address || ""
      });
    },
    async handleMapTap(event) {
      const detail = event && event.detail ? event.detail : {};
      const latitude = Number(detail.latitude);
      const longitude = Number(detail.longitude);
      if (!latitude || !longitude) {
        return;
      }
      await this.fillFormByCoordinate(latitude, longitude);
    },
    handleMapRegionChange(event) {
      const detail = event && event.detail ? event.detail : {};
      if (detail.type !== "end") {
        return;
      }
      if (this.ignoreNextRegionChange) {
        this.ignoreNextRegionChange = false;
        return;
      }
      if (this.regionChangeTimer) {
        clearTimeout(this.regionChangeTimer);
      }
      this.regionChangeTimer = setTimeout(() => {
        const mapContext = this.getMapContext();
        if (!mapContext || typeof mapContext.getCenterLocation !== "function") {
          return;
        }
        mapContext.getCenterLocation({
          success: ({ latitude, longitude }) => {
            const nextLatitude = Number(latitude);
            const nextLongitude = Number(longitude);
            const currentLatitude = Number(this.form.latitude);
            const currentLongitude = Number(this.form.longitude);
            if (!nextLatitude || !nextLongitude) {
              return;
            }
            if (Math.abs(nextLatitude - currentLatitude) < 5e-5 && Math.abs(nextLongitude - currentLongitude) < 5e-5) {
              return;
            }
            this.fillFormByCoordinate(nextLatitude, nextLongitude);
          }
        });
      }, 260);
    },
    async fillFormByCoordinate(latitude, longitude, fallback = {}) {
      try {
        const geocoderResult = await utils_tencentMap.reverseGeocoder(latitude, longitude);
        const payload = utils_tencentMap.buildLocationPayloadByGeocoder(geocoderResult, {
          detailAddress: fallback.title || fallback.address || "",
          latitude,
          longitude
        });
        await this.applyLocationPayload(payload);
        common_vendor.index.showToast({
          title: "地址已回填",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.showToast({
          title: "地址解析失败",
          icon: "none"
        });
      }
    },
    validateForm() {
      if (!this.form.contactName.trim()) {
        common_vendor.index.showToast({
          title: "请输入联系人",
          icon: "none"
        });
        return false;
      }
      if (!this.form.contactPhone.trim()) {
        common_vendor.index.showToast({
          title: "请输入联系电话",
          icon: "none"
        });
        return false;
      }
      if (!/^1\d{10}$/.test(this.form.contactPhone.trim())) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号",
          icon: "none"
        });
        return false;
      }
      if (!this.form.province) {
        common_vendor.index.showToast({
          title: "请选择省份",
          icon: "none"
        });
        return false;
      }
      if (!this.form.city) {
        common_vendor.index.showToast({
          title: "请选择城市",
          icon: "none"
        });
        return false;
      }
      if (!this.form.district) {
        common_vendor.index.showToast({
          title: "请选择区县",
          icon: "none"
        });
        return false;
      }
      if (this.townOptions.length > 0 && !this.form.town) {
        common_vendor.index.showToast({
          title: "请选择镇 / 街道",
          icon: "none"
        });
        return false;
      }
      if (!this.form.detailAddress.trim()) {
        common_vendor.index.showToast({
          title: "请输入详细地址",
          icon: "none"
        });
        return false;
      }
      return true;
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
      };
    },
    async handleSubmit() {
      if (this.saving || !this.validateForm()) {
        return;
      }
      if (!this.userId) {
        common_vendor.index.showToast({
          title: "未读取到用户信息",
          icon: "none"
        });
        return;
      }
      this.saving = true;
      try {
        const payload = this.buildPayload();
        if (this.id) {
          await api_address.updateAddress(this.id, payload);
        } else {
          await api_address.createAddress(payload);
        }
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack({
            delta: 1
          });
        }, 300);
      } catch (error) {
      } finally {
        this.saving = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.form.contactName,
    b: common_vendor.o(($event) => $data.form.contactName = $event.detail.value),
    c: $data.form.contactPhone,
    d: common_vendor.o(($event) => $data.form.contactPhone = $event.detail.value),
    e: common_vendor.o([($event) => $data.searchKeyword = $event.detail.value, (...args) => $options.handleKeywordInput && $options.handleKeywordInput(...args)]),
    f: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    g: $data.searchKeyword,
    h: $data.searching,
    i: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    j: $data.searchResults.length > 0
  }, $data.searchResults.length > 0 ? {
    k: common_vendor.f($data.searchResults, (item, index, i0) => {
      return {
        a: common_vendor.t(item.title || "未命名地点"),
        b: common_vendor.t(item.address || "暂无详细地址"),
        c: item.id || `${item.title}-${index}`,
        d: common_vendor.o(($event) => $options.handleSelectSearchResult(item), item.id || `${item.title}-${index}`)
      };
    })
  } : {}, {
    l: $data.mapLatitude,
    m: $data.mapLongitude,
    n: common_vendor.o((...args) => $options.handleMapRegionChange && $options.handleMapRegionChange(...args)),
    o: common_vendor.o((...args) => $options.handleMapTap && $options.handleMapTap(...args)),
    p: $data.markerIcon,
    q: common_vendor.t($options.selectedLocationText),
    r: common_vendor.t($data.form.province || "请选择省份"),
    s: $options.provinceRange,
    t: $options.provinceIndex,
    v: common_vendor.o((...args) => $options.handleProvinceChange && $options.handleProvinceChange(...args)),
    w: common_vendor.t($data.form.city || "请选择城市"),
    x: !$data.form.city ? 1 : "",
    y: $options.cityRange,
    z: $options.cityIndex,
    A: common_vendor.o((...args) => $options.handleCityChange && $options.handleCityChange(...args)),
    B: common_vendor.t($data.form.district || "请选择区县"),
    C: !$data.form.district ? 1 : "",
    D: $options.districtRange,
    E: $options.districtIndex,
    F: common_vendor.o((...args) => $options.handleDistrictChange && $options.handleDistrictChange(...args)),
    G: common_vendor.t($data.form.town || "请选择镇 / 街道"),
    H: !$data.form.town ? 1 : "",
    I: $options.townRange,
    J: $options.townIndex,
    K: common_vendor.o((...args) => $options.handleTownChange && $options.handleTownChange(...args)),
    L: $data.form.detailAddress,
    M: common_vendor.o(($event) => $data.form.detailAddress = $event.detail.value),
    N: Number($data.form.isDefault) === 1,
    O: common_vendor.o((...args) => $options.handleDefaultChange && $options.handleDefaultChange(...args)),
    P: common_vendor.t($data.saving ? "保存中..." : "保存地址"),
    Q: $data.saving,
    R: $data.saving,
    S: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dcb1f0d8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/address/edit.js.map

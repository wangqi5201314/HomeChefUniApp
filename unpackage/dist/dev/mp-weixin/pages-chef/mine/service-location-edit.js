"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefServiceLocation = require("../../api/chef-service-location.js");
const data_address_regions_index = require("../../data/address/regions/index.js");
const utils_tencentMap = require("../../utils/tencent-map.js");
const DEFAULT_LATITUDE = 23.12911;
const DEFAULT_LONGITUDE = 113.264385;
const MARKER_ICON = "/static/service-location-marker.png";
function createDefaultForm() {
  return {
    locationName: "",
    province: "",
    city: "",
    district: "",
    town: "",
    detailAddress: "",
    longitude: DEFAULT_LONGITUDE,
    latitude: DEFAULT_LATITUDE
  };
}
const _sfc_main = {
  name: "ChefServiceLocationEditPage",
  data() {
    return {
      id: "",
      pageReady: false,
      loading: false,
      saving: false,
      searching: false,
      searchKeyword: "",
      searchResults: [],
      provinceOptions: data_address_regions_index.provinceList,
      currentProvinceCode: "",
      currentProvinceRegion: null,
      mapLatitude: DEFAULT_LATITUDE,
      mapLongitude: DEFAULT_LONGITUDE,
      markerIcon: MARKER_ICON,
      mapContext: null,
      regionChangeTimer: null,
      ignoreNextRegionChange: false,
      form: createDefaultForm()
    };
  },
  computed: {
    pageTitle() {
      return this.id ? "编辑服务位置" : "新增服务位置";
    },
    selectedLocationText() {
      const parts = [
        this.form.province,
        this.form.city,
        this.form.district,
        this.form.town,
        this.form.detailAddress
      ].filter(Boolean);
      return parts.length ? parts.join("") : "暂未设置服务位置";
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
      const districtsWithTown = this.currentCity.districts.filter(
        (item) => Array.isArray(item.towns) && item.towns.length > 0
      );
      return districtsWithTown.length ? districtsWithTown : this.currentCity.districts;
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
    this.id = options && options.id ? String(options.id) : "";
    common_vendor.index.setNavigationBarTitle({
      title: this.pageTitle
    });
    this.initDefaultRegion();
    this.pageReady = true;
    if (this.id) {
      this.loadLocationDetail();
    }
  },
  onUnload() {
    if (this.regionChangeTimer) {
      clearTimeout(this.regionChangeTimer);
      this.regionChangeTimer = null;
    }
  },
  methods: {
    getMapContext() {
      if (!this.mapContext) {
        this.mapContext = common_vendor.index.createMapContext("serviceLocationMap", this);
      }
      return this.mapContext;
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
      this.currentProvinceRegion = data_address_regions_index.loadProvinceRegion(this.currentProvinceCode) || {
        code: this.currentProvinceCode,
        name: "",
        cities: []
      };
    },
    applyRegionValues(cityName, districtName, townName) {
      const city = this.cityOptions.find((item) => item.name === cityName) || this.cityOptions[0] || null;
      this.form.city = city ? city.name : "";
      const districtOptions = city && Array.isArray(city.districts) ? city.districts : [];
      const districtsWithTown = districtOptions.filter(
        (item) => Array.isArray(item.towns) && item.towns.length > 0
      );
      const availableDistricts = districtsWithTown.length ? districtsWithTown : districtOptions;
      const district = availableDistricts.find((item) => item.name === districtName) || availableDistricts[0] || null;
      this.form.district = district ? district.name : "";
      const townOptions = district && Array.isArray(district.towns) ? district.towns : [];
      const exactTown = townOptions.find((item) => item === townName);
      const fuzzyTown = townOptions.find((item) => townName && (item.includes(townName) || townName.includes(item)));
      this.form.town = exactTown || fuzzyTown || townOptions[0] || townName || "";
    },
    initDefaultRegion() {
      const firstProvince = this.provinceOptions[0];
      if (!firstProvince) {
        return;
      }
      this.form = {
        ...createDefaultForm(),
        locationName: this.form.locationName || "",
        province: firstProvince.name
      };
      this.loadProvinceData(firstProvince.code);
      this.applyRegionValues("", "", "");
      this.setMapCenter(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
    },
    syncRegionByForm() {
      const province = this.getProvinceByName(this.form.province) || this.provinceOptions[0] || null;
      if (!province) {
        this.currentProvinceCode = "";
        this.currentProvinceRegion = null;
        return;
      }
      this.form.province = province.name;
      this.loadProvinceData(province.code);
      this.applyRegionValues(this.form.city, this.form.district, this.form.town);
    },
    setMapCenter(latitude, longitude) {
      this.ignoreNextRegionChange = true;
      this.mapLatitude = Number(latitude) || DEFAULT_LATITUDE;
      this.mapLongitude = Number(longitude) || DEFAULT_LONGITUDE;
      this.form.latitude = this.mapLatitude;
      this.form.longitude = this.mapLongitude;
    },
    applyLocationPayload(locationData = {}) {
      const province = this.getProvinceByName(locationData.province) || this.provinceOptions[0] || null;
      if (province) {
        this.form.province = province.name;
        this.loadProvinceData(province.code);
        this.applyRegionValues(locationData.city, locationData.district, locationData.town);
      } else {
        this.syncRegionByForm();
      }
      this.form.detailAddress = locationData.detailAddress || "";
      this.setMapCenter(locationData.latitude, locationData.longitude);
    },
    async loadLocationDetail() {
      this.loading = true;
      try {
        const data = await api_chefServiceLocation.getChefServiceLocationDetail(this.id);
        this.form = {
          locationName: data.locationName || "",
          province: data.province || "",
          city: data.city || "",
          district: data.district || "",
          town: data.town || "",
          detailAddress: data.detailAddress || "",
          longitude: data.longitude === 0 || data.longitude ? Number(data.longitude) : DEFAULT_LONGITUDE,
          latitude: data.latitude === 0 || data.latitude ? Number(data.latitude) : DEFAULT_LATITUDE
        };
        this.setMapCenter(this.form.latitude, this.form.longitude);
        this.syncRegionByForm();
      } catch (error) {
      } finally {
        this.loading = false;
      }
    },
    handleProvinceChange(event) {
      const index = Number(event.detail.value);
      const province = this.provinceOptions[index];
      if (!province) {
        return;
      }
      this.form.province = province.name;
      this.loadProvinceData(province.code);
      this.applyRegionValues("", "", "");
    },
    handleCityChange(event) {
      const index = Number(event.detail.value);
      const city = this.cityOptions[index];
      if (!city) {
        return;
      }
      this.applyRegionValues(city.name, "", "");
    },
    handleDistrictChange(event) {
      const index = Number(event.detail.value);
      const district = this.districtOptions[index];
      if (!district) {
        return;
      }
      this.applyRegionValues(this.form.city, district.name, "");
    },
    handleTownChange(event) {
      const index = Number(event.detail.value);
      const town = this.townOptions[index];
      if (!town) {
        return;
      }
      this.form.town = town;
    },
    async handleSearch() {
      const keyword = this.searchKeyword ? String(this.searchKeyword).trim() : "";
      if (!keyword) {
        common_vendor.index.showToast({
          title: "请输入搜索关键词",
          icon: "none"
        });
        return;
      }
      this.searching = true;
      try {
        const data = await utils_tencentMap.searchAddress(keyword, {
          pageSize: 10,
          region: this.form.city || this.form.province || "",
          location: {
            latitude: this.form.latitude,
            longitude: this.form.longitude
          }
        });
        this.searchResults = Array.isArray(data) ? data : [];
        if (!this.searchResults.length) {
          common_vendor.index.showToast({
            title: "未搜索到相关地点",
            icon: "none"
          });
        }
      } catch (error) {
        this.searchResults = [];
      } finally {
        this.searching = false;
      }
    },
    async fillLocationByCoordinate(latitude, longitude, options = {}) {
      common_vendor.index.showLoading({
        title: "定位中...",
        mask: true
      });
      try {
        const geocoderResult = await utils_tencentMap.reverseGeocoder(latitude, longitude);
        const payload = utils_tencentMap.buildLocationPayloadByGeocoder(geocoderResult, {
          detailAddress: options.detailAddress,
          latitude,
          longitude
        });
        this.applyLocationPayload(payload);
      } catch (error) {
        if (options.fallback) {
          this.applyLocationPayload({
            province: options.fallback.province || "",
            city: options.fallback.city || "",
            district: options.fallback.district || "",
            town: "",
            detailAddress: options.detailAddress || options.fallback.detailAddress || "",
            latitude,
            longitude
          });
        } else {
          this.setMapCenter(latitude, longitude);
        }
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    async handleSelectSearchResult(item) {
      if (!item) {
        return;
      }
      this.searchKeyword = item.title || this.searchKeyword;
      this.searchResults = [];
      await this.fillLocationByCoordinate(item.latitude, item.longitude, {
        detailAddress: item.title || item.address || "",
        fallback: {
          province: item.province || "",
          city: item.city || "",
          district: item.district || "",
          detailAddress: item.title || item.address || ""
        }
      });
    },
    async handleMapTap(event) {
      const detail = event && event.detail ? event.detail : {};
      const latitude = Number(detail.latitude);
      const longitude = Number(detail.longitude);
      if (!latitude || !longitude) {
        return;
      }
      await this.fillLocationByCoordinate(latitude, longitude);
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
            this.fillLocationByCoordinate(nextLatitude, nextLongitude);
          }
        });
      }, 260);
    },
    validateForm() {
      if (!this.form.locationName.trim()) {
        common_vendor.index.showToast({
          title: "请输入位置名称",
          icon: "none"
        });
        return false;
      }
      if (!this.form.province || !this.form.city || !this.form.district) {
        common_vendor.index.showToast({
          title: "请先选择完整的省市区",
          icon: "none"
        });
        return false;
      }
      if (this.townOptions.length > 0 && !this.form.town) {
        common_vendor.index.showToast({
          title: "请选择镇或街道",
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
      if (!this.form.latitude || !this.form.longitude) {
        common_vendor.index.showToast({
          title: "请先通过地图选择服务位置",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    buildSubmitPayload() {
      return {
        locationName: this.form.locationName.trim(),
        province: this.form.province,
        city: this.form.city,
        district: this.form.district,
        town: this.form.town || "",
        detailAddress: this.form.detailAddress.trim(),
        longitude: Number(this.form.longitude),
        latitude: Number(this.form.latitude)
      };
    },
    async handleSubmit() {
      if (!this.validateForm() || this.saving) {
        return;
      }
      this.saving = true;
      try {
        if (this.id) {
          await api_chefServiceLocation.updateChefServiceLocation(this.id, this.buildSubmitPayload());
        } else {
          await api_chefServiceLocation.createChefServiceLocation(this.buildSubmitPayload());
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
    a: $data.loading && !$data.pageReady
  }, $data.loading && !$data.pageReady ? {} : common_vendor.e({
    b: common_vendor.t($options.pageTitle),
    c: $data.form.locationName,
    d: common_vendor.o(($event) => $data.form.locationName = $event.detail.value),
    e: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    f: $data.searchKeyword,
    g: common_vendor.o(($event) => $data.searchKeyword = $event.detail.value),
    h: $data.searching,
    i: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    j: $data.searchResults.length
  }, $data.searchResults.length ? {
    k: common_vendor.f($data.searchResults, (item, index, i0) => {
      return {
        a: common_vendor.t(item.title || "未命名地点"),
        b: common_vendor.t(item.address || "暂无详细地址"),
        c: item.id || `${item.title || "poi"}-${index}`,
        d: common_vendor.o(($event) => $options.handleSelectSearchResult(item), item.id || `${item.title || "poi"}-${index}`)
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
    s: !$data.form.province ? 1 : "",
    t: $options.provinceRange,
    v: $options.provinceIndex,
    w: common_vendor.o((...args) => $options.handleProvinceChange && $options.handleProvinceChange(...args)),
    x: common_vendor.t($data.form.city || "请选择城市"),
    y: !$data.form.city ? 1 : "",
    z: $options.cityRange,
    A: $options.cityIndex,
    B: common_vendor.o((...args) => $options.handleCityChange && $options.handleCityChange(...args)),
    C: common_vendor.t($data.form.district || "请选择区县"),
    D: !$data.form.district ? 1 : "",
    E: $options.districtRange,
    F: $options.districtIndex,
    G: common_vendor.o((...args) => $options.handleDistrictChange && $options.handleDistrictChange(...args)),
    H: common_vendor.t($data.form.town || ($options.townOptions.length ? "请选择镇/街道" : "暂无可选镇街")),
    I: !$data.form.town ? 1 : "",
    J: $options.townRange,
    K: $options.townIndex,
    L: common_vendor.o((...args) => $options.handleTownChange && $options.handleTownChange(...args)),
    M: $data.form.detailAddress,
    N: common_vendor.o(($event) => $data.form.detailAddress = $event.detail.value),
    O: common_vendor.t($data.saving ? "保存中..." : "保存服务位置"),
    P: $data.saving,
    Q: $data.saving || $data.loading,
    R: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  }));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c3d606db"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/mine/service-location-edit.js.map

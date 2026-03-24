"use strict";
const common_vendor = require("../../common/vendor.js");
const api_address = require("../../api/address.js");
const data_address_regions_index = require("../../data/address/regions/index.js");
const utils_tencentMap = require("../../utils/tencent-map.js");
const USER_ID_KEY = "user_id";
const DEFAULT_LATITUDE = 39.90469;
const DEFAULT_LONGITUDE = 116.40717;
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
      provinceOptions: data_address_regions_index.provinceList,
      currentProvinceCode: "",
      currentProvinceRegion: null,
      searchKeyword: "",
      searchResults: [],
      mapLatitude: DEFAULT_LATITUDE,
      mapLongitude: DEFAULT_LONGITUDE,
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
      const usableDistricts = this.currentCity.districts.filter(
        (item) => Array.isArray(item.towns) && item.towns.length > 0
      );
      return usableDistricts.length > 0 ? usableDistricts : this.currentCity.districts;
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
    if (this.id) {
      this.loadAddressDetail();
      return;
    }
    this.initDefaultRegion();
  },
  methods: {
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
      const usableDistricts = districtOptions.filter(
        (item) => Array.isArray(item.towns) && item.towns.length > 0
      );
      const availableDistricts = usableDistricts.length > 0 ? usableDistricts : districtOptions;
      const district = availableDistricts.find((item) => item.name === districtName) || availableDistricts[0] || null;
      this.form.district = district ? district.name : "";
      const townOptions = district && Array.isArray(district.towns) ? district.towns : [];
      const exactTown = townOptions.find((item) => item === townName);
      const fuzzyTown = townOptions.find((item) => townName && (item.includes(townName) || townName.includes(item)));
      const town = exactTown || fuzzyTown || townOptions[0] || townName || "";
      this.form.town = town;
    },
    initDefaultRegion() {
      const firstProvince = this.provinceOptions[0];
      if (!firstProvince) {
        return;
      }
      this.form.province = firstProvince.name;
      this.loadProvinceData(firstProvince.code);
      this.applyRegionValues("", "", "");
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
      this.mapLatitude = Number(latitude) || DEFAULT_LATITUDE;
      this.mapLongitude = Number(longitude) || DEFAULT_LONGITUDE;
      this.form.latitude = this.mapLatitude;
      this.form.longitude = this.mapLongitude;
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
        this.syncRegionByForm();
      } catch (error) {
        this.initDefaultRegion();
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
      this.form.city = city.name;
      this.applyRegionValues(city.name, "", "");
    },
    handleDistrictChange(event) {
      const index = Number(event.detail.value);
      const district = this.districtOptions[index];
      if (!district) {
        return;
      }
      this.form.district = district.name;
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
    handleDefaultChange(event) {
      this.form.isDefault = event.detail.value ? 1 : 0;
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
    extractTownName(result, simplify) {
      return result.address_reference && result.address_reference.town && (result.address_reference.town.title || result.address_reference.town.name) || result.address_component && result.address_component.street || simplify.street || "";
    },
    extractDetailAddress(result, simplify, fallback) {
      const precise = [simplify.street, simplify.street_number].filter(Boolean).join("");
      if (precise) {
        return precise;
      }
      if (fallback && fallback.title) {
        return fallback.title;
      }
      return simplify.recommend || simplify.rough || result.formatted_addresses && result.formatted_addresses.recommend || "";
    },
    async fillFormByCoordinate(latitude, longitude, fallback = {}) {
      try {
        this.setMapCenter(latitude, longitude);
        const data = await utils_tencentMap.reverseGeocoder(latitude, longitude);
        const province = data.province || "";
        const city = data.city || "";
        const district = data.district || "";
        const town = data.town || "";
        const detailAddress = this.extractDetailAddress(data.raw, data.simplify, fallback);
        if (province) {
          this.form.province = province;
          const provinceItem = this.getProvinceByName(province);
          if (provinceItem) {
            this.loadProvinceData(provinceItem.code);
          }
        }
        this.applyRegionValues(city, district, town);
        if (detailAddress) {
          this.form.detailAddress = detailAddress;
        }
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
      if (!this.form.town) {
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
    e: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    f: $data.searchKeyword,
    g: common_vendor.o(($event) => $data.searchKeyword = $event.detail.value),
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
    n: common_vendor.o((...args) => $options.handleMapTap && $options.handleMapTap(...args)),
    o: common_vendor.t($options.selectedLocationText),
    p: common_vendor.t($data.form.province || "请选择省份"),
    q: $options.provinceRange,
    r: $options.provinceIndex,
    s: common_vendor.o((...args) => $options.handleProvinceChange && $options.handleProvinceChange(...args)),
    t: common_vendor.t($data.form.city || "请选择城市"),
    v: !$data.form.city ? 1 : "",
    w: $options.cityRange,
    x: $options.cityIndex,
    y: common_vendor.o((...args) => $options.handleCityChange && $options.handleCityChange(...args)),
    z: common_vendor.t($data.form.district || "请选择区县"),
    A: !$data.form.district ? 1 : "",
    B: $options.districtRange,
    C: $options.districtIndex,
    D: common_vendor.o((...args) => $options.handleDistrictChange && $options.handleDistrictChange(...args)),
    E: common_vendor.t($data.form.town || "请选择镇 / 街道"),
    F: !$data.form.town ? 1 : "",
    G: $options.townRange,
    H: $options.townIndex,
    I: common_vendor.o((...args) => $options.handleTownChange && $options.handleTownChange(...args)),
    J: $data.form.detailAddress,
    K: common_vendor.o(($event) => $data.form.detailAddress = $event.detail.value),
    L: Number($data.form.isDefault) === 1,
    M: common_vendor.o((...args) => $options.handleDefaultChange && $options.handleDefaultChange(...args)),
    N: common_vendor.t($data.saving ? "保存中..." : "保存地址"),
    O: $data.saving,
    P: $data.saving,
    Q: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dcb1f0d8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/address/edit.js.map

"use strict";
const common_vendor = require("../../common/vendor.js");
const api_address = require("../../api/address.js");
const api_chef = require("../../api/chef.js");
const utils_chefServiceMode = require("../../utils/chef-service-mode.js");
const utils_config = require("../../utils/config.js");
const utils_sortOptions = require("../../utils/sort-options.js");
const utils_timeSlot = require("../../utils/time-slot.js");
const USER_ID_KEY = "user_id";
const SELECTED_ADDRESS_KEY = "selected_address";
const HOME_BANNER_PATHS = ["/banner/dish1.png", "/banner/dish2.png", "/banner/dish3.png"];
const INGREDIENT_MODE_OPTIONS = [
  { label: "用户自备食材", value: 1 },
  { label: "平台协同采购", value: 2 }
];
function getTodayDate() {
  const date = /* @__PURE__ */ new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function buildOssImageUrl(path) {
  if (!path) {
    return "";
  }
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const baseUrl = `${utils_config.OSS_PUBLIC_BASE_URL}`.trim().replace(/\/+$/, "");
  if (!baseUrl) {
    return "";
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
const _sfc_main = {
  name: "HomePage",
  data() {
    return {
      bannerList: [
        {
          kicker: "同城精选",
          title: "上门私厨 更省心",
          desc: "按地址、时段和食材模式智能推荐更合适的厨师。",
          themeClass: "banner-theme-warm"
        },
        {
          kicker: "预约灵活",
          title: "早餐午餐晚餐都可约",
          desc: "支持按日期和时间段筛选，快速找到可服务档期。",
          themeClass: "banner-theme-fresh"
        },
        {
          kicker: "安心下单",
          title: "评分、订单量、距离一目了然",
          desc: "结合服务半径和当前地址，挑选更适合你的厨师。",
          themeClass: "banner-theme-sun"
        }
      ],
      userId: "",
      loading: false,
      chefList: [],
      selectedAddress: null,
      advancedFilterVisible: false,
      currentRecommendMode: "default",
      form: {
        ingredientMode: 1,
        serviceDate: getTodayDate(),
        timeSlot: "DINNER",
        sortType: "DEFAULT"
      }
    };
  },
  computed: {
    ingredientModeOptions() {
      return INGREDIENT_MODE_OPTIONS;
    },
    hasAddress() {
      return Boolean(this.selectedAddress && this.selectedAddress.id);
    },
    selectedAddressText() {
      if (!this.hasAddress) {
        return "";
      }
      const address = this.selectedAddress || {};
      return [
        address.province,
        address.city,
        address.district,
        address.town,
        address.detailAddress
      ].filter(Boolean).join("");
    },
    timeSlotRange() {
      return utils_timeSlot.TIME_SLOT_OPTIONS.map((item) => item.label);
    },
    timeSlotIndex() {
      const index = utils_timeSlot.TIME_SLOT_OPTIONS.findIndex((item) => item.value === this.form.timeSlot);
      return index >= 0 ? index : 0;
    },
    timeSlotText() {
      return utils_timeSlot.getTimeSlotText(this.form.timeSlot);
    },
    sortTypeRange() {
      return utils_sortOptions.SORT_OPTIONS.map((item) => item.label);
    },
    sortTypeIndex() {
      const index = utils_sortOptions.SORT_OPTIONS.findIndex((item) => item.value === this.form.sortType);
      return index >= 0 ? index : 0;
    },
    sortTypeText() {
      return utils_sortOptions.getSortTypeText(this.form.sortType);
    }
  },
  onLoad() {
    this.resetBannerList();
    this.userId = common_vendor.index.getStorageSync(USER_ID_KEY) || "";
  },
  onShow() {
    this.initializePage();
  },
  onPullDownRefresh() {
    this.initializePage({
      fromPullDownRefresh: true
    });
  },
  methods: {
    getChefServiceModeText: utils_chefServiceMode.getChefServiceModeText,
    resetBannerList() {
      this.bannerList = HOME_BANNER_PATHS.map((path, index) => ({
        id: index + 1,
        imageUrl: buildOssImageUrl(path)
      }));
    },
    async initializePage(options = {}) {
      const { fromPullDownRefresh = false } = options;
      try {
        await this.loadCurrentAddress();
        await this.fetchRecommendList({
          silent: !this.hasAddress
        });
      } finally {
        if (fromPullDownRefresh) {
          common_vendor.index.stopPullDownRefresh();
        }
      }
    },
    async loadCurrentAddress() {
      const selectedAddress = common_vendor.index.getStorageSync(SELECTED_ADDRESS_KEY);
      if (selectedAddress && selectedAddress.id) {
        this.selectedAddress = selectedAddress;
        return;
      }
      if (!this.userId) {
        this.selectedAddress = null;
        this.chefList = [];
        return;
      }
      try {
        const data = await api_address.getDefaultUserAddressSilently({
          userId: this.userId
        });
        this.selectedAddress = data && data.id ? data : null;
      } catch (error) {
        this.selectedAddress = null;
      }
    },
    async fetchRecommendList(options = {}) {
      if (!this.userId || !this.hasAddress) {
        this.chefList = [];
        this.loading = false;
        return;
      }
      this.loading = true;
      try {
        const data = this.currentRecommendMode === "advanced" ? await api_chef.recommendChefs({
          userId: Number(this.userId),
          addressId: Number(this.selectedAddress.id),
          ingredientMode: Number(this.form.ingredientMode),
          serviceDate: this.form.serviceDate,
          timeSlot: this.form.timeSlot,
          sortType: this.form.sortType
        }) : await api_chef.getDefaultRecommendChefs({
          userId: Number(this.userId),
          addressId: Number(this.selectedAddress.id)
        });
        this.chefList = Array.isArray(data) ? data : [];
      } catch (error) {
        this.chefList = [];
      } finally {
        this.loading = false;
      }
    },
    goSelectAddress() {
      common_vendor.index.navigateTo({
        url: "/pages/address/list?mode=select"
      });
    },
    toggleAdvancedFilter() {
      this.advancedFilterVisible = !this.advancedFilterVisible;
    },
    handleAdvancedQuery() {
      this.currentRecommendMode = "advanced";
      this.fetchRecommendList();
    },
    handleIngredientModeChange(value) {
      if (this.form.ingredientMode === value) {
        return;
      }
      this.form.ingredientMode = value;
    },
    handleDateChange(event) {
      const value = event && event.detail ? event.detail.value : "";
      if (!value || value === this.form.serviceDate) {
        return;
      }
      this.form.serviceDate = value;
    },
    handleTimeSlotChange(event) {
      const index = Number(event.detail.value);
      const selected = utils_timeSlot.TIME_SLOT_OPTIONS[index];
      if (!selected || selected.value === this.form.timeSlot) {
        return;
      }
      this.form.timeSlot = selected.value;
    },
    handleSortTypeChange(event) {
      const index = Number(event.detail.value);
      const selected = utils_sortOptions.SORT_OPTIONS[index];
      if (!selected || selected.value === this.form.sortType) {
        return;
      }
      this.form.sortType = selected.value;
    },
    goToDetail(id) {
      if (!id) {
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/chef/detail?id=${id}`
      });
    },
    getNameInitial(name) {
      return name ? String(name).slice(0, 1) : "厨";
    },
    formatExperience(value) {
      if (value === 0) {
        return "0 年";
      }
      return value || value === 0 ? `${value} 年` : "-";
    },
    formatNumber(value) {
      if (value === 0) {
        return "0";
      }
      return value || "-";
    },
    formatCount(value) {
      if (value === 0) {
        return "0";
      }
      return value || "-";
    },
    formatRate(value) {
      if (value === 0) {
        return "0%";
      }
      if (!value) {
        return "-";
      }
      const numericValue = Number(value);
      if (Number.isNaN(numericValue)) {
        return String(value);
      }
      return numericValue > 1 ? `${numericValue.toFixed(2)}%` : `${(numericValue * 100).toFixed(2)}%`;
    },
    formatRadius(value) {
      if (value === 0) {
        return "0 km";
      }
      return value || value === 0 ? `${Number(value).toFixed(2).replace(/\.00$/, "")} km` : "-";
    },
    formatDistance(value) {
      if (value === 0) {
        return "距离你 0 km";
      }
      if (!value && value !== 0) {
        return "距离信息暂缺";
      }
      return `距离你 ${Number(value).toFixed(2)} km`;
    },
    hasNearestAvailability(item) {
      return Boolean(item && (item.nearestAvailableDate || item.nearestAvailableTimeSlotDesc || item.nearestAvailableTimeSlot));
    },
    formatNearestAvailability(item) {
      if (!item) {
        return "-";
      }
      const parts = [
        item.nearestAvailableDate,
        item.nearestAvailableTimeSlotDesc || utils_timeSlot.getTimeSlotText(item.nearestAvailableTimeSlot)
      ].filter(Boolean);
      return parts.length ? parts.join(" ") : "-";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.bannerList, (item, k0, i0) => {
      return common_vendor.e({
        a: item.imageUrl
      }, item.imageUrl ? {
        b: item.imageUrl
      } : {}, {
        c: item.id || item.title
      });
    }),
    b: $options.hasAddress
  }, $options.hasAddress ? {
    c: common_vendor.t($options.selectedAddressText)
  } : {}, {
    d: common_vendor.o((...args) => $options.goSelectAddress && $options.goSelectAddress(...args)),
    e: common_vendor.t($data.advancedFilterVisible ? "调整筛选项后，点击下方查询按钮再刷新结果" : "默认先展示最近 7 天可预约厨师，点此再按条件精查"),
    f: common_vendor.t($data.advancedFilterVisible ? "收起" : "展开"),
    g: common_vendor.o((...args) => $options.toggleAdvancedFilter && $options.toggleAdvancedFilter(...args)),
    h: $data.advancedFilterVisible
  }, $data.advancedFilterVisible ? {
    i: common_vendor.f($options.ingredientModeOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: $data.form.ingredientMode === item.value ? 1 : "",
        c: item.value,
        d: $data.form.ingredientMode === item.value ? 1 : "",
        e: common_vendor.o(($event) => $options.handleIngredientModeChange(item.value), item.value)
      };
    }),
    j: common_vendor.t($data.form.serviceDate || "请选择服务日期"),
    k: $data.form.serviceDate,
    l: common_vendor.o((...args) => $options.handleDateChange && $options.handleDateChange(...args)),
    m: common_vendor.t($options.timeSlotText),
    n: $options.timeSlotRange,
    o: $options.timeSlotIndex,
    p: common_vendor.o((...args) => $options.handleTimeSlotChange && $options.handleTimeSlotChange(...args)),
    q: common_vendor.t($options.sortTypeText),
    r: $options.sortTypeRange,
    s: $options.sortTypeIndex,
    t: common_vendor.o((...args) => $options.handleSortTypeChange && $options.handleSortTypeChange(...args)),
    v: $data.loading,
    w: $data.loading || !$options.hasAddress,
    x: common_vendor.o((...args) => $options.handleAdvancedQuery && $options.handleAdvancedQuery(...args))
  } : {}, {
    y: !$options.hasAddress
  }, !$options.hasAddress ? {
    z: common_vendor.o((...args) => $options.goSelectAddress && $options.goSelectAddress(...args))
  } : $data.loading && !$data.chefList.length ? {} : !$data.loading && $data.chefList.length === 0 ? {} : common_vendor.e({
    C: $data.loading
  }, $data.loading ? {} : {}, {
    D: common_vendor.f($data.chefList, (item, k0, i0) => {
      return common_vendor.e({
        a: item.avatar
      }, item.avatar ? {
        b: item.avatar
      } : {
        c: common_vendor.t($options.getNameInitial(item.name))
      }, {
        d: common_vendor.t(item.name || "未命名厨师"),
        e: common_vendor.t(item.specialtyCuisine || "-"),
        f: common_vendor.t($options.formatDistance(item.distanceKm)),
        g: common_vendor.t(item.serviceAreaText || "暂未设置服务地址"),
        h: common_vendor.t($options.formatNumber(item.ratingAvg)),
        i: common_vendor.t($options.formatCount(item.orderCount)),
        j: common_vendor.t($options.formatRate(item.goodReviewRate)),
        k: common_vendor.t(item.serviceModeDesc || $options.getChefServiceModeText(item.serviceMode)),
        l: common_vendor.t($options.formatRadius(item.serviceRadiusKm)),
        m: $options.hasNearestAvailability(item)
      }, $options.hasNearestAvailability(item) ? {
        n: common_vendor.t($options.formatNearestAvailability(item))
      } : {}, {
        o: common_vendor.t($options.formatExperience(item.yearsOfExperience)),
        p: item.id,
        q: common_vendor.o(($event) => $options.goToDetail(item.id), item.id)
      });
    })
  }), {
    A: $data.loading && !$data.chefList.length,
    B: !$data.loading && $data.chefList.length === 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4978fed5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/index.js.map

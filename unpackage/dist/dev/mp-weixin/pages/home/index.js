"use strict";
const common_vendor = require("../../common/vendor.js");
const api_address = require("../../api/address.js");
const api_chef = require("../../api/chef.js");
const utils_chefServiceMode = require("../../utils/chef-service-mode.js");
const utils_sortOptions = require("../../utils/sort-options.js");
const utils_timeSlot = require("../../utils/time-slot.js");
const USER_ID_KEY = "user_id";
const SELECTED_ADDRESS_KEY = "selected_address";
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
        const data = await api_address.getDefaultUserAddress({
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
        const data = await api_chef.recommendChefs({
          userId: Number(this.userId),
          addressId: Number(this.selectedAddress.id),
          ingredientMode: Number(this.form.ingredientMode),
          serviceDate: this.form.serviceDate,
          timeSlot: this.form.timeSlot,
          sortType: this.form.sortType
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
    handleIngredientModeChange(value) {
      if (this.form.ingredientMode === value) {
        return;
      }
      this.form.ingredientMode = value;
      this.fetchRecommendList();
    },
    handleDateChange(event) {
      const value = event && event.detail ? event.detail.value : "";
      if (!value || value === this.form.serviceDate) {
        return;
      }
      this.form.serviceDate = value;
      this.fetchRecommendList();
    },
    handleTimeSlotChange(event) {
      const index = Number(event.detail.value);
      const selected = utils_timeSlot.TIME_SLOT_OPTIONS[index];
      if (!selected || selected.value === this.form.timeSlot) {
        return;
      }
      this.form.timeSlot = selected.value;
      this.fetchRecommendList();
    },
    handleSortTypeChange(event) {
      const index = Number(event.detail.value);
      const selected = utils_sortOptions.SORT_OPTIONS[index];
      if (!selected || selected.value === this.form.sortType) {
        return;
      }
      this.form.sortType = selected.value;
      this.fetchRecommendList();
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
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.bannerList, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.kicker),
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.desc),
        d: common_vendor.n(item.themeClass),
        e: item.title
      };
    }),
    b: $options.hasAddress
  }, $options.hasAddress ? {
    c: common_vendor.t($options.selectedAddressText)
  } : {}, {
    d: common_vendor.o((...args) => $options.goSelectAddress && $options.goSelectAddress(...args)),
    e: common_vendor.f($options.ingredientModeOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: $data.form.ingredientMode === item.value ? 1 : "",
        c: item.value,
        d: $data.form.ingredientMode === item.value ? 1 : "",
        e: common_vendor.o(($event) => $options.handleIngredientModeChange(item.value), item.value)
      };
    }),
    f: common_vendor.t($data.form.serviceDate || "请选择服务日期"),
    g: $data.form.serviceDate,
    h: common_vendor.o((...args) => $options.handleDateChange && $options.handleDateChange(...args)),
    i: common_vendor.t($options.timeSlotText),
    j: $options.timeSlotRange,
    k: $options.timeSlotIndex,
    l: common_vendor.o((...args) => $options.handleTimeSlotChange && $options.handleTimeSlotChange(...args)),
    m: common_vendor.t($options.sortTypeText),
    n: $options.sortTypeRange,
    o: $options.sortTypeIndex,
    p: common_vendor.o((...args) => $options.handleSortTypeChange && $options.handleSortTypeChange(...args)),
    q: !$options.hasAddress
  }, !$options.hasAddress ? {
    r: common_vendor.o((...args) => $options.goSelectAddress && $options.goSelectAddress(...args))
  } : $data.loading && !$data.chefList.length ? {} : !$data.loading && $data.chefList.length === 0 ? {} : common_vendor.e({
    v: $data.loading
  }, $data.loading ? {} : {}, {
    w: common_vendor.f($data.chefList, (item, k0, i0) => {
      return common_vendor.e({
        a: item.avatar
      }, item.avatar ? {
        b: item.avatar
      } : {
        c: common_vendor.t($options.getNameInitial(item.name))
      }, {
        d: common_vendor.t(item.name || "未命名厨师"),
        e: common_vendor.t($options.formatDistance(item.distanceKm)),
        f: common_vendor.t(item.specialtyCuisine || "-"),
        g: common_vendor.t(item.serviceAreaText || "暂未设置服务地址"),
        h: common_vendor.t(item.serviceModeDesc || $options.getChefServiceModeText(item.serviceMode)),
        i: common_vendor.t($options.formatRadius(item.serviceRadiusKm)),
        j: common_vendor.t($options.formatExperience(item.yearsOfExperience)),
        k: common_vendor.t($options.formatNumber(item.ratingAvg)),
        l: common_vendor.t($options.formatCount(item.orderCount)),
        m: common_vendor.t($options.formatRate(item.goodReviewRate)),
        n: item.id,
        o: common_vendor.o(($event) => $options.goToDetail(item.id), item.id)
      });
    })
  }), {
    s: $data.loading && !$data.chefList.length,
    t: !$data.loading && $data.chefList.length === 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4978fed5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/index.js.map

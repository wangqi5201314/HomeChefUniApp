"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chef = require("../../api/chef.js");
const _sfc_main = {
  name: "HomePage",
  data() {
    return {
      bannerList: [
        "/static/dish1.png",
        "/static/dish2.png",
        "/static/dish3.png"
      ],
      searchName: "",
      chefList: [],
      loading: false
    };
  },
  onLoad() {
    this.fetchChefList();
  },
  onPullDownRefresh() {
    this.fetchChefList({
      fromPullDownRefresh: true
    });
  },
  methods: {
    async fetchChefList(options = {}) {
      const { fromPullDownRefresh = false } = options;
      this.loading = true;
      try {
        const params = {};
        if (this.searchName.trim()) {
          params.name = this.searchName.trim();
        }
        const data = await api_chef.getChefList(params);
        this.chefList = Array.isArray(data) ? data : [];
      } catch (error) {
        this.chefList = [];
      } finally {
        this.loading = false;
        if (fromPullDownRefresh) {
          common_vendor.index.stopPullDownRefresh();
        }
      }
    },
    handleSearch() {
      this.fetchChefList();
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
      return value ? `${value} 年` : "-";
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
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.bannerList, (item, k0, i0) => {
      return {
        a: item,
        b: item
      };
    }),
    b: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    c: $data.searchName,
    d: common_vendor.o(($event) => $data.searchName = $event.detail.value),
    e: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    f: $data.loading && !$data.chefList.length
  }, $data.loading && !$data.chefList.length ? {} : !$data.loading && $data.chefList.length === 0 ? {} : common_vendor.e({
    h: $data.loading
  }, $data.loading ? {} : {}, {
    i: common_vendor.f($data.chefList, (item, k0, i0) => {
      return common_vendor.e({
        a: item.avatar
      }, item.avatar ? {
        b: item.avatar
      } : {
        c: common_vendor.t($options.getNameInitial(item.name))
      }, {
        d: common_vendor.t(item.name || "未命名厨师"),
        e: common_vendor.t(item.specialtyCuisine || "-"),
        f: common_vendor.t($options.formatExperience(item.yearsOfExperience)),
        g: common_vendor.t($options.formatNumber(item.ratingAvg)),
        h: common_vendor.t($options.formatCount(item.orderCount)),
        i: item.id,
        j: common_vendor.o(($event) => $options.goToDetail(item.id), item.id)
      });
    })
  }), {
    g: !$data.loading && $data.chefList.length === 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4978fed5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/index.js.map

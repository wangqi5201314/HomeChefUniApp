"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefProfile = require("../../api/chef-profile.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  name: "ChefMinePage",
  data() {
    return {
      chefInfo: {}
    };
  },
  computed: {
    avatarText() {
      return this.chefInfo.name ? String(this.chefInfo.name).slice(0, 1) : "厨";
    },
    certStatusText() {
      if (this.chefInfo.certStatus === 1) {
        return "已认证";
      }
      if (this.chefInfo.certStatus === 0) {
        return "未认证";
      }
      return String(this.chefInfo.certStatus || "未知");
    }
  },
  onShow() {
    const cachedInfo = utils_auth.getChefInfo();
    if (cachedInfo) {
      this.chefInfo = cachedInfo;
    }
    this.loadChefInfo();
  },
  methods: {
    async loadChefInfo() {
      try {
        const data = await api_chefProfile.getCurrentChefProfile();
        this.chefInfo = data || {};
        utils_auth.setChefInfo(this.chefInfo);
      } catch (error) {
      }
    },
    formatValue(value) {
      if (value === 0) {
        return "0";
      }
      return value || "-";
    },
    goPage(url) {
      common_vendor.index.navigateTo({
        url
      });
    },
    handleLogout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确认退出登录吗？",
        success: (res) => {
          if (!res.confirm) {
            return;
          }
          utils_auth.clearAuth();
          common_vendor.index.reLaunch({
            url: "/pages-chef/login/index"
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.chefInfo.avatar
  }, $data.chefInfo.avatar ? {
    b: $data.chefInfo.avatar
  } : {
    c: common_vendor.t($options.avatarText)
  }, {
    d: common_vendor.t($data.chefInfo.name || "未命名厨师"),
    e: common_vendor.t($data.chefInfo.phone || "-"),
    f: common_vendor.t($options.certStatusText),
    g: common_vendor.t($options.formatValue($data.chefInfo.ratingAvg)),
    h: common_vendor.t($options.formatValue($data.chefInfo.orderCount)),
    i: common_vendor.o(($event) => $options.goPage("/pages-chef/mine/profile")),
    j: common_vendor.o(($event) => $options.goPage("/pages-chef/mine/change-password")),
    k: common_vendor.o(($event) => $options.goPage("/pages-chef/certification/index")),
    l: common_vendor.o(($event) => $options.goPage("/pages-chef/schedule/index")),
    m: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1ec0422a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/mine/index.js.map

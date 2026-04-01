"use strict";
const common_vendor = require("../../common/vendor.js");
const api_address = require("../../api/address.js");
const api_order = require("../../api/order.js");
const api_user = require("../../api/user.js");
const utils_auth = require("../../utils/auth.js");
const utils_userStatus = require("../../utils/user-status.js");
const common_assets = require("../../common/assets.js");
const USER_ID_KEY = "user_id";
const USER_TYPE_KEY = "user_type";
const ADMIN_ID_KEY = "admin_id";
const _sfc_main = {
  name: "MinePage",
  data() {
    return {
      userId: "",
      userInfo: {},
      orderCount: 0,
      addressCount: 0
    };
  },
  computed: {
    displayNickname() {
      return this.userInfo.nickname || "未设置昵称";
    },
    avatarText() {
      const name = this.userInfo.nickname || this.userInfo.phone || "我";
      return String(name).slice(0, 1);
    },
    userStatusText() {
      if (this.userInfo.statusDesc) {
        return this.userInfo.statusDesc;
      }
      if (this.userInfo.status === 0 || this.userInfo.status) {
        return utils_userStatus.getUserStatusText(this.userInfo.status);
      }
      return "未知状态";
    }
  },
  onShow() {
    this.userId = common_vendor.index.getStorageSync(USER_ID_KEY) || "";
    this.loadPageData();
  },
  methods: {
    async loadPageData() {
      const cachedUserInfo = utils_auth.getUserInfo();
      if (cachedUserInfo) {
        this.userInfo = cachedUserInfo;
      }
      if (!this.userId) {
        this.userInfo = {};
        this.orderCount = 0;
        this.addressCount = 0;
        return;
      }
      try {
        const [userData, orderData, addressData] = await Promise.all([
          api_user.getCurrentUserInfo(),
          api_order.getOrderList({ userId: this.userId }),
          api_address.getUserAddressList({ userId: this.userId })
        ]);
        this.userInfo = userData || {};
        this.orderCount = Array.isArray(orderData) ? orderData.length : 0;
        this.addressCount = Array.isArray(addressData) ? addressData.length : 0;
        utils_auth.setUserInfo(this.userInfo);
      } catch (error) {
        this.orderCount = 0;
        this.addressCount = 0;
      }
    },
    goProfile() {
      common_vendor.index.navigateTo({ url: "/pages/mine/profile" });
    },
    goReviewList() {
      common_vendor.index.navigateTo({ url: "/pages/review/list" });
    },
    goAddressList() {
      common_vendor.index.navigateTo({ url: "/pages/address/list" });
    },
    goChangePassword() {
      common_vendor.index.navigateTo({ url: "/pages/mine/change-password" });
    },
    goOrderList() {
      common_vendor.index.switchTab({ url: "/pages/order/list" });
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
          common_vendor.index.removeStorageSync(USER_ID_KEY);
          common_vendor.index.removeStorageSync(USER_TYPE_KEY);
          common_vendor.index.removeStorageSync(ADMIN_ID_KEY);
          common_vendor.index.reLaunch({ url: "/pages/login/index" });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.userInfo.avatar
  }, $data.userInfo.avatar ? {
    b: $data.userInfo.avatar
  } : {
    c: common_vendor.t($options.avatarText)
  }, {
    d: common_vendor.t($options.displayNickname),
    e: common_vendor.t($data.userInfo.phone || "-"),
    f: common_vendor.t($options.userStatusText),
    g: common_vendor.t($data.orderCount),
    h: common_vendor.t($data.addressCount),
    i: common_assets._imports_3,
    j: common_vendor.t($data.orderCount),
    k: common_vendor.o((...args) => $options.goOrderList && $options.goOrderList(...args)),
    l: common_assets._imports_1,
    m: common_vendor.t($data.addressCount),
    n: common_vendor.o((...args) => $options.goAddressList && $options.goAddressList(...args)),
    o: common_assets._imports_2,
    p: common_vendor.o((...args) => $options.goReviewList && $options.goReviewList(...args)),
    q: common_assets._imports_0,
    r: common_vendor.o((...args) => $options.goProfile && $options.goProfile(...args)),
    s: common_assets._imports_4,
    t: common_vendor.o((...args) => $options.goChangePassword && $options.goChangePassword(...args)),
    v: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-569e925a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/index.js.map

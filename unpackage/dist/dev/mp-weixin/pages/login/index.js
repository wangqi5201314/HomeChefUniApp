"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const utils_auth = require("../../utils/auth.js");
const USER_ID_KEY = "user_id";
const USER_TYPE_KEY = "user_type";
const ADMIN_ID_KEY = "admin_id";
const _sfc_main = {
  data() {
    return {
      phone: "",
      loading: false
    };
  },
  methods: {
    validatePhone() {
      const phone = (this.phone || "").trim();
      if (!phone) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return false;
      }
      if (!/^1\d{10}$/.test(phone)) {
        common_vendor.index.showToast({
          title: "请输入正确的 11 位手机号",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    async handleLogin() {
      if (this.loading || !this.validatePhone()) {
        return;
      }
      this.loading = true;
      try {
        const loginData = await api_user.loginUser({
          phone: this.phone.trim()
        });
        if (!loginData || !loginData.token) {
          throw new Error("登录返回缺少 token");
        }
        utils_auth.setToken(loginData.token);
        common_vendor.index.setStorageSync(USER_ID_KEY, loginData.userId || "");
        common_vendor.index.setStorageSync(USER_TYPE_KEY, loginData.userType || "");
        common_vendor.index.setStorageSync(ADMIN_ID_KEY, loginData.adminId || 0);
        const profile = await api_user.getCurrentUserInfo();
        utils_auth.setUserInfo(profile || {});
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.switchTab({
            url: "/pages/home/index"
          });
        }, 300);
      } catch (error) {
        utils_auth.clearAuth();
        common_vendor.index.removeStorageSync(USER_ID_KEY);
        common_vendor.index.removeStorageSync(USER_TYPE_KEY);
        common_vendor.index.removeStorageSync(ADMIN_ID_KEY);
        if (error && error.message) {
          common_vendor.index.showToast({
            title: error.message,
            icon: "none"
          });
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.loading,
    b: $data.phone,
    c: common_vendor.o(($event) => $data.phone = $event.detail.value),
    d: common_vendor.t($data.loading ? "登录中..." : "登录"),
    e: $data.loading,
    f: $data.loading,
    g: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map

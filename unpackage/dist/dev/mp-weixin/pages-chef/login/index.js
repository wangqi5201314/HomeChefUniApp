"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefAuth = require("../../api/chef-auth.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  name: "ChefLoginPage",
  data() {
    return {
      loading: false,
      form: {
        phone: "",
        password: ""
      }
    };
  },
  methods: {
    validateForm() {
      const phone = this.form.phone.trim();
      const password = this.form.password.trim();
      if (!phone) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return false;
      }
      if (!/^1\d{10}$/.test(phone)) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号",
          icon: "none"
        });
        return false;
      }
      if (!password) {
        common_vendor.index.showToast({
          title: "请输入密码",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    async handleLogin() {
      if (this.loading || !this.validateForm()) {
        return;
      }
      this.loading = true;
      try {
        const loginData = await api_chefAuth.chefLogin({
          phone: this.form.phone.trim(),
          password: this.form.password
        });
        if (!loginData || !loginData.token) {
          throw new Error("登录返回缺少 token");
        }
        utils_auth.setToken(loginData.token);
        utils_auth.setUserType(loginData.userType || "CHEF");
        utils_auth.setChefId(loginData.chefId || "");
        const chefInfo = await api_chefAuth.getCurrentChefInfo();
        utils_auth.setChefInfo(chefInfo || {});
        common_vendor.index.redirectTo({
          url: "/pages-chef/home/index"
        });
      } catch (error) {
        utils_auth.clearAuth();
      } finally {
        this.loading = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.loading,
    b: $data.form.phone,
    c: common_vendor.o(($event) => $data.form.phone = $event.detail.value),
    d: $data.loading,
    e: $data.form.password,
    f: common_vendor.o(($event) => $data.form.password = $event.detail.value),
    g: common_vendor.t($data.loading ? "登录中..." : "登录"),
    h: $data.loading,
    i: $data.loading,
    j: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-85a779a0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/login/index.js.map

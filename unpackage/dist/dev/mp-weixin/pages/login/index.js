"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  name: "LoginPage",
  data() {
    return {
      loading: false,
      wechatLoading: false,
      form: {
        phone: "",
        password: ""
      }
    };
  },
  methods: {
    async handleLoginSuccess(loginData) {
      if (!loginData || !loginData.token) {
        throw new Error("登录返回缺少 token");
      }
      utils_auth.setToken(loginData.token);
      utils_auth.setUserId(loginData.userId || "");
      utils_auth.setUserType(loginData.userType || "");
      utils_auth.setAdminId(loginData.adminId || 0);
      const profile = await api_user.getUserInfo();
      utils_auth.setUserInfo(profile || {});
      common_vendor.index.switchTab({
        url: "/pages/home/index"
      });
    },
    validateForm() {
      const phone = this.form.phone.trim();
      const password = this.form.password.trim();
      if (!phone) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return false;
      }
      if (!/^1\d{10}$/.test(phone)) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return false;
      }
      if (!password) {
        common_vendor.index.showToast({ title: "请输入密码", icon: "none" });
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
        const loginData = await api_user.login({
          phone: this.form.phone.trim(),
          password: this.form.password
        });
        await this.handleLoginSuccess(loginData);
      } catch (error) {
        utils_auth.clearAuth();
      } finally {
        this.loading = false;
      }
    },
    handleWechatLogin() {
      if (this.loading || this.wechatLoading) {
        return;
      }
      this.wechatLoading = true;
      common_vendor.wx$1.login({
        success: async (res) => {
          if (!res.code) {
            common_vendor.index.showToast({ title: "微信登录失败", icon: "none" });
            this.wechatLoading = false;
            return;
          }
          try {
            const loginData = await api_user.wechatLogin({
              code: res.code
            });
            await this.handleLoginSuccess(loginData);
          } catch (error) {
            utils_auth.clearAuth();
          } finally {
            this.wechatLoading = false;
          }
        },
        fail: () => {
          common_vendor.index.showToast({ title: "微信登录失败", icon: "none" });
          this.wechatLoading = false;
        }
      });
    },
    goRegister() {
      common_vendor.index.navigateTo({
        url: "/pages/register/index"
      });
    },
    goChefLogin() {
      common_vendor.index.navigateTo({
        url: "/pages-chef/login/index"
      });
    },
    stayOnUserLogin() {
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.stayOnUserLogin && $options.stayOnUserLogin(...args)),
    b: common_vendor.o((...args) => $options.goChefLogin && $options.goChefLogin(...args)),
    c: $data.loading || $data.wechatLoading,
    d: $data.form.phone,
    e: common_vendor.o(($event) => $data.form.phone = $event.detail.value),
    f: $data.loading || $data.wechatLoading,
    g: $data.form.password,
    h: common_vendor.o(($event) => $data.form.password = $event.detail.value),
    i: common_vendor.t($data.loading ? "登录中..." : "登录"),
    j: $data.loading,
    k: $data.loading || $data.wechatLoading,
    l: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    m: common_vendor.t($data.wechatLoading ? "登录中..." : "微信快捷登录"),
    n: $data.wechatLoading,
    o: $data.loading || $data.wechatLoading,
    p: common_vendor.o((...args) => $options.handleWechatLogin && $options.handleWechatLogin(...args)),
    q: common_vendor.o((...args) => $options.goRegister && $options.goRegister(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map

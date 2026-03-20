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
      redirecting: false,
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
      this.redirecting = true;
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
        const loginData = await api_user.login({
          phone: this.form.phone.trim(),
          password: this.form.password
        });
        await this.handleLoginSuccess(loginData);
      } catch (error) {
        utils_auth.clearAuth();
        this.redirecting = false;
        if (error && error.message) {
          common_vendor.index.showToast({
            title: error.message,
            icon: "none"
          });
        }
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
            common_vendor.index.showToast({
              title: "微信登录未获取到 code",
              icon: "none"
            });
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
            this.redirecting = false;
            if (error && error.message) {
              common_vendor.index.showToast({
                title: error.message,
                icon: "none"
              });
            }
          } finally {
            this.wechatLoading = false;
          }
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "微信登录失败，请稍后重试",
            icon: "none"
          });
          this.redirecting = false;
          this.wechatLoading = false;
        }
      });
    },
    goRegister() {
      if (this.loading || this.wechatLoading) {
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/register/index"
      });
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
    h: $data.loading || $data.wechatLoading,
    i: $data.loading || $data.wechatLoading,
    j: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    k: common_vendor.t($data.wechatLoading ? "微信登录中..." : "微信快捷登录"),
    l: $data.wechatLoading,
    m: $data.loading || $data.wechatLoading,
    n: common_vendor.o((...args) => $options.handleWechatLogin && $options.handleWechatLogin(...args)),
    o: common_vendor.o((...args) => $options.goRegister && $options.goRegister(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map

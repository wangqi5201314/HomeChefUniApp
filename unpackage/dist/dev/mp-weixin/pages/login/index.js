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
      emailLoading: false,
      codeLoading: false,
      codeCountdown: 0,
      codeTimer: null,
      loginMode: "phone",
      form: {
        phone: "",
        password: ""
      },
      emailForm: {
        email: "",
        code: ""
      }
    };
  },
  computed: {
    currentLoginLoading() {
      return this.loginMode === "email" ? this.emailLoading : this.loading;
    }
  },
  beforeDestroy() {
    this.clearCodeTimer();
  },
  onUnload() {
    this.clearCodeTimer();
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
    switchLoginMode(mode) {
      if (this.loading || this.wechatLoading || this.emailLoading || this.codeLoading) {
        return;
      }
      this.loginMode = mode;
    },
    handlePrimaryLogin() {
      if (this.loginMode === "email") {
        this.handleEmailLogin();
        return;
      }
      this.handleLogin();
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
    validateEmail() {
      const email = this.emailForm.email.trim();
      if (!email) {
        common_vendor.index.showToast({ title: "请输入邮箱", icon: "none" });
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        common_vendor.index.showToast({ title: "请输入正确的邮箱", icon: "none" });
        return false;
      }
      return true;
    },
    validateEmailLoginForm() {
      if (!this.validateEmail()) {
        return false;
      }
      const code = this.emailForm.code.trim();
      if (!/^\d{6}$/.test(code)) {
        common_vendor.index.showToast({ title: "请输入6位验证码", icon: "none" });
        return false;
      }
      return true;
    },
    async handleSendEmailCode() {
      if (this.codeLoading || this.codeCountdown > 0 || !this.validateEmail()) {
        return;
      }
      this.codeLoading = true;
      try {
        await api_user.sendEmailCode({
          email: this.emailForm.email.trim()
        });
        common_vendor.index.showToast({ title: "验证码已发送", icon: "none" });
        this.startCodeCountdown();
      } finally {
        this.codeLoading = false;
      }
    },
    async handleEmailLogin() {
      if (this.emailLoading || !this.validateEmailLoginForm()) {
        return;
      }
      this.emailLoading = true;
      try {
        const loginData = await api_user.emailLogin({
          email: this.emailForm.email.trim(),
          code: this.emailForm.code.trim()
        });
        await this.handleLoginSuccess(loginData);
      } catch (error) {
        utils_auth.clearAuth();
      } finally {
        this.emailLoading = false;
      }
    },
    startCodeCountdown() {
      this.clearCodeTimer();
      this.codeCountdown = 60;
      this.codeTimer = setInterval(() => {
        if (this.codeCountdown <= 1) {
          this.clearCodeTimer();
          return;
        }
        this.codeCountdown -= 1;
      }, 1e3);
    },
    clearCodeTimer() {
      if (this.codeTimer) {
        clearInterval(this.codeTimer);
        this.codeTimer = null;
      }
      this.codeCountdown = 0;
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
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.stayOnUserLogin && $options.stayOnUserLogin(...args)),
    b: common_vendor.o((...args) => $options.goChefLogin && $options.goChefLogin(...args)),
    c: $data.loginMode === "phone" ? 1 : "",
    d: $data.loading || $data.wechatLoading || $data.emailLoading || $data.codeLoading,
    e: common_vendor.o(($event) => $options.switchLoginMode("phone")),
    f: $data.loginMode === "email" ? 1 : "",
    g: $data.loading || $data.wechatLoading || $data.emailLoading || $data.codeLoading,
    h: common_vendor.o(($event) => $options.switchLoginMode("email")),
    i: $data.loginMode === "phone"
  }, $data.loginMode === "phone" ? {
    j: $data.loading || $data.wechatLoading,
    k: $data.form.phone,
    l: common_vendor.o(($event) => $data.form.phone = $event.detail.value),
    m: $data.loading || $data.wechatLoading,
    n: $data.form.password,
    o: common_vendor.o(($event) => $data.form.password = $event.detail.value)
  } : {
    p: $data.emailLoading || $data.codeLoading,
    q: $data.emailForm.email,
    r: common_vendor.o(($event) => $data.emailForm.email = $event.detail.value),
    s: $data.emailLoading,
    t: $data.emailForm.code,
    v: common_vendor.o(($event) => $data.emailForm.code = $event.detail.value),
    w: common_vendor.t($data.codeCountdown > 0 ? `${$data.codeCountdown}s` : "获取验证码"),
    x: $data.codeLoading,
    y: $data.emailLoading || $data.codeLoading || $data.codeCountdown > 0,
    z: common_vendor.o((...args) => $options.handleSendEmailCode && $options.handleSendEmailCode(...args))
  }, {
    A: common_vendor.t($options.currentLoginLoading ? "登录中..." : "登录"),
    B: $options.currentLoginLoading,
    C: $data.loading || $data.wechatLoading || $data.emailLoading || $data.codeLoading,
    D: common_vendor.o((...args) => $options.handlePrimaryLogin && $options.handlePrimaryLogin(...args)),
    E: common_vendor.t($data.wechatLoading ? "登录中..." : "微信快捷登录"),
    F: $data.wechatLoading,
    G: $data.loading || $data.wechatLoading,
    H: common_vendor.o((...args) => $options.handleWechatLogin && $options.handleWechatLogin(...args)),
    I: common_vendor.o((...args) => $options.goRegister && $options.goRegister(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map

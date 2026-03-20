"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const _sfc_main = {
  name: "RegisterPage",
  data() {
    return {
      loading: false,
      form: {
        phone: "",
        password: "",
        confirmPassword: "",
        nickname: ""
      }
    };
  },
  methods: {
    validateForm() {
      const phone = this.form.phone.trim();
      const password = this.form.password;
      const confirmPassword = this.form.confirmPassword;
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
      if (password.length < 6) {
        common_vendor.index.showToast({
          title: "密码至少 6 位",
          icon: "none"
        });
        return false;
      }
      if (confirmPassword !== password) {
        common_vendor.index.showToast({
          title: "两次密码输入不一致",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    async handleRegister() {
      if (this.loading || !this.validateForm()) {
        return;
      }
      this.loading = true;
      try {
        await api_user.register({
          phone: this.form.phone.trim(),
          password: this.form.password,
          confirmPassword: this.form.confirmPassword,
          nickname: this.form.nickname.trim()
        });
        common_vendor.index.showToast({
          title: "注册成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack({
            delta: 1
          });
        }, 300);
      } catch (error) {
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
    e: $data.form.nickname,
    f: common_vendor.o(($event) => $data.form.nickname = $event.detail.value),
    g: $data.loading,
    h: $data.form.password,
    i: common_vendor.o(($event) => $data.form.password = $event.detail.value),
    j: $data.loading,
    k: $data.form.confirmPassword,
    l: common_vendor.o(($event) => $data.form.confirmPassword = $event.detail.value),
    m: common_vendor.t($data.loading ? "注册中..." : "注册"),
    n: $data.loading,
    o: $data.loading,
    p: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-46a64346"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/register/index.js.map

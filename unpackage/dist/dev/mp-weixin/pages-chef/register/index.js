"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefAuth = require("../../api/chef-auth.js");
const _sfc_main = {
  name: "ChefRegisterPage",
  data() {
    return {
      loading: false,
      showPassword: false,
      showConfirmPassword: false,
      form: {
        phone: "",
        password: "",
        confirmPassword: "",
        name: ""
      }
    };
  },
  methods: {
    togglePasswordVisible(type) {
      if (type === "password") {
        this.showPassword = !this.showPassword;
        return;
      }
      if (type === "confirm") {
        this.showConfirmPassword = !this.showConfirmPassword;
      }
    },
    validateForm() {
      if (!this.form.phone.trim()) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return false;
      }
      if (!/^1\d{10}$/.test(this.form.phone.trim())) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return false;
      }
      if (!this.form.name.trim()) {
        common_vendor.index.showToast({ title: "请输入姓名", icon: "none" });
        return false;
      }
      if (!this.form.password || this.form.password.length < 6) {
        common_vendor.index.showToast({ title: "密码至少 6 位", icon: "none" });
        return false;
      }
      if (this.form.password !== this.form.confirmPassword) {
        common_vendor.index.showToast({ title: "两次密码输入不一致", icon: "none" });
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
        await api_chefAuth.chefRegister({
          phone: this.form.phone.trim(),
          password: this.form.password,
          confirmPassword: this.form.confirmPassword,
          name: this.form.name.trim()
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
    e: $data.form.name,
    f: common_vendor.o(($event) => $data.form.name = $event.detail.value),
    g: !$data.showPassword,
    h: $data.loading,
    i: $data.form.password,
    j: common_vendor.o(($event) => $data.form.password = $event.detail.value),
    k: common_vendor.t($data.showPassword ? "隐藏" : "显示"),
    l: common_vendor.o(($event) => $options.togglePasswordVisible("password")),
    m: !$data.showConfirmPassword,
    n: $data.loading,
    o: $data.form.confirmPassword,
    p: common_vendor.o(($event) => $data.form.confirmPassword = $event.detail.value),
    q: common_vendor.t($data.showConfirmPassword ? "隐藏" : "显示"),
    r: common_vendor.o(($event) => $options.togglePasswordVisible("confirm")),
    s: common_vendor.t($data.loading ? "注册中..." : "注册"),
    t: $data.loading,
    v: $data.loading,
    w: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c94e6b93"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/register/index.js.map

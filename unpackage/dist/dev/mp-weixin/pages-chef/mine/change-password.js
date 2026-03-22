"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefProfile = require("../../api/chef-profile.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  name: "ChefChangePasswordPage",
  data() {
    return {
      loading: false,
      form: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      }
    };
  },
  methods: {
    validateForm() {
      const { oldPassword, newPassword, confirmPassword } = this.form;
      if (!oldPassword || !newPassword || !confirmPassword) {
        common_vendor.index.showToast({
          title: "请完整填写密码信息",
          icon: "none"
        });
        return false;
      }
      if (newPassword.length < 6) {
        common_vendor.index.showToast({
          title: "新密码至少 6 位",
          icon: "none"
        });
        return false;
      }
      if (newPassword !== confirmPassword) {
        common_vendor.index.showToast({
          title: "两次密码输入不一致",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    async handleSubmit() {
      if (this.loading || !this.validateForm()) {
        return;
      }
      this.loading = true;
      try {
        await api_chefProfile.changeChefPassword({
          oldPassword: this.form.oldPassword,
          newPassword: this.form.newPassword,
          confirmPassword: this.form.confirmPassword
        });
        common_vendor.index.showToast({
          title: "修改成功，请重新登录",
          icon: "success"
        });
        utils_auth.clearAuth();
        setTimeout(() => {
          common_vendor.index.reLaunch({
            url: "/pages-chef/login/index"
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
    b: $data.form.oldPassword,
    c: common_vendor.o(($event) => $data.form.oldPassword = $event.detail.value),
    d: $data.loading,
    e: $data.form.newPassword,
    f: common_vendor.o(($event) => $data.form.newPassword = $event.detail.value),
    g: $data.loading,
    h: $data.form.confirmPassword,
    i: common_vendor.o(($event) => $data.form.confirmPassword = $event.detail.value),
    j: $data.loading,
    k: $data.loading,
    l: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ade93a9d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/mine/change-password.js.map

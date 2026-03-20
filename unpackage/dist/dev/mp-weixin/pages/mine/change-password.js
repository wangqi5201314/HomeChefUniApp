"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  name: "ChangePasswordPage",
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
      if (!oldPassword) {
        common_vendor.index.showToast({
          title: "请输入旧密码",
          icon: "none"
        });
        return false;
      }
      if (!newPassword) {
        common_vendor.index.showToast({
          title: "请输入新密码",
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
      if (!confirmPassword) {
        common_vendor.index.showToast({
          title: "请输入确认密码",
          icon: "none"
        });
        return false;
      }
      if (confirmPassword !== newPassword) {
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
        await api_user.changePassword({
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
            url: "/pages/login/index"
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
    j: common_vendor.t($data.loading ? "提交中..." : "确认修改"),
    k: $data.loading,
    l: $data.loading,
    m: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9f0b9728"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/change-password.js.map

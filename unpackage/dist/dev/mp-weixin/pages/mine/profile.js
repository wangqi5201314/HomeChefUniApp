"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const utils_auth = require("../../utils/auth.js");
const utils_config = require("../../utils/config.js");
const utils_toastMessage = require("../../utils/toast-message.js");
const utils_userStatus = require("../../utils/user-status.js");
function createDefaultForm() {
  return {
    phone: "",
    status: "",
    statusDesc: "",
    nickname: "",
    avatar: "",
    gender: 0,
    birthday: "",
    tastePreference: "",
    allergyInfo: "",
    emergencyContactName: "",
    emergencyContactPhone: ""
  };
}
const _sfc_main = {
  name: "MineProfilePage",
  data() {
    return {
      saving: false,
      avatarUploading: false,
      genderOptions: [
        { label: "未知", value: 0 },
        { label: "男", value: 1 },
        { label: "女", value: 2 }
      ],
      form: createDefaultForm()
    };
  },
  computed: {
    avatarText() {
      const text = this.form.nickname || this.form.phone || "我";
      return String(text).slice(0, 1);
    },
    genderIndex() {
      const index = this.genderOptions.findIndex((item) => item.value === Number(this.form.gender));
      return index === -1 ? 0 : index;
    },
    genderLabel() {
      const current = this.genderOptions.find((item) => item.value === Number(this.form.gender));
      return current ? current.label : "未知";
    },
    statusDisplay() {
      if (this.form.statusDesc) {
        return this.form.statusDesc;
      }
      if (this.form.status === 0 || this.form.status) {
        return utils_userStatus.getUserStatusText(this.form.status);
      }
      return "未知状态";
    }
  },
  onLoad() {
    this.loadUserProfile();
  },
  methods: {
    async loadUserProfile() {
      try {
        const data = await api_user.getCurrentUserInfo();
        this.form = {
          phone: data.phone || "",
          status: data.status,
          statusDesc: data.statusDesc || "",
          nickname: data.nickname || "",
          avatar: data.avatar || "",
          gender: data.gender === 0 || data.gender ? Number(data.gender) : 0,
          birthday: data.birthday || "",
          tastePreference: data.tastePreference || "",
          allergyInfo: data.allergyInfo || "",
          emergencyContactName: data.emergencyContactName || "",
          emergencyContactPhone: data.emergencyContactPhone || ""
        };
        utils_auth.setUserInfo(data || {});
      } catch (error) {
      }
    },
    handleGenderChange(event) {
      const index = Number(event.detail.value);
      const current = this.genderOptions[index];
      this.form.gender = current ? current.value : 0;
    },
    handleBirthdayChange(event) {
      this.form.birthday = event.detail.value || "";
    },
    async handleAvatarUploaded(fileUrl) {
      await api_user.updateCurrentUserInfo({
        phone: this.form.phone.trim(),
        nickname: this.form.nickname.trim(),
        avatar: fileUrl || "",
        gender: Number(this.form.gender),
        birthday: this.form.birthday || "",
        tastePreference: this.form.tastePreference.trim(),
        allergyInfo: this.form.allergyInfo.trim(),
        emergencyContactName: this.form.emergencyContactName.trim(),
        emergencyContactPhone: this.form.emergencyContactPhone.trim()
      });
      this.form.avatar = fileUrl || "";
      const latestUserInfo = await api_user.getCurrentUserInfo();
      this.form.status = latestUserInfo.status;
      this.form.statusDesc = latestUserInfo.statusDesc || "";
      utils_auth.setUserInfo(latestUserInfo || {});
    },
    chooseAvatar() {
      if (this.avatarUploading) {
        return;
      }
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const filePath = res.tempFilePaths && res.tempFilePaths[0];
          if (!filePath) {
            return;
          }
          this.avatarUploading = true;
          common_vendor.wx$1.uploadFile({
            url: `${utils_config.BASE_URL}/api/upload/image`,
            filePath,
            name: "file",
            header: utils_auth.getToken() ? { Authorization: `Bearer ${utils_auth.getToken()}` } : {},
            success: async (uploadRes) => {
              let result = null;
              try {
                result = JSON.parse(uploadRes.data);
              } catch (error) {
                common_vendor.index.showToast({ title: "上传返回格式错误", icon: "none" });
                return;
              }
              if (uploadRes.statusCode === 401 || result.code === 401) {
                utils_auth.clearAuth();
                common_vendor.index.reLaunch({ url: "/pages/login/index" });
                return;
              }
              if (uploadRes.statusCode < 200 || uploadRes.statusCode >= 300 || result.code !== 200) {
                common_vendor.index.showToast({ title: utils_toastMessage.normalizeToastMessage(result.message) || "上传失败", icon: "none" });
                return;
              }
              const fileUrl = result.data && result.data.fileUrl ? result.data.fileUrl : "";
              if (!fileUrl) {
                common_vendor.index.showToast({ title: "未获取到头像地址", icon: "none" });
                return;
              }
              try {
                await this.handleAvatarUploaded(fileUrl);
                common_vendor.index.showToast({ title: "头像已更新", icon: "success" });
              } catch (error) {
              }
            },
            fail: () => {
              common_vendor.index.showToast({ title: "上传失败，请稍后重试", icon: "none" });
            },
            complete: () => {
              this.avatarUploading = false;
            }
          });
        }
      });
    },
    buildPayload() {
      return {
        phone: this.form.phone.trim(),
        nickname: this.form.nickname.trim(),
        avatar: this.form.avatar || "",
        gender: Number(this.form.gender),
        birthday: this.form.birthday || "",
        tastePreference: this.form.tastePreference.trim(),
        allergyInfo: this.form.allergyInfo.trim(),
        emergencyContactName: this.form.emergencyContactName.trim(),
        emergencyContactPhone: this.form.emergencyContactPhone.trim()
      };
    },
    async submitProfile() {
      if (this.saving || this.avatarUploading) {
        return;
      }
      const phone = this.form.phone.trim();
      if (!phone) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return;
      }
      if (!/^1\d{10}$/.test(phone)) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号",
          icon: "none"
        });
        return;
      }
      this.saving = true;
      try {
        await api_user.updateCurrentUserInfo(this.buildPayload());
        const latestUserInfo = await api_user.getCurrentUserInfo();
        this.form.status = latestUserInfo.status;
        this.form.statusDesc = latestUserInfo.statusDesc || "";
        utils_auth.setUserInfo(latestUserInfo || {});
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack({ delta: 1 });
        }, 300);
      } catch (error) {
      } finally {
        this.saving = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.form.avatar
  }, $data.form.avatar ? {
    b: $data.form.avatar
  } : {
    c: common_vendor.t($options.avatarText)
  }, {
    d: common_vendor.t($data.avatarUploading ? "上传中..." : "更换头像"),
    e: common_vendor.o((...args) => $options.chooseAvatar && $options.chooseAvatar(...args)),
    f: $data.form.phone,
    g: common_vendor.o(($event) => $data.form.phone = $event.detail.value),
    h: common_vendor.t($options.statusDisplay),
    i: $data.form.nickname,
    j: common_vendor.o(($event) => $data.form.nickname = $event.detail.value),
    k: common_vendor.t($options.genderLabel),
    l: $data.genderOptions,
    m: $options.genderIndex,
    n: common_vendor.o((...args) => $options.handleGenderChange && $options.handleGenderChange(...args)),
    o: common_vendor.t($data.form.birthday || "请选择生日"),
    p: $data.form.birthday,
    q: common_vendor.o((...args) => $options.handleBirthdayChange && $options.handleBirthdayChange(...args)),
    r: $data.form.tastePreference,
    s: common_vendor.o(($event) => $data.form.tastePreference = $event.detail.value),
    t: $data.form.allergyInfo,
    v: common_vendor.o(($event) => $data.form.allergyInfo = $event.detail.value),
    w: $data.form.emergencyContactName,
    x: common_vendor.o(($event) => $data.form.emergencyContactName = $event.detail.value),
    y: $data.form.emergencyContactPhone,
    z: common_vendor.o(($event) => $data.form.emergencyContactPhone = $event.detail.value),
    A: common_vendor.t($data.saving ? "保存中..." : "保存资料"),
    B: $data.saving,
    C: $data.saving || $data.avatarUploading,
    D: common_vendor.o((...args) => $options.submitProfile && $options.submitProfile(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-935803c6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/profile.js.map

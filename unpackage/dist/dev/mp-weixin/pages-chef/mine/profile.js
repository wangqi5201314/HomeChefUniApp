"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefProfile = require("../../api/chef-profile.js");
const api_upload = require("../../api/upload.js");
const utils_auth = require("../../utils/auth.js");
const utils_chefServiceMode = require("../../utils/chef-service-mode.js");
function createDefaultForm() {
  return {
    phone: "",
    certStatus: "",
    name: "",
    avatar: "",
    gender: "0",
    age: "",
    introduction: "",
    specialtyCuisine: "",
    specialtyTags: "",
    yearsOfExperience: "",
    serviceRadiusKm: "",
    serviceMode: "1",
    serviceModeDesc: ""
  };
}
const _sfc_main = {
  name: "ChefProfilePage",
  data() {
    return {
      saving: false,
      avatarUploading: false,
      form: createDefaultForm(),
      serviceModeOptions: utils_chefServiceMode.chefServiceModeOptions
    };
  },
  computed: {
    avatarText() {
      const text = this.form.name || this.form.phone || "厨";
      return String(text).slice(0, 1);
    },
    phoneDisplay() {
      return this.form.phone || "-";
    },
    certStatusText() {
      if (Number(this.form.certStatus) === 1) {
        return "已认证";
      }
      if (Number(this.form.certStatus) === 0) {
        return "未认证";
      }
      return this.form.certStatus || "-";
    },
    serviceModeRange() {
      return this.serviceModeOptions.map((item) => item.label);
    },
    serviceModeIndex() {
      const index = this.serviceModeOptions.findIndex((item) => item.value === Number(this.form.serviceMode));
      return index < 0 ? 0 : index;
    },
    currentServiceModeText() {
      if (this.form.serviceModeDesc) {
        return this.form.serviceModeDesc;
      }
      return utils_chefServiceMode.getChefServiceModeText(this.form.serviceMode);
    }
  },
  onLoad() {
    const cachedInfo = utils_auth.getChefInfo();
    if (cachedInfo) {
      this.fillForm(cachedInfo);
    }
    this.loadChefProfile();
  },
  methods: {
    fillForm(data) {
      const normalizedServiceMode = [1, 2, 3].includes(Number(data.serviceMode)) ? String(Number(data.serviceMode)) : "1";
      this.form = {
        phone: data.phone || "",
        certStatus: data.certStatus === 0 || data.certStatus ? String(data.certStatus) : "",
        name: data.name || "",
        avatar: data.avatar || "",
        gender: data.gender === 0 || data.gender ? String(data.gender) : "0",
        age: data.age === 0 || data.age ? String(data.age) : "",
        introduction: data.introduction || "",
        specialtyCuisine: data.specialtyCuisine || "",
        specialtyTags: data.specialtyTags || "",
        yearsOfExperience: data.yearsOfExperience === 0 || data.yearsOfExperience ? String(data.yearsOfExperience) : "",
        serviceRadiusKm: data.serviceRadiusKm === 0 || data.serviceRadiusKm ? String(data.serviceRadiusKm) : "",
        serviceMode: normalizedServiceMode,
        serviceModeDesc: data.serviceModeDesc || ""
      };
    },
    async loadChefProfile() {
      try {
        const data = await api_chefProfile.getCurrentChefProfile();
        this.fillForm(data || {});
        utils_auth.setChefInfo(data || {});
      } catch (error) {
      }
    },
    buildPayload() {
      return {
        name: this.form.name.trim(),
        avatar: this.form.avatar || "",
        gender: Number(this.form.gender || 0),
        age: Number(this.form.age || 0),
        introduction: this.form.introduction.trim(),
        specialtyCuisine: this.form.specialtyCuisine.trim(),
        specialtyTags: this.form.specialtyTags.trim(),
        yearsOfExperience: Number(this.form.yearsOfExperience || 0),
        serviceRadiusKm: Number(this.form.serviceRadiusKm || 0),
        serviceMode: Number(this.form.serviceMode || 1)
      };
    },
    handleServiceModeChange(event) {
      const index = Number(event.detail.value);
      const selected = this.serviceModeOptions[index];
      if (!selected) {
        return;
      }
      this.form.serviceMode = String(selected.value);
      this.form.serviceModeDesc = selected.label;
    },
    chooseAvatar() {
      if (this.avatarUploading) {
        return;
      }
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const filePath = res.tempFilePaths && res.tempFilePaths[0];
          if (!filePath) {
            return;
          }
          this.avatarUploading = true;
          try {
            const uploadData = await api_upload.uploadImage(filePath);
            this.form.avatar = uploadData && uploadData.fileUrl ? uploadData.fileUrl : "";
          } catch (error) {
          } finally {
            this.avatarUploading = false;
          }
        }
      });
    },
    async submitProfile() {
      if (this.saving || this.avatarUploading) {
        return;
      }
      this.saving = true;
      try {
        await api_chefProfile.updateCurrentChefProfile(this.buildPayload());
        const latestInfo = await api_chefProfile.getCurrentChefProfile();
        this.fillForm(latestInfo || {});
        utils_auth.setChefInfo(latestInfo || {});
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack({
            delta: 1
          });
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
    f: common_vendor.t($options.phoneDisplay),
    g: common_vendor.t($options.certStatusText),
    h: $data.form.name,
    i: common_vendor.o(($event) => $data.form.name = $event.detail.value),
    j: $data.form.gender,
    k: common_vendor.o(($event) => $data.form.gender = $event.detail.value),
    l: $data.form.age,
    m: common_vendor.o(($event) => $data.form.age = $event.detail.value),
    n: $data.form.introduction,
    o: common_vendor.o(($event) => $data.form.introduction = $event.detail.value),
    p: $data.form.specialtyCuisine,
    q: common_vendor.o(($event) => $data.form.specialtyCuisine = $event.detail.value),
    r: $data.form.specialtyTags,
    s: common_vendor.o(($event) => $data.form.specialtyTags = $event.detail.value),
    t: $data.form.yearsOfExperience,
    v: common_vendor.o(($event) => $data.form.yearsOfExperience = $event.detail.value),
    w: $data.form.serviceRadiusKm,
    x: common_vendor.o(($event) => $data.form.serviceRadiusKm = $event.detail.value),
    y: common_vendor.t($options.currentServiceModeText),
    z: $options.serviceModeRange,
    A: $options.serviceModeIndex,
    B: common_vendor.o((...args) => $options.handleServiceModeChange && $options.handleServiceModeChange(...args)),
    C: $data.saving,
    D: $data.saving || $data.avatarUploading,
    E: common_vendor.o((...args) => $options.submitProfile && $options.submitProfile(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-22f0af08"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/mine/profile.js.map

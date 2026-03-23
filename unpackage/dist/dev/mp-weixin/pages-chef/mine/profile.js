"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefProfile = require("../../api/chef-profile.js");
const api_upload = require("../../api/upload.js");
const utils_auth = require("../../utils/auth.js");
const utils_chefServiceMode = require("../../utils/chef-service-mode.js");
const utils_chefCertStatus = require("../../utils/chef-cert-status.js");
const GENDER_OPTIONS = [
  { label: "女", value: 0 },
  { label: "男", value: 1 }
];
const AGE_OPTIONS = Array.from({ length: 56 }, (_, index) => {
  const value = index + 15;
  return {
    label: `${value}岁`,
    value
  };
});
const EXPERIENCE_OPTIONS = Array.from({ length: 56 }, (_, index) => ({
  label: `${index}年`,
  value: index
}));
const SERVICE_RADIUS_OPTIONS = Array.from({ length: 51 }, (_, index) => ({
  label: `${index}km`,
  value: index
}));
function createDefaultForm() {
  return {
    phone: "",
    certStatus: "",
    certStatusDesc: "",
    name: "",
    avatar: "",
    gender: "0",
    age: "15",
    introduction: "",
    specialtyCuisine: "",
    specialtyTags: "",
    yearsOfExperience: "0",
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
      genderOptions: GENDER_OPTIONS,
      ageOptions: AGE_OPTIONS,
      experienceOptions: EXPERIENCE_OPTIONS,
      serviceRadiusOptions: SERVICE_RADIUS_OPTIONS,
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
      if (this.form.certStatusDesc) {
        return this.form.certStatusDesc;
      }
      if (this.form.certStatus === "0" || this.form.certStatus) {
        return utils_chefCertStatus.getChefCertStatusText(this.form.certStatus);
      }
      return "未知状态";
    },
    genderRange() {
      return this.genderOptions.map((item) => item.label);
    },
    genderIndex() {
      const index = this.genderOptions.findIndex((item) => item.value === Number(this.form.gender));
      return index < 0 ? 0 : index;
    },
    currentGenderText() {
      const current = this.genderOptions.find((item) => item.value === Number(this.form.gender));
      return current ? current.label : "请选择性别";
    },
    ageRange() {
      return this.ageOptions.map((item) => item.label);
    },
    ageIndex() {
      const index = this.ageOptions.findIndex((item) => item.value === Number(this.form.age));
      return index < 0 ? 0 : index;
    },
    currentAgeText() {
      const current = this.ageOptions.find((item) => item.value === Number(this.form.age));
      return current ? current.label : "请选择年龄";
    },
    experienceRange() {
      return this.experienceOptions.map((item) => item.label);
    },
    experienceIndex() {
      const index = this.experienceOptions.findIndex((item) => item.value === Number(this.form.yearsOfExperience));
      return index < 0 ? 0 : index;
    },
    currentExperienceText() {
      const current = this.experienceOptions.find((item) => item.value === Number(this.form.yearsOfExperience));
      return current ? current.label : "请选择从业年限";
    },
    serviceRadiusRange() {
      return this.serviceRadiusOptions.map((item) => item.label);
    },
    serviceRadiusIndex() {
      const index = this.serviceRadiusOptions.findIndex((item) => item.value === Number(this.form.serviceRadiusKm));
      return index < 0 ? 0 : index;
    },
    currentServiceRadiusText() {
      const current = this.serviceRadiusOptions.find((item) => item.value === Number(this.form.serviceRadiusKm));
      return current ? current.label : "请选择服务半径";
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
      const normalizedGender = [0, 1].includes(Number(data.gender)) ? String(Number(data.gender)) : "0";
      const normalizedAge = Number(data.age);
      const normalizedExperience = Number(data.yearsOfExperience);
      this.form = {
        phone: data.phone || "",
        certStatus: data.certStatus === 0 || data.certStatus ? String(data.certStatus) : "",
        certStatusDesc: data.certStatusDesc || "",
        name: data.name || "",
        avatar: data.avatar || "",
        gender: normalizedGender,
        age: normalizedAge >= 15 && normalizedAge <= 70 ? String(normalizedAge) : "15",
        introduction: data.introduction || "",
        specialtyCuisine: data.specialtyCuisine || "",
        specialtyTags: data.specialtyTags || "",
        yearsOfExperience: normalizedExperience >= 0 && normalizedExperience <= 55 ? String(normalizedExperience) : "0",
        serviceRadiusKm: Number(data.serviceRadiusKm) >= 0 && Number(data.serviceRadiusKm) <= 50 ? String(Number(data.serviceRadiusKm)) : "0",
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
        age: Number(this.form.age || 15),
        introduction: this.form.introduction.trim(),
        specialtyCuisine: this.form.specialtyCuisine.trim(),
        specialtyTags: this.form.specialtyTags.trim(),
        yearsOfExperience: Number(this.form.yearsOfExperience || 0),
        serviceRadiusKm: Number(this.form.serviceRadiusKm || 0),
        serviceMode: Number(this.form.serviceMode || 1)
      };
    },
    handleGenderChange(event) {
      const index = Number(event.detail.value);
      const selected = this.genderOptions[index];
      if (selected) {
        this.form.gender = String(selected.value);
      }
    },
    handleAgeChange(event) {
      const index = Number(event.detail.value);
      const selected = this.ageOptions[index];
      if (selected) {
        this.form.age = String(selected.value);
      }
    },
    handleExperienceChange(event) {
      const index = Number(event.detail.value);
      const selected = this.experienceOptions[index];
      if (selected) {
        this.form.yearsOfExperience = String(selected.value);
      }
    },
    handleServiceRadiusChange(event) {
      const index = Number(event.detail.value);
      const selected = this.serviceRadiusOptions[index];
      if (selected) {
        this.form.serviceRadiusKm = String(selected.value);
      }
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
    j: common_vendor.t($options.currentGenderText),
    k: $options.genderRange,
    l: $options.genderIndex,
    m: common_vendor.o((...args) => $options.handleGenderChange && $options.handleGenderChange(...args)),
    n: common_vendor.t($options.currentAgeText),
    o: $options.ageRange,
    p: $options.ageIndex,
    q: common_vendor.o((...args) => $options.handleAgeChange && $options.handleAgeChange(...args)),
    r: $data.form.introduction,
    s: common_vendor.o(($event) => $data.form.introduction = $event.detail.value),
    t: $data.form.specialtyCuisine,
    v: common_vendor.o(($event) => $data.form.specialtyCuisine = $event.detail.value),
    w: $data.form.specialtyTags,
    x: common_vendor.o(($event) => $data.form.specialtyTags = $event.detail.value),
    y: common_vendor.t($options.currentExperienceText),
    z: $options.experienceRange,
    A: $options.experienceIndex,
    B: common_vendor.o((...args) => $options.handleExperienceChange && $options.handleExperienceChange(...args)),
    C: common_vendor.t($options.currentServiceRadiusText),
    D: $options.serviceRadiusRange,
    E: $options.serviceRadiusIndex,
    F: common_vendor.o((...args) => $options.handleServiceRadiusChange && $options.handleServiceRadiusChange(...args)),
    G: common_vendor.t($options.currentServiceModeText),
    H: $options.serviceModeRange,
    I: $options.serviceModeIndex,
    J: common_vendor.o((...args) => $options.handleServiceModeChange && $options.handleServiceModeChange(...args)),
    K: $data.saving,
    L: $data.saving || $data.avatarUploading,
    M: common_vendor.o((...args) => $options.submitProfile && $options.submitProfile(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-22f0af08"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/mine/profile.js.map

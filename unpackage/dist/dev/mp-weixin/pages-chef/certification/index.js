"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefCertification = require("../../api/chef-certification.js");
const api_chefProfile = require("../../api/chef-profile.js");
const api_upload = require("../../api/upload.js");
const utils_auth = require("../../utils/auth.js");
const utils_chefCertStatus = require("../../utils/chef-cert-status.js");
function createDefaultForm() {
  return {
    realName: "",
    idCardNo: "",
    healthCertUrl: "",
    skillCertUrl: "",
    serviceCertUrl: "",
    advancedCertUrl: ""
  };
}
function isValidChineseIdCard(idCardNo) {
  const value = String(idCardNo || "").trim().toUpperCase();
  if (!/^\d{17}[\dX]$/.test(value)) {
    return false;
  }
  const year = Number(value.slice(6, 10));
  const month = Number(value.slice(10, 12));
  const day = Number(value.slice(12, 14));
  const birthday = new Date(year, month - 1, day);
  if (birthday.getFullYear() !== year || birthday.getMonth() + 1 !== month || birthday.getDate() !== day) {
    return false;
  }
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const codes = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
  const sum = value.slice(0, 17).split("").reduce((total, current, index) => total + Number(current) * weights[index], 0);
  return codes[sum % 11] === value[17];
}
const _sfc_main = {
  name: "ChefCertificationPage",
  data() {
    return {
      loaded: false,
      skipNextOnShowReload: false,
      saving: false,
      uploadingKey: "",
      hasCertificationRecord: false,
      form: createDefaultForm(),
      chefInfo: {},
      uploadFields: [
        { key: "healthCertUrl", label: "健康证" },
        { key: "skillCertUrl", label: "技能证书" },
        { key: "serviceCertUrl", label: "服务认证" },
        { key: "advancedCertUrl", label: "高级认证" }
      ]
    };
  },
  computed: {
    certStatusText() {
      if (!this.hasCertificationRecord || Number(this.chefInfo.certStatus) === 3) {
        return "待上传";
      }
      if (this.chefInfo.certStatusDesc) {
        return this.chefInfo.certStatusDesc;
      }
      if (this.chefInfo.certStatus === 0 || this.chefInfo.certStatus) {
        return utils_chefCertStatus.getChefCertStatusText(this.chefInfo.certStatus);
      }
      return "未知状态";
    },
    certStatusTip() {
      if (!this.hasCertificationRecord || Number(this.chefInfo.certStatus) === 3) {
        return "当前还没有提交认证资料，请先上传相关证书照片并提交。";
      }
      const status = Number(this.chefInfo.certStatus);
      if (status === 2) {
        return "认证已被拒绝，请检查资料后重新提交。";
      }
      if (status === 1) {
        return "认证已通过。";
      }
      if (status === 0) {
        return "审核中，请耐心等待。";
      }
      return "请完善并提交认证资料。";
    }
  },
  onLoad() {
    const cachedInfo = utils_auth.getChefInfo();
    if (cachedInfo) {
      this.chefInfo = cachedInfo;
    }
    this.loadPageData();
  },
  onShow() {
    if (this.skipNextOnShowReload) {
      this.skipNextOnShowReload = false;
      return;
    }
    if (!this.loaded) {
      const cachedInfo = utils_auth.getChefInfo();
      if (cachedInfo) {
        this.chefInfo = cachedInfo;
      }
      this.loadPageData();
    }
  },
  methods: {
    validateForm() {
      if (!this.form.realName.trim()) {
        common_vendor.index.showToast({
          title: "请输入真实姓名",
          icon: "none"
        });
        return false;
      }
      if (!this.form.idCardNo.trim()) {
        common_vendor.index.showToast({
          title: "请输入身份证号",
          icon: "none"
        });
        return false;
      }
      if (!isValidChineseIdCard(this.form.idCardNo)) {
        common_vendor.index.showToast({
          title: "请输入正确的身份证号",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    async loadPageData() {
      try {
        const [certificationData, chefData] = await Promise.all([
          api_chefCertification.getChefCertification(),
          api_chefProfile.getCurrentChefProfile()
        ]);
        this.hasCertificationRecord = Boolean(
          certificationData && (certificationData.realName || certificationData.idCardNo || certificationData.healthCertUrl || certificationData.skillCertUrl || certificationData.serviceCertUrl || certificationData.advancedCertUrl)
        );
        this.form = {
          ...createDefaultForm(),
          ...certificationData || {}
        };
        this.chefInfo = chefData || {};
        utils_auth.setChefInfo(this.chefInfo);
      } catch (error) {
        this.hasCertificationRecord = false;
        this.form = createDefaultForm();
      } finally {
        this.loaded = true;
      }
    },
    chooseCertImage(field) {
      if (this.uploadingKey) {
        return;
      }
      this.skipNextOnShowReload = true;
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const filePath = res.tempFilePaths && res.tempFilePaths[0];
          if (!filePath) {
            return;
          }
          this.uploadingKey = field;
          try {
            const uploadData = await api_upload.uploadImage(filePath);
            this.form[field] = uploadData && uploadData.fileUrl ? uploadData.fileUrl : "";
          } catch (error) {
          } finally {
            this.uploadingKey = "";
          }
        }
      });
    },
    async submitCertification() {
      if (this.saving || this.uploadingKey || !this.validateForm()) {
        return;
      }
      this.saving = true;
      try {
        await api_chefCertification.submitChefCertification({
          realName: this.form.realName.trim(),
          idCardNo: this.form.idCardNo.trim(),
          healthCertUrl: this.form.healthCertUrl || "",
          skillCertUrl: this.form.skillCertUrl || "",
          serviceCertUrl: this.form.serviceCertUrl || "",
          advancedCertUrl: this.form.advancedCertUrl || ""
        });
        this.hasCertificationRecord = true;
        common_vendor.index.showToast({
          title: "提交成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.redirectTo({
            url: "/pages-chef/mine/index"
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
  return {
    a: common_vendor.t($options.certStatusText),
    b: common_vendor.t($options.certStatusTip),
    c: $data.form.realName,
    d: common_vendor.o(($event) => $data.form.realName = $event.detail.value),
    e: $data.form.idCardNo,
    f: common_vendor.o(($event) => $data.form.idCardNo = $event.detail.value),
    g: common_vendor.f($data.uploadFields, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.label),
        b: $data.form[item.key]
      }, $data.form[item.key] ? {
        c: $data.form[item.key]
      } : {
        d: common_vendor.t($data.uploadingKey === item.key ? "上传中..." : "点击上传图片")
      }, {
        e: common_vendor.o(($event) => $options.chooseCertImage(item.key), item.key),
        f: item.key
      });
    }),
    h: $data.saving,
    i: $data.saving || !!$data.uploadingKey,
    j: common_vendor.o((...args) => $options.submitCertification && $options.submitCertification(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2e97051e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/certification/index.js.map

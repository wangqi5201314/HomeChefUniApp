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
const _sfc_main = {
  name: "ChefCertificationPage",
  data() {
    return {
      saving: false,
      uploadingKey: "",
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
      if (this.chefInfo.certStatusDesc) {
        return this.chefInfo.certStatusDesc;
      }
      if (this.chefInfo.certStatus === 0 || this.chefInfo.certStatus) {
        return utils_chefCertStatus.getChefCertStatusText(this.chefInfo.certStatus);
      }
      return "未知状态";
    },
    certStatusTip() {
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
  onShow() {
    const cachedInfo = utils_auth.getChefInfo();
    if (cachedInfo) {
      this.chefInfo = cachedInfo;
    }
    this.loadPageData();
  },
  methods: {
    async loadPageData() {
      try {
        const [certificationData, chefData] = await Promise.all([
          api_chefCertification.getChefCertification(),
          api_chefProfile.getCurrentChefProfile()
        ]);
        this.form = {
          ...createDefaultForm(),
          ...certificationData || {}
        };
        this.chefInfo = chefData || {};
        utils_auth.setChefInfo(this.chefInfo);
      } catch (error) {
        this.form = createDefaultForm();
      }
    },
    chooseCertImage(field) {
      if (this.uploadingKey) {
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
      if (this.saving || this.uploadingKey) {
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
        common_vendor.index.showToast({
          title: "提交成功",
          icon: "success"
        });
        await this.loadPageData();
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
      } : {}, {
        d: common_vendor.o(($event) => $options.chooseCertImage(item.key), item.key),
        e: item.key
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

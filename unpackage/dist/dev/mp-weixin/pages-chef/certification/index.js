"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefCertification = require("../../api/chef-certification.js");
const api_upload = require("../../api/upload.js");
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
      uploadFields: [
        { key: "healthCertUrl", label: "健康证" },
        { key: "skillCertUrl", label: "技能证书" },
        { key: "serviceCertUrl", label: "服务认证" },
        { key: "advancedCertUrl", label: "高级认证" }
      ]
    };
  },
  onShow() {
    this.loadCertification();
  },
  methods: {
    async loadCertification() {
      try {
        const data = await api_chefCertification.getChefCertification();
        this.form = {
          ...createDefaultForm(),
          ...data || {}
        };
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
        await this.loadCertification();
      } catch (error) {
      } finally {
        this.saving = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form.realName,
    b: common_vendor.o(($event) => $data.form.realName = $event.detail.value),
    c: $data.form.idCardNo,
    d: common_vendor.o(($event) => $data.form.idCardNo = $event.detail.value),
    e: common_vendor.f($data.uploadFields, (item, k0, i0) => {
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
    f: $data.saving,
    g: $data.saving || $data.uploadingKey,
    h: common_vendor.o((...args) => $options.submitCertification && $options.submitCertification(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2e97051e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/certification/index.js.map

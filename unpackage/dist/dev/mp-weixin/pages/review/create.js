"use strict";
const common_vendor = require("../../common/vendor.js");
const api_review = require("../../api/review.js");
const api_upload = require("../../api/upload.js");
function createDefaultForm() {
  return {
    dishScore: 5,
    serviceScore: 5,
    skillScore: 5,
    environmentScore: 5,
    content: "",
    isAnonymous: 0
  };
}
const _sfc_main = {
  name: "ReviewCreatePage",
  data() {
    return {
      orderId: "",
      userId: "",
      chefId: "",
      uploading: false,
      submitting: false,
      scoreOptions: [1, 2, 3, 4, 5],
      form: createDefaultForm(),
      imageList: []
    };
  },
  onLoad(options) {
    this.orderId = options && options.orderId ? options.orderId : "";
    this.userId = options && options.userId ? options.userId : "";
    this.chefId = options && options.chefId ? options.chefId : "";
    if (!this.orderId || !this.userId || !this.chefId) {
      common_vendor.index.showToast({
        title: "评价参数不完整",
        icon: "none"
      });
    }
  },
  methods: {
    setScore(field, value) {
      this.form[field] = value;
    },
    handleAnonymousChange(event) {
      this.form.isAnonymous = event.detail.value ? 1 : 0;
    },
    chooseImages() {
      if (this.uploading) {
        return;
      }
      const remainCount = 9 - this.imageList.length;
      if (remainCount <= 0) {
        common_vendor.index.showToast({
          title: "最多上传 9 张图片",
          icon: "none"
        });
        return;
      }
      common_vendor.index.chooseImage({
        count: remainCount,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePaths = res.tempFilePaths || [];
          if (!tempFilePaths.length) {
            return;
          }
          this.uploading = true;
          try {
            for (const filePath of tempFilePaths) {
              const imageItem = {
                localPath: filePath,
                fileUrl: "",
                uploading: true
              };
              this.imageList.push(imageItem);
              const currentIndex = this.imageList.length - 1;
              try {
                const uploadResult = await api_upload.uploadImage(filePath);
                this.imageList.splice(currentIndex, 1, {
                  localPath: filePath,
                  fileUrl: uploadResult.fileUrl || "",
                  uploading: false
                });
              } catch (error) {
                this.imageList.splice(currentIndex, 1);
              }
            }
          } finally {
            this.uploading = false;
          }
        }
      });
    },
    removeImage(index) {
      if (this.uploading && this.imageList[index] && this.imageList[index].uploading) {
        return;
      }
      this.imageList.splice(index, 1);
    },
    validateForm() {
      if (!this.orderId || !this.userId || !this.chefId) {
        common_vendor.index.showToast({
          title: "评价参数不完整",
          icon: "none"
        });
        return false;
      }
      if (this.imageList.some((item) => item.uploading)) {
        common_vendor.index.showToast({
          title: "图片上传中，请稍后提交",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    buildPayload() {
      const imageUrls = this.imageList.map((item) => item.fileUrl).filter(Boolean).join(",");
      return {
        orderId: Number(this.orderId),
        userId: Number(this.userId),
        chefId: Number(this.chefId),
        dishScore: Number(this.form.dishScore),
        serviceScore: Number(this.form.serviceScore),
        skillScore: Number(this.form.skillScore),
        environmentScore: Number(this.form.environmentScore),
        content: this.form.content.trim(),
        imageUrls,
        isAnonymous: Number(this.form.isAnonymous) === 1 ? 1 : 0
      };
    },
    async submitReview() {
      if (this.submitting || this.uploading || !this.validateForm()) {
        return;
      }
      this.submitting = true;
      try {
        await api_review.createReview(this.buildPayload());
        common_vendor.index.showToast({
          title: "评价成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack({
            delta: 1
          });
        }, 300);
      } catch (error) {
      } finally {
        this.submitting = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.scoreOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item),
        b: `dish-${item}`,
        c: $data.form.dishScore === item ? 1 : "",
        d: common_vendor.o(($event) => $options.setScore("dishScore", item), `dish-${item}`)
      };
    }),
    b: common_vendor.f($data.scoreOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item),
        b: `service-${item}`,
        c: $data.form.serviceScore === item ? 1 : "",
        d: common_vendor.o(($event) => $options.setScore("serviceScore", item), `service-${item}`)
      };
    }),
    c: common_vendor.f($data.scoreOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item),
        b: `skill-${item}`,
        c: $data.form.skillScore === item ? 1 : "",
        d: common_vendor.o(($event) => $options.setScore("skillScore", item), `skill-${item}`)
      };
    }),
    d: common_vendor.f($data.scoreOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item),
        b: `environment-${item}`,
        c: $data.form.environmentScore === item ? 1 : "",
        d: common_vendor.o(($event) => $options.setScore("environmentScore", item), `environment-${item}`)
      };
    }),
    e: $data.form.content,
    f: common_vendor.o(($event) => $data.form.content = $event.detail.value),
    g: Number($data.form.isAnonymous) === 1,
    h: common_vendor.o((...args) => $options.handleAnonymousChange && $options.handleAnonymousChange(...args)),
    i: common_vendor.f($data.imageList, (item, index, i0) => {
      return common_vendor.e({
        a: item.localPath,
        b: item.uploading
      }, item.uploading ? {} : {}, {
        c: common_vendor.o(($event) => $options.removeImage(index), `${item.fileUrl || item.localPath}-${index}`),
        d: `${item.fileUrl || item.localPath}-${index}`
      });
    }),
    j: $data.imageList.length < 9
  }, $data.imageList.length < 9 ? {
    k: common_vendor.t($data.uploading ? "上传中" : "上传图片"),
    l: $data.uploading ? 1 : "",
    m: common_vendor.o((...args) => $options.chooseImages && $options.chooseImages(...args))
  } : {}, {
    n: common_vendor.t($data.submitting ? "提交中..." : "提交评价"),
    o: $data.submitting,
    p: $data.submitting || $data.uploading,
    q: common_vendor.o((...args) => $options.submitReview && $options.submitReview(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6a700c41"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/review/create.js.map

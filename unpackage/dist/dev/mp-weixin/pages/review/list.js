"use strict";
const common_vendor = require("../../common/vendor.js");
const api_review = require("../../api/review.js");
const USER_ID_KEY = "user_id";
const _sfc_main = {
  name: "ReviewListPage",
  data() {
    return {
      loading: true,
      userId: "",
      reviewList: []
    };
  },
  onLoad() {
    this.userId = common_vendor.index.getStorageSync(USER_ID_KEY) || "";
    this.loadReviewList();
  },
  methods: {
    async loadReviewList() {
      if (!this.userId) {
        this.loading = false;
        this.reviewList = [];
        return;
      }
      this.loading = true;
      try {
        const data = await api_review.getMyReviewList(this.userId);
        this.reviewList = Array.isArray(data) ? data : [];
      } catch (error) {
        this.reviewList = [];
      } finally {
        this.loading = false;
      }
    },
    parseImageUrls(imageUrls) {
      if (!imageUrls) {
        return [];
      }
      return String(imageUrls).split(",").map((item) => item.trim()).filter(Boolean);
    },
    previewImages(urls, currentIndex) {
      common_vendor.index.previewImage({
        urls,
        current: urls[currentIndex]
      });
    },
    formatScore(score) {
      if (score === 0) {
        return "0";
      }
      return score || "-";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : $data.reviewList.length === 0 ? {} : {
    c: common_vendor.f($data.reviewList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.orderId || "-"),
        b: common_vendor.t($options.formatScore(item.overallScore)),
        c: common_vendor.t($options.formatScore(item.dishScore)),
        d: common_vendor.t($options.formatScore(item.serviceScore)),
        e: common_vendor.t($options.formatScore(item.skillScore)),
        f: common_vendor.t($options.formatScore(item.environmentScore)),
        g: common_vendor.t(item.isAnonymous === 1 ? "匿名评价" : "实名评价"),
        h: common_vendor.t(item.createdAt || "-"),
        i: common_vendor.t(item.content || "未填写评价内容"),
        j: $options.parseImageUrls(item.imageUrls).length
      }, $options.parseImageUrls(item.imageUrls).length ? {
        k: common_vendor.f($options.parseImageUrls(item.imageUrls), (url, index, i1) => {
          return {
            a: `${item.id}-${index}`,
            b: url,
            c: common_vendor.o(($event) => $options.previewImages($options.parseImageUrls(item.imageUrls), index), `${item.id}-${index}`)
          };
        })
      } : {}, {
        l: item.replyContent
      }, item.replyContent ? {
        m: common_vendor.t(item.replyContent),
        n: common_vendor.t(item.replyAt || "-")
      } : {}, {
        o: item.id
      });
    })
  }, {
    b: $data.reviewList.length === 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-eeac79e8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/review/list.js.map

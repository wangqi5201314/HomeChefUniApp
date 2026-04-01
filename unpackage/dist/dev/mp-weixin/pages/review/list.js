"use strict";
const common_vendor = require("../../common/vendor.js");
const api_review = require("../../api/review.js");
const utils_scheduleTime = require("../../utils/schedule-time.js");
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
    formatFullDateTime: utils_scheduleTime.formatFullDateTime,
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
    },
    renderStars(score) {
      const numericScore = Number(score);
      if (!Number.isFinite(numericScore) || numericScore <= 0) {
        return "☆☆☆☆☆";
      }
      const fullStars = Math.max(0, Math.min(5, Math.round(numericScore)));
      return `${"★".repeat(fullStars)}${"☆".repeat(5 - fullStars)}`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : $data.reviewList.length === 0 ? {} : {
    c: common_vendor.f($data.reviewList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.orderNo || item.orderId || "-"),
        b: common_vendor.t(item.isAnonymous === 1 ? "匿名评价" : "实名评价"),
        c: item.isAnonymous === 1 ? 1 : "",
        d: common_vendor.t($options.formatFullDateTime(item.createdAt)),
        e: common_vendor.t($options.formatScore(item.overallScore)),
        f: common_vendor.t($options.renderStars(item.overallScore)),
        g: common_vendor.t($options.renderStars(item.dishScore)),
        h: common_vendor.t($options.formatScore(item.dishScore)),
        i: common_vendor.t($options.renderStars(item.serviceScore)),
        j: common_vendor.t($options.formatScore(item.serviceScore)),
        k: common_vendor.t($options.renderStars(item.skillScore)),
        l: common_vendor.t($options.formatScore(item.skillScore)),
        m: common_vendor.t($options.renderStars(item.environmentScore)),
        n: common_vendor.t($options.formatScore(item.environmentScore)),
        o: common_vendor.t(item.content || "未填写评价内容"),
        p: $options.parseImageUrls(item.imageUrls).length
      }, $options.parseImageUrls(item.imageUrls).length ? {
        q: common_vendor.t($options.parseImageUrls(item.imageUrls).length),
        r: common_vendor.f($options.parseImageUrls(item.imageUrls), (url, index, i1) => {
          return {
            a: `${item.id}-${index}`,
            b: url,
            c: common_vendor.o(($event) => $options.previewImages($options.parseImageUrls(item.imageUrls), index), `${item.id}-${index}`)
          };
        })
      } : {}, {
        s: item.replyContent
      }, item.replyContent ? {
        t: common_vendor.t(item.replyContent),
        v: common_vendor.t($options.formatFullDateTime(item.replyAt))
      } : {}, {
        w: item.id
      });
    })
  }, {
    b: $data.reviewList.length === 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-eeac79e8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/review/list.js.map

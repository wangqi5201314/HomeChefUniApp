"use strict";
const common_vendor = require("../../common/vendor.js");
const api_review = require("../../api/review.js");
const utils_auth = require("../../utils/auth.js");
const utils_scheduleTime = require("../../utils/schedule-time.js");
const _sfc_main = {
  name: "ChefReviewListPage",
  data() {
    return {
      chefId: "",
      loading: false,
      reviewList: [],
      showReplyModal: false,
      currentReviewId: "",
      replyContent: "",
      replyingId: ""
    };
  },
  onShow() {
    const cachedChefId = utils_auth.getChefId();
    const cachedChefInfo = utils_auth.getChefInfo();
    this.chefId = cachedChefId || cachedChefInfo && cachedChefInfo.id || "";
    this.loadReviewList();
  },
  methods: {
    formatFullDateTime: utils_scheduleTime.formatFullDateTime,
    getReviewUserName(item) {
      if (!item) {
        return "-";
      }
      return item.nickname || item.userNickname || item.userName || item.username || item.realName || item.name || `用户${item.userId}`;
    },
    async loadReviewList() {
      if (!this.chefId) {
        this.reviewList = [];
        return;
      }
      this.loading = true;
      try {
        const data = await api_review.getChefReviewList(this.chefId);
        this.reviewList = Array.isArray(data) ? data : [];
      } catch (error) {
        this.reviewList = [];
      } finally {
        this.loading = false;
      }
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
    openReplyPopup(item) {
      if (!item || !item.id || item.replyContent) {
        return;
      }
      this.currentReviewId = item.id;
      this.replyContent = "";
      this.showReplyModal = true;
    },
    closeReplyPopup() {
      if (this.replyingId !== "") {
        return;
      }
      this.showReplyModal = false;
      this.currentReviewId = "";
      this.replyContent = "";
    },
    async submitReply() {
      if (!this.currentReviewId || this.replyingId !== "") {
        return;
      }
      if (!this.replyContent.trim()) {
        common_vendor.index.showToast({
          title: "请输入回复内容",
          icon: "none"
        });
        return;
      }
      this.replyingId = String(this.currentReviewId);
      try {
        await api_review.replyReview(this.currentReviewId, {
          replyContent: this.replyContent.trim()
        });
        common_vendor.index.showToast({
          title: "回复成功",
          icon: "success"
        });
        this.showReplyModal = false;
        this.currentReviewId = "";
        this.replyContent = "";
        await this.loadReviewList();
      } catch (error) {
      } finally {
        this.replyingId = "";
      }
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
        b: common_vendor.t(item.isAnonymous === 1 ? "匿名用户" : $options.getReviewUserName(item)),
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
      } : {
        w: $data.replyingId === String(item.id),
        x: $data.replyingId === String(item.id),
        y: common_vendor.o(($event) => $options.openReplyPopup(item), item.id)
      }, {
        z: item.id
      });
    })
  }, {
    b: $data.reviewList.length === 0,
    d: $data.showReplyModal
  }, $data.showReplyModal ? {
    e: $data.replyContent,
    f: common_vendor.o(($event) => $data.replyContent = $event.detail.value),
    g: common_vendor.o((...args) => $options.closeReplyPopup && $options.closeReplyPopup(...args)),
    h: $data.replyingId !== "",
    i: $data.replyingId !== "",
    j: common_vendor.o((...args) => $options.submitReply && $options.submitReply(...args)),
    k: common_vendor.o(() => {
    }),
    l: common_vendor.o((...args) => $options.closeReplyPopup && $options.closeReplyPopup(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9dff818c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/review/list.js.map

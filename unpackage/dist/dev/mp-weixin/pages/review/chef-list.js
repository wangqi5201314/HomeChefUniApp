"use strict";
const common_vendor = require("../../common/vendor.js");
const api_review = require("../../api/review.js");
const utils_scheduleTime = require("../../utils/schedule-time.js");
const _sfc_main = {
  name: "ChefReviewListPage",
  data() {
    return {
      chefId: "",
      loading: false,
      reviewList: []
    };
  },
  onLoad(options) {
    this.chefId = options && options.chefId ? options.chefId : "";
    if (!this.chefId) {
      common_vendor.index.showToast({
        title: "缺少厨师 id",
        icon: "none"
      });
      return;
    }
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
    formatPlain(value) {
      if (value === 0) {
        return "0";
      }
      return value || "-";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : $data.reviewList.length === 0 ? {} : {
    c: common_vendor.f($data.reviewList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.isAnonymous === 1 ? "匿名用户" : $options.getReviewUserName(item)),
        b: common_vendor.t($options.formatPlain(item.overallScore)),
        c: common_vendor.t($options.formatPlain(item.dishScore)),
        d: common_vendor.t($options.formatPlain(item.serviceScore)),
        e: common_vendor.t($options.formatPlain(item.skillScore)),
        f: common_vendor.t($options.formatPlain(item.environmentScore)),
        g: common_vendor.t(item.content || "用户未填写评价内容"),
        h: common_vendor.t($options.formatFullDateTime(item.createdAt)),
        i: $options.parseImageUrls(item.imageUrls).length
      }, $options.parseImageUrls(item.imageUrls).length ? {
        j: common_vendor.f($options.parseImageUrls(item.imageUrls), (url, index, i1) => {
          return {
            a: `${item.id}-${index}`,
            b: url,
            c: common_vendor.o(($event) => $options.previewImages($options.parseImageUrls(item.imageUrls), index), `${item.id}-${index}`)
          };
        })
      } : {}, {
        k: item.replyContent
      }, item.replyContent ? common_vendor.e({
        l: common_vendor.t(item.replyContent),
        m: item.replyAt
      }, item.replyAt ? {
        n: common_vendor.t($options.formatFullDateTime(item.replyAt))
      } : {}) : {}, {
        o: item.id
      });
    })
  }, {
    b: $data.reviewList.length === 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6ecc23c8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/review/chef-list.js.map

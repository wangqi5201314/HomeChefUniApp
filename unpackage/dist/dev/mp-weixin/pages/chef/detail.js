"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chef = require("../../api/chef.js");
const api_review = require("../../api/review.js");
const utils_chefServiceMode = require("../../utils/chef-service-mode.js");
const utils_chefCertStatus = require("../../utils/chef-cert-status.js");
const utils_chefStatus = require("../../utils/chef-status.js");
const utils_scheduleTime = require("../../utils/schedule-time.js");
const utils_timeSlot = require("../../utils/time-slot.js");
const _sfc_main = {
  name: "ChefDetailPage",
  data() {
    return {
      chefId: "",
      chef: {},
      reviewList: [],
      availableScheduleList: [],
      selectedScheduleId: null,
      selectedSchedule: null,
      loading: true
    };
  },
  computed: {
    tagList() {
      if (!this.chef.specialtyTags) {
        return [];
      }
      return String(this.chef.specialtyTags).split(",").map((item) => item.trim()).filter(Boolean);
    },
    displayReviewList() {
      return this.reviewList.slice(0, 3);
    },
    selectedScheduleText() {
      if (!this.selectedSchedule) {
        return "请选择一个可预约档期";
      }
      return `${utils_timeSlot.getTimeSlotText(this.selectedSchedule.timeSlot)} ${utils_scheduleTime.formatScheduleDateTime(this.selectedSchedule.startTime)} - ${utils_scheduleTime.formatScheduleDateTime(this.selectedSchedule.endTime)}`.trim();
    },
    serviceModeText() {
      if (this.chef.serviceModeDesc) {
        return this.chef.serviceModeDesc;
      }
      if (this.chef.serviceMode === 0 || this.chef.serviceMode) {
        return utils_chefServiceMode.getChefServiceModeText(this.chef.serviceMode);
      }
      return "-";
    },
    certStatusText() {
      if (this.chef.certStatusDesc) {
        return this.chef.certStatusDesc;
      }
      if (this.chef.certStatus === 0 || this.chef.certStatus) {
        return utils_chefCertStatus.getChefCertStatusText(this.chef.certStatus);
      }
      return "未知状态";
    },
    chefStatusText() {
      if (this.chef.statusDesc) {
        return this.chef.statusDesc;
      }
      if (this.chef.status === 0 || this.chef.status) {
        return utils_chefStatus.getChefStatusText(this.chef.status);
      }
      return "未知状态";
    },
    chefServiceLocationText() {
      return this.chef.serviceAreaText || "暂未设置服务地址";
    }
  },
  onLoad(options) {
    const { id = "" } = options || {};
    this.chefId = id;
    if (!this.chefId) {
      common_vendor.index.showToast({ title: "缺少厨师 id", icon: "none" });
      return;
    }
    this.loadPageData();
  },
  methods: {
    formatFullDateTime: utils_scheduleTime.formatFullDateTime,
    formatScheduleDateTime: utils_scheduleTime.formatScheduleDateTime,
    getTimeSlotText: utils_timeSlot.getTimeSlotText,
    getReviewUserName(item) {
      if (!item) {
        return "-";
      }
      return item.nickname || item.userNickname || item.userName || item.username || item.realName || item.name || `用户${item.userId}`;
    },
    async loadPageData() {
      this.loading = true;
      try {
        const dateRange = this.getNextSevenDaysRange();
        const [chefData, scheduleData, reviewData] = await Promise.all([
          api_chef.getChefDetail(this.chefId),
          api_chef.getChefSchedule(this.chefId, dateRange),
          api_review.getChefReviewList(this.chefId)
        ]);
        this.chef = chefData || {};
        this.availableScheduleList = Array.isArray(scheduleData) ? scheduleData.filter((item) => item && (item.isAvailable === 1 || item.isAvailable === true)).map((item) => ({
          ...item,
          timeSlot: utils_timeSlot.normalizeTimeSlot(item.timeSlot)
        })) : [];
        this.reviewList = Array.isArray(reviewData) ? reviewData : [];
        if (this.availableScheduleList.length) {
          this.selectSchedule(this.availableScheduleList[0]);
        }
      } catch (error) {
        this.chef = {};
        this.availableScheduleList = [];
        this.reviewList = [];
      } finally {
        this.loading = false;
      }
    },
    getNextSevenDaysRange() {
      const start = /* @__PURE__ */ new Date();
      const end = /* @__PURE__ */ new Date();
      end.setDate(end.getDate() + 6);
      return {
        startDate: this.formatDate(start),
        endDate: this.formatDate(end)
      };
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const day = `${date.getDate()}`.padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    selectSchedule(item) {
      this.selectedScheduleId = item.id;
      this.selectedSchedule = item;
    },
    handleBook() {
      if (!this.selectedSchedule) {
        common_vendor.index.showToast({ title: "请先选择档期", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/order/confirm?chefId=${this.chefId}&serviceDate=${encodeURIComponent(this.selectedSchedule.serviceDate || "")}&timeSlot=${encodeURIComponent(this.selectedSchedule.timeSlot || "")}&serviceStartTime=${encodeURIComponent(this.selectedSchedule.startTime || "")}&serviceEndTime=${encodeURIComponent(this.selectedSchedule.endTime || "")}`
      });
    },
    goAllReviews() {
      common_vendor.index.navigateTo({ url: `/pages/review/chef-list?chefId=${this.chefId}` });
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
    getNameInitial(name) {
      return name ? String(name).slice(0, 1) : "厨";
    },
    formatValue(value, suffix) {
      if (value === 0) {
        return `0${suffix}`;
      }
      return value || value === 0 ? `${value}${suffix}` : "-";
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
  }, $data.loading ? {} : common_vendor.e({
    b: $data.chef.avatar
  }, $data.chef.avatar ? {
    c: $data.chef.avatar
  } : {
    d: common_vendor.t($options.getNameInitial($data.chef.name))
  }, {
    e: common_vendor.t($data.chef.name || "未命名厨师"),
    f: common_vendor.t($options.certStatusText),
    g: common_vendor.t($options.chefStatusText),
    h: common_vendor.t($data.chef.specialtyCuisine || "-"),
    i: common_vendor.t($options.serviceModeText),
    j: common_vendor.t($options.chefServiceLocationText),
    k: common_vendor.t($data.chef.introduction || "暂无介绍"),
    l: common_vendor.t($options.formatValue($data.chef.yearsOfExperience, "年")),
    m: common_vendor.t($options.formatPlain($data.chef.ratingAvg)),
    n: common_vendor.t($options.formatPlain($data.chef.orderCount)),
    o: common_vendor.t($options.certStatusText),
    p: $options.tagList.length
  }, $options.tagList.length ? {
    q: common_vendor.f($options.tagList, (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index
      };
    })
  } : {}, {
    r: $data.availableScheduleList.length
  }, $data.availableScheduleList.length ? {
    s: common_vendor.f($data.availableScheduleList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.serviceDate),
        b: common_vendor.t($options.getTimeSlotText(item.timeSlot)),
        c: common_vendor.t($options.formatScheduleDateTime(item.startTime)),
        d: common_vendor.t($options.formatScheduleDateTime(item.endTime)),
        e: item.remark
      }, item.remark ? {
        f: common_vendor.t(item.remark)
      } : {}, {
        g: item.id,
        h: $data.selectedScheduleId === item.id ? 1 : "",
        i: common_vendor.o(($event) => $options.selectSchedule(item), item.id)
      });
    })
  } : {}, {
    t: $data.reviewList.length > $options.displayReviewList.length
  }, $data.reviewList.length > $options.displayReviewList.length ? {
    v: common_vendor.o((...args) => $options.goAllReviews && $options.goAllReviews(...args))
  } : {}, {
    w: $options.displayReviewList.length
  }, $options.displayReviewList.length ? {
    x: common_vendor.f($options.displayReviewList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.isAnonymous === 1 ? "匿名用户" : $options.getReviewUserName(item)),
        b: common_vendor.t($options.formatPlain(item.overallScore)),
        c: common_vendor.t(item.content || "用户未填写评价内容"),
        d: common_vendor.t($options.formatFullDateTime(item.createdAt)),
        e: $options.parseImageUrls(item.imageUrls).length
      }, $options.parseImageUrls(item.imageUrls).length ? {
        f: common_vendor.f($options.parseImageUrls(item.imageUrls), (url, index, i1) => {
          return {
            a: `${item.id}-${index}`,
            b: url,
            c: common_vendor.o(($event) => $options.previewImages($options.parseImageUrls(item.imageUrls), index), `${item.id}-${index}`)
          };
        })
      } : {}, {
        g: item.replyContent
      }, item.replyContent ? {
        h: common_vendor.t(item.replyContent)
      } : {}, {
        i: item.id
      });
    })
  } : {}), {
    y: common_vendor.t($options.selectedScheduleText),
    z: common_vendor.o((...args) => $options.handleBook && $options.handleBook(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b9a9a594"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/chef/detail.js.map

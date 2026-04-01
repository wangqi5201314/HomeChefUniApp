"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chef = require("../../api/chef.js");
const api_order = require("../../api/order.js");
const api_pay = require("../../api/pay.js");
const api_review = require("../../api/review.js");
const utils_orderStatus = require("../../utils/order-status.js");
const utils_scheduleTime = require("../../utils/schedule-time.js");
const utils_timeSlot = require("../../utils/time-slot.js");
const USER_ID_KEY = "user_id";
const INGREDIENT_MODE_TEXT_MAP = {
  1: "用户自备食材",
  2: "平台协同采购"
};
const _sfc_main = {
  name: "OrderDetailPage",
  data() {
    return {
      ORDER_STATUS: utils_orderStatus.ORDER_STATUS,
      id: "",
      userId: "",
      loading: false,
      reviewLoading: false,
      paying: false,
      cancelSubmitting: false,
      refundSubmitting: false,
      showCancelModal: false,
      showRefundModal: false,
      cancelReason: "",
      refundReason: "",
      orderDetail: {},
      chefInfo: null,
      orderReview: null
    };
  },
  computed: {
    isReviewed() {
      return this.orderDetail.reviewed === true || this.orderDetail.reviewed === 1;
    },
    statusLabel() {
      return utils_orderStatus.getOrderStatusLabel(this.orderDetail.orderStatus);
    },
    statusClass() {
      return utils_orderStatus.getOrderStatusClass(this.orderDetail.orderStatus);
    },
    showCancelButton() {
      return this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.PENDING_CONFIRM || this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.WAIT_PAY;
    },
    showPayButton() {
      return this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.WAIT_PAY;
    },
    showRefundButton() {
      return this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.PAID;
    },
    chefDisplay() {
      return {
        name: this.orderDetail.chefName || this.chefInfo && this.chefInfo.name || "",
        avatar: this.orderDetail.chefAvatar || this.chefInfo && this.chefInfo.avatar || "",
        phone: this.orderDetail.chefPhone || this.chefInfo && this.chefInfo.phone || "",
        specialtyCuisine: this.orderDetail.chefSpecialtyCuisine || this.chefInfo && this.chefInfo.specialtyCuisine || "",
        serviceModeDesc: this.orderDetail.chefServiceModeDesc || this.chefInfo && this.chefInfo.serviceModeDesc || ""
      };
    },
    showChefInfoSection() {
      const status = this.orderDetail.orderStatus;
      return (status === utils_orderStatus.ORDER_STATUS.IN_SERVICE || status === utils_orderStatus.ORDER_STATUS.COMPLETED) && !!this.chefDisplay.name;
    },
    showReviewSection() {
      return this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.COMPLETED;
    },
    hasOrderReview() {
      return !!(this.orderReview && this.orderReview.id);
    },
    showStatusNotice() {
      return this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.PAID || this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.IN_SERVICE || this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.COMPLETED || this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.REJECTED || this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.CANCELLED || this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.REFUNDED;
    },
    statusNoticeText() {
      const status = this.orderDetail.orderStatus;
      if (status === utils_orderStatus.ORDER_STATUS.PAID)
        return "已支付";
      if (status === utils_orderStatus.ORDER_STATUS.IN_SERVICE)
        return "服务中";
      if (status === utils_orderStatus.ORDER_STATUS.COMPLETED)
        return this.isReviewed ? "已评价" : "已完成";
      if (status === utils_orderStatus.ORDER_STATUS.REJECTED)
        return "厨师已拒单";
      if (status === utils_orderStatus.ORDER_STATUS.CANCELLED)
        return "已取消";
      if (status === utils_orderStatus.ORDER_STATUS.REFUNDED)
        return "已退款";
      return "";
    },
    showBackHomeButton() {
      return this.showCancelButton || this.showRefundButton;
    },
    showActionBar() {
      return this.showCancelButton || this.showPayButton || this.showRefundButton || this.showStatusNotice || this.showBackHomeButton;
    }
  },
  onLoad(options) {
    this.userId = common_vendor.index.getStorageSync(USER_ID_KEY) || "";
    this.id = options && options.id ? options.id : "";
    if (!this.id) {
      common_vendor.index.showToast({ title: "缺少订单 id", icon: "none" });
      return;
    }
    this.loadOrderDetail();
  },
  onShow() {
    if (this.id) {
      this.loadOrderDetail();
    }
  },
  methods: {
    formatFullDateTime: utils_scheduleTime.formatFullDateTime,
    formatScheduleDateTime: utils_scheduleTime.formatScheduleDateTime,
    getTimeSlotText: utils_timeSlot.getTimeSlotText,
    getIngredientModeText(value) {
      const normalizedValue = Number(value);
      if (INGREDIENT_MODE_TEXT_MAP[normalizedValue]) {
        return INGREDIENT_MODE_TEXT_MAP[normalizedValue];
      }
      return value || "-";
    },
    getChefInitial(name) {
      return name ? String(name).slice(0, 1) : "厨";
    },
    async loadOrderDetail() {
      this.loading = true;
      try {
        const data = await api_order.getOrderDetail(this.id);
        this.orderDetail = data || {};
        if (!this.userId && data && data.userId) {
          this.userId = data.userId;
        }
        await Promise.all([
          this.loadChefInfo(),
          this.loadOrderReview()
        ]);
      } catch (error) {
        this.orderDetail = {};
        this.chefInfo = null;
        this.orderReview = null;
      } finally {
        this.loading = false;
      }
    },
    async loadChefInfo() {
      this.chefInfo = null;
      const status = this.orderDetail.orderStatus;
      if (status !== utils_orderStatus.ORDER_STATUS.IN_SERVICE && status !== utils_orderStatus.ORDER_STATUS.COMPLETED) {
        return;
      }
      if (this.orderDetail.chefName || this.orderDetail.chefAvatar || this.orderDetail.chefPhone) {
        return;
      }
      if (!this.orderDetail.chefId) {
        return;
      }
      try {
        this.chefInfo = await api_chef.getChefDetail(this.orderDetail.chefId);
      } catch (error) {
        this.chefInfo = null;
      }
    },
    async loadOrderReview() {
      this.orderReview = null;
      if (this.orderDetail.orderStatus !== utils_orderStatus.ORDER_STATUS.COMPLETED) {
        return;
      }
      if (!this.orderDetail.id && !this.orderDetail.orderNo) {
        return;
      }
      this.reviewLoading = true;
      try {
        this.orderReview = await api_review.getSingleReview({
          orderId: this.orderDetail.id
        });
      } catch (error) {
        this.orderReview = null;
      } finally {
        this.reviewLoading = false;
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
    formatAmount(value) {
      if (value === 0) {
        return "0";
      }
      return value || "-";
    },
    openCancelPopup() {
      this.cancelReason = "";
      this.showCancelModal = true;
    },
    closeCancelPopup() {
      if (this.cancelSubmitting) {
        return;
      }
      this.showCancelModal = false;
    },
    async submitCancel() {
      if (this.cancelSubmitting) {
        return;
      }
      if (!this.cancelReason.trim()) {
        common_vendor.index.showToast({ title: "请输入取消原因", icon: "none" });
        return;
      }
      this.cancelSubmitting = true;
      try {
        await api_order.cancelOrder(this.id, { reason: this.cancelReason.trim() });
        common_vendor.index.showToast({ title: "取消成功", icon: "success" });
        this.showCancelModal = false;
        await this.loadOrderDetail();
      } finally {
        this.cancelSubmitting = false;
      }
    },
    openRefundPopup() {
      this.refundReason = "";
      this.showRefundModal = true;
    },
    closeRefundPopup() {
      if (this.refundSubmitting) {
        return;
      }
      this.showRefundModal = false;
    },
    async submitRefund() {
      if (this.refundSubmitting) {
        return;
      }
      if (!this.refundReason.trim()) {
        common_vendor.index.showToast({ title: "请输入退款原因", icon: "none" });
        return;
      }
      this.refundSubmitting = true;
      try {
        await api_pay.refundPayment({
          orderId: Number(this.orderDetail.id),
          refundAmount: Number(this.orderDetail.payAmount || 0),
          refundReason: this.refundReason.trim()
        });
        common_vendor.index.showToast({ title: "退款申请成功", icon: "success" });
        this.showRefundModal = false;
        await this.loadOrderDetail();
      } finally {
        this.refundSubmitting = false;
      }
    },
    async handlePay() {
      if (this.paying) {
        return;
      }
      this.paying = true;
      try {
        await api_pay.createPayment({ orderId: this.orderDetail.id });
        await api_pay.mockPaymentSuccess(this.orderDetail.id);
        common_vendor.index.showToast({ title: "支付成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateTo({ url: `/pages/pay/result?orderId=${this.orderDetail.id}` });
        }, 300);
      } finally {
        this.paying = false;
      }
    },
    goReview() {
      if (this.isReviewed || !this.orderDetail.id) {
        return;
      }
      common_vendor.index.navigateTo({ url: `/pages/review/create?orderId=${this.orderDetail.id}&chefId=${this.orderDetail.chefId}&userId=${this.orderDetail.userId}` });
    },
    goHome() {
      common_vendor.index.switchTab({ url: "/pages/home/index" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : !$data.orderDetail.id ? {} : common_vendor.e({
    c: common_vendor.t($data.orderDetail.orderNo || "-"),
    d: common_vendor.t($options.statusLabel),
    e: common_vendor.n($options.statusClass),
    f: common_vendor.t($options.formatFullDateTime($data.orderDetail.createdAt)),
    g: common_vendor.t($data.orderDetail.serviceDate || "-"),
    h: common_vendor.t($options.getTimeSlotText($data.orderDetail.timeSlot)),
    i: common_vendor.t($options.formatScheduleDateTime($data.orderDetail.serviceStartTime)),
    j: common_vendor.t($options.formatScheduleDateTime($data.orderDetail.serviceEndTime)),
    k: $options.showChefInfoSection
  }, $options.showChefInfoSection ? common_vendor.e({
    l: $options.chefDisplay.avatar
  }, $options.chefDisplay.avatar ? {
    m: $options.chefDisplay.avatar
  } : {
    n: common_vendor.t($options.getChefInitial($options.chefDisplay.name))
  }, {
    o: common_vendor.t($options.chefDisplay.name || "未命名厨师"),
    p: common_vendor.t($options.chefDisplay.specialtyCuisine || $options.chefDisplay.serviceModeDesc || "已开始为你服务"),
    q: common_vendor.t($options.chefDisplay.phone || "-")
  }) : {}, {
    r: common_vendor.t($data.orderDetail.peopleCount || "-"),
    s: common_vendor.t($data.orderDetail.tastePreference || "-"),
    t: common_vendor.t($data.orderDetail.tabooFood || "-"),
    v: common_vendor.t($data.orderDetail.specialRequirement || "-"),
    w: common_vendor.t($options.getIngredientModeText($data.orderDetail.ingredientMode)),
    x: common_vendor.t($data.orderDetail.ingredientList || "-"),
    y: common_vendor.t($data.orderDetail.contactName || "-"),
    z: common_vendor.t($data.orderDetail.contactPhone || "-"),
    A: common_vendor.t($data.orderDetail.fullAddress || "-"),
    B: common_vendor.t($options.formatAmount($data.orderDetail.totalAmount)),
    C: common_vendor.t($options.formatAmount($data.orderDetail.payAmount)),
    D: $data.orderDetail.cancelReason || $data.orderDetail.refundReason
  }, $data.orderDetail.cancelReason || $data.orderDetail.refundReason ? common_vendor.e({
    E: $data.orderDetail.cancelReason
  }, $data.orderDetail.cancelReason ? {
    F: common_vendor.t($data.orderDetail.cancelReason)
  } : {}, {
    G: $data.orderDetail.refundReason
  }, $data.orderDetail.refundReason ? {
    H: common_vendor.t($data.orderDetail.refundReason)
  } : {}) : {}, {
    I: $options.showReviewSection
  }, $options.showReviewSection ? common_vendor.e({
    J: $options.hasOrderReview
  }, $options.hasOrderReview ? {
    K: common_vendor.t($options.formatScore($data.orderReview.overallScore))
  } : {}, {
    L: $data.reviewLoading
  }, $data.reviewLoading ? {} : $options.hasOrderReview ? common_vendor.e({
    N: common_vendor.t($data.orderReview.isAnonymous === 1 ? "匿名评价" : "实名评价"),
    O: common_vendor.t($options.formatFullDateTime($data.orderReview.createdAt)),
    P: common_vendor.t($options.formatScore($data.orderReview.dishScore)),
    Q: common_vendor.t($options.formatScore($data.orderReview.serviceScore)),
    R: common_vendor.t($options.formatScore($data.orderReview.skillScore)),
    S: common_vendor.t($options.formatScore($data.orderReview.environmentScore)),
    T: common_vendor.t($data.orderReview.content || "未填写评价内容"),
    U: $options.parseImageUrls($data.orderReview.imageUrls).length
  }, $options.parseImageUrls($data.orderReview.imageUrls).length ? {
    V: common_vendor.f($options.parseImageUrls($data.orderReview.imageUrls), (url, index, i0) => {
      return {
        a: `${$data.orderReview.id}-${index}`,
        b: url,
        c: common_vendor.o(($event) => $options.previewImages($options.parseImageUrls($data.orderReview.imageUrls), index), `${$data.orderReview.id}-${index}`)
      };
    })
  } : {}, {
    W: $data.orderReview.replyContent
  }, $data.orderReview.replyContent ? common_vendor.e({
    X: common_vendor.t($data.orderReview.replyContent),
    Y: $data.orderReview.replyAt
  }, $data.orderReview.replyAt ? {
    Z: common_vendor.t($options.formatFullDateTime($data.orderReview.replyAt))
  } : {}) : {}) : {
    aa: common_vendor.o((...args) => $options.goReview && $options.goReview(...args))
  }, {
    M: $options.hasOrderReview
  }) : {}), {
    b: !$data.orderDetail.id,
    ab: $options.showActionBar
  }, $options.showActionBar ? common_vendor.e({
    ac: $options.showCancelButton
  }, $options.showCancelButton ? {
    ad: $data.cancelSubmitting,
    ae: $data.cancelSubmitting || $data.paying || $data.refundSubmitting,
    af: common_vendor.o((...args) => $options.openCancelPopup && $options.openCancelPopup(...args))
  } : {}, {
    ag: $options.showPayButton
  }, $options.showPayButton ? {
    ah: $data.paying,
    ai: $data.paying || $data.cancelSubmitting || $data.refundSubmitting,
    aj: common_vendor.o((...args) => $options.handlePay && $options.handlePay(...args))
  } : {}, {
    ak: $options.showRefundButton
  }, $options.showRefundButton ? {
    al: $data.refundSubmitting,
    am: $data.refundSubmitting || $data.paying || $data.cancelSubmitting,
    an: common_vendor.o((...args) => $options.openRefundPopup && $options.openRefundPopup(...args))
  } : {}, {
    ao: $options.showStatusNotice
  }, $options.showStatusNotice ? {
    ap: common_vendor.t($options.statusNoticeText)
  } : {}, {
    aq: $options.showBackHomeButton
  }, $options.showBackHomeButton ? {
    ar: common_vendor.o((...args) => $options.goHome && $options.goHome(...args))
  } : {}) : {}, {
    as: $data.showCancelModal
  }, $data.showCancelModal ? {
    at: $data.cancelReason,
    av: common_vendor.o(($event) => $data.cancelReason = $event.detail.value),
    aw: common_vendor.o((...args) => $options.closeCancelPopup && $options.closeCancelPopup(...args)),
    ax: $data.cancelSubmitting,
    ay: $data.cancelSubmitting,
    az: common_vendor.o((...args) => $options.submitCancel && $options.submitCancel(...args)),
    aA: common_vendor.o(() => {
    }),
    aB: common_vendor.o((...args) => $options.closeCancelPopup && $options.closeCancelPopup(...args))
  } : {}, {
    aC: $data.showRefundModal
  }, $data.showRefundModal ? {
    aD: $data.refundReason,
    aE: common_vendor.o(($event) => $data.refundReason = $event.detail.value),
    aF: common_vendor.o((...args) => $options.closeRefundPopup && $options.closeRefundPopup(...args)),
    aG: $data.refundSubmitting,
    aH: $data.refundSubmitting,
    aI: common_vendor.o((...args) => $options.submitRefund && $options.submitRefund(...args)),
    aJ: common_vendor.o(() => {
    }),
    aK: common_vendor.o((...args) => $options.closeRefundPopup && $options.closeRefundPopup(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6b23c96c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/detail.js.map

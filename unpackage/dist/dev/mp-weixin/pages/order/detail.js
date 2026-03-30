"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const api_pay = require("../../api/pay.js");
const utils_orderStatus = require("../../utils/order-status.js");
const utils_scheduleTime = require("../../utils/schedule-time.js");
const utils_timeSlot = require("../../utils/time-slot.js");
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
      loading: false,
      paying: false,
      cancelSubmitting: false,
      refundSubmitting: false,
      showCancelModal: false,
      showRefundModal: false,
      cancelReason: "",
      refundReason: "",
      orderDetail: {}
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
    showReviewButton() {
      return this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.COMPLETED && !this.isReviewed;
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
      return this.showCancelButton || this.showPayButton || this.showRefundButton || this.showReviewButton || this.showStatusNotice || this.showBackHomeButton;
    }
  },
  onLoad(options) {
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
    async loadOrderDetail() {
      this.loading = true;
      try {
        const data = await api_order.getOrderDetail(this.id);
        this.orderDetail = data || {};
      } catch (error) {
        this.orderDetail = {};
      } finally {
        this.loading = false;
      }
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
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
      } finally {
        this.paying = false;
      }
    },
    goReview() {
      if (this.isReviewed) {
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
    k: common_vendor.t($data.orderDetail.peopleCount || "-"),
    l: common_vendor.t($data.orderDetail.tastePreference || "-"),
    m: common_vendor.t($data.orderDetail.tabooFood || "-"),
    n: common_vendor.t($data.orderDetail.specialRequirement || "-"),
    o: common_vendor.t($options.getIngredientModeText($data.orderDetail.ingredientMode)),
    p: common_vendor.t($data.orderDetail.ingredientList || "-"),
    q: common_vendor.t($data.orderDetail.contactName || "-"),
    r: common_vendor.t($data.orderDetail.contactPhone || "-"),
    s: common_vendor.t($data.orderDetail.fullAddress || "-"),
    t: common_vendor.t($options.formatAmount($data.orderDetail.totalAmount)),
    v: common_vendor.t($options.formatAmount($data.orderDetail.payAmount)),
    w: $data.orderDetail.cancelReason || $data.orderDetail.refundReason
  }, $data.orderDetail.cancelReason || $data.orderDetail.refundReason ? common_vendor.e({
    x: $data.orderDetail.cancelReason
  }, $data.orderDetail.cancelReason ? {
    y: common_vendor.t($data.orderDetail.cancelReason)
  } : {}, {
    z: $data.orderDetail.refundReason
  }, $data.orderDetail.refundReason ? {
    A: common_vendor.t($data.orderDetail.refundReason)
  } : {}) : {}), {
    b: !$data.orderDetail.id,
    B: $options.showActionBar
  }, $options.showActionBar ? common_vendor.e({
    C: $options.showCancelButton
  }, $options.showCancelButton ? {
    D: $data.cancelSubmitting,
    E: $data.cancelSubmitting || $data.paying || $data.refundSubmitting,
    F: common_vendor.o((...args) => $options.openCancelPopup && $options.openCancelPopup(...args))
  } : {}, {
    G: $options.showPayButton
  }, $options.showPayButton ? {
    H: $data.paying,
    I: $data.paying || $data.cancelSubmitting || $data.refundSubmitting,
    J: common_vendor.o((...args) => $options.handlePay && $options.handlePay(...args))
  } : {}, {
    K: $options.showRefundButton
  }, $options.showRefundButton ? {
    L: $data.refundSubmitting,
    M: $data.refundSubmitting || $data.paying || $data.cancelSubmitting,
    N: common_vendor.o((...args) => $options.openRefundPopup && $options.openRefundPopup(...args))
  } : {}, {
    O: $options.showReviewButton
  }, $options.showReviewButton ? {
    P: common_vendor.o((...args) => $options.goReview && $options.goReview(...args))
  } : {}, {
    Q: $options.showStatusNotice
  }, $options.showStatusNotice ? {
    R: common_vendor.t($options.statusNoticeText)
  } : {}, {
    S: $options.showBackHomeButton
  }, $options.showBackHomeButton ? {
    T: common_vendor.o((...args) => $options.goHome && $options.goHome(...args))
  } : {}) : {}, {
    U: $data.showCancelModal
  }, $data.showCancelModal ? {
    V: $data.cancelReason,
    W: common_vendor.o(($event) => $data.cancelReason = $event.detail.value),
    X: common_vendor.o((...args) => $options.closeCancelPopup && $options.closeCancelPopup(...args)),
    Y: $data.cancelSubmitting,
    Z: $data.cancelSubmitting,
    aa: common_vendor.o((...args) => $options.submitCancel && $options.submitCancel(...args)),
    ab: common_vendor.o(() => {
    }),
    ac: common_vendor.o((...args) => $options.closeCancelPopup && $options.closeCancelPopup(...args))
  } : {}, {
    ad: $data.showRefundModal
  }, $data.showRefundModal ? {
    ae: $data.refundReason,
    af: common_vendor.o(($event) => $data.refundReason = $event.detail.value),
    ag: common_vendor.o((...args) => $options.closeRefundPopup && $options.closeRefundPopup(...args)),
    ah: $data.refundSubmitting,
    ai: $data.refundSubmitting,
    aj: common_vendor.o((...args) => $options.submitRefund && $options.submitRefund(...args)),
    ak: common_vendor.o(() => {
    }),
    al: common_vendor.o((...args) => $options.closeRefundPopup && $options.closeRefundPopup(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6b23c96c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/detail.js.map

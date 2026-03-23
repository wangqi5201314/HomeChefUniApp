"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const api_pay = require("../../api/pay.js");
const utils_orderStatus = require("../../utils/order-status.js");
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
    f: common_vendor.t($data.orderDetail.createdAt || "-"),
    g: common_vendor.t($data.orderDetail.serviceDate || "-"),
    h: common_vendor.t($data.orderDetail.timeSlot || "-"),
    i: common_vendor.t($data.orderDetail.serviceStartTime || "-"),
    j: common_vendor.t($data.orderDetail.serviceEndTime || "-"),
    k: common_vendor.t($data.orderDetail.chefId || "-"),
    l: common_vendor.t($data.orderDetail.addressId || "-"),
    m: common_vendor.t($data.orderDetail.peopleCount || "-"),
    n: common_vendor.t($data.orderDetail.tastePreference || "-"),
    o: common_vendor.t($data.orderDetail.tabooFood || "-"),
    p: common_vendor.t($data.orderDetail.specialRequirement || "-"),
    q: common_vendor.t($data.orderDetail.ingredientMode || "-"),
    r: common_vendor.t($data.orderDetail.ingredientList || "-"),
    s: common_vendor.t($data.orderDetail.contactName || "-"),
    t: common_vendor.t($data.orderDetail.contactPhone || "-"),
    v: common_vendor.t($data.orderDetail.fullAddress || "-"),
    w: common_vendor.t($options.formatAmount($data.orderDetail.totalAmount)),
    x: common_vendor.t($options.formatAmount($data.orderDetail.payAmount)),
    y: $data.orderDetail.cancelReason || $data.orderDetail.refundReason
  }, $data.orderDetail.cancelReason || $data.orderDetail.refundReason ? common_vendor.e({
    z: $data.orderDetail.cancelReason
  }, $data.orderDetail.cancelReason ? {
    A: common_vendor.t($data.orderDetail.cancelReason)
  } : {}, {
    B: $data.orderDetail.refundReason
  }, $data.orderDetail.refundReason ? {
    C: common_vendor.t($data.orderDetail.refundReason)
  } : {}) : {}), {
    b: !$data.orderDetail.id,
    D: $options.showActionBar
  }, $options.showActionBar ? common_vendor.e({
    E: $options.showCancelButton
  }, $options.showCancelButton ? {
    F: $data.cancelSubmitting,
    G: $data.cancelSubmitting || $data.paying || $data.refundSubmitting,
    H: common_vendor.o((...args) => $options.openCancelPopup && $options.openCancelPopup(...args))
  } : {}, {
    I: $options.showPayButton
  }, $options.showPayButton ? {
    J: $data.paying,
    K: $data.paying || $data.cancelSubmitting || $data.refundSubmitting,
    L: common_vendor.o((...args) => $options.handlePay && $options.handlePay(...args))
  } : {}, {
    M: $options.showRefundButton
  }, $options.showRefundButton ? {
    N: $data.refundSubmitting,
    O: $data.refundSubmitting || $data.paying || $data.cancelSubmitting,
    P: common_vendor.o((...args) => $options.openRefundPopup && $options.openRefundPopup(...args))
  } : {}, {
    Q: $options.showReviewButton
  }, $options.showReviewButton ? {
    R: common_vendor.o((...args) => $options.goReview && $options.goReview(...args))
  } : {}, {
    S: $options.showStatusNotice
  }, $options.showStatusNotice ? {
    T: common_vendor.t($options.statusNoticeText)
  } : {}, {
    U: $options.showBackHomeButton
  }, $options.showBackHomeButton ? {
    V: common_vendor.o((...args) => $options.goHome && $options.goHome(...args))
  } : {}) : {}, {
    W: $data.showCancelModal
  }, $data.showCancelModal ? {
    X: $data.cancelReason,
    Y: common_vendor.o(($event) => $data.cancelReason = $event.detail.value),
    Z: common_vendor.o((...args) => $options.closeCancelPopup && $options.closeCancelPopup(...args)),
    aa: $data.cancelSubmitting,
    ab: $data.cancelSubmitting,
    ac: common_vendor.o((...args) => $options.submitCancel && $options.submitCancel(...args)),
    ad: common_vendor.o(() => {
    }),
    ae: common_vendor.o((...args) => $options.closeCancelPopup && $options.closeCancelPopup(...args))
  } : {}, {
    af: $data.showRefundModal
  }, $data.showRefundModal ? {
    ag: $data.refundReason,
    ah: common_vendor.o(($event) => $data.refundReason = $event.detail.value),
    ai: common_vendor.o((...args) => $options.closeRefundPopup && $options.closeRefundPopup(...args)),
    aj: $data.refundSubmitting,
    ak: $data.refundSubmitting,
    al: common_vendor.o((...args) => $options.submitRefund && $options.submitRefund(...args)),
    am: common_vendor.o(() => {
    }),
    an: common_vendor.o((...args) => $options.closeRefundPopup && $options.closeRefundPopup(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6b23c96c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/detail.js.map

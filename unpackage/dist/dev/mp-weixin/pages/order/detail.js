"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const api_pay = require("../../api/pay.js");
const _sfc_main = {
  name: "OrderDetailPage",
  data() {
    return {
      id: "",
      loading: false,
      paying: false,
      cancelSubmitting: false,
      showCancelModal: false,
      cancelReason: "",
      orderDetail: {}
    };
  },
  computed: {
    showCancelButton() {
      return this.orderDetail.orderStatus === "PENDING_CONFIRM" || this.orderDetail.orderStatus === "WAIT_PAY" || this.orderDetail.orderStatus === "PAID";
    },
    showPayButton() {
      return this.orderDetail.orderStatus === "WAIT_PAY" || this.orderDetail.orderStatus === "PENDING_CONFIRM";
    },
    showReviewButton() {
      return this.orderDetail.orderStatus === "COMPLETED";
    },
    showActionBar() {
      return this.showCancelButton || this.showPayButton || this.showReviewButton;
    },
    statusClass() {
      const status = this.orderDetail.orderStatus;
      if (status === "WAIT_PAY" || status === "PENDING_CONFIRM") {
        return "pending";
      }
      if (status === "PAID" || status === "COMPLETED") {
        return "success";
      }
      if (status === "CANCELLED" || status === "REFUNDED") {
        return "danger";
      }
      return "";
    }
  },
  onLoad(options) {
    this.id = options && options.id ? options.id : "";
    if (!this.id) {
      common_vendor.index.showToast({
        title: "缺少订单 id",
        icon: "none"
      });
      return;
    }
    this.loadOrderDetail();
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
    formatPlain(value) {
      if (value === 0) {
        return "0";
      }
      return value || "-";
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
        common_vendor.index.showToast({
          title: "请输入取消原因",
          icon: "none"
        });
        return;
      }
      this.cancelSubmitting = true;
      try {
        await api_order.cancelOrder(this.id, {
          reason: this.cancelReason.trim()
        });
        common_vendor.index.showToast({
          title: "取消成功",
          icon: "success"
        });
        this.showCancelModal = false;
        this.loadOrderDetail();
      } catch (error) {
      } finally {
        this.cancelSubmitting = false;
      }
    },
    async handlePay() {
      if (this.paying) {
        return;
      }
      this.paying = true;
      try {
        await api_pay.createPayment({
          orderId: this.orderDetail.id
        });
        await api_pay.mockPaymentSuccess(this.orderDetail.id);
        common_vendor.index.showToast({
          title: "支付成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: `/pages/pay/result?orderId=${this.orderDetail.id}`
          });
        }, 300);
      } catch (error) {
      } finally {
        this.paying = false;
      }
    },
    goReview() {
      common_vendor.index.navigateTo({
        url: `/pages/review/create?orderId=${this.orderDetail.id}&chefId=${this.orderDetail.chefId}&userId=${this.orderDetail.userId}`
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : !$data.orderDetail.id ? {} : common_vendor.e({
    c: common_vendor.t($data.orderDetail.orderNo || "-"),
    d: common_vendor.t($data.orderDetail.orderStatus || "-"),
    e: common_vendor.n($options.statusClass),
    f: common_vendor.t($data.orderDetail.createdAt || "-"),
    g: common_vendor.t($data.orderDetail.serviceDate || "-"),
    h: common_vendor.t($data.orderDetail.timeSlot || "-"),
    i: common_vendor.t($data.orderDetail.serviceStartTime || "-"),
    j: common_vendor.t($data.orderDetail.serviceEndTime || "-"),
    k: common_vendor.t($data.orderDetail.chefId || "-"),
    l: common_vendor.t($data.orderDetail.addressId || "-"),
    m: common_vendor.t($data.orderDetail.confirmCode || "-"),
    n: common_vendor.t($data.orderDetail.peopleCount || "-"),
    o: common_vendor.t($data.orderDetail.tastePreference || "-"),
    p: common_vendor.t($data.orderDetail.tabooFood || "-"),
    q: common_vendor.t($data.orderDetail.specialRequirement || "-"),
    r: common_vendor.t($data.orderDetail.ingredientMode || "-"),
    s: common_vendor.t($data.orderDetail.ingredientList || "-"),
    t: common_vendor.t($data.orderDetail.contactName || "-"),
    v: common_vendor.t($data.orderDetail.contactPhone || "-"),
    w: common_vendor.t($data.orderDetail.fullAddress || "-"),
    x: common_vendor.t($options.formatPlain($data.orderDetail.longitude)),
    y: common_vendor.t($options.formatPlain($data.orderDetail.latitude)),
    z: common_vendor.t($options.formatAmount($data.orderDetail.totalAmount)),
    A: common_vendor.t($options.formatAmount($data.orderDetail.discountAmount)),
    B: common_vendor.t($options.formatAmount($data.orderDetail.payAmount)),
    C: $data.orderDetail.cancelReason || $data.orderDetail.refundReason
  }, $data.orderDetail.cancelReason || $data.orderDetail.refundReason ? common_vendor.e({
    D: $data.orderDetail.cancelReason
  }, $data.orderDetail.cancelReason ? {
    E: common_vendor.t($data.orderDetail.cancelReason)
  } : {}, {
    F: $data.orderDetail.refundReason
  }, $data.orderDetail.refundReason ? {
    G: common_vendor.t($data.orderDetail.refundReason)
  } : {}) : {}), {
    b: !$data.orderDetail.id,
    H: $options.showActionBar
  }, $options.showActionBar ? common_vendor.e({
    I: $options.showCancelButton
  }, $options.showCancelButton ? {
    J: $data.cancelSubmitting,
    K: $data.cancelSubmitting || $data.paying,
    L: common_vendor.o((...args) => $options.openCancelPopup && $options.openCancelPopup(...args))
  } : {}, {
    M: $options.showPayButton
  }, $options.showPayButton ? {
    N: $data.paying,
    O: $data.paying || $data.cancelSubmitting,
    P: common_vendor.o((...args) => $options.handlePay && $options.handlePay(...args))
  } : {}, {
    Q: $options.showReviewButton
  }, $options.showReviewButton ? {
    R: common_vendor.o((...args) => $options.goReview && $options.goReview(...args))
  } : {}) : {}, {
    S: $data.showCancelModal
  }, $data.showCancelModal ? {
    T: $data.cancelReason,
    U: common_vendor.o(($event) => $data.cancelReason = $event.detail.value),
    V: common_vendor.o((...args) => $options.closeCancelPopup && $options.closeCancelPopup(...args)),
    W: $data.cancelSubmitting,
    X: $data.cancelSubmitting,
    Y: common_vendor.o((...args) => $options.submitCancel && $options.submitCancel(...args)),
    Z: common_vendor.o(() => {
    }),
    aa: common_vendor.o((...args) => $options.closeCancelPopup && $options.closeCancelPopup(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6b23c96c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/detail.js.map

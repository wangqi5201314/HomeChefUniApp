"use strict";
const common_vendor = require("../../common/vendor.js");
const api_pay = require("../../api/pay.js");
const utils_payStatus = require("../../utils/pay-status.js");
const utils_refundStatus = require("../../utils/refund-status.js");
const _sfc_main = {
  name: "PayResultPage",
  data() {
    return {
      orderId: "",
      loading: false,
      payInfo: {}
    };
  },
  computed: {
    isPaid() {
      return this.payInfo.payStatus === "PAID";
    },
    payStatusText() {
      if (this.payInfo.payStatusDesc) {
        return this.payInfo.payStatusDesc;
      }
      if (this.payInfo.payStatus) {
        return utils_payStatus.getPayStatusText(this.payInfo.payStatus);
      }
      return "未知状态";
    },
    refundStatusText() {
      if (this.payInfo.refundStatusDesc) {
        return this.payInfo.refundStatusDesc;
      }
      if (this.payInfo.refundStatus) {
        return utils_refundStatus.getRefundStatusText(this.payInfo.refundStatus);
      }
      return "未知状态";
    },
    hasRefundStatus() {
      return Boolean(this.payInfo.refundStatus || this.payInfo.refundStatusDesc);
    }
  },
  onLoad(options) {
    this.orderId = options && options.orderId ? options.orderId : "";
    if (!this.orderId) {
      common_vendor.index.showToast({ title: "缺少订单 id", icon: "none" });
      return;
    }
    this.loadPayStatus();
  },
  methods: {
    async loadPayStatus() {
      this.loading = true;
      try {
        const data = await api_pay.getPaymentStatus(this.orderId);
        this.payInfo = data || {};
      } catch (error) {
        this.payInfo = {};
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
    goOrderDetail() {
      common_vendor.index.navigateTo({ url: `/pages/order/detail?id=${this.orderId}` });
    },
    goOrderList() {
      common_vendor.index.switchTab({ url: "/pages/order/list" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : common_vendor.e({
    b: common_vendor.t($options.isPaid ? "✓" : "!"),
    c: common_vendor.n($options.isPaid ? "success" : "pending"),
    d: common_vendor.t($options.isPaid ? "支付成功" : "支付未完成"),
    e: common_vendor.t($options.isPaid ? "订单支付已完成，可返回查看订单详情。" : "当前订单尚未完成支付，请稍后重试或返回查看订单。"),
    f: common_vendor.t($data.payInfo.payNo || "-"),
    g: common_vendor.t($options.formatAmount($data.payInfo.payAmount)),
    h: common_vendor.t($options.payStatusText),
    i: $options.hasRefundStatus
  }, $options.hasRefundStatus ? {
    j: common_vendor.t($options.refundStatusText)
  } : {}, {
    k: common_vendor.t($data.payInfo.paidAt || "-"),
    l: common_vendor.o((...args) => $options.goOrderDetail && $options.goOrderDetail(...args)),
    m: common_vendor.o((...args) => $options.goOrderList && $options.goOrderList(...args))
  }));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-42b1ec48"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/pay/result.js.map

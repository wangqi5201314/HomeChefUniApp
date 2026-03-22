"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefOrder = require("../../api/chef-order.js");
const _sfc_main = {
  name: "ChefOrderDetailPage",
  data() {
    return {
      loading: false,
      actionLoading: false,
      pendingAction: "",
      orderId: "",
      orderDetail: {},
      showRejectPopup: false,
      rejectReason: ""
    };
  },
  onLoad(options) {
    this.orderId = options && options.id ? options.id : "";
    this.fetchOrderDetail();
  },
  methods: {
    async fetchOrderDetail() {
      if (!this.orderId) {
        common_vendor.index.showToast({
          title: "缺少订单ID",
          icon: "none"
        });
        return;
      }
      this.loading = true;
      try {
        const data = await api_chefOrder.getChefOrderDetail(this.orderId);
        this.orderDetail = data || {};
      } catch (error) {
        this.orderDetail = {};
      } finally {
        this.loading = false;
      }
    },
    async handleAccept() {
      await this.runOrderAction("accept", async () => {
        await api_chefOrder.acceptChefOrder(this.orderId);
      }, "接单成功");
    },
    async handleStart() {
      await this.runOrderAction("start", async () => {
        await api_chefOrder.startChefOrder(this.orderId);
      }, "已开始服务");
    },
    async handleFinish() {
      await this.runOrderAction("finish", async () => {
        await api_chefOrder.finishChefOrder(this.orderId);
      }, "服务已完成");
    },
    async handleReject() {
      if (!this.rejectReason.trim()) {
        common_vendor.index.showToast({
          title: "请输入拒单原因",
          icon: "none"
        });
        return;
      }
      await this.runOrderAction("reject", async () => {
        await api_chefOrder.rejectChefOrder(this.orderId, {
          reason: this.rejectReason.trim()
        });
      }, "拒单成功", true);
    },
    async runOrderAction(action, handler, successText, closePopup = false) {
      if (this.actionLoading) {
        return;
      }
      this.actionLoading = true;
      this.pendingAction = action;
      try {
        await handler();
        common_vendor.index.showToast({
          title: successText,
          icon: "success"
        });
        if (closePopup) {
          this.closeRejectPopup();
        }
        await this.fetchOrderDetail();
      } catch (error) {
      } finally {
        this.actionLoading = false;
        this.pendingAction = "";
      }
    },
    openRejectPopup() {
      this.rejectReason = "";
      this.showRejectPopup = true;
    },
    closeRejectPopup() {
      this.showRejectPopup = false;
      this.rejectReason = "";
    },
    backToList() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        common_vendor.index.navigateBack({
          delta: 1
        });
        return;
      }
      common_vendor.index.redirectTo({
        url: "/pages-chef/order/list"
      });
    },
    formatPeopleCount(value) {
      if (value === 0) {
        return "0人";
      }
      return value ? `${value}人` : "-";
    },
    formatAmount(value) {
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
  }, $data.loading ? {} : !$data.orderDetail.id ? {
    c: common_vendor.o((...args) => $options.backToList && $options.backToList(...args))
  } : common_vendor.e({
    d: common_vendor.t($data.orderDetail.orderStatus || "-"),
    e: common_vendor.t($data.orderDetail.orderNo || "-"),
    f: common_vendor.t($data.orderDetail.serviceDate || "-"),
    g: common_vendor.t($data.orderDetail.timeSlot || "-"),
    h: common_vendor.t($data.orderDetail.serviceStartTime || "-"),
    i: common_vendor.t($data.orderDetail.serviceEndTime || "-"),
    j: common_vendor.t($options.formatPeopleCount($data.orderDetail.peopleCount)),
    k: common_vendor.t($data.orderDetail.tastePreference || "-"),
    l: common_vendor.t($data.orderDetail.tabooFood || "-"),
    m: common_vendor.t($data.orderDetail.specialRequirement || "-"),
    n: common_vendor.t($data.orderDetail.ingredientMode || "-"),
    o: common_vendor.t($data.orderDetail.ingredientList || "-"),
    p: common_vendor.t($data.orderDetail.contactName || "-"),
    q: common_vendor.t($data.orderDetail.contactPhone || "-"),
    r: common_vendor.t($data.orderDetail.fullAddress || "-"),
    s: common_vendor.t($options.formatAmount($data.orderDetail.totalAmount)),
    t: common_vendor.t($options.formatAmount($data.orderDetail.payAmount)),
    v: common_vendor.t($data.orderDetail.createdAt || "-"),
    w: $data.orderDetail.orderStatus === "PENDING_CONFIRM"
  }, $data.orderDetail.orderStatus === "PENDING_CONFIRM" ? {
    x: $data.actionLoading,
    y: common_vendor.o((...args) => $options.openRejectPopup && $options.openRejectPopup(...args))
  } : {}, {
    z: $data.orderDetail.orderStatus === "PENDING_CONFIRM"
  }, $data.orderDetail.orderStatus === "PENDING_CONFIRM" ? {
    A: $data.actionLoading && $data.pendingAction === "accept",
    B: $data.actionLoading,
    C: common_vendor.o((...args) => $options.handleAccept && $options.handleAccept(...args))
  } : {}, {
    D: $data.orderDetail.orderStatus === "PAID"
  }, $data.orderDetail.orderStatus === "PAID" ? {
    E: $data.actionLoading && $data.pendingAction === "start",
    F: $data.actionLoading,
    G: common_vendor.o((...args) => $options.handleStart && $options.handleStart(...args))
  } : {}, {
    H: $data.orderDetail.orderStatus === "IN_SERVICE"
  }, $data.orderDetail.orderStatus === "IN_SERVICE" ? {
    I: $data.actionLoading && $data.pendingAction === "finish",
    J: $data.actionLoading,
    K: common_vendor.o((...args) => $options.handleFinish && $options.handleFinish(...args))
  } : {}, {
    L: $data.actionLoading,
    M: common_vendor.o((...args) => $options.backToList && $options.backToList(...args))
  }), {
    b: !$data.orderDetail.id,
    N: $data.showRejectPopup
  }, $data.showRejectPopup ? {
    O: $data.rejectReason,
    P: common_vendor.o(($event) => $data.rejectReason = $event.detail.value),
    Q: $data.actionLoading,
    R: common_vendor.o((...args) => $options.closeRejectPopup && $options.closeRejectPopup(...args)),
    S: $data.actionLoading && $data.pendingAction === "reject",
    T: $data.actionLoading,
    U: common_vendor.o((...args) => $options.handleReject && $options.handleReject(...args)),
    V: common_vendor.o(() => {
    }),
    W: common_vendor.o((...args) => $options.closeRejectPopup && $options.closeRejectPopup(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f5138f84"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/order/detail.js.map

"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefOrder = require("../../api/chef-order.js");
const utils_orderStatus = require("../../utils/order-status.js");
const utils_scheduleTime = require("../../utils/schedule-time.js");
const utils_timeSlot = require("../../utils/time-slot.js");
const INGREDIENT_MODE_TEXT_MAP = {
  1: "用户自备食材",
  2: "平台协同采购"
};
const _sfc_main = {
  name: "ChefOrderDetailPage",
  data() {
    return {
      ORDER_STATUS: utils_orderStatus.ORDER_STATUS,
      loading: false,
      actionLoading: false,
      pendingAction: "",
      orderId: "",
      orderDetail: {},
      showRejectPopup: false,
      rejectReason: ""
    };
  },
  computed: {
    statusLabel() {
      return utils_orderStatus.getOrderStatusLabel(this.orderDetail.orderStatus);
    },
    statusClass() {
      return utils_orderStatus.getOrderStatusClass(this.orderDetail.orderStatus);
    },
    showAcceptButton() {
      return this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.PENDING_CONFIRM;
    },
    showStartButton() {
      return this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.PAID;
    },
    showFinishButton() {
      return this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.IN_SERVICE;
    },
    showStatusNotice() {
      return this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.WAIT_PAY || this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.COMPLETED || this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.REJECTED || this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.CANCELLED || this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.REFUNDED;
    },
    statusNoticeText() {
      const status = this.orderDetail.orderStatus;
      if (status === utils_orderStatus.ORDER_STATUS.WAIT_PAY) {
        return "待用户支付";
      }
      if (status === utils_orderStatus.ORDER_STATUS.COMPLETED) {
        return "服务已完成";
      }
      if (status === utils_orderStatus.ORDER_STATUS.REJECTED) {
        return "已拒单";
      }
      if (status === utils_orderStatus.ORDER_STATUS.CANCELLED) {
        return "用户已取消";
      }
      if (status === utils_orderStatus.ORDER_STATUS.REFUNDED) {
        return "已退款";
      }
      return "";
    },
    statusPanelLabel() {
      const status = this.orderDetail.orderStatus;
      if (status === utils_orderStatus.ORDER_STATUS.WAIT_PAY) {
        return "订单进度";
      }
      if (status === utils_orderStatus.ORDER_STATUS.COMPLETED) {
        return "当前状态";
      }
      if (status === utils_orderStatus.ORDER_STATUS.REJECTED || status === utils_orderStatus.ORDER_STATUS.CANCELLED || status === utils_orderStatus.ORDER_STATUS.REFUNDED) {
        return "处理结果";
      }
      return "状态提示";
    },
    statusPanelClass() {
      const status = this.orderDetail.orderStatus;
      if (status === utils_orderStatus.ORDER_STATUS.WAIT_PAY) {
        return "status-panel--pending";
      }
      if (status === utils_orderStatus.ORDER_STATUS.COMPLETED) {
        return "status-panel--success";
      }
      return "status-panel--danger";
    }
  },
  onLoad(options) {
    this.orderId = options && options.id ? options.id : "";
    this.fetchOrderDetail();
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
    d: common_vendor.t($options.statusLabel),
    e: common_vendor.n($options.statusClass),
    f: common_vendor.t($data.orderDetail.orderNo || "-"),
    g: common_vendor.t($data.orderDetail.serviceDate || "-"),
    h: common_vendor.t($options.getTimeSlotText($data.orderDetail.timeSlot)),
    i: common_vendor.t($options.formatScheduleDateTime($data.orderDetail.serviceStartTime)),
    j: common_vendor.t($options.formatScheduleDateTime($data.orderDetail.serviceEndTime)),
    k: common_vendor.t($options.formatPeopleCount($data.orderDetail.peopleCount)),
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
    w: common_vendor.t($options.formatFullDateTime($data.orderDetail.createdAt)),
    x: $options.showAcceptButton
  }, $options.showAcceptButton ? {
    y: $data.actionLoading,
    z: common_vendor.o((...args) => $options.openRejectPopup && $options.openRejectPopup(...args))
  } : {}, {
    A: $options.showAcceptButton
  }, $options.showAcceptButton ? {
    B: $data.actionLoading && $data.pendingAction === "accept",
    C: $data.actionLoading,
    D: common_vendor.o((...args) => $options.handleAccept && $options.handleAccept(...args))
  } : {}, {
    E: $options.showStartButton
  }, $options.showStartButton ? {
    F: $data.actionLoading && $data.pendingAction === "start",
    G: $data.actionLoading,
    H: common_vendor.o((...args) => $options.handleStart && $options.handleStart(...args))
  } : {}, {
    I: $options.showFinishButton
  }, $options.showFinishButton ? {
    J: $data.actionLoading && $data.pendingAction === "finish",
    K: $data.actionLoading,
    L: common_vendor.o((...args) => $options.handleFinish && $options.handleFinish(...args))
  } : {}, {
    M: $options.showStatusNotice
  }, $options.showStatusNotice ? {
    N: common_vendor.t($options.statusPanelLabel),
    O: common_vendor.t($options.statusNoticeText),
    P: common_vendor.n($options.statusPanelClass)
  } : {}, {
    Q: $data.actionLoading,
    R: common_vendor.o((...args) => $options.backToList && $options.backToList(...args))
  }), {
    b: !$data.orderDetail.id,
    S: $data.showRejectPopup
  }, $data.showRejectPopup ? {
    T: $data.rejectReason,
    U: common_vendor.o(($event) => $data.rejectReason = $event.detail.value),
    V: $data.actionLoading,
    W: common_vendor.o((...args) => $options.closeRejectPopup && $options.closeRejectPopup(...args)),
    X: $data.actionLoading && $data.pendingAction === "reject",
    Y: $data.actionLoading,
    Z: common_vendor.o((...args) => $options.handleReject && $options.handleReject(...args)),
    aa: common_vendor.o(() => {
    }),
    ab: common_vendor.o((...args) => $options.closeRejectPopup && $options.closeRejectPopup(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f5138f84"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/order/detail.js.map

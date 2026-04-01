"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const utils_orderStatus = require("../../utils/order-status.js");
const utils_scheduleTime = require("../../utils/schedule-time.js");
const utils_timeSlot = require("../../utils/time-slot.js");
const USER_ID_KEY = "user_id";
const _sfc_main = {
  name: "OrderListPage",
  data() {
    return {
      ORDER_STATUS: utils_orderStatus.ORDER_STATUS,
      userId: "",
      loading: false,
      activeStatus: "",
      orderList: [],
      statusTabs: utils_orderStatus.USER_ORDER_STATUS_TABS
    };
  },
  onShow() {
    this.userId = common_vendor.index.getStorageSync(USER_ID_KEY) || "";
    this.fetchOrderList();
  },
  onPullDownRefresh() {
    this.fetchOrderList({
      fromPullDownRefresh: true
    });
  },
  methods: {
    formatFullDateTime: utils_scheduleTime.formatFullDateTime,
    getTimeSlotText: utils_timeSlot.getTimeSlotText,
    async fetchOrderList(options = {}) {
      const { fromPullDownRefresh = false } = options;
      if (!this.userId) {
        this.orderList = [];
        common_vendor.index.showToast({
          title: "未读取到用户信息",
          icon: "none"
        });
        if (fromPullDownRefresh) {
          common_vendor.index.stopPullDownRefresh();
        }
        return;
      }
      this.loading = true;
      try {
        const params = {
          userId: this.userId
        };
        if (this.activeStatus) {
          params.orderStatus = this.activeStatus;
        }
        const data = await api_order.getOrderList(params);
        this.orderList = Array.isArray(data) ? data : [];
      } catch (error) {
        this.orderList = [];
      } finally {
        this.loading = false;
        if (fromPullDownRefresh) {
          common_vendor.index.stopPullDownRefresh();
        }
      }
    },
    changeStatus(status) {
      if (this.activeStatus === status) {
        return;
      }
      this.activeStatus = status;
      this.fetchOrderList();
    },
    goDetail(id) {
      if (!id) {
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/order/detail?id=${id}`
      });
    },
    goReview(item) {
      if (!item || !item.id) {
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/review/create?orderId=${item.id}&chefId=${item.chefId}&userId=${item.userId}`
      });
    },
    isReviewed(item) {
      return item && (item.reviewed === true || item.reviewed === 1);
    },
    getStatusLabel(status) {
      return utils_orderStatus.getOrderStatusLabel(status);
    },
    getStatusClass(status) {
      return utils_orderStatus.getOrderStatusClass(status);
    },
    getOrderCardClass(status) {
      if (status === utils_orderStatus.ORDER_STATUS.COMPLETED) {
        return "completed";
      }
      if (status === utils_orderStatus.ORDER_STATUS.IN_SERVICE || status === utils_orderStatus.ORDER_STATUS.PAID) {
        return "serving";
      }
      if (status === utils_orderStatus.ORDER_STATUS.PENDING_CONFIRM || status === utils_orderStatus.ORDER_STATUS.WAIT_PAY) {
        return "pending";
      }
      if (status === utils_orderStatus.ORDER_STATUS.REJECTED || status === utils_orderStatus.ORDER_STATUS.CANCELLED || status === utils_orderStatus.ORDER_STATUS.REFUNDED) {
        return "closed";
      }
      return "";
    },
    getStatusHint(status) {
      if (status === utils_orderStatus.ORDER_STATUS.PENDING_CONFIRM) {
        return "等待厨师确认订单后，将进入支付流程";
      }
      if (status === utils_orderStatus.ORDER_STATUS.WAIT_PAY) {
        return "订单已确认，请尽快完成支付";
      }
      if (status === utils_orderStatus.ORDER_STATUS.PAID) {
        return "订单已支付，等待厨师开始服务";
      }
      if (status === utils_orderStatus.ORDER_STATUS.IN_SERVICE) {
        return "厨师正在上门服务中";
      }
      if (status === utils_orderStatus.ORDER_STATUS.COMPLETED) {
        return "服务已完成，可以查看本单记录";
      }
      if (status === utils_orderStatus.ORDER_STATUS.REJECTED) {
        return "订单已被厨师拒绝";
      }
      if (status === utils_orderStatus.ORDER_STATUS.CANCELLED) {
        return "订单已取消";
      }
      if (status === utils_orderStatus.ORDER_STATUS.REFUNDED) {
        return "订单已退款完成";
      }
      return "查看订单详情";
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
    a: common_vendor.f($data.statusTabs, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: item.value,
        c: $data.activeStatus === item.value ? 1 : "",
        d: common_vendor.o(($event) => $options.changeStatus(item.value), item.value)
      };
    }),
    b: $data.loading
  }, $data.loading ? {} : $data.orderList.length === 0 ? {} : {
    d: common_vendor.f($data.orderList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.orderNo || "-"),
        b: common_vendor.t(item.serviceDate || "-"),
        c: common_vendor.t($options.getTimeSlotText(item.timeSlot)),
        d: common_vendor.t($options.getStatusLabel(item.orderStatus)),
        e: common_vendor.n($options.getStatusClass(item.orderStatus)),
        f: common_vendor.t($options.formatAmount(item.payAmount)),
        g: common_vendor.t(item.contactName || "-"),
        h: common_vendor.t(item.contactPhone || "-"),
        i: common_vendor.t(item.fullAddress || "-"),
        j: common_vendor.t($options.formatFullDateTime(item.createdAt)),
        k: common_vendor.t($options.getStatusHint(item.orderStatus)),
        l: item.orderStatus === $data.ORDER_STATUS.COMPLETED
      }, item.orderStatus === $data.ORDER_STATUS.COMPLETED ? common_vendor.e({
        m: $options.isReviewed(item) === false
      }, $options.isReviewed(item) === false ? {
        n: common_vendor.o(($event) => $options.goReview(item), item.id)
      } : $options.isReviewed(item) === true ? {} : {}, {
        o: $options.isReviewed(item) === true
      }) : {}, {
        p: common_vendor.o(() => {
        }, item.id),
        q: item.id,
        r: common_vendor.n($options.getOrderCardClass(item.orderStatus)),
        s: common_vendor.o(($event) => $options.goDetail(item.id), item.id)
      });
    })
  }, {
    c: $data.orderList.length === 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-456ecf67"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/list.js.map

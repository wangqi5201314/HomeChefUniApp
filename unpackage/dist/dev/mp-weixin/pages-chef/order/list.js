"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefOrder = require("../../api/chef-order.js");
const utils_orderStatus = require("../../utils/order-status.js");
const utils_scheduleTime = require("../../utils/schedule-time.js");
const utils_timeSlot = require("../../utils/time-slot.js");
const ChefTabbar = () => "../../components/chef-tabbar.js";
const _sfc_main = {
  name: "ChefOrderListPage",
  components: {
    ChefTabbar
  },
  data() {
    return {
      loading: false,
      currentStatus: "",
      tabs: utils_orderStatus.CHEF_ORDER_STATUS_TABS,
      orderList: []
    };
  },
  onLoad(options) {
    if (options && typeof options.orderStatus !== "undefined") {
      this.currentStatus = options.orderStatus;
    }
    this.fetchOrderList();
  },
  onShow() {
    if (this.orderList.length > 0) {
      this.fetchOrderList(false);
    }
  },
  onPullDownRefresh() {
    this.fetchOrderList(false, true);
  },
  methods: {
    formatFullDateTime: utils_scheduleTime.formatFullDateTime,
    getTimeSlotText: utils_timeSlot.getTimeSlotText,
    async fetchOrderList(showLoading = true, fromPullDownRefresh = false) {
      if (showLoading) {
        this.loading = true;
      }
      try {
        const params = {};
        if (this.currentStatus) {
          params.orderStatus = this.currentStatus;
        }
        const data = await api_chefOrder.getChefOrderList(params);
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
    changeTab(status) {
      if (this.currentStatus === status) {
        return;
      }
      this.currentStatus = status;
      this.fetchOrderList();
    },
    goDetail(id) {
      common_vendor.index.navigateTo({
        url: `/pages-chef/order/detail?id=${id}`
      });
    },
    getStatusLabel(status) {
      return utils_orderStatus.getOrderStatusLabel(status);
    },
    getStatusClass(status) {
      return utils_orderStatus.getOrderStatusClass(status);
    },
    getOrderCardTone(status) {
      if (status === utils_orderStatus.ORDER_STATUS.PENDING_CONFIRM || status === utils_orderStatus.ORDER_STATUS.WAIT_PAY) {
        return "tone-pending";
      }
      if (status === utils_orderStatus.ORDER_STATUS.PAID || status === utils_orderStatus.ORDER_STATUS.IN_SERVICE) {
        return "tone-serving";
      }
      if (status === utils_orderStatus.ORDER_STATUS.COMPLETED) {
        return "tone-completed";
      }
      if (status === utils_orderStatus.ORDER_STATUS.REJECTED || status === utils_orderStatus.ORDER_STATUS.CANCELLED || status === utils_orderStatus.ORDER_STATUS.REFUNDED) {
        return "tone-closed";
      }
      return "";
    },
    getStatusCaption(status) {
      if (status === utils_orderStatus.ORDER_STATUS.PENDING_CONFIRM) {
        return "待你处理";
      }
      if (status === utils_orderStatus.ORDER_STATUS.WAIT_PAY) {
        return "等待用户支付";
      }
      if (status === utils_orderStatus.ORDER_STATUS.PAID) {
        return "已准备就绪";
      }
      if (status === utils_orderStatus.ORDER_STATUS.IN_SERVICE) {
        return "正在服务";
      }
      if (status === utils_orderStatus.ORDER_STATUS.COMPLETED) {
        return "服务闭环完成";
      }
      if (status === utils_orderStatus.ORDER_STATUS.REJECTED) {
        return "订单已拒绝";
      }
      if (status === utils_orderStatus.ORDER_STATUS.CANCELLED) {
        return "订单已取消";
      }
      if (status === utils_orderStatus.ORDER_STATUS.REFUNDED) {
        return "订单已退款";
      }
      return "订单状态";
    },
    getStatusHint(status) {
      if (status === utils_orderStatus.ORDER_STATUS.PENDING_CONFIRM) {
        return "请尽快确认订单，避免影响用户支付";
      }
      if (status === utils_orderStatus.ORDER_STATUS.WAIT_PAY) {
        return "订单已确认，等待用户完成支付";
      }
      if (status === utils_orderStatus.ORDER_STATUS.PAID) {
        return "用户已支付，可进入开始服务流程";
      }
      if (status === utils_orderStatus.ORDER_STATUS.IN_SERVICE) {
        return "服务进行中，结束后记得完成订单";
      }
      if (status === utils_orderStatus.ORDER_STATUS.COMPLETED) {
        return "订单已完成，可查看本单评价与服务记录";
      }
      if (status === utils_orderStatus.ORDER_STATUS.REJECTED) {
        return "该订单已拒绝，无需继续处理";
      }
      if (status === utils_orderStatus.ORDER_STATUS.CANCELLED) {
        return "该订单已取消";
      }
      if (status === utils_orderStatus.ORDER_STATUS.REFUNDED) {
        return "退款已处理完成";
      }
      return "查看订单详情";
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
if (!Array) {
  const _component_chef_tabbar = common_vendor.resolveComponent("chef-tabbar");
  _component_chef_tabbar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.tabs, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: item.value,
        c: $data.currentStatus === item.value ? 1 : "",
        d: common_vendor.o(($event) => $options.changeTab(item.value), item.value)
      };
    }),
    b: $data.loading
  }, $data.loading ? {} : $data.orderList.length === 0 ? {} : {
    d: common_vendor.f($data.orderList, (item, k0, i0) => {
      return {
        a: common_vendor.t($options.getStatusCaption(item.orderStatus)),
        b: common_vendor.t($options.getStatusLabel(item.orderStatus)),
        c: common_vendor.t($options.formatAmount(item.payAmount)),
        d: common_vendor.t(item.orderNo || "-"),
        e: common_vendor.t($options.getStatusLabel(item.orderStatus)),
        f: common_vendor.n($options.getStatusClass(item.orderStatus)),
        g: common_vendor.t(item.serviceDate || "-"),
        h: common_vendor.t($options.getTimeSlotText(item.timeSlot)),
        i: common_vendor.t($options.formatPeopleCount(item.peopleCount)),
        j: common_vendor.t($options.formatAmount(item.payAmount)),
        k: common_vendor.t(item.contactName || "-"),
        l: common_vendor.t(item.contactPhone || "-"),
        m: common_vendor.t(item.fullAddress || "-"),
        n: common_vendor.t($options.formatFullDateTime(item.createdAt)),
        o: common_vendor.t($options.getStatusHint(item.orderStatus)),
        p: item.id,
        q: common_vendor.n($options.getOrderCardTone(item.orderStatus)),
        r: common_vendor.o(($event) => $options.goDetail(item.id), item.id)
      };
    })
  }, {
    c: $data.orderList.length === 0,
    e: common_vendor.p({
      current: "order"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7a556a5b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/order/list.js.map

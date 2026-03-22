"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefOrder = require("../../api/chef-order.js");
const TAB_OPTIONS = [
  { label: "全部", value: "" },
  { label: "PENDING_CONFIRM", value: "PENDING_CONFIRM" },
  { label: "WAIT_PAY", value: "WAIT_PAY" },
  { label: "PAID", value: "PAID" },
  { label: "IN_SERVICE", value: "IN_SERVICE" },
  { label: "COMPLETED", value: "COMPLETED" },
  { label: "CANCELLED", value: "CANCELLED" }
];
const _sfc_main = {
  name: "ChefOrderListPage",
  data() {
    return {
      loading: false,
      currentStatus: "",
      tabs: TAB_OPTIONS,
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
  methods: {
    async fetchOrderList(showLoading = true) {
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
        a: common_vendor.t(item.orderNo || "-"),
        b: common_vendor.t(item.orderStatus || "-"),
        c: common_vendor.t(item.serviceDate || "-"),
        d: common_vendor.t(item.timeSlot || "-"),
        e: common_vendor.t($options.formatPeopleCount(item.peopleCount)),
        f: common_vendor.t($options.formatAmount(item.payAmount)),
        g: common_vendor.t(item.contactName || "-"),
        h: common_vendor.t(item.contactPhone || "-"),
        i: common_vendor.t(item.fullAddress || "-"),
        j: item.id,
        k: common_vendor.o(($event) => $options.goDetail(item.id), item.id)
      };
    })
  }, {
    c: $data.orderList.length === 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7a556a5b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/order/list.js.map

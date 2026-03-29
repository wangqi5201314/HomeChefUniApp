"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefOrder = require("../../api/chef-order.js");
const utils_orderStatus = require("../../utils/order-status.js");
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
  methods: {
    getTimeSlotText: utils_timeSlot.getTimeSlotText,
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
    getStatusLabel(status) {
      return utils_orderStatus.getOrderStatusLabel(status);
    },
    getStatusClass(status) {
      return utils_orderStatus.getOrderStatusClass(status);
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
        a: common_vendor.t(item.orderNo || "-"),
        b: common_vendor.t($options.getStatusLabel(item.orderStatus)),
        c: common_vendor.n($options.getStatusClass(item.orderStatus)),
        d: common_vendor.t(item.serviceDate || "-"),
        e: common_vendor.t($options.getTimeSlotText(item.timeSlot)),
        f: common_vendor.t($options.formatPeopleCount(item.peopleCount)),
        g: common_vendor.t($options.formatAmount(item.payAmount)),
        h: common_vendor.t(item.contactName || "-"),
        i: common_vendor.t(item.contactPhone || "-"),
        j: common_vendor.t(item.fullAddress || "-"),
        k: common_vendor.t(item.createdAt || "-"),
        l: item.id,
        m: common_vendor.o(($event) => $options.goDetail(item.id), item.id)
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

"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const USER_ID_KEY = "user_id";
const _sfc_main = {
  name: "OrderListPage",
  data() {
    return {
      userId: "",
      loading: false,
      activeStatus: "",
      orderList: [],
      statusTabs: [
        { label: "全部", value: "" },
        { label: "PENDING_CONFIRM", value: "PENDING_CONFIRM" },
        { label: "WAIT_PAY", value: "WAIT_PAY" },
        { label: "PAID", value: "PAID" },
        { label: "COMPLETED", value: "COMPLETED" },
        { label: "CANCELLED", value: "CANCELLED" },
        { label: "REFUNDED", value: "REFUNDED" }
      ]
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
        b: common_vendor.t(item.orderStatus || "-"),
        c: common_vendor.t(item.serviceDate || "-"),
        d: common_vendor.t(item.timeSlot || "-"),
        e: common_vendor.t($options.formatAmount(item.payAmount)),
        f: common_vendor.t(item.contactName || "-"),
        g: common_vendor.t(item.contactPhone || "-"),
        h: common_vendor.t(item.fullAddress || "-"),
        i: common_vendor.t(item.createdAt || "-"),
        j: item.orderStatus === "COMPLETED"
      }, item.orderStatus === "COMPLETED" ? common_vendor.e({
        k: item.reviewed === false
      }, item.reviewed === false ? {
        l: common_vendor.o(($event) => $options.goReview(item), item.id)
      } : item.reviewed === true ? {} : {}, {
        m: item.reviewed === true,
        n: common_vendor.o(() => {
        }, item.id)
      }) : {}, {
        o: item.id,
        p: common_vendor.o(($event) => $options.goDetail(item.id), item.id)
      });
    })
  }, {
    c: $data.orderList.length === 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-456ecf67"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/list.js.map

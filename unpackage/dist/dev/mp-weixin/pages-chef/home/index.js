"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefAuth = require("../../api/chef-auth.js");
const api_chefOrder = require("../../api/chef-order.js");
const api_chefSchedule = require("../../api/chef-schedule.js");
const utils_auth = require("../../utils/auth.js");
const utils_chefCertStatus = require("../../utils/chef-cert-status.js");
const utils_chefServiceMode = require("../../utils/chef-service-mode.js");
const utils_orderStatus = require("../../utils/order-status.js");
const utils_timeSlot = require("../../utils/time-slot.js");
const ChefTabbar = () => "../../components/chef-tabbar.js";
const QUICK_ACTIONS = [
  {
    icon: "/static/chef-order.png",
    label: "我的订单",
    url: "/pages-chef/order/list"
  },
  {
    icon: "/static/chef-schedule.png",
    label: "我的档期",
    url: "/pages-chef/schedule/index"
  },
  {
    icon: "/static/chef-certification.png",
    label: "认证资料",
    url: "/pages-chef/certification/index"
  },
  {
    icon: "/static/chef-profile.png",
    label: "我的资料",
    url: "/pages-chef/mine/profile"
  }
];
const _sfc_main = {
  name: "ChefHomePage",
  components: {
    ChefTabbar
  },
  data() {
    return {
      loading: true,
      chefInfo: {},
      pendingConfirmCount: 0,
      waitingServiceCount: 0,
      todayScheduleCount: 0,
      recentOrders: [],
      quickActions: QUICK_ACTIONS,
      actionLoadingId: null,
      actionLoadingType: "",
      showRejectModal: false,
      pendingRejectOrderId: null,
      rejectReason: ""
    };
  },
  computed: {
    avatarText() {
      return this.chefInfo.name ? String(this.chefInfo.name).slice(0, 1) : "厨";
    },
    certStatusText() {
      if (this.chefInfo.certStatusDesc) {
        return this.chefInfo.certStatusDesc;
      }
      return utils_chefCertStatus.getChefCertStatusText(this.chefInfo.certStatus);
    },
    certTagClass() {
      const status = Number(this.chefInfo.certStatus);
      if (status === 1) {
        return "success";
      }
      if (status === 2) {
        return "danger";
      }
      return "pending";
    },
    serviceModeText() {
      if (this.chefInfo.serviceModeDesc) {
        return this.chefInfo.serviceModeDesc;
      }
      return utils_chefServiceMode.getChefServiceModeText(this.chefInfo.serviceMode);
    }
  },
  onShow() {
    this.loadWorkbench(false);
  },
  onPullDownRefresh() {
    this.loadWorkbench(true);
  },
  methods: {
    getTimeSlotText: utils_timeSlot.getTimeSlotText,
    async loadWorkbench(fromPullDown = false) {
      if (!fromPullDown) {
        this.loading = true;
      }
      const today = this.getTodayDate();
      try {
        const [
          chefData,
          recentOrderData,
          pendingOrderData,
          paidOrderData,
          todayScheduleData
        ] = await Promise.all([
          api_chefAuth.getCurrentChefInfo(),
          api_chefOrder.getChefOrderList(),
          api_chefOrder.getChefOrderList({ orderStatus: utils_orderStatus.ORDER_STATUS.PENDING_CONFIRM }),
          api_chefOrder.getChefOrderList({ orderStatus: utils_orderStatus.ORDER_STATUS.PAID }),
          api_chefSchedule.getMyChefSchedule({
            startDate: today,
            endDate: today
          })
        ]);
        this.chefInfo = chefData || {};
        utils_auth.setChefInfo(this.chefInfo);
        this.pendingConfirmCount = Array.isArray(pendingOrderData) ? pendingOrderData.length : 0;
        this.waitingServiceCount = Array.isArray(paidOrderData) ? paidOrderData.length : 0;
        this.todayScheduleCount = Array.isArray(todayScheduleData) ? todayScheduleData.length : 0;
        this.recentOrders = Array.isArray(recentOrderData) ? recentOrderData.slice(0, 5) : [];
      } catch (error) {
        common_vendor.index.showToast({
          title: "工作台数据加载失败",
          icon: "none"
        });
      } finally {
        this.loading = false;
        common_vendor.index.stopPullDownRefresh();
      }
    },
    getTodayDate() {
      const now = /* @__PURE__ */ new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    formatValue(value) {
      if (value === 0) {
        return "0";
      }
      return value || "-";
    },
    formatPeopleCount(value) {
      if (value === 0) {
        return "0人";
      }
      return value ? `${value}人` : "-";
    },
    getStatusLabel(status) {
      return utils_orderStatus.getOrderStatusLabel(status);
    },
    getStatusClass(status) {
      return utils_orderStatus.getOrderStatusClass(status);
    },
    getOrderActions(order) {
      if (order.orderStatus === utils_orderStatus.ORDER_STATUS.PENDING_CONFIRM) {
        return [
          {
            type: "accept",
            label: "接单",
            buttonClass: "primary"
          },
          {
            type: "reject",
            label: "拒单",
            buttonClass: "danger"
          }
        ];
      }
      if (order.orderStatus === utils_orderStatus.ORDER_STATUS.PAID) {
        return [
          {
            type: "start",
            label: "开始服务",
            buttonClass: "primary"
          }
        ];
      }
      if (order.orderStatus === utils_orderStatus.ORDER_STATUS.IN_SERVICE) {
        return [
          {
            type: "finish",
            label: "完成服务",
            buttonClass: "primary"
          }
        ];
      }
      return [];
    },
    goPage(url) {
      common_vendor.index.navigateTo({
        url
      });
    },
    goOrderDetail(id) {
      common_vendor.index.navigateTo({
        url: `/pages-chef/order/detail?id=${id}`
      });
    },
    goPendingOrders() {
      common_vendor.index.redirectTo({
        url: "/pages-chef/order/list?orderStatus=PENDING_CONFIRM"
      });
    },
    goServiceOrders() {
      common_vendor.index.redirectTo({
        url: "/pages-chef/order/list?orderStatus=PAID"
      });
    },
    goSchedulePage() {
      common_vendor.index.navigateTo({
        url: "/pages-chef/schedule/index"
      });
    },
    async handleOrderAction(order, actionType) {
      if (!order || !order.id || this.actionLoadingId) {
        return;
      }
      if (actionType === "reject") {
        this.pendingRejectOrderId = order.id;
        this.rejectReason = "";
        this.showRejectModal = true;
        return;
      }
      this.actionLoadingId = order.id;
      this.actionLoadingType = actionType;
      try {
        if (actionType === "accept") {
          await api_chefOrder.acceptChefOrder(order.id);
        } else if (actionType === "start") {
          await api_chefOrder.startChefOrder(order.id);
        } else if (actionType === "finish") {
          await api_chefOrder.finishChefOrder(order.id);
        }
        common_vendor.index.showToast({
          title: "操作成功",
          icon: "success"
        });
        await this.loadWorkbench(false);
      } catch (error) {
      } finally {
        this.actionLoadingId = null;
        this.actionLoadingType = "";
      }
    },
    closeRejectPopup(force = false) {
      if (!force && this.actionLoadingType === "reject") {
        return;
      }
      this.showRejectModal = false;
      this.pendingRejectOrderId = null;
      this.rejectReason = "";
    },
    async confirmReject() {
      if (!this.pendingRejectOrderId) {
        return;
      }
      if (!this.rejectReason.trim()) {
        common_vendor.index.showToast({
          title: "请输入拒单原因",
          icon: "none"
        });
        return;
      }
      this.actionLoadingId = this.pendingRejectOrderId;
      this.actionLoadingType = "reject";
      try {
        await api_chefOrder.rejectChefOrder(this.pendingRejectOrderId, {
          reason: this.rejectReason.trim()
        });
        common_vendor.index.showToast({
          title: "操作成功",
          icon: "success"
        });
        this.closeRejectPopup(true);
        await this.loadWorkbench(false);
      } catch (error) {
      } finally {
        this.actionLoadingId = null;
        this.actionLoadingType = "";
      }
    }
  }
};
if (!Array) {
  const _component_chef_tabbar = common_vendor.resolveComponent("chef-tabbar");
  _component_chef_tabbar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : common_vendor.e({
    b: $data.chefInfo.avatar
  }, $data.chefInfo.avatar ? {
    c: $data.chefInfo.avatar
  } : {
    d: common_vendor.t($options.avatarText)
  }, {
    e: common_vendor.t($data.chefInfo.name || "未命名厨师"),
    f: common_vendor.t($options.certStatusText),
    g: common_vendor.n($options.certTagClass),
    h: common_vendor.t($options.serviceModeText),
    i: common_vendor.t($options.formatValue($data.chefInfo.ratingAvg)),
    j: common_vendor.t($options.formatValue($data.chefInfo.orderCount)),
    k: common_vendor.t($data.pendingConfirmCount),
    l: common_vendor.o((...args) => $options.goPendingOrders && $options.goPendingOrders(...args)),
    m: common_vendor.t($data.waitingServiceCount),
    n: common_vendor.o((...args) => $options.goServiceOrders && $options.goServiceOrders(...args)),
    o: common_vendor.t($data.todayScheduleCount),
    p: common_vendor.o((...args) => $options.goSchedulePage && $options.goSchedulePage(...args)),
    q: common_vendor.f($data.quickActions, (item, k0, i0) => {
      return {
        a: item.icon,
        b: common_vendor.t(item.label),
        c: item.url,
        d: common_vendor.o(($event) => $options.goPage(item.url), item.url)
      };
    }),
    r: common_vendor.o(($event) => $options.goPage("/pages-chef/order/list")),
    s: $data.recentOrders.length === 0
  }, $data.recentOrders.length === 0 ? {} : {
    t: common_vendor.f($data.recentOrders, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.orderNo || "-"),
        b: common_vendor.t($options.getStatusLabel(item.orderStatus)),
        c: common_vendor.n($options.getStatusClass(item.orderStatus)),
        d: common_vendor.t(item.serviceDate || "-"),
        e: common_vendor.t($options.getTimeSlotText(item.timeSlot)),
        f: common_vendor.t($options.formatPeopleCount(item.peopleCount)),
        g: common_vendor.t(item.contactName || "-"),
        h: common_vendor.t(item.fullAddress || "-"),
        i: $options.getOrderActions(item).length
      }, $options.getOrderActions(item).length ? {
        j: common_vendor.f($options.getOrderActions(item), (action, k1, i1) => {
          return {
            a: common_vendor.t(action.label),
            b: action.type,
            c: common_vendor.n(action.buttonClass),
            d: $data.actionLoadingId === item.id && $data.actionLoadingType === action.type,
            e: common_vendor.o(($event) => $options.handleOrderAction(item, action.type), action.type)
          };
        }),
        k: $data.actionLoadingId === item.id
      } : {}, {
        l: item.id,
        m: common_vendor.o(($event) => $options.goOrderDetail(item.id), item.id)
      });
    })
  }), {
    v: $data.showRejectModal
  }, $data.showRejectModal ? {
    w: $data.rejectReason,
    x: common_vendor.o(($event) => $data.rejectReason = $event.detail.value),
    y: common_vendor.o((...args) => $options.closeRejectPopup && $options.closeRejectPopup(...args)),
    z: $data.actionLoadingType === "reject",
    A: $data.actionLoadingType === "reject",
    B: common_vendor.o((...args) => $options.confirmReject && $options.confirmReject(...args)),
    C: common_vendor.o(() => {
    }),
    D: common_vendor.o((...args) => $options.closeRejectPopup && $options.closeRejectPopup(...args))
  } : {}, {
    E: common_vendor.p({
      current: "home"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-74d96ff2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/home/index.js.map

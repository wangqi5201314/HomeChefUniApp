"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefOrder = require("../../api/chef-order.js");
const api_review = require("../../api/review.js");
const utils_auth = require("../../utils/auth.js");
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
      chefId: "",
      orderDetail: {},
      orderReview: null,
      reviewReplyContent: "",
      reviewReplying: false,
      showRejectPopup: false,
      rejectReason: "",
      showReviewPopup: false
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
    showNavigateButton() {
      return this.hasValidServiceCoordinate && (this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.PAID || this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.IN_SERVICE);
    },
    showViewReviewButton() {
      return this.orderDetail.orderStatus === utils_orderStatus.ORDER_STATUS.COMPLETED && Boolean(this.orderReview && this.orderReview.id);
    },
    hasValidServiceCoordinate() {
      const latitude = Number(this.orderDetail.latitude);
      const longitude = Number(this.orderDetail.longitude);
      return Boolean(latitude && longitude);
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
    const cachedChefInfo = utils_auth.getChefInfo();
    this.chefId = utils_auth.getChefId() || cachedChefInfo && cachedChefInfo.id || "";
    this.fetchOrderDetail();
  },
  methods: {
    formatFullDateTime: utils_scheduleTime.formatFullDateTime,
    formatScheduleDateTime: utils_scheduleTime.formatScheduleDateTime,
    getTimeSlotText: utils_timeSlot.getTimeSlotText,
    formatScore(value) {
      if (value === 0) {
        return "0";
      }
      return value || "-";
    },
    getIngredientModeText(value) {
      const normalizedValue = Number(value);
      if (INGREDIENT_MODE_TEXT_MAP[normalizedValue]) {
        return INGREDIENT_MODE_TEXT_MAP[normalizedValue];
      }
      return value || "-";
    },
    getReviewUserName(item) {
      if (!item) {
        return "-";
      }
      return item.nickname || item.userNickname || item.userName || item.username || item.realName || item.name || `用户${item.userId}`;
    },
    parseImageUrls(imageUrls) {
      if (!imageUrls) {
        return [];
      }
      return String(imageUrls).split(",").map((item) => item.trim()).filter(Boolean);
    },
    previewImages(urls, currentIndex) {
      common_vendor.index.previewImage({
        urls,
        current: urls[currentIndex]
      });
    },
    async fetchOrderReview() {
      if (!this.orderDetail.id || this.orderDetail.orderStatus !== utils_orderStatus.ORDER_STATUS.COMPLETED) {
        this.orderReview = null;
        this.reviewReplyContent = "";
        this.showReviewPopup = false;
        return;
      }
      try {
        this.orderReview = await api_review.getSingleReview({
          orderId: this.orderDetail.id
        });
        this.reviewReplyContent = "";
        if (!this.orderReview) {
          this.showReviewPopup = false;
        }
      } catch (error) {
        this.orderReview = null;
        this.reviewReplyContent = "";
        this.showReviewPopup = false;
      }
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
        if (this.orderDetail && this.orderDetail.chefId) {
          this.chefId = this.orderDetail.chefId;
        }
        await this.fetchOrderReview();
      } catch (error) {
        this.orderDetail = {};
        this.orderReview = null;
        this.reviewReplyContent = "";
        this.showReviewPopup = false;
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
      }, "已开始服务", false, async () => {
        this.openServiceNavigation();
      });
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
    async runOrderAction(action, handler, successText, closePopup = false, afterSuccess = null) {
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
        if (typeof afterSuccess === "function") {
          await afterSuccess();
        }
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
    openReviewPopup() {
      if (!this.showViewReviewButton) {
        return;
      }
      this.reviewReplyContent = "";
      this.showReviewPopup = true;
    },
    closeReviewPopup() {
      if (this.reviewReplying) {
        return;
      }
      this.reviewReplyContent = "";
      this.showReviewPopup = false;
    },
    async submitOrderReviewReply() {
      if (!this.orderReview || !this.orderReview.id || this.reviewReplying) {
        return;
      }
      const replyContent = this.reviewReplyContent.trim();
      if (!replyContent) {
        common_vendor.index.showToast({
          title: "请输入回复内容",
          icon: "none"
        });
        return;
      }
      this.reviewReplying = true;
      try {
        await api_review.replyReview(this.orderReview.id, {
          replyContent
        });
        common_vendor.index.showToast({
          title: "回复成功",
          icon: "success"
        });
        await this.fetchOrderReview();
      } catch (error) {
      } finally {
        this.reviewReplying = false;
      }
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
    openServiceNavigation() {
      if (!this.hasValidServiceCoordinate) {
        common_vendor.index.showToast({
          title: "未获取到服务地址坐标",
          icon: "none"
        });
        return;
      }
      const latitude = Number(this.orderDetail.latitude);
      const longitude = Number(this.orderDetail.longitude);
      const systemInfo = common_vendor.index.getSystemInfoSync ? common_vendor.index.getSystemInfoSync() : {};
      if (systemInfo.platform === "devtools") {
        const addressText = this.orderDetail.fullAddress || `${latitude},${longitude}`;
        common_vendor.index.setClipboardData({
          data: addressText,
          success: () => {
            common_vendor.index.showModal({
              title: "请在真机导航",
              content: "微信开发者工具里点击“去这里”会尝试打开 qqmap:// 协议，电脑环境无法拉起腾讯地图导航。请在微信真机中测试导航，当前已为你复制服务地址。",
              showCancel: false
            });
          },
          fail: () => {
            common_vendor.index.showModal({
              title: "请在真机导航",
              content: "微信开发者工具里无法直接拉起腾讯地图导航，请在微信真机中测试。",
              showCancel: false
            });
          }
        });
        return;
      }
      common_vendor.index.openLocation({
        latitude,
        longitude,
        name: this.orderDetail.contactName || "服务地址",
        address: this.orderDetail.fullAddress || "",
        scale: 16
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
    I: $options.showNavigateButton
  }, $options.showNavigateButton ? {
    J: $data.actionLoading,
    K: common_vendor.o((...args) => $options.openServiceNavigation && $options.openServiceNavigation(...args))
  } : {}, {
    L: $options.showFinishButton
  }, $options.showFinishButton ? {
    M: $data.actionLoading && $data.pendingAction === "finish",
    N: $data.actionLoading,
    O: common_vendor.o((...args) => $options.handleFinish && $options.handleFinish(...args))
  } : {}, {
    P: $options.showStatusNotice
  }, $options.showStatusNotice ? {
    Q: common_vendor.t($options.statusPanelLabel),
    R: common_vendor.t($options.statusNoticeText),
    S: common_vendor.n($options.statusPanelClass)
  } : {}, {
    T: $options.showViewReviewButton
  }, $options.showViewReviewButton ? {
    U: $data.actionLoading,
    V: common_vendor.o((...args) => $options.openReviewPopup && $options.openReviewPopup(...args))
  } : {}, {
    W: $data.actionLoading,
    X: common_vendor.o((...args) => $options.backToList && $options.backToList(...args))
  }), {
    b: !$data.orderDetail.id,
    Y: $data.showRejectPopup
  }, $data.showRejectPopup ? {
    Z: $data.rejectReason,
    aa: common_vendor.o(($event) => $data.rejectReason = $event.detail.value),
    ab: $data.actionLoading,
    ac: common_vendor.o((...args) => $options.closeRejectPopup && $options.closeRejectPopup(...args)),
    ad: $data.actionLoading && $data.pendingAction === "reject",
    ae: $data.actionLoading,
    af: common_vendor.o((...args) => $options.handleReject && $options.handleReject(...args)),
    ag: common_vendor.o(() => {
    }),
    ah: common_vendor.o((...args) => $options.closeRejectPopup && $options.closeRejectPopup(...args))
  } : {}, {
    ai: $data.showReviewPopup && $data.orderReview && $data.orderReview.id
  }, $data.showReviewPopup && $data.orderReview && $data.orderReview.id ? common_vendor.e({
    aj: common_vendor.t($options.formatScore($data.orderReview.overallScore)),
    ak: common_vendor.t($data.orderReview.isAnonymous === 1 ? "匿名用户" : $options.getReviewUserName($data.orderReview)),
    al: common_vendor.t($options.formatFullDateTime($data.orderReview.createdAt)),
    am: common_vendor.t($options.formatScore($data.orderReview.dishScore)),
    an: common_vendor.t($options.formatScore($data.orderReview.serviceScore)),
    ao: common_vendor.t($options.formatScore($data.orderReview.skillScore)),
    ap: common_vendor.t($options.formatScore($data.orderReview.environmentScore)),
    aq: common_vendor.t($data.orderReview.content || "用户未填写评价内容"),
    ar: $options.parseImageUrls($data.orderReview.imageUrls).length
  }, $options.parseImageUrls($data.orderReview.imageUrls).length ? {
    as: common_vendor.f($options.parseImageUrls($data.orderReview.imageUrls), (url, index, i0) => {
      return {
        a: `${$data.orderReview.id}-${index}`,
        b: url,
        c: common_vendor.o(($event) => $options.previewImages($options.parseImageUrls($data.orderReview.imageUrls), index), `${$data.orderReview.id}-${index}`)
      };
    })
  } : {}, {
    at: $data.orderReview.replyContent
  }, $data.orderReview.replyContent ? common_vendor.e({
    av: common_vendor.t($data.orderReview.replyContent),
    aw: $data.orderReview.replyAt
  }, $data.orderReview.replyAt ? {
    ax: common_vendor.t($options.formatFullDateTime($data.orderReview.replyAt))
  } : {}) : {
    ay: $data.reviewReplyContent,
    az: common_vendor.o(($event) => $data.reviewReplyContent = $event.detail.value),
    aA: $data.reviewReplying,
    aB: $data.reviewReplying,
    aC: common_vendor.o((...args) => $options.submitOrderReviewReply && $options.submitOrderReviewReply(...args))
  }, {
    aD: common_vendor.o((...args) => $options.closeReviewPopup && $options.closeReviewPopup(...args)),
    aE: common_vendor.o(() => {
    }),
    aF: common_vendor.o((...args) => $options.closeReviewPopup && $options.closeReviewPopup(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f5138f84"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/order/detail.js.map

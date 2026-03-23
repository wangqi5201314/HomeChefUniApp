"use strict";
const common_vendor = require("../../common/vendor.js");
const api_address = require("../../api/address.js");
const api_chef = require("../../api/chef.js");
const api_order = require("../../api/order.js");
const utils_chefServiceMode = require("../../utils/chef-service-mode.js");
const USER_ID_KEY = "user_id";
const SELECTED_ADDRESS_KEY = "selected_address";
const FIXED_TOTAL_AMOUNT = 299;
const FIXED_DISCOUNT_AMOUNT = 0;
const FIXED_PAY_AMOUNT = 299;
function createDefaultForm() {
  return {
    peopleCount: "1",
    tastePreference: "",
    tabooFood: "",
    specialRequirement: "",
    ingredientMode: "1",
    ingredientList: ""
  };
}
const _sfc_main = {
  name: "OrderConfirmPage",
  data() {
    return {
      loading: true,
      submitting: false,
      userId: "",
      chef: {},
      selectedAddress: {},
      orderInfo: {
        chefId: "",
        serviceDate: "",
        timeSlot: "",
        serviceStartTime: "",
        serviceEndTime: ""
      },
      form: createDefaultForm(),
      totalAmount: FIXED_TOTAL_AMOUNT,
      discountAmount: FIXED_DISCOUNT_AMOUNT,
      payAmount: FIXED_PAY_AMOUNT
    };
  },
  computed: {
    fullAddress() {
      const address = this.selectedAddress || {};
      return [
        address.province,
        address.city,
        address.district,
        address.detailAddress,
        address.doorplate
      ].filter(Boolean).join("");
    },
    chefServiceModeText() {
      if (this.chef.serviceModeDesc) {
        return this.chef.serviceModeDesc;
      }
      if (this.chef.serviceMode === 0 || this.chef.serviceMode) {
        return utils_chefServiceMode.getChefServiceModeText(this.chef.serviceMode);
      }
      return "-";
    }
  },
  onLoad(options) {
    this.userId = common_vendor.index.getStorageSync(USER_ID_KEY) || "";
    this.orderInfo.chefId = options && options.chefId ? options.chefId : "";
    this.orderInfo.serviceDate = options && options.serviceDate ? decodeURIComponent(options.serviceDate) : "";
    this.orderInfo.timeSlot = options && options.timeSlot ? decodeURIComponent(options.timeSlot) : "";
    this.orderInfo.serviceStartTime = this.normalizeServiceTime(
      options && options.serviceStartTime ? decodeURIComponent(options.serviceStartTime) : "",
      this.orderInfo.serviceDate
    );
    this.orderInfo.serviceEndTime = this.normalizeServiceTime(
      options && options.serviceEndTime ? decodeURIComponent(options.serviceEndTime) : "",
      this.orderInfo.serviceDate
    );
    this.loadPageData();
  },
  onShow() {
    this.consumeSelectedAddress();
  },
  methods: {
    async loadPageData() {
      if (!this.userId) {
        this.loading = false;
        common_vendor.index.showToast({
          title: "未读取到用户信息",
          icon: "none"
        });
        return;
      }
      if (!this.orderInfo.chefId) {
        this.loading = false;
        common_vendor.index.showToast({
          title: "缺少厨师信息",
          icon: "none"
        });
        return;
      }
      this.loading = true;
      try {
        const [chefData, addressData] = await Promise.all([
          api_chef.getChefDetail(this.orderInfo.chefId),
          api_address.getDefaultUserAddress({
            userId: this.userId
          })
        ]);
        this.chef = chefData || {};
        if (addressData && addressData.id) {
          this.selectedAddress = addressData;
        }
        this.consumeSelectedAddress();
      } catch (error) {
        this.chef = {};
      } finally {
        this.loading = false;
      }
    },
    consumeSelectedAddress() {
      const address = common_vendor.index.getStorageSync(SELECTED_ADDRESS_KEY);
      if (address && address.id) {
        this.selectedAddress = address;
        common_vendor.index.removeStorageSync(SELECTED_ADDRESS_KEY);
      }
    },
    normalizeServiceTime(value, serviceDate) {
      if (!value) {
        return "";
      }
      if (value.includes("T")) {
        return value;
      }
      const pureTime = value.length === 5 ? `${value}:00` : value;
      return serviceDate ? `${serviceDate}T${pureTime}` : value;
    },
    getNameInitial(name) {
      return name ? String(name).slice(0, 1) : "厨";
    },
    goSelectAddress() {
      common_vendor.index.navigateTo({
        url: "/pages/address/list?mode=select"
      });
    },
    validateForm() {
      if (!this.selectedAddress || !this.selectedAddress.id) {
        common_vendor.index.showToast({
          title: "请选择服务地址",
          icon: "none"
        });
        return false;
      }
      if (!this.orderInfo.serviceDate || !this.orderInfo.timeSlot || !this.orderInfo.serviceStartTime || !this.orderInfo.serviceEndTime) {
        common_vendor.index.showToast({
          title: "服务时间信息不完整",
          icon: "none"
        });
        return false;
      }
      if (!this.form.peopleCount || Number(this.form.peopleCount) <= 0) {
        common_vendor.index.showToast({
          title: "请输入正确的用餐人数",
          icon: "none"
        });
        return false;
      }
      if (this.form.ingredientMode === "" || Number(this.form.ingredientMode) < 0) {
        common_vendor.index.showToast({
          title: "请输入食材模式",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    buildPayload() {
      return {
        userId: Number(this.userId),
        chefId: Number(this.orderInfo.chefId),
        addressId: this.selectedAddress.id,
        serviceDate: this.orderInfo.serviceDate,
        timeSlot: this.orderInfo.timeSlot,
        serviceStartTime: this.orderInfo.serviceStartTime,
        serviceEndTime: this.orderInfo.serviceEndTime,
        peopleCount: Number(this.form.peopleCount),
        tastePreference: this.form.tastePreference.trim(),
        tabooFood: this.form.tabooFood.trim(),
        specialRequirement: this.form.specialRequirement.trim(),
        ingredientMode: Number(this.form.ingredientMode),
        ingredientList: this.form.ingredientList.trim(),
        contactName: this.selectedAddress.contactName || "",
        contactPhone: this.selectedAddress.contactPhone || "",
        fullAddress: this.fullAddress,
        longitude: this.selectedAddress.longitude === 0 || this.selectedAddress.longitude ? Number(this.selectedAddress.longitude) : 0,
        latitude: this.selectedAddress.latitude === 0 || this.selectedAddress.latitude ? Number(this.selectedAddress.latitude) : 0,
        totalAmount: this.totalAmount,
        discountAmount: this.discountAmount,
        payAmount: this.payAmount
      };
    },
    async submitOrder() {
      if (this.submitting || !this.validateForm()) {
        return;
      }
      this.submitting = true;
      try {
        const result = await api_order.createOrder(this.buildPayload());
        const orderId = result && result.id ? result.id : "";
        common_vendor.index.showToast({
          title: "下单成功",
          icon: "success"
        });
        setTimeout(() => {
          if (orderId) {
            common_vendor.index.navigateTo({
              url: `/pages/order/detail?id=${orderId}`
            });
          }
        }, 300);
      } catch (error) {
      } finally {
        this.submitting = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : common_vendor.e({
    b: $data.selectedAddress && $data.selectedAddress.id
  }, $data.selectedAddress && $data.selectedAddress.id ? {
    c: common_vendor.t($data.selectedAddress.contactName || "-"),
    d: common_vendor.t($data.selectedAddress.contactPhone || "-"),
    e: common_vendor.t($options.fullAddress || "暂无地址信息")
  } : {}, {
    f: common_vendor.o((...args) => $options.goSelectAddress && $options.goSelectAddress(...args)),
    g: $data.chef.avatar
  }, $data.chef.avatar ? {
    h: $data.chef.avatar
  } : {
    i: common_vendor.t($options.getNameInitial($data.chef.name))
  }, {
    j: common_vendor.t($data.chef.name || "未命名厨师"),
    k: common_vendor.t($data.chef.specialtyCuisine || "-"),
    l: common_vendor.t($options.chefServiceModeText),
    m: common_vendor.t($data.orderInfo.serviceDate || "-"),
    n: common_vendor.t($data.orderInfo.timeSlot || "-"),
    o: common_vendor.t($data.orderInfo.serviceStartTime || "-"),
    p: common_vendor.t($data.orderInfo.serviceEndTime || "-"),
    q: $data.form.peopleCount,
    r: common_vendor.o(($event) => $data.form.peopleCount = $event.detail.value),
    s: $data.form.tastePreference,
    t: common_vendor.o(($event) => $data.form.tastePreference = $event.detail.value),
    v: $data.form.tabooFood,
    w: common_vendor.o(($event) => $data.form.tabooFood = $event.detail.value),
    x: $data.form.specialRequirement,
    y: common_vendor.o(($event) => $data.form.specialRequirement = $event.detail.value),
    z: $data.form.ingredientMode,
    A: common_vendor.o(($event) => $data.form.ingredientMode = $event.detail.value),
    B: $data.form.ingredientList,
    C: common_vendor.o(($event) => $data.form.ingredientList = $event.detail.value),
    D: common_vendor.t($data.selectedAddress.contactName || "-"),
    E: common_vendor.t($data.selectedAddress.contactPhone || "-"),
    F: common_vendor.t($data.totalAmount),
    G: common_vendor.t($data.discountAmount),
    H: common_vendor.t($data.payAmount)
  }), {
    I: common_vendor.t($data.payAmount),
    J: common_vendor.t($data.submitting ? "提交中..." : "提交订单"),
    K: $data.submitting,
    L: $data.submitting,
    M: common_vendor.o((...args) => $options.submitOrder && $options.submitOrder(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-324e7894"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/confirm.js.map

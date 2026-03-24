"use strict";
const common_vendor = require("../../common/vendor.js");
const api_address = require("../../api/address.js");
const USER_ID_KEY = "user_id";
const SELECTED_ADDRESS_KEY = "selected_address";
const _sfc_main = {
  name: "AddressListPage",
  data() {
    return {
      userId: "",
      mode: "",
      loading: false,
      addressList: []
    };
  },
  onLoad(options) {
    this.mode = options && options.mode ? options.mode : "";
    this.userId = common_vendor.index.getStorageSync(USER_ID_KEY) || "";
  },
  onShow() {
    this.loadAddressList();
  },
  methods: {
    async loadAddressList() {
      if (!this.userId) {
        this.addressList = [];
        common_vendor.index.showToast({
          title: "未读取到用户信息",
          icon: "none"
        });
        return;
      }
      this.loading = true;
      try {
        const data = await api_address.getUserAddressList({
          userId: this.userId
        });
        this.addressList = Array.isArray(data) ? data : [];
      } catch (error) {
        this.addressList = [];
      } finally {
        this.loading = false;
      }
    },
    isDefaultAddress(item) {
      return item && (item.isDefault === 1 || item.isDefault === true);
    },
    getFullAddress(item) {
      return [
        item.province,
        item.city,
        item.district,
        item.town,
        item.detailAddress
      ].filter(Boolean).join("");
    },
    goAddAddress() {
      common_vendor.index.navigateTo({
        url: "/pages/address/edit"
      });
    },
    goEditAddress(id) {
      if (!id) {
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/address/edit?id=${id}`
      });
    },
    handleDeleteAddress(item) {
      if (!item || !item.id) {
        return;
      }
      common_vendor.index.showModal({
        title: "提示",
        content: "确认删除这条地址吗？",
        success: async (res) => {
          if (!res.confirm) {
            return;
          }
          try {
            await api_address.deleteAddress(item.id);
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
            this.loadAddressList();
          } catch (error) {
          }
        }
      });
    },
    async handleSetDefault(item) {
      if (!item || !item.id) {
        return;
      }
      try {
        await api_address.setDefaultAddress(item.id, {
          userId: Number(this.userId)
        });
        common_vendor.index.showToast({
          title: "设置成功",
          icon: "success"
        });
        this.loadAddressList();
      } catch (error) {
      }
    },
    handleSelectAddress(item) {
      if (this.mode !== "select") {
        return;
      }
      common_vendor.index.setStorageSync(SELECTED_ADDRESS_KEY, item);
      common_vendor.index.showToast({
        title: "已选择地址",
        icon: "success"
      });
      setTimeout(() => {
        common_vendor.index.navigateBack({
          delta: 1
        });
      }, 300);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.mode === "select"
  }, $data.mode === "select" ? {} : {}, {
    b: $data.loading
  }, $data.loading ? {} : $data.addressList.length === 0 ? {
    d: common_vendor.o((...args) => $options.goAddAddress && $options.goAddAddress(...args))
  } : {
    e: common_vendor.f($data.addressList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.contactName || "-"),
        b: common_vendor.t(item.contactPhone || "-"),
        c: $options.isDefaultAddress(item)
      }, $options.isDefaultAddress(item) ? {} : {}, {
        d: common_vendor.t($options.getFullAddress(item) || "暂无地址信息"),
        e: !$options.isDefaultAddress(item)
      }, !$options.isDefaultAddress(item) ? {
        f: common_vendor.o(($event) => $options.handleSetDefault(item), item.id)
      } : {}, {
        g: common_vendor.o(($event) => $options.goEditAddress(item.id), item.id),
        h: common_vendor.o(($event) => $options.handleDeleteAddress(item), item.id),
        i: item.id,
        j: common_vendor.o(($event) => $options.handleSelectAddress(item), item.id)
      });
    })
  }, {
    c: $data.addressList.length === 0,
    f: common_vendor.o((...args) => $options.goAddAddress && $options.goAddAddress(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-90a3874e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/address/list.js.map

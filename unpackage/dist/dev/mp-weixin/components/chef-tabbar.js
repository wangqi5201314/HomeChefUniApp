"use strict";
const common_vendor = require("../common/vendor.js");
const TAB_ITEMS = [
  {
    key: "home",
    label: "首页",
    url: "/pages-chef/home/index"
  },
  {
    key: "order",
    label: "订单",
    url: "/pages-chef/order/list"
  },
  {
    key: "mine",
    label: "我的",
    url: "/pages-chef/mine/index"
  }
];
const _sfc_main = {
  name: "ChefTabbar",
  props: {
    current: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      items: TAB_ITEMS
    };
  },
  methods: {
    handleClick(item) {
      if (!item || this.current === item.key) {
        return;
      }
      common_vendor.index.redirectTo({
        url: item.url
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.items, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: item.key,
        c: $props.current === item.key ? 1 : "",
        d: common_vendor.o(($event) => $options.handleClick(item), item.key)
      };
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-78bb8aa6"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/chef-tabbar.js.map

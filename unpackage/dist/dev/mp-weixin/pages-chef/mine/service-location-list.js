"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefServiceLocation = require("../../api/chef-service-location.js");
const _sfc_main = {
  name: "ChefServiceLocationListPage",
  data() {
    return {
      loading: false,
      activatingId: "",
      deletingId: "",
      locationList: []
    };
  },
  onShow() {
    this.loadLocationList();
  },
  methods: {
    formatRegion(item) {
      if (!item) {
        return "-";
      }
      return [
        item.province,
        item.city,
        item.district,
        item.town
      ].filter(Boolean).join("");
    },
    async loadLocationList() {
      this.loading = true;
      try {
        const data = await api_chefServiceLocation.getChefServiceLocationList();
        this.locationList = Array.isArray(data) ? data : [];
      } catch (error) {
        this.locationList = [];
      } finally {
        this.loading = false;
      }
    },
    goAdd() {
      common_vendor.index.navigateTo({
        url: "/pages-chef/mine/service-location-edit"
      });
    },
    goEdit(id) {
      common_vendor.index.navigateTo({
        url: `/pages-chef/mine/service-location-edit?id=${id}`
      });
    },
    confirmDelete(item) {
      if (!item || !item.id || this.deletingId) {
        return;
      }
      common_vendor.index.showModal({
        title: "删除确认",
        content: `确定删除“${item.locationName || "该服务位置"}”吗？`,
        success: async (res) => {
          if (!res.confirm) {
            return;
          }
          this.deletingId = String(item.id);
          try {
            await api_chefServiceLocation.deleteChefServiceLocation(item.id);
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
            await this.loadLocationList();
          } catch (error) {
          } finally {
            this.deletingId = "";
          }
        }
      });
    },
    confirmActivate(item) {
      if (!item || !item.id || this.activatingId) {
        return;
      }
      common_vendor.index.showModal({
        title: "启用确认",
        content: `确定启用“${item.locationName || "该服务位置"}”吗？`,
        success: async (res) => {
          if (!res.confirm) {
            return;
          }
          this.activatingId = String(item.id);
          try {
            await api_chefServiceLocation.activateChefServiceLocation(item.id);
            common_vendor.index.showToast({
              title: "启用成功",
              icon: "success"
            });
            await this.loadLocationList();
          } catch (error) {
          } finally {
            this.activatingId = "";
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goAdd && $options.goAdd(...args)),
    b: $data.loading
  }, $data.loading ? {} : $data.locationList.length === 0 ? {
    d: common_vendor.o((...args) => $options.goAdd && $options.goAdd(...args))
  } : {
    e: common_vendor.f($data.locationList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.locationName || "未命名位置"),
        b: common_vendor.t(item.isActive === 1 ? "已启用" : "未启用"),
        c: common_vendor.n(item.isActive === 1 ? "active" : "inactive"),
        d: common_vendor.t($options.formatRegion(item)),
        e: common_vendor.t(item.detailAddress || "暂无详细地址"),
        f: common_vendor.o(($event) => $options.goEdit(item.id), item.id),
        g: common_vendor.o(($event) => $options.confirmDelete(item), item.id),
        h: item.isActive !== 1
      }, item.isActive !== 1 ? {
        i: $data.activatingId === String(item.id),
        j: $data.activatingId === String(item.id),
        k: common_vendor.o(($event) => $options.confirmActivate(item), item.id)
      } : {}, {
        l: item.id
      });
    })
  }, {
    c: $data.locationList.length === 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-93a330d8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/mine/service-location-list.js.map

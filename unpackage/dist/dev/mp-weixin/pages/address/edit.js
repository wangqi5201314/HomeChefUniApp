"use strict";
const common_vendor = require("../../common/vendor.js");
const api_address = require("../../api/address.js");
const USER_ID_KEY = "user_id";
function createDefaultForm() {
  return {
    contactName: "",
    contactPhone: "",
    province: "",
    city: "",
    district: "",
    detailAddress: "",
    longitude: "",
    latitude: "",
    doorplate: "",
    isDefault: 0
  };
}
const _sfc_main = {
  name: "AddressEditPage",
  data() {
    return {
      id: "",
      userId: "",
      saving: false,
      form: createDefaultForm()
    };
  },
  onLoad(options) {
    this.id = options && options.id ? options.id : "";
    this.userId = common_vendor.index.getStorageSync(USER_ID_KEY) || "";
    if (this.id) {
      common_vendor.index.setNavigationBarTitle({
        title: "编辑地址"
      });
      this.loadAddressDetail();
    } else {
      common_vendor.index.setNavigationBarTitle({
        title: "新增地址"
      });
    }
  },
  methods: {
    async loadAddressDetail() {
      try {
        const data = await api_address.getAddressDetail(this.id);
        this.form = {
          contactName: data.contactName || "",
          contactPhone: data.contactPhone || "",
          province: data.province || "",
          city: data.city || "",
          district: data.district || "",
          detailAddress: data.detailAddress || "",
          longitude: data.longitude === 0 || data.longitude ? String(data.longitude) : "",
          latitude: data.latitude === 0 || data.latitude ? String(data.latitude) : "",
          doorplate: data.doorplate || "",
          isDefault: data.isDefault === 1 || data.isDefault === true ? 1 : 0
        };
      } catch (error) {
      }
    },
    handleDefaultChange(event) {
      this.form.isDefault = event.detail.value ? 1 : 0;
    },
    validateForm() {
      if (!this.form.contactName.trim()) {
        common_vendor.index.showToast({
          title: "请输入联系人",
          icon: "none"
        });
        return false;
      }
      if (!this.form.contactPhone.trim()) {
        common_vendor.index.showToast({
          title: "请输入联系电话",
          icon: "none"
        });
        return false;
      }
      if (!/^1\d{10}$/.test(this.form.contactPhone.trim())) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号",
          icon: "none"
        });
        return false;
      }
      if (!this.form.province.trim()) {
        common_vendor.index.showToast({
          title: "请输入省",
          icon: "none"
        });
        return false;
      }
      if (!this.form.city.trim()) {
        common_vendor.index.showToast({
          title: "请输入市",
          icon: "none"
        });
        return false;
      }
      if (!this.form.district.trim()) {
        common_vendor.index.showToast({
          title: "请输入区",
          icon: "none"
        });
        return false;
      }
      if (!this.form.detailAddress.trim()) {
        common_vendor.index.showToast({
          title: "请输入详细地址",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    buildPayload() {
      return {
        contactName: this.form.contactName.trim(),
        contactPhone: this.form.contactPhone.trim(),
        province: this.form.province.trim(),
        city: this.form.city.trim(),
        district: this.form.district.trim(),
        detailAddress: this.form.detailAddress.trim(),
        longitude: this.form.longitude === "" ? 0 : Number(this.form.longitude),
        latitude: this.form.latitude === "" ? 0 : Number(this.form.latitude),
        doorplate: this.form.doorplate.trim(),
        isDefault: Number(this.form.isDefault) === 1 ? 1 : 0
      };
    },
    async handleSubmit() {
      if (this.saving || !this.validateForm()) {
        return;
      }
      if (!this.id && !this.userId) {
        common_vendor.index.showToast({
          title: "未读取到用户信息",
          icon: "none"
        });
        return;
      }
      this.saving = true;
      try {
        const payload = this.buildPayload();
        if (this.id) {
          await api_address.updateAddress(this.id, payload);
        } else {
          await api_address.createAddress({
            userId: this.userId,
            ...payload
          });
        }
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack({
            delta: 1
          });
        }, 300);
      } catch (error) {
      } finally {
        this.saving = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form.contactName,
    b: common_vendor.o(($event) => $data.form.contactName = $event.detail.value),
    c: $data.form.contactPhone,
    d: common_vendor.o(($event) => $data.form.contactPhone = $event.detail.value),
    e: $data.form.province,
    f: common_vendor.o(($event) => $data.form.province = $event.detail.value),
    g: $data.form.city,
    h: common_vendor.o(($event) => $data.form.city = $event.detail.value),
    i: $data.form.district,
    j: common_vendor.o(($event) => $data.form.district = $event.detail.value),
    k: $data.form.detailAddress,
    l: common_vendor.o(($event) => $data.form.detailAddress = $event.detail.value),
    m: $data.form.doorplate,
    n: common_vendor.o(($event) => $data.form.doorplate = $event.detail.value),
    o: $data.form.longitude,
    p: common_vendor.o(($event) => $data.form.longitude = $event.detail.value),
    q: $data.form.latitude,
    r: common_vendor.o(($event) => $data.form.latitude = $event.detail.value),
    s: Number($data.form.isDefault) === 1,
    t: common_vendor.o((...args) => $options.handleDefaultChange && $options.handleDefaultChange(...args)),
    v: common_vendor.t($data.saving ? "保存中..." : "保存地址"),
    w: $data.saving,
    x: $data.saving,
    y: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dcb1f0d8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/address/edit.js.map

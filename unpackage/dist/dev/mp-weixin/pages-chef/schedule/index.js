"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefSchedule = require("../../api/chef-schedule.js");
function formatDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function formatTime(date) {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}
function getDefaultForm() {
  return {
    serviceDate: "",
    timeSlot: "",
    startClock: "",
    endClock: "",
    isAvailable: 1,
    remark: ""
  };
}
function toDateTime(date, clock) {
  return `${date}T${clock}:00`;
}
function parseClock(dateTime) {
  const match = String(dateTime || "").match(/T(\d{2}:\d{2})/);
  return match ? match[1] : "";
}
const _sfc_main = {
  name: "ChefSchedulePage",
  data() {
    const startDate = /* @__PURE__ */ new Date();
    const endDate = /* @__PURE__ */ new Date();
    endDate.setDate(endDate.getDate() + 30);
    return {
      loading: false,
      saving: false,
      showPopup: false,
      editingId: "",
      filters: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      },
      scheduleList: [],
      form: {
        ...getDefaultForm(),
        serviceDate: formatDate(startDate),
        startClock: formatTime(startDate),
        endClock: "20:00"
      }
    };
  },
  onShow() {
    this.fetchScheduleList();
  },
  methods: {
    async fetchScheduleList() {
      this.loading = true;
      try {
        const data = await api_chefSchedule.getMyChefSchedule({
          startDate: this.filters.startDate,
          endDate: this.filters.endDate
        });
        this.scheduleList = Array.isArray(data) ? data : [];
      } catch (error) {
        this.scheduleList = [];
      } finally {
        this.loading = false;
      }
    },
    handleStartDateChange(event) {
      this.filters.startDate = event.detail.value;
    },
    handleEndDateChange(event) {
      this.filters.endDate = event.detail.value;
    },
    handleFormDateChange(event) {
      this.form.serviceDate = event.detail.value || "";
    },
    handleStartClockChange(event) {
      this.form.startClock = event.detail.value || "";
    },
    handleEndClockChange(event) {
      this.form.endClock = event.detail.value || "";
    },
    handleFormSwitchChange(event) {
      this.form.isAvailable = event.detail.value ? 1 : 0;
    },
    openCreatePopup() {
      const now = /* @__PURE__ */ new Date();
      this.editingId = "";
      this.form = {
        ...getDefaultForm(),
        serviceDate: formatDate(now),
        startClock: formatTime(now),
        endClock: "20:00"
      };
      this.showPopup = true;
    },
    openEditPopup(item) {
      this.editingId = item.id;
      this.form = {
        serviceDate: item.serviceDate || "",
        timeSlot: item.timeSlot || "",
        startClock: parseClock(item.startTime),
        endClock: parseClock(item.endTime),
        isAvailable: Number(item.isAvailable) === 1 ? 1 : 0,
        remark: item.remark || ""
      };
      this.showPopup = true;
    },
    closePopup() {
      if (this.saving) {
        return;
      }
      this.showPopup = false;
      this.editingId = "";
      this.form = getDefaultForm();
    },
    buildPayload() {
      return {
        serviceDate: this.form.serviceDate,
        timeSlot: this.form.timeSlot.trim(),
        startTime: toDateTime(this.form.serviceDate, this.form.startClock),
        endTime: toDateTime(this.form.serviceDate, this.form.endClock),
        isAvailable: Number(this.form.isAvailable) === 1 ? 1 : 0,
        remark: this.form.remark.trim()
      };
    },
    validateForm(payload) {
      if (!this.form.serviceDate) {
        common_vendor.index.showToast({
          title: "请选择服务日期",
          icon: "none"
        });
        return false;
      }
      if (!payload.timeSlot) {
        common_vendor.index.showToast({
          title: "请输入时段",
          icon: "none"
        });
        return false;
      }
      if (!this.form.startClock) {
        common_vendor.index.showToast({
          title: "请选择开始时间",
          icon: "none"
        });
        return false;
      }
      if (!this.form.endClock) {
        common_vendor.index.showToast({
          title: "请选择结束时间",
          icon: "none"
        });
        return false;
      }
      if (payload.startTime >= payload.endTime) {
        common_vendor.index.showToast({
          title: "结束时间必须晚于开始时间",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    async submitSchedule() {
      if (this.saving) {
        return;
      }
      const payload = this.buildPayload();
      if (!this.validateForm(payload)) {
        return;
      }
      this.saving = true;
      try {
        if (this.editingId) {
          await api_chefSchedule.updateChefSchedule(this.editingId, payload);
        } else {
          await api_chefSchedule.createChefSchedule(payload);
        }
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
        this.closePopup();
        await this.fetchScheduleList();
      } catch (error) {
      } finally {
        this.saving = false;
      }
    },
    handleDelete(id) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确认删除该档期吗？",
        success: async (res) => {
          if (!res.confirm) {
            return;
          }
          try {
            await api_chefSchedule.deleteChefSchedule(id);
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
            await this.fetchScheduleList();
          } catch (error) {
          }
        }
      });
    },
    async toggleAvailability(item, event) {
      try {
        await api_chefSchedule.updateChefScheduleAvailability(item.id, {
          isAvailable: event.detail.value ? 1 : 0
        });
        await this.fetchScheduleList();
      } catch (error) {
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.filters.startDate),
    b: $data.filters.startDate,
    c: common_vendor.o((...args) => $options.handleStartDateChange && $options.handleStartDateChange(...args)),
    d: common_vendor.t($data.filters.endDate),
    e: $data.filters.endDate,
    f: common_vendor.o((...args) => $options.handleEndDateChange && $options.handleEndDateChange(...args)),
    g: $data.loading,
    h: common_vendor.o((...args) => $options.fetchScheduleList && $options.fetchScheduleList(...args)),
    i: common_vendor.o((...args) => $options.openCreatePopup && $options.openCreatePopup(...args)),
    j: $data.loading
  }, $data.loading ? {} : $data.scheduleList.length === 0 ? {} : {
    l: common_vendor.f($data.scheduleList, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.serviceDate || "-"),
        b: common_vendor.t(item.timeSlot || "-"),
        c: Number(item.isAvailable) === 1,
        d: common_vendor.o(($event) => $options.toggleAvailability(item, $event), item.id),
        e: common_vendor.t(item.startTime || "-"),
        f: common_vendor.t(item.endTime || "-"),
        g: common_vendor.t(Number(item.isAvailable) === 1 ? "是" : "否"),
        h: common_vendor.t(item.remark || "-"),
        i: common_vendor.o(($event) => $options.openEditPopup(item), item.id),
        j: common_vendor.o(($event) => $options.handleDelete(item.id), item.id),
        k: item.id
      };
    })
  }, {
    k: $data.scheduleList.length === 0,
    m: $data.showPopup
  }, $data.showPopup ? {
    n: common_vendor.t($data.editingId ? "编辑档期" : "新增档期"),
    o: common_vendor.t($data.form.serviceDate || "请选择服务日期"),
    p: $data.form.serviceDate,
    q: common_vendor.o((...args) => $options.handleFormDateChange && $options.handleFormDateChange(...args)),
    r: $data.form.timeSlot,
    s: common_vendor.o(($event) => $data.form.timeSlot = $event.detail.value),
    t: common_vendor.t($data.form.startClock || "请选择开始时间"),
    v: $data.form.startClock,
    w: common_vendor.o((...args) => $options.handleStartClockChange && $options.handleStartClockChange(...args)),
    x: common_vendor.t($data.form.endClock || "请选择结束时间"),
    y: $data.form.endClock,
    z: common_vendor.o((...args) => $options.handleEndClockChange && $options.handleEndClockChange(...args)),
    A: Number($data.form.isAvailable) === 1,
    B: common_vendor.o((...args) => $options.handleFormSwitchChange && $options.handleFormSwitchChange(...args)),
    C: $data.form.remark,
    D: common_vendor.o(($event) => $data.form.remark = $event.detail.value),
    E: $data.saving,
    F: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args)),
    G: $data.saving,
    H: $data.saving,
    I: common_vendor.o((...args) => $options.submitSchedule && $options.submitSchedule(...args)),
    J: common_vendor.o(() => {
    }),
    K: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-09c466c6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/schedule/index.js.map

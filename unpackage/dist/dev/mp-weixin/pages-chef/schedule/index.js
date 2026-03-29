"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chefSchedule = require("../../api/chef-schedule.js");
const utils_scheduleTime = require("../../utils/schedule-time.js");
const utils_timeSlot = require("../../utils/time-slot.js");
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
function compareScheduleDesc(a, b) {
  const aTime = `${a.serviceDate || ""} ${parseClock(a.startTime) || "00:00"}`;
  const bTime = `${b.serviceDate || ""} ${parseClock(b.startTime) || "00:00"}`;
  return bTime.localeCompare(aTime);
}
const _sfc_main = {
  name: "ChefSchedulePage",
  data() {
    const now = /* @__PURE__ */ new Date();
    return {
      loading: false,
      saving: false,
      switchingId: null,
      showPopup: false,
      editingId: "",
      today: formatDate(now),
      allScheduleList: [],
      form: {
        ...getDefaultForm(),
        serviceDate: formatDate(now),
        startClock: formatTime(now),
        endClock: "20:00"
      }
    };
  },
  computed: {
    displayScheduleList() {
      return this.allScheduleList;
    },
    timeSlotRange() {
      return utils_timeSlot.TIME_SLOT_OPTIONS.map((item) => item.label);
    },
    timeSlotIndex() {
      const currentValue = utils_timeSlot.normalizeTimeSlot(this.form.timeSlot);
      const index = utils_timeSlot.TIME_SLOT_OPTIONS.findIndex((item) => item.value === currentValue);
      return index >= 0 ? index : 0;
    },
    timeSlotText() {
      const currentValue = utils_timeSlot.normalizeTimeSlot(this.form.timeSlot);
      return currentValue ? utils_timeSlot.getTimeSlotText(currentValue) : "请选择时段";
    },
    availableScheduleCount() {
      return this.allScheduleList.filter((item) => this.isAvailableSchedule(item)).length;
    },
    expiredScheduleCount() {
      return this.allScheduleList.filter((item) => this.isExpiredSchedule(item)).length;
    },
    emptyText() {
      return "暂无档期";
    }
  },
  async onShow() {
    await this.initializePageData();
  },
  onPullDownRefresh() {
    this.fetchScheduleList(true);
  },
  methods: {
    async initializePageData() {
      this.loading = true;
      try {
        await api_chefSchedule.disableExpiredChefSchedule();
      } catch (error) {
      }
      await this.fetchScheduleList(false);
    },
    async fetchScheduleList(fromPullDown = false) {
      if (!fromPullDown) {
        this.loading = true;
      }
      try {
        const data = await api_chefSchedule.getMySchedule();
        const list = Array.isArray(data) ? data.map((item) => ({
          ...item,
          timeSlot: utils_timeSlot.normalizeTimeSlot(item.timeSlot)
        })).sort(compareScheduleDesc) : [];
        this.allScheduleList = list;
      } catch (error) {
        this.allScheduleList = [];
      } finally {
        this.loading = false;
        common_vendor.index.stopPullDownRefresh();
      }
    },
    formatDateTime(dateTime) {
      return utils_scheduleTime.formatScheduleDateTime(dateTime);
    },
    isExpiredSchedule(item) {
      return !item || item.serviceDate < this.today;
    },
    isAvailableSchedule(item) {
      return !!item && item.serviceDate >= this.today && Number(item.isAvailable) === 1;
    },
    isClosedSchedule(item) {
      return !!item && item.serviceDate >= this.today && Number(item.isAvailable) !== 1;
    },
    canOperate(item) {
      return !!item && !this.isExpiredSchedule(item);
    },
    showToggleButton(item) {
      return !!item && !this.isExpiredSchedule(item);
    },
    getScheduleActions(item) {
      if (!item || !item.id) {
        return [];
      }
      if (this.isExpiredSchedule(item)) {
        return ["delete"];
      }
      return ["edit", "toggle", "delete"];
    },
    getScheduleStatusText(item) {
      if (this.isAvailableSchedule(item)) {
        return "可预约";
      }
      if (this.isClosedSchedule(item)) {
        return "已关闭预约";
      }
      return "已过期不可预约";
    },
    getScheduleStatusClass(item) {
      if (this.isAvailableSchedule(item)) {
        return "success";
      }
      if (this.isClosedSchedule(item)) {
        return "closed";
      }
      return "expired";
    },
    handleFormDateChange(event) {
      this.form.serviceDate = event.detail.value || "";
    },
    handleTimeSlotChange(event) {
      const index = Number(event.detail.value);
      const selected = utils_timeSlot.TIME_SLOT_OPTIONS[index];
      this.form.timeSlot = selected ? selected.value : "";
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
        timeSlot: "",
        startClock: formatTime(now),
        endClock: "20:00"
      };
      this.showPopup = true;
    },
    openEditPopup(item) {
      if (!item || !item.id || this.isExpiredSchedule(item)) {
        return;
      }
      this.editingId = item.id;
      this.form = {
        serviceDate: item.serviceDate || "",
        timeSlot: utils_timeSlot.normalizeTimeSlot(item.timeSlot),
        startClock: parseClock(item.startTime),
        endClock: parseClock(item.endTime),
        isAvailable: Number(item.isAvailable) === 1 ? 1 : 0,
        remark: item.remark || ""
      };
      this.showPopup = true;
    },
    closePopup(force = false) {
      if (!force && this.saving) {
        return;
      }
      this.showPopup = false;
      this.editingId = "";
      this.form = getDefaultForm();
    },
    buildPayload() {
      return {
        serviceDate: this.form.serviceDate,
        timeSlot: utils_timeSlot.normalizeTimeSlot(this.form.timeSlot),
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
      if (this.form.serviceDate < this.today) {
        common_vendor.index.showToast({
          title: "不能新增或编辑过期档期",
          icon: "none"
        });
        return false;
      }
      if (!utils_timeSlot.isValidTimeSlot(payload.timeSlot)) {
        common_vendor.index.showToast({
          title: "请选择时段",
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
        this.closePopup(true);
        await this.fetchScheduleList(false);
      } catch (error) {
      } finally {
        this.saving = false;
      }
    },
    handleDelete(item) {
      if (!item || !item.id) {
        return;
      }
      common_vendor.index.showModal({
        title: "提示",
        content: "确认删除该档期吗？",
        success: async (res) => {
          if (!res.confirm) {
            return;
          }
          try {
            await api_chefSchedule.deleteChefSchedule(item.id);
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
            await this.fetchScheduleList(false);
          } catch (error) {
          }
        }
      });
    },
    async handleToggleAvailability(item) {
      if (!item || !item.id || this.isExpiredSchedule(item) || this.switchingId) {
        return;
      }
      this.switchingId = item.id;
      try {
        await api_chefSchedule.updateChefScheduleAvailability(item.id, {
          isAvailable: Number(item.isAvailable) === 1 ? 0 : 1
        });
        common_vendor.index.showToast({
          title: Number(item.isAvailable) === 1 ? "已关闭预约" : "已开启预约",
          icon: "success"
        });
        await this.fetchScheduleList(false);
      } catch (error) {
      } finally {
        this.switchingId = null;
      }
    },
    getTimeSlotText: utils_timeSlot.getTimeSlotText
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.openCreatePopup && $options.openCreatePopup(...args)),
    b: common_vendor.t($data.allScheduleList.length),
    c: common_vendor.t($options.availableScheduleCount),
    d: common_vendor.t($options.expiredScheduleCount),
    e: $data.loading
  }, $data.loading ? {} : $options.displayScheduleList.length === 0 ? {
    g: common_vendor.t($options.emptyText)
  } : {
    h: common_vendor.f($options.displayScheduleList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.serviceDate || "-"),
        b: common_vendor.t($options.getTimeSlotText(item.timeSlot)),
        c: common_vendor.t($options.getScheduleStatusText(item)),
        d: common_vendor.n($options.getScheduleStatusClass(item)),
        e: common_vendor.t($options.formatDateTime(item.startTime)),
        f: common_vendor.t($options.formatDateTime(item.endTime)),
        g: common_vendor.t(Number(item.isAvailable) === 1 ? "可预约" : "不可预约"),
        h: common_vendor.t(item.remark || "-"),
        i: $options.getScheduleActions(item).length
      }, $options.getScheduleActions(item).length ? common_vendor.e({
        j: $options.getScheduleActions(item).includes("edit")
      }, $options.getScheduleActions(item).includes("edit") ? {
        k: common_vendor.o(($event) => $options.openEditPopup(item), item.id)
      } : {}, {
        l: $options.getScheduleActions(item).includes("toggle")
      }, $options.getScheduleActions(item).includes("toggle") ? {
        m: common_vendor.t(Number(item.isAvailable) === 1 ? "关闭预约" : "开启预约"),
        n: $data.switchingId === item.id,
        o: $data.switchingId === item.id,
        p: common_vendor.o(($event) => $options.handleToggleAvailability(item), item.id)
      } : {}, {
        q: $options.getScheduleActions(item).includes("delete")
      }, $options.getScheduleActions(item).includes("delete") ? {
        r: common_vendor.o(($event) => $options.handleDelete(item), item.id)
      } : {}) : {}, {
        s: item.id
      });
    })
  }, {
    f: $options.displayScheduleList.length === 0,
    i: $data.showPopup
  }, $data.showPopup ? {
    j: common_vendor.t($data.editingId ? "编辑档期" : "新增档期"),
    k: common_vendor.t($data.form.serviceDate || "请选择服务日期"),
    l: $data.form.serviceDate,
    m: common_vendor.o((...args) => $options.handleFormDateChange && $options.handleFormDateChange(...args)),
    n: common_vendor.t($options.timeSlotText),
    o: $options.timeSlotRange,
    p: $options.timeSlotIndex,
    q: common_vendor.o((...args) => $options.handleTimeSlotChange && $options.handleTimeSlotChange(...args)),
    r: common_vendor.t($data.form.startClock || "请选择开始时间"),
    s: $data.form.startClock,
    t: common_vendor.o((...args) => $options.handleStartClockChange && $options.handleStartClockChange(...args)),
    v: common_vendor.t($data.form.endClock || "请选择结束时间"),
    w: $data.form.endClock,
    x: common_vendor.o((...args) => $options.handleEndClockChange && $options.handleEndClockChange(...args)),
    y: Number($data.form.isAvailable) === 1,
    z: common_vendor.o((...args) => $options.handleFormSwitchChange && $options.handleFormSwitchChange(...args)),
    A: $data.form.remark,
    B: common_vendor.o(($event) => $data.form.remark = $event.detail.value),
    C: $data.saving,
    D: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args)),
    E: $data.saving,
    F: $data.saving,
    G: common_vendor.o((...args) => $options.submitSchedule && $options.submitSchedule(...args)),
    H: common_vendor.o(() => {
    }),
    I: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-09c466c6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/schedule/index.js.map

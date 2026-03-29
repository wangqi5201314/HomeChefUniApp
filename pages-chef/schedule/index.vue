<template>
  <view class="page">
    <view class="toolbar-card">
      <view class="toolbar-main">
        <view>
          <text class="toolbar-title">我的档期</text>
          <text class="toolbar-desc">默认展示全部档期，按时间倒序排列</text>
        </view>
        <button class="add-btn" @click="openCreatePopup">新增档期</button>
      </view>

      <view class="summary-row">
        <view class="summary-item">
          <text class="summary-value">{{ allScheduleList.length }}</text>
          <text class="summary-label">全部档期</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ availableScheduleCount }}</text>
          <text class="summary-label">可预约</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ expiredScheduleCount }}</text>
          <text class="summary-label">不可预约</text>
        </view>
      </view>
    </view>

    <view v-if="loading" class="state-card">
      <text class="state-text">档期加载中...</text>
    </view>

    <view v-else-if="displayScheduleList.length === 0" class="state-card">
      <text class="state-text">{{ emptyText }}</text>
    </view>

    <view v-else class="schedule-list">
      <view v-for="item in displayScheduleList" :key="item.id" class="schedule-card">
        <view class="card-head">
          <view>
            <text class="date-text">{{ item.serviceDate || '-' }}</text>
            <text class="time-slot">{{ getTimeSlotText(item.timeSlot) }}</text>
          </view>
          <text class="status-tag" :class="getScheduleStatusClass(item)">
            {{ getScheduleStatusText(item) }}
          </text>
        </view>

        <view class="row">
          <text class="row-label">开始时间</text>
          <text class="row-value">{{ formatDateTime(item.startTime) }}</text>
        </view>
        <view class="row">
          <text class="row-label">结束时间</text>
          <text class="row-value">{{ formatDateTime(item.endTime) }}</text>
        </view>
        <view class="row">
          <text class="row-label">可预约状态</text>
          <text class="row-value">{{ Number(item.isAvailable) === 1 ? '可预约' : '不可预约' }}</text>
        </view>
        <view class="row">
          <text class="row-label">备注</text>
          <text class="row-value">{{ item.remark || '-' }}</text>
        </view>

        <view v-if="getScheduleActions(item).length" class="actions">
          <button v-if="getScheduleActions(item).includes('edit')" class="ghost-btn" @click="openEditPopup(item)">
            编辑
          </button>
          <button
            v-if="getScheduleActions(item).includes('toggle')"
            class="ghost-btn"
            :loading="switchingId === item.id"
            :disabled="switchingId === item.id"
            @click="handleToggleAvailability(item)"
          >
            {{ Number(item.isAvailable) === 1 ? '关闭预约' : '开启预约' }}
          </button>
          <button v-if="getScheduleActions(item).includes('delete')" class="danger-btn" @click="handleDelete(item)">
            删除
          </button>
        </view>
      </view>
    </view>

    <view v-if="showPopup" class="popup-mask" @click="closePopup">
      <view class="popup-card" @click.stop>
        <text class="popup-title">{{ editingId ? '编辑档期' : '新增档期' }}</text>

        <view class="form-item">
          <text class="label">服务日期</text>
          <picker mode="date" :value="form.serviceDate" @change="handleFormDateChange">
            <view class="picker-value">{{ form.serviceDate || '请选择服务日期' }}</view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">时段</text>
          <picker :range="timeSlotRange" :value="timeSlotIndex" @change="handleTimeSlotChange">
            <view class="picker-value">{{ timeSlotText }}</view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">开始时间</text>
          <picker mode="time" :value="form.startClock" @change="handleStartClockChange">
            <view class="picker-value">{{ form.startClock || '请选择开始时间' }}</view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">结束时间</text>
          <picker mode="time" :value="form.endClock" @change="handleEndClockChange">
            <view class="picker-value">{{ form.endClock || '请选择结束时间' }}</view>
          </picker>
        </view>

        <view class="form-item switch-item">
          <text class="label switch-label">可预约</text>
          <switch :checked="Number(form.isAvailable) === 1" color="#2f8f55" @change="handleFormSwitchChange" />
        </view>

        <view class="form-item">
          <text class="label">备注</text>
          <textarea v-model="form.remark" class="textarea" maxlength="200" placeholder="请输入备注" />
        </view>

        <view class="popup-actions">
          <button class="ghost-btn" :disabled="saving" @click="closePopup">取消</button>
          <button class="primary-btn" :loading="saving" :disabled="saving" @click="submitSchedule">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  createChefSchedule,
  deleteChefSchedule,
  disableExpiredChefSchedule,
  getMySchedule,
  updateChefSchedule,
  updateChefScheduleAvailability
} from '../../api/chef-schedule'
import { formatScheduleDateTime } from '../../utils/schedule-time'
import { TIME_SLOT_OPTIONS, getTimeSlotText, isValidTimeSlot, normalizeTimeSlot } from '../../utils/time-slot'

function formatDate(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(date) {
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${hours}:${minutes}`
}

function getDefaultForm() {
  return {
    serviceDate: '',
    timeSlot: '',
    startClock: '',
    endClock: '',
    isAvailable: 1,
    remark: ''
  }
}

function toDateTime(date, clock) {
  return `${date}T${clock}:00`
}

function parseClock(dateTime) {
  const match = String(dateTime || '').match(/T(\d{2}:\d{2})/)
  return match ? match[1] : ''
}

function compareScheduleDesc(a, b) {
  const aTime = `${a.serviceDate || ''} ${parseClock(a.startTime) || '00:00'}`
  const bTime = `${b.serviceDate || ''} ${parseClock(b.startTime) || '00:00'}`
  return bTime.localeCompare(aTime)
}

export default {
  name: 'ChefSchedulePage',
  data() {
    const now = new Date()

    return {
      loading: false,
      saving: false,
      switchingId: null,
      showPopup: false,
      editingId: '',
      today: formatDate(now),
      allScheduleList: [],
      form: {
        ...getDefaultForm(),
        serviceDate: formatDate(now),
        startClock: formatTime(now),
        endClock: '20:00'
      }
    }
  },
  computed: {
    displayScheduleList() {
      return this.allScheduleList
    },
    timeSlotRange() {
      return TIME_SLOT_OPTIONS.map((item) => item.label)
    },
    timeSlotIndex() {
      const currentValue = normalizeTimeSlot(this.form.timeSlot)
      const index = TIME_SLOT_OPTIONS.findIndex((item) => item.value === currentValue)
      return index >= 0 ? index : 0
    },
    timeSlotText() {
      const currentValue = normalizeTimeSlot(this.form.timeSlot)
      return currentValue ? getTimeSlotText(currentValue) : '请选择时段'
    },
    availableScheduleCount() {
      return this.allScheduleList.filter((item) => this.isAvailableSchedule(item)).length
    },
    expiredScheduleCount() {
      return this.allScheduleList.filter((item) => this.isExpiredSchedule(item)).length
    },
    emptyText() {
      return '暂无档期'
    }
  },
  async onShow() {
    await this.initializePageData()
  },
  onPullDownRefresh() {
    this.fetchScheduleList(true)
  },
  methods: {
    async initializePageData() {
      this.loading = true

      try {
        await disableExpiredChefSchedule()
      } catch (error) {
      }

      await this.fetchScheduleList(false)
    },
    async fetchScheduleList(fromPullDown = false) {
      if (!fromPullDown) {
        this.loading = true
      }

      try {
        const data = await getMySchedule()
        const list = Array.isArray(data)
          ? data
            .map((item) => ({
              ...item,
              timeSlot: normalizeTimeSlot(item.timeSlot)
            }))
            .sort(compareScheduleDesc)
          : []
        this.allScheduleList = list
      } catch (error) {
        this.allScheduleList = []
      } finally {
        this.loading = false
        uni.stopPullDownRefresh()
      }
    },
    formatDateTime(dateTime) {
      return formatScheduleDateTime(dateTime)
    },
    isExpiredSchedule(item) {
      return !item || item.serviceDate < this.today
    },
    isAvailableSchedule(item) {
      return !!item && item.serviceDate >= this.today && Number(item.isAvailable) === 1
    },
    isClosedSchedule(item) {
      return !!item && item.serviceDate >= this.today && Number(item.isAvailable) !== 1
    },
    canOperate(item) {
      return !!item && !this.isExpiredSchedule(item)
    },
    showToggleButton(item) {
      return !!item && !this.isExpiredSchedule(item)
    },
    getScheduleActions(item) {
      if (!item || !item.id) {
        return []
      }

      if (this.isExpiredSchedule(item)) {
        return ['delete']
      }

      return ['edit', 'toggle', 'delete']
    },
    getScheduleStatusText(item) {
      if (this.isAvailableSchedule(item)) {
        return '可预约'
      }

      if (this.isClosedSchedule(item)) {
        return '已关闭预约'
      }

      return '已过期不可预约'
    },
    getScheduleStatusClass(item) {
      if (this.isAvailableSchedule(item)) {
        return 'success'
      }

      if (this.isClosedSchedule(item)) {
        return 'closed'
      }

      return 'expired'
    },
    handleFormDateChange(event) {
      this.form.serviceDate = event.detail.value || ''
    },
    handleTimeSlotChange(event) {
      const index = Number(event.detail.value)
      const selected = TIME_SLOT_OPTIONS[index]
      this.form.timeSlot = selected ? selected.value : ''
    },
    handleStartClockChange(event) {
      this.form.startClock = event.detail.value || ''
    },
    handleEndClockChange(event) {
      this.form.endClock = event.detail.value || ''
    },
    handleFormSwitchChange(event) {
      this.form.isAvailable = event.detail.value ? 1 : 0
    },
    openCreatePopup() {
      const now = new Date()
      this.editingId = ''
      this.form = {
        ...getDefaultForm(),
        serviceDate: formatDate(now),
        timeSlot: '',
        startClock: formatTime(now),
        endClock: '20:00'
      }
      this.showPopup = true
    },
    openEditPopup(item) {
      if (!item || !item.id || this.isExpiredSchedule(item)) {
        return
      }

      this.editingId = item.id
      this.form = {
        serviceDate: item.serviceDate || '',
        timeSlot: normalizeTimeSlot(item.timeSlot),
        startClock: parseClock(item.startTime),
        endClock: parseClock(item.endTime),
        isAvailable: Number(item.isAvailable) === 1 ? 1 : 0,
        remark: item.remark || ''
      }
      this.showPopup = true
    },
    closePopup(force = false) {
      if (!force && this.saving) {
        return
      }

      this.showPopup = false
      this.editingId = ''
      this.form = getDefaultForm()
    },
    buildPayload() {
      return {
        serviceDate: this.form.serviceDate,
        timeSlot: normalizeTimeSlot(this.form.timeSlot),
        startTime: toDateTime(this.form.serviceDate, this.form.startClock),
        endTime: toDateTime(this.form.serviceDate, this.form.endClock),
        isAvailable: Number(this.form.isAvailable) === 1 ? 1 : 0,
        remark: this.form.remark.trim()
      }
    },
    validateForm(payload) {
      if (!this.form.serviceDate) {
        uni.showToast({
          title: '请选择服务日期',
          icon: 'none'
        })
        return false
      }

      if (this.form.serviceDate < this.today) {
        uni.showToast({
          title: '不能新增或编辑过期档期',
          icon: 'none'
        })
        return false
      }

      if (!isValidTimeSlot(payload.timeSlot)) {
        uni.showToast({
          title: '请选择时段',
          icon: 'none'
        })
        return false
      }

      if (!this.form.startClock) {
        uni.showToast({
          title: '请选择开始时间',
          icon: 'none'
        })
        return false
      }

      if (!this.form.endClock) {
        uni.showToast({
          title: '请选择结束时间',
          icon: 'none'
        })
        return false
      }

      if (payload.startTime >= payload.endTime) {
        uni.showToast({
          title: '结束时间必须晚于开始时间',
          icon: 'none'
        })
        return false
      }

      return true
    },
    async submitSchedule() {
      if (this.saving) {
        return
      }

      const payload = this.buildPayload()
      if (!this.validateForm(payload)) {
        return
      }

      this.saving = true

      try {
        if (this.editingId) {
          await updateChefSchedule(this.editingId, payload)
        } else {
          await createChefSchedule(payload)
        }

        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        this.closePopup(true)
        await this.fetchScheduleList(false)
      } catch (error) {
      } finally {
        this.saving = false
      }
    },
    handleDelete(item) {
      if (!item || !item.id) {
        return
      }

      uni.showModal({
        title: '提示',
        content: '确认删除该档期吗？',
        success: async (res) => {
          if (!res.confirm) {
            return
          }

          try {
            await deleteChefSchedule(item.id)
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            await this.fetchScheduleList(false)
          } catch (error) {
          }
        }
      })
    },
    async handleToggleAvailability(item) {
      if (!item || !item.id || this.isExpiredSchedule(item) || this.switchingId) {
        return
      }

      this.switchingId = item.id

      try {
        await updateChefScheduleAvailability(item.id, {
          isAvailable: Number(item.isAvailable) === 1 ? 0 : 1
        })
        uni.showToast({
          title: Number(item.isAvailable) === 1 ? '已关闭预约' : '已开启预约',
          icon: 'success'
        })
        await this.fetchScheduleList(false)
      } catch (error) {
      } finally {
        this.switchingId = null
      }
    },
    getTimeSlotText
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: linear-gradient(180deg, #edf7f0 0%, #f6f7fb 36%, #f6f7fb 100%);
  box-sizing: border-box;
}

.toolbar-card,
.schedule-card,
.state-card,
.popup-card {
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 36rpx rgba(28, 39, 31, 0.06);
}

.toolbar-card {
  padding: 28rpx;
}

.toolbar-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.toolbar-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #223128;
}

.toolbar-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #74807b;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-top: 24rpx;
}

.summary-item {
  padding: 20rpx 12rpx;
  border-radius: 22rpx;
  background: #f8faf9;
  text-align: center;
}

.summary-value {
  display: block;
  font-size: 38rpx;
  font-weight: 700;
  color: #2f8f55;
}

.summary-label {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #6c7872;
}

.add-btn,
.ghost-btn,
.danger-btn,
.primary-btn {
  height: 84rpx;
  line-height: 84rpx;
  border: none;
  border-radius: 18rpx;
  font-size: 28rpx;
}

.add-btn,
.primary-btn {
  min-width: 180rpx;
  margin: 0;
  background: #2f8f55;
  color: #ffffff;
}

.state-card {
  margin-top: 24rpx;
  padding: 72rpx 32rpx;
  text-align: center;
}

.state-text {
  font-size: 28rpx;
  color: #74807b;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-top: 24rpx;
}

.schedule-card {
  padding: 28rpx;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.date-text {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #223128;
}

.time-slot {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #738078;
}

.status-tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.status-tag.success {
  background: #edf8f1;
  color: #2f8f55;
}

.status-tag.closed {
  background: #eef2f7;
  color: #5b6675;
}

.status-tag.expired {
  background: #fff1f1;
  color: #d14a4a;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 18rpx;
}

.row-label {
  font-size: 26rpx;
  color: #7a837d;
}

.row-value {
  max-width: 70%;
  font-size: 26rpx;
  color: #1f2329;
  text-align: right;
  line-height: 1.6;
}

.actions,
.popup-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.ghost-btn,
.danger-btn,
.primary-btn {
  flex: 1;
}

.ghost-btn {
  background: #ffffff;
  box-shadow: inset 0 0 0 2rpx #d6e3da;
  color: #4d5d52;
}

.danger-btn {
  background: #fff1f1;
  color: #d14a4a;
}

.popup-mask {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  background: rgba(15, 23, 18, 0.42);
  z-index: 99;
  box-sizing: border-box;
}

.popup-card {
  width: 100%;
  padding: 32rpx 28rpx;
}

.popup-title {
  display: block;
  margin-bottom: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #223128;
}

.form-item {
  margin-bottom: 20rpx;
}

.label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 26rpx;
  color: #4d5d52;
}

.switch-label {
  margin-bottom: 0;
}

.picker-value,
.input,
.textarea {
  width: 100%;
  border-radius: 18rpx;
  background: #f5f7f6;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #1f2329;
}

.picker-value,
.input {
  min-height: 84rpx;
  padding: 24rpx;
}

.textarea {
  min-height: 180rpx;
  padding: 24rpx;
}

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-btn::after,
.ghost-btn::after,
.danger-btn::after,
.primary-btn::after {
  border: none;
}
</style>

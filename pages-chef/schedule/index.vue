<template>
  <view class="page">
    <view class="filter-card">
      <view class="filter-item">
        <text class="label">开始日期</text>
        <picker mode="date" :value="filters.startDate" @change="handleStartDateChange">
          <view class="picker-value">{{ filters.startDate }}</view>
        </picker>
      </view>
      <view class="filter-item">
        <text class="label">结束日期</text>
        <picker mode="date" :value="filters.endDate" @change="handleEndDateChange">
          <view class="picker-value">{{ filters.endDate }}</view>
        </picker>
      </view>
      <button class="query-btn" :disabled="loading" @click="fetchScheduleList">查询档期</button>
    </view>

    <button class="add-btn" @click="openCreatePopup">新增档期</button>

    <view v-if="loading" class="state-card">
      <text class="state-text">档期加载中...</text>
    </view>

    <view v-else-if="scheduleList.length === 0" class="state-card">
      <text class="state-text">当前没有档期</text>
    </view>

    <view v-else>
      <view v-for="item in scheduleList" :key="item.id" class="schedule-card">
        <view class="card-head">
          <view>
            <text class="date-text">{{ item.serviceDate || '-' }}</text>
            <text class="time-slot">{{ item.timeSlot || '-' }}</text>
          </view>
          <switch
            :checked="Number(item.isAvailable) === 1"
            color="#2f8f55"
            @change="toggleAvailability(item, $event)"
          />
        </view>

        <view class="row">
          <text class="row-label">开始时间</text>
          <text class="row-value">{{ item.startTime || '-' }}</text>
        </view>
        <view class="row">
          <text class="row-label">结束时间</text>
          <text class="row-value">{{ item.endTime || '-' }}</text>
        </view>
        <view class="row">
          <text class="row-label">可预约</text>
          <text class="row-value">{{ Number(item.isAvailable) === 1 ? '是' : '否' }}</text>
        </view>
        <view class="row">
          <text class="row-label">备注</text>
          <text class="row-value">{{ item.remark || '-' }}</text>
        </view>

        <view class="actions">
          <button class="ghost-btn" @click="openEditPopup(item)">编辑</button>
          <button class="danger-btn" @click="handleDelete(item.id)">删除</button>
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
          <input v-model="form.timeSlot" class="input" placeholder="请输入时段，例如 dinner" />
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
          <text class="label switch-label">是否可预约</text>
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
  getMyChefSchedule,
  updateChefSchedule,
  updateChefScheduleAvailability
} from '../../api/chef-schedule'

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

export default {
  name: 'ChefSchedulePage',
  data() {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)

    return {
      loading: false,
      saving: false,
      showPopup: false,
      editingId: '',
      filters: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      },
      scheduleList: [],
      form: {
        ...getDefaultForm(),
        serviceDate: formatDate(startDate),
        startClock: formatTime(startDate),
        endClock: '20:00'
      }
    }
  },
  onShow() {
    this.fetchScheduleList()
  },
  methods: {
    async fetchScheduleList() {
      this.loading = true

      try {
        const data = await getMyChefSchedule({
          startDate: this.filters.startDate,
          endDate: this.filters.endDate
        })
        this.scheduleList = Array.isArray(data) ? data : []
      } catch (error) {
        this.scheduleList = []
      } finally {
        this.loading = false
      }
    },
    handleStartDateChange(event) {
      this.filters.startDate = event.detail.value
    },
    handleEndDateChange(event) {
      this.filters.endDate = event.detail.value
    },
    handleFormDateChange(event) {
      this.form.serviceDate = event.detail.value || ''
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
        startClock: formatTime(now),
        endClock: '20:00'
      }
      this.showPopup = true
    },
    openEditPopup(item) {
      this.editingId = item.id
      this.form = {
        serviceDate: item.serviceDate || '',
        timeSlot: item.timeSlot || '',
        startClock: parseClock(item.startTime),
        endClock: parseClock(item.endTime),
        isAvailable: Number(item.isAvailable) === 1 ? 1 : 0,
        remark: item.remark || ''
      }
      this.showPopup = true
    },
    closePopup() {
      if (this.saving) {
        return
      }

      this.showPopup = false
      this.editingId = ''
      this.form = getDefaultForm()
    },
    buildPayload() {
      return {
        serviceDate: this.form.serviceDate,
        timeSlot: this.form.timeSlot.trim(),
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

      if (!payload.timeSlot) {
        uni.showToast({
          title: '请输入时段',
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
        this.closePopup()
        await this.fetchScheduleList()
      } catch (error) {
      } finally {
        this.saving = false
      }
    },
    handleDelete(id) {
      uni.showModal({
        title: '提示',
        content: '确认删除该档期吗？',
        success: async (res) => {
          if (!res.confirm) {
            return
          }

          try {
            await deleteChefSchedule(id)
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            await this.fetchScheduleList()
          } catch (error) {
          }
        }
      })
    },
    async toggleAvailability(item, event) {
      try {
        await updateChefScheduleAvailability(item.id, {
          isAvailable: event.detail.value ? 1 : 0
        })
        await this.fetchScheduleList()
      } catch (error) {
      }
    }
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

.filter-card,
.schedule-card,
.state-card,
.popup-card {
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 36rpx rgba(28, 39, 31, 0.06);
}

.filter-card {
  padding: 28rpx;
}

.filter-item,
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

.query-btn,
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

.query-btn,
.add-btn,
.primary-btn {
  background: #2f8f55;
  color: #ffffff;
}

.add-btn {
  width: 100%;
  margin-top: 24rpx;
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

.schedule-card {
  margin-top: 24rpx;
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
  font-size: 26rpx;
  color: #1f2329;
  text-align: right;
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

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.query-btn::after,
.add-btn::after,
.ghost-btn::after,
.danger-btn::after,
.primary-btn::after {
  border: none;
}
</style>

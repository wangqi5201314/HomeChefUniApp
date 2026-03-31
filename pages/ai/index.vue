<template>
  <view class="page">
    <scroll-view
      class="message-scroll"
      scroll-y
      :scroll-into-view="scrollIntoView"
      :scroll-with-animation="true"
    >
      <view class="message-list">
        <view
          v-for="item in messages"
          :id="'msg-' + item.id"
          :key="item.id"
          class="message-row"
          :class="item.role === 'user' ? 'message-row-user' : 'message-row-assistant'"
        >
          <view
            class="message-bubble"
            :class="item.role === 'user' ? 'message-bubble-user' : 'message-bubble-assistant'"
          >
            <text class="message-text">{{ item.content }}</text>
          </view>
        </view>

        <view
          v-if="thinking"
          :id="'msg-' + loadingMessageId"
          class="message-row message-row-assistant"
        >
          <view class="message-bubble message-bubble-assistant message-bubble-loading">
            <text class="message-text">小嘉AI正在思考...</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="input-bar">
      <input
        v-model="inputValue"
        class="input-box"
        type="text"
        confirm-type="send"
        maxlength="300"
        placeholder="请输入你想问的问题"
        :disabled="sending"
        @confirm="handleSend"
      />
      <button
        class="send-btn"
        :class="{ 'send-btn-disabled': sending || !canSend }"
        :disabled="sending || !canSend"
        @click="handleSend"
      >
        {{ sending ? '发送中' : '发送' }}
      </button>
    </view>
  </view>
</template>

<script>
import { chatWithAiStream } from '../../api/ai'
import { AI_CHAT_HISTORY_KEY } from '../../utils/auth'
import { normalizeToastMessage } from '../../utils/toast-message'

const WELCOME_TEXT = '你好，我是小嘉AI，可以帮你解答做菜、调味、火候、食材搭配等问题。'

function createMessage(role, content, extra) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    ...(extra || {})
  }
}

export default {
  name: 'AiChatPage',
  data() {
    return {
      messages: [],
      inputValue: '',
      sending: false,
      thinking: false,
      scrollIntoView: '',
      loadingMessageId: 'ai-loading-message',
      requestTask: null,
      assistantMessageId: ''
    }
  },
  computed: {
    canSend() {
      return this.inputValue.trim().length > 0
    }
  },
  onLoad() {
    this.initMessages()
  },
  onUnload() {
    this.abortCurrentRequest()
  },
  methods: {
    initMessages() {
      const cached = uni.getStorageSync(AI_CHAT_HISTORY_KEY)

      if (Array.isArray(cached) && cached.length > 0) {
        this.messages = cached
      } else {
        this.messages = [createMessage('assistant', WELCOME_TEXT, { isWelcome: true })]
      }

      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    persistMessages() {
      uni.setStorageSync(AI_CHAT_HISTORY_KEY, this.messages)
    },
    abortCurrentRequest() {
      if (this.requestTask && typeof this.requestTask.abort === 'function') {
        this.requestTask.abort()
      }

      this.requestTask = null
    },
    scrollToBottom() {
      const lastMessage = this.thinking
        ? { id: this.loadingMessageId }
        : this.messages[this.messages.length - 1]

      if (!lastMessage) {
        return
      }

      this.scrollIntoView = ''
      this.$nextTick(() => {
        this.scrollIntoView = `msg-${lastMessage.id}`
      })
    },
    buildHistory() {
      return this.messages
        .filter((item) => (item.role === 'user' || item.role === 'assistant') && !item.isWelcome)
        .slice(-20)
        .map((item) => ({
          role: item.role,
          content: item.content
        }))
    },
    ensureAssistantMessage() {
      if (this.assistantMessageId) {
        const existedIndex = this.messages.findIndex((item) => item.id === this.assistantMessageId)
        if (existedIndex !== -1) {
          return existedIndex
        }
      }

      const message = createMessage('assistant', '')
      this.assistantMessageId = message.id
      this.messages.push(message)
      this.persistMessages()
      this.scrollToBottom()

      return this.messages.length - 1
    },
    appendAssistantChunk(chunk) {
      if (!chunk) {
        return
      }

      const messageIndex = this.ensureAssistantMessage()
      const currentMessage = this.messages[messageIndex]

      this.$set(this.messages, messageIndex, {
        ...currentMessage,
        content: `${currentMessage.content || ''}${chunk}`
      })

      this.persistMessages()
      this.scrollToBottom()
    },
    finishStreaming() {
      this.sending = false
      this.thinking = false
      this.requestTask = null
      this.assistantMessageId = ''
      this.persistMessages()
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    handleStreamError(error) {
      this.thinking = false
      this.requestTask = null

      if (this.assistantMessageId) {
        const messageIndex = this.messages.findIndex((item) => item.id === this.assistantMessageId)
        if (messageIndex !== -1 && !this.messages[messageIndex].content) {
          this.messages.splice(messageIndex, 1)
        }
      }

      this.assistantMessageId = ''
      this.sending = false
      this.persistMessages()

      uni.showToast({
        title: error && error.message ? normalizeToastMessage(error.message) : '发送失败，请稍后重试',
        icon: 'none'
      })

      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    async handleSend() {
      const message = this.inputValue.trim()

      if (!message || this.sending) {
        return
      }

      const history = this.buildHistory()
      this.messages.push(createMessage('user', message))
      this.inputValue = ''
      this.sending = true
      this.thinking = true
      this.assistantMessageId = ''
      this.persistMessages()
      this.scrollToBottom()

      this.abortCurrentRequest()
      this.requestTask = chatWithAiStream({
        message,
        history,
        onMessage: (chunk) => {
          this.thinking = false
          this.appendAssistantChunk(chunk)
        },
        onDone: () => {
          this.finishStreaming()
        },
        onError: (error) => {
          this.handleStreamError(error)
        }
      })
    }
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f6f7fb;
}

.message-scroll {
  flex: 1;
  min-height: 0;
}

.message-list {
  padding: 24rpx 24rpx 12rpx;
  box-sizing: border-box;
}

.message-row {
  display: flex;
  margin-bottom: 20rpx;
}

.message-row-assistant {
  justify-content: flex-start;
}

.message-row-user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 78%;
  padding: 22rpx 24rpx;
  border-radius: 20rpx;
  box-sizing: border-box;
}

.message-bubble-assistant {
  background: #ffffff;
  border-top-left-radius: 8rpx;
  box-shadow: 0 8rpx 24rpx rgba(31, 35, 41, 0.06);
}

.message-bubble-user {
  background: #d96c3a;
  border-top-right-radius: 8rpx;
}

.message-bubble-loading {
  background: #fff5ef;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.7;
  color: #1f2329;
  word-break: break-all;
}

.message-bubble-user .message-text {
  color: #ffffff;
}

.input-bar {
  display: flex;
  align-items: center;
  height: 96rpx;
  padding: 8rpx 20rpx;
  background: #ffffff;
  border-top: 1rpx solid #eceff3;
  box-sizing: border-box;
}

.input-box {
  flex: 1;
  height: 80rpx;
  padding: 0 24rpx;
  border-radius: 40rpx;
  background: #f5f6fa;
  font-size: 28rpx;
  color: #1f2329;
  box-sizing: border-box;
}

.send-btn {
  width: 136rpx;
  height: 80rpx;
  margin-left: 12rpx;
  line-height: 80rpx;
  border: none;
  border-radius: 40rpx;
  background: #d96c3a;
  font-size: 28rpx;
  color: #ffffff;
}

.send-btn::after {
  border: none;
}

.send-btn-disabled {
  background: #f0b39a;
  color: #fff7f2;
}
</style>

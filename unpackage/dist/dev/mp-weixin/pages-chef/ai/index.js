"use strict";
const common_vendor = require("../../common/vendor.js");
const api_ai = require("../../api/ai.js");
const utils_auth = require("../../utils/auth.js");
const utils_toastMessage = require("../../utils/toast-message.js");
const ChefTabbar = () => "../../components/chef-tabbar.js";
const WELCOME_TEXT = "你好，我是小嘉AI，可以帮你解答做菜、调味、火候、食材搭配等问题。";
function createMessage(role, content, extra) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    ...extra || {}
  };
}
const _sfc_main = {
  name: "ChefAiChatPage",
  components: {
    ChefTabbar
  },
  data() {
    return {
      messages: [],
      inputValue: "",
      sending: false,
      thinking: false,
      scrollIntoView: "",
      loadingMessageId: "chef-ai-loading-message",
      requestTask: null,
      assistantMessageId: ""
    };
  },
  computed: {
    canSend() {
      return this.inputValue.trim().length > 0;
    }
  },
  onLoad() {
    this.initMessages();
  },
  onUnload() {
    this.abortCurrentRequest();
  },
  methods: {
    initMessages() {
      const cached = common_vendor.index.getStorageSync(utils_auth.CHEF_AI_CHAT_HISTORY_KEY);
      if (Array.isArray(cached) && cached.length > 0) {
        this.messages = cached;
      } else {
        this.messages = [createMessage("assistant", WELCOME_TEXT, { isWelcome: true })];
      }
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    persistMessages() {
      common_vendor.index.setStorageSync(utils_auth.CHEF_AI_CHAT_HISTORY_KEY, this.messages);
    },
    abortCurrentRequest() {
      if (this.requestTask && typeof this.requestTask.abort === "function") {
        this.requestTask.abort();
      }
      this.requestTask = null;
    },
    scrollToBottom() {
      const lastMessage = this.thinking ? { id: this.loadingMessageId } : this.messages[this.messages.length - 1];
      if (!lastMessage) {
        return;
      }
      this.scrollIntoView = "";
      this.$nextTick(() => {
        this.scrollIntoView = `msg-${lastMessage.id}`;
      });
    },
    buildHistory() {
      return this.messages.filter((item) => (item.role === "user" || item.role === "assistant") && !item.isWelcome).slice(-20).map((item) => ({
        role: item.role,
        content: item.content
      }));
    },
    ensureAssistantMessage() {
      if (this.assistantMessageId) {
        const existedIndex = this.messages.findIndex((item) => item.id === this.assistantMessageId);
        if (existedIndex !== -1) {
          return existedIndex;
        }
      }
      const message = createMessage("assistant", "");
      this.assistantMessageId = message.id;
      this.messages.push(message);
      this.persistMessages();
      this.scrollToBottom();
      return this.messages.length - 1;
    },
    appendAssistantChunk(chunk) {
      if (!chunk) {
        return;
      }
      const messageIndex = this.ensureAssistantMessage();
      const currentMessage = this.messages[messageIndex];
      this.$set(this.messages, messageIndex, {
        ...currentMessage,
        content: `${currentMessage.content || ""}${chunk}`
      });
      this.persistMessages();
      this.scrollToBottom();
    },
    finishStreaming() {
      this.sending = false;
      this.thinking = false;
      this.requestTask = null;
      this.assistantMessageId = "";
      this.persistMessages();
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    handleStreamError(error) {
      this.thinking = false;
      this.requestTask = null;
      if (this.assistantMessageId) {
        const messageIndex = this.messages.findIndex((item) => item.id === this.assistantMessageId);
        if (messageIndex !== -1 && !this.messages[messageIndex].content) {
          this.messages.splice(messageIndex, 1);
        }
      }
      this.assistantMessageId = "";
      this.sending = false;
      this.persistMessages();
      common_vendor.index.showToast({
        title: error && error.message ? utils_toastMessage.normalizeToastMessage(error.message) : "发送失败，请稍后重试",
        icon: "none"
      });
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    async handleSend() {
      const message = this.inputValue.trim();
      if (!message || this.sending) {
        return;
      }
      const history = this.buildHistory();
      this.messages.push(createMessage("user", message));
      this.inputValue = "";
      this.sending = true;
      this.thinking = true;
      this.assistantMessageId = "";
      this.persistMessages();
      this.scrollToBottom();
      this.abortCurrentRequest();
      this.requestTask = api_ai.chatWithAiStream({
        message,
        history,
        onMessage: (chunk) => {
          this.thinking = false;
          this.appendAssistantChunk(chunk);
        },
        onDone: () => {
          this.finishStreaming();
        },
        onError: (error) => {
          this.handleStreamError(error);
        }
      });
    }
  }
};
if (!Array) {
  const _component_chef_tabbar = common_vendor.resolveComponent("chef-tabbar");
  _component_chef_tabbar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.messages, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.content),
        b: common_vendor.n(item.role === "user" ? "message-bubble-user" : "message-bubble-assistant"),
        c: "msg-" + item.id,
        d: item.id,
        e: common_vendor.n(item.role === "user" ? "message-row-user" : "message-row-assistant")
      };
    }),
    b: $data.thinking
  }, $data.thinking ? {
    c: "msg-" + $data.loadingMessageId
  } : {}, {
    d: $data.scrollIntoView,
    e: $data.sending,
    f: common_vendor.o((...args) => $options.handleSend && $options.handleSend(...args)),
    g: $data.inputValue,
    h: common_vendor.o(($event) => $data.inputValue = $event.detail.value),
    i: common_vendor.t($data.sending ? "发送中" : "发送"),
    j: $data.sending || !$options.canSend ? 1 : "",
    k: $data.sending || !$options.canSend,
    l: common_vendor.o((...args) => $options.handleSend && $options.handleSend(...args)),
    m: common_vendor.p({
      current: "ai"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c3b8679e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages-chef/ai/index.js.map

"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("../utils/config.js");
const utils_auth = require("../utils/auth.js");
function buildUrl(url) {
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  return `${utils_config.BASE_URL}${url}`;
}
function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }
  return history.filter((item) => item && (item.role === "user" || item.role === "assistant")).map((item) => ({
    role: item.role,
    content: item.content ? String(item.content) : ""
  }));
}
function createUtf8Decoder() {
  if (typeof TextDecoder !== "undefined") {
    const decoder = new TextDecoder("utf-8");
    return {
      decode(chunk) {
        return decoder.decode(new Uint8Array(chunk), { stream: true });
      },
      flush() {
        return decoder.decode();
      }
    };
  }
  return {
    decode(chunk) {
      const bytes = new Uint8Array(chunk);
      let result = "";
      for (let i = 0; i < bytes.length; i += 1) {
        result += String.fromCharCode(bytes[i]);
      }
      try {
        return decodeURIComponent(escape(result));
      } catch (error) {
        return result;
      }
    },
    flush() {
      return "";
    }
  };
}
function chatWithAiStream(options = {}) {
  const payload = {
    message: options.message ? String(options.message) : "",
    history: normalizeHistory(options.history)
  };
  const header = {
    "Content-Type": "application/json",
    Accept: "text/event-stream"
  };
  const token = utils_auth.getToken();
  if (token) {
    header.Authorization = `Bearer ${token}`;
  }
  const decoder = createUtf8Decoder();
  let buffer = "";
  let currentEvent = "";
  let currentDataLines = [];
  let finished = false;
  let aborted = false;
  function resetCurrentFrame() {
    currentEvent = "";
    currentDataLines = [];
  }
  function emitFrame() {
    if (!currentEvent && currentDataLines.length === 0) {
      return;
    }
    const eventName = currentEvent || "message";
    const rawData = currentDataLines.join("\n");
    let payloadData = null;
    resetCurrentFrame();
    if (!rawData) {
      return;
    }
    try {
      payloadData = JSON.parse(rawData);
    } catch (error) {
      options.onError && options.onError(new Error("AI流数据解析失败"));
      return;
    }
    if (eventName === "message") {
      if (payloadData && payloadData.code === 200) {
        const reply = payloadData.data && payloadData.data.reply ? String(payloadData.data.reply) : "";
        if (reply) {
          options.onMessage && options.onMessage(reply, payloadData);
        }
        return;
      }
      options.onError && options.onError(new Error(payloadData && payloadData.message ? payloadData.message : "AI请求失败"));
      return;
    }
    if (eventName === "done") {
      finished = true;
      options.onDone && options.onDone(payloadData);
      return;
    }
    if (eventName === "error") {
      finished = true;
      options.onError && options.onError(new Error(payloadData && payloadData.message ? payloadData.message : "AI请求失败"));
    }
  }
  function processLine(line) {
    const normalizedLine = line.replace(/\r$/, "");
    if (normalizedLine === "") {
      emitFrame();
      return;
    }
    if (normalizedLine.indexOf("event:") === 0) {
      currentEvent = normalizedLine.slice(6).trim();
      return;
    }
    if (normalizedLine.indexOf("data:") === 0) {
      currentDataLines.push(normalizedLine.slice(5).trimStart());
    }
  }
  function parseChunk(chunk) {
    buffer += decoder.decode(chunk);
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    lines.forEach(processLine);
  }
  const requestTask = common_vendor.wx$1.request({
    url: buildUrl("/api/ai/chat"),
    method: "POST",
    data: payload,
    header,
    enableChunked: true,
    responseType: "arraybuffer",
    success: (response) => {
      if (aborted) {
        return;
      }
      if (response.statusCode === 401) {
        options.onError && options.onError(new Error("登录已失效"));
        return;
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        options.onError && options.onError(new Error(`AI请求失败(${response.statusCode})`));
        return;
      }
      const tail = decoder.flush();
      if (tail) {
        buffer += tail;
      }
      if (buffer) {
        buffer.split("\n").forEach(processLine);
        buffer = "";
      }
      emitFrame();
      if (!finished) {
        options.onDone && options.onDone(null);
      }
    },
    fail: (error) => {
      if (aborted) {
        return;
      }
      options.onError && options.onError(new Error(error && error.errMsg || "网络异常"));
    }
  });
  if (requestTask && typeof requestTask.onChunkReceived === "function") {
    requestTask.onChunkReceived((result) => {
      if (aborted) {
        return;
      }
      if (result && result.data) {
        parseChunk(result.data);
      }
    });
  }
  return {
    abort() {
      aborted = true;
      if (requestTask && typeof requestTask.abort === "function") {
        requestTask.abort();
      }
    }
  };
}
exports.chatWithAiStream = chatWithAiStream;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/ai.js.map

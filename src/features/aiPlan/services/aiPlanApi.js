import api from "../../../utils/axiosInstance";
import { getTokens } from "../../../utils/tokenManager";

const BASE = "/ai-plan/sessions";
const API_ROOT = import.meta.env.VITE_API_URL || "/api";

export const createSession = async (initialMessage, planId = null) => {
  const body = {};
  if (initialMessage) body.initial_message = initialMessage;
  if (planId != null) body.plan_id = planId;
  const res = await api.post(BASE, body);
  return res.data.data;
};

export const applyEdits = async (sessionId) => {
  const res = await api.post(`${BASE}/${sessionId}/apply-edits`);
  return res.data.data;
};

export const getSession = async (sessionId) => {
  const res = await api.get(`${BASE}/${sessionId}`);
  return res.data.data;
};

// AI chat history (newest first) for the current user — used by the conversation list.
export const listSessions = async () => {
  const res = await api.get(BASE);
  return res.data.data;
};

export const sendMessage = async (sessionId, content) => {
  const res = await api.post(`${BASE}/${sessionId}/messages`, { content });
  return res.data.data;
};

export const regenerateDraft = async (sessionId, instructions) => {
  const res = await api.post(`${BASE}/${sessionId}/regenerate`, instructions ? { instructions } : {});
  return res.data.data;
};

export const approveSession = async (sessionId) => {
  const res = await api.post(`${BASE}/${sessionId}/approve`);
  return res.data.data;
};

/**
 * Stream an agent reply via SSE. Uses fetch+ReadableStream because EventSource
 * doesn't support POST + Authorization. The handler receives one parsed event
 * at a time: { event, data } where data is the JSON payload.
 *
 * Returns a Promise that resolves when the stream closes. Reject only on
 * network / HTTP errors; tool-level errors arrive as `{ event: "error" }`.
 */
const streamSse = async (url, body, onEvent, { signal } = {}) => {
  const { accessToken } = getTokens();

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    let text = "";
    try {
      text = await res.text();
    } catch {
      // ignore
    }
    throw new Error(`Stream HTTP ${res.status}: ${text || res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line.
      let sepIdx;
      while ((sepIdx = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, sepIdx);
        buffer = buffer.slice(sepIdx + 2);
        const parsed = parseFrame(frame);
        if (parsed) onEvent?.(parsed);
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
};

export const streamMessage = (sessionId, content, onEvent, opts = {}) =>
  streamSse(`${API_ROOT}${BASE}/${sessionId}/messages/stream`, { content }, onEvent, opts);

export const streamRegenerate = (sessionId, instructions, onEvent, opts = {}) =>
  streamSse(
    `${API_ROOT}${BASE}/${sessionId}/regenerate/stream`,
    instructions ? { instructions } : {},
    onEvent,
    opts
  );

const parseFrame = (frame) => {
  let event = "message";
  let data = "";
  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data += line.slice(5).trim();
  }
  if (!data) return { event, data: null };
  try {
    return { event, data: JSON.parse(data) };
  } catch {
    return { event, data };
  }
};

// src/realtime/mainSocket.js
import { Client } from "@stomp/stompjs";

class MainSocket {
  client = null;
  connected = false;
  accessToken = null;

  subscribers = new Map(); // subId -> () => unsubscribe
  nextSubId = 1;

  pendingSubs = []; // { id, destination, handler }

  setAccessToken(token) {
    this.accessToken = token;
  }

  _createClient() {
    const client = new Client({
      brokerURL:
        import.meta.env.VITE_REALTIME_WS_URL || "ws://localhost:8080/ws",

      // Tự reconnect nếu server rớt, network drop, ...
      reconnectDelay: 5000,

      debug: (str) => {
        // console.log("[STOMP]", str);
      },

      // Mỗi lần chuẩn bị connect/reconnect, gắn lại header từ accessToken hiện tại
      beforeConnect: () => {
        client.connectHeaders = this.accessToken
          ? { Authorization: `Bearer ${this.accessToken}` }
          : {};
      },
    });

    // Gắn client hiện tại
    this.client = client;

    // ========== HANDLER ==========
    client.onConnect = () => {
      // Chặn callback của client cũ (trong trường hợp đã create client mới)
      if (this.client !== client) {
        console.warn("[WS] Ignore onConnect from stale client");
        return;
      }

      console.log("[WS] Connected STOMP");
      this.connected = true;

      // Flush pendingSubs
      const pending = [...this.pendingSubs];
      this.pendingSubs = [];

      pending.forEach(({ id, destination, handler }) => {
        const sub = client.subscribe(destination, (msg) => {
          try {
            const payload = JSON.parse(msg.body);
            handler(payload);
          } catch (e) {
            console.error("Parse WS payload error:", e);
          }
        });
        this.subscribers.set(id, () => sub.unsubscribe());
      });
    };

    client.onStompError = (frame) => {
      console.error(
        "STOMP error:",
        frame.headers["message"],
        frame.body
      );
    };

    client.onWebSocketClose = (event) => {
      // Nếu đã có client mới => bỏ qua close của client cũ
      if (this.client !== client) {
        console.warn("[WS] WebSocket closed on stale client");
        return;
      }

      console.warn("[WS] Socket closed:", event.code, event.reason);
      this.connected = false;

      // KHÔNG set this.client = null ở đây
      // để STOMP tự reconnect với reconnectDelay
      // Chỉ khi logout mới disconnect() và null.
    };
  }

  connect() {
    // Nếu chưa có client (lần đầu hoặc sau khi logout) → tạo
    if (!this.client) {
      this._createClient();
    }

    // Nếu đang active rồi thì thôi
    if (this.client.active) return;

    this.client.activate();
  }

  disconnect() {
    if (!this.client) return;

    // Huỷ hết subscriptions
    this.subscribers.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        console.warn("[WS] Error when unsubscribing during disconnect:", e);
      }
    });
    this.subscribers.clear();
    this.pendingSubs = [];

    try {
      this.client.deactivate();
    } catch (e) {
      console.warn("[WS] Error when deactivating client:", e);
    }

    this.client = null;
    this.connected = false;
  }

  /**
   * Đăng ký subscribe 1 topic
   * @param {string} destination - ví dụ `/topic/plans/123/board`
   * @param {(msgBody:any)=>void} handler
   * @returns {number} subId để sau này hủy
   */
  subscribe(destination, handler) {
    const id = this.nextSubId++;

    const subscribeNow = () => {
      // Phòng trường hợp vừa disconnect xong, client bị null
      if (!this.client) {
        console.warn(
          "[WS] subscribeNow but client is null, push back to pending"
        );
        this.pendingSubs.push({ id, destination, handler });
        return;
      }

      const sub = this.client.subscribe(destination, (msg) => {
        try {
          const payload = JSON.parse(msg.body);
          handler(payload);
        } catch (e) {
          console.error("Parse WS payload error:", e);
        }
      });
      this.subscribers.set(id, () => sub.unsubscribe());
    };

    if (this.client && this.connected) {
      subscribeNow();
    } else {
      this.pendingSubs.push({ id, destination, handler });
    }

    return id;
  }

  unsubscribe(subId) {
    // Bỏ khỏi pending nếu chưa kịp subscribe
    this.pendingSubs = this.pendingSubs.filter((p) => p.id !== subId);

    const unsub = this.subscribers.get(subId);
    if (unsub) {
      try {
        unsub();
      } catch (e) {
        console.warn(
          "[WS] Error when unsubscribing (socket may be closing):",
          e
        );
      }
      this.subscribers.delete(subId);
    }
  }
}

export const mainSocket = new MainSocket();

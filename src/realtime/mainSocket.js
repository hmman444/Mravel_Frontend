// src/realtime/mainSocket.js
import { Client } from "@stomp/stompjs";

class MainSocket {
  client = null;
  connected = false;

  // key: subId, value: () => unsubscribe
  subscribers = new Map();
  nextSubId = 1;

  // các sub đăng ký khi chưa connect xong
  // mỗi item: { id, destination, handler }
  pendingSubs = [];

  _createClient(accessToken) {
    this.client = new Client({
      brokerURL:
        import.meta.env.VITE_REALTIME_WS_URL || "ws://localhost:8080/ws",
      reconnectDelay: 5000,
      debug: (str) => {
        // console.log("[STOMP]", str);
      },
      connectHeaders: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {},
    });

    this.client.onConnect = () => {
      console.log("[WS] Connected STOMP");
      this.connected = true;

      // flush toàn bộ pendingSubs
      this.pendingSubs.forEach(({ id, destination, handler }) => {
        const sub = this.client.subscribe(destination, (msg) => {
          try {
            const payload = JSON.parse(msg.body);
            handler(payload);
          } catch (e) {
            console.error("Parse WS payload error:", e);
          }
        });
        this.subscribers.set(id, () => sub.unsubscribe());
      });
      this.pendingSubs = [];
    };

    this.client.onStompError = (frame) => {
      console.error(
        "STOMP error:",
        frame.headers["message"],
        frame.body
      );
    };

    this.client.onWebSocketClose = (event) => {
      console.warn("[WS] Socket closed:", event.code, event.reason);
      this.connected = false;

      // cho phép connect() tạo client mới
      this.client = null;
      // pendingSubs giữ nguyên, subscribers vẫn còn unsubscribe fn
      // (unsubscribe có try/catch nên không sao nếu gọi trên socket đã close)
    };
  }

  connect(accessToken) {
    // nếu đã có client đang active rồi thì khỏi làm gì
    if (this.client && this.client.active) return;

    // nếu client null (chưa tạo lần nào hoặc sau khi bị đóng) → tạo mới
    if (!this.client) {
      this._createClient(accessToken);
    }

    // nếu client chưa active thì activate
    if (!this.client.active) {
      this.client.activate();
    }
  }

  disconnect() {
    if (!this.client) return;

    // hủy hết subscription hiện tại
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
      // đã connect → subscribe ngay
      subscribeNow();
    } else {
      // chưa connect xong hoặc client chưa tạo → đẩy vào hàng đợi
      this.pendingSubs.push({ id, destination, handler });
    }

    return id;
  }

  unsubscribe(subId) {
    // bỏ pending nếu chưa kịp subscribe
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

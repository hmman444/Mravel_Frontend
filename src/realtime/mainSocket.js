// src/realtime/mainSocket.js
import { Client } from "@stomp/stompjs";

class MainSocket {
  client = null;
  connected = false;
  subscribers = new Map(); // key: id, value: unsubscribe fn
  nextSubId = 1;
  pendingSubs = []; // {id, destination, handler}

  connect(accessToken) {
    if (this.connected && this.client) return;
    if (this.client) {
      // đang activating rồi thì thôi
      return;
    }

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
      this.connected = true;
      // flush tất cả subscription chờ
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
      console.error("STOMP error:", frame.headers["message"], frame.body);
    };

    this.client.onWebSocketClose = () => {
      this.connected = false;
      // console.warn("MainSocket closed");
    };

    this.client.activate();
  }

  disconnect() {
    if (!this.client) return;

    this.subscribers.forEach((unsub) => {
      try {
        unsub();
      } catch {}
    });
    this.subscribers.clear();
    this.pendingSubs = [];

    this.client.deactivate();
    this.client = null;
    this.connected = false;
  }

  /**
   * Đăng ký subscribe 1 topic
   * @param {string} destination - ví dụ `/topic/plans/123/board`
   * @param {(msgBody:any)=>void} handler
   * @returns {number|null} subId để sau này hủy
   */
  subscribe(destination, handler) {
    if (!this.client) {
      console.warn("MainSocket not connected yet");
      return null;
    }

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

    if (this.connected) {
      // đã connect → subscribe ngay
      subscribeNow();
    } else {
      // chưa connect → đưa vào hàng đợi
      this.pendingSubs.push({ id, destination, handler });
    }

    return id;
  }

  unsubscribe(subId) {
    // Nếu vẫn còn pending mà unmount trước khi connect
    this.pendingSubs = this.pendingSubs.filter((p) => p.id !== subId);

    const unsub = this.subscribers.get(subId);
    if (unsub) {
      try {
        unsub();
      } catch {}
      this.subscribers.delete(subId);
    }
  }

  // notify/chat
}

export const mainSocket = new MainSocket();

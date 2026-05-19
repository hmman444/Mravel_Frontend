// src/realtime/mainSocket.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";

class MainSocket {
  client = null;
  connected = false;
  accessToken = null;

  // subId -> { destination, handler, unsub | null }
  // Only contains subscriptions that have been successfully registered with STOMP.
  subscribers = new Map();
  nextSubId = 1;

  // Queued while disconnected; flushed on next onConnect.
  pendingSubs = [];

  setAccessToken(token) {
    this.accessToken = token;
  }

  _createClient() {
    const rawRealtimeUrl =
      import.meta.env.VITE_REALTIME_WS_URL || "http://localhost:8090/ws";
    const sockJsUrl = rawRealtimeUrl
      .replace(/^ws:/i, "http:")
      .replace(/^wss:/i, "https:");
    const nativeWsUrl = rawRealtimeUrl
      .replace(/^http:/i, "ws:")
      .replace(/^https:/i, "wss:");
    const useSockJs = import.meta.env.VITE_REALTIME_USE_SOCKJS !== "false";

    const client = new Client({
      ...(useSockJs
        ? { webSocketFactory: () => new SockJS(sockJsUrl) }
        : { brokerURL: nativeWsUrl }),

      reconnectDelay: 5000,

      heartbeatIncoming: 0,
      heartbeatOutgoing: useSockJs ? 0 : 10000,

      debug: () => {},

      beforeConnect: () => {
        client.connectHeaders = this.accessToken
          ? { Authorization: `Bearer ${this.accessToken}` }
          : {};
      },
    });

    this.client = client;

    client.onConnect = () => {
      if (this.client !== client) {
        console.warn("[WS] Ignore onConnect from stale client");
        return;
      }

      console.log("[WS] Connected STOMP");
      this.connected = true;

      // Re-subscribe all active subscriptions that were lost during disconnect.
      // This ensures hooks don't need to re-run their effects on every reconnect.
      this.subscribers.forEach((entry) => {
        try {
          const stomp_sub = client.subscribe(entry.destination, (msg) => {
            try {
              entry.handler(JSON.parse(msg.body));
            } catch (e) {
              console.error("[WS] Parse error on re-subscribe:", e);
            }
          });
          entry.unsub = () => stomp_sub.unsubscribe();
        } catch (e) {
          console.warn("[WS] Re-subscribe failed for", entry.destination, e);
        }
      });

      // Flush subscriptions that arrived while disconnected.
      const pending = [...this.pendingSubs];
      this.pendingSubs = [];
      pending.forEach(({ id, destination, handler }) => {
        try {
          const stomp_sub = client.subscribe(destination, (msg) => {
            try {
              handler(JSON.parse(msg.body));
            } catch (e) {
              console.error("[WS] Parse error on pending flush:", e);
            }
          });
          this.subscribers.set(id, {
            destination,
            handler,
            unsub: () => stomp_sub.unsubscribe(),
          });
        } catch (e) {
          console.warn("[WS] Pending sub failed for", destination, e);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("[WS] STOMP error:", frame.headers["message"], frame.body);
    };

    client.onWebSocketClose = (event) => {
      if (this.client !== client) {
        console.warn("[WS] WebSocket closed on stale client");
        return;
      }
      console.warn("[WS] Socket closed:", event.code, event.reason);
      this.connected = false;
      // Do NOT null out this.client — STOMP auto-reconnects via reconnectDelay.
    };
  }

  connect(accessToken) {
    this.setAccessToken(accessToken || null);

    if (!this.client) {
      this._createClient();
    }

    if (this.client.active) return;

    this.client.activate();
  }

  disconnect() {
    if (!this.client) return;

    this.subscribers.forEach((entry) => {
      try {
        entry.unsub?.();
      } catch (e) {
        console.warn("[WS] Error unsubscribing during disconnect:", e);
      }
    });
    this.subscribers.clear();
    this.pendingSubs = [];

    try {
      this.client.deactivate();
    } catch (e) {
      console.warn("[WS] Error deactivating client:", e);
    }

    this.client = null;
    this.connected = false;
    this.accessToken = null;
  }

  subscribe(destination, handler) {
    const id = this.nextSubId++;

    if (this.client && this.connected) {
      try {
        const stomp_sub = this.client.subscribe(destination, (msg) => {
          try {
            handler(JSON.parse(msg.body));
          } catch (e) {
            console.error("[WS] Parse error:", e);
          }
        });
        this.subscribers.set(id, {
          destination,
          handler,
          unsub: () => stomp_sub.unsubscribe(),
        });
      } catch (e) {
        // Socket closed mid-subscribe — queue for next connect
        console.warn("[WS] Subscribe failed, queuing:", destination, e);
        this.pendingSubs.push({ id, destination, handler });
      }
    } else {
      this.pendingSubs.push({ id, destination, handler });
    }

    return id;
  }

  unsubscribe(subId) {
    this.pendingSubs = this.pendingSubs.filter((p) => p.id !== subId);

    const entry = this.subscribers.get(subId);
    if (entry) {
      try {
        entry.unsub?.();
      } catch (e) {
        console.warn("[WS] Error unsubscribing:", e);
      }
      this.subscribers.delete(subId);
    }
  }
}

export const mainSocket = new MainSocket();

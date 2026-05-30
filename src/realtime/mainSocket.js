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
      console.warn("[WS] Socket closed:", event?.code, event?.reason);
      this.connected = false;
      // Do NOT null out this.client — STOMP auto-reconnects via reconnectDelay.
    };

    client.onWebSocketError = (event) => {
      console.warn("[WS] Socket error:", event?.message || event);
    };
  }

  connect(accessToken) {
    const tokenChanged =
      accessToken && this.accessToken && accessToken !== this.accessToken;

    this.setAccessToken(accessToken || null);

    if (!this.client) {
      this._createClient();
    }

    // If the token changed and the client is currently connected, force a
    // reconnect so the new JWT is used immediately (otherwise the existing
    // STOMP session keeps running with the old token until the next natural
    // disconnect — which can mean stale auth context after a refresh or
    // account switch).
    if (tokenChanged && this.client.active) {
      this._forceReconnect();
      return;
    }

    if (this.client.active) return;

    this.client.activate();
  }

  // Deactivate the current STOMP client and immediately re-activate it so that
  // the next CONNECT frame carries the latest in-memory access token. Kept
  // subscriptions in `subscribers` so they get reinstated by onConnect.
  _forceReconnect() {
    if (!this.client) return;
    const client = this.client;
    this.connected = false;
    // Drop the old STOMP-side subscription handles (the new client.subscribe
    // call inside onConnect will replace them anyway). Without this, an
    // unsubscribe() during the brief reconnect gap would call into a dead
    // STOMP session and noisily fail.
    this.subscribers.forEach((entry) => {
      entry.unsub = null;
    });
    Promise.resolve()
      .then(() => client.deactivate())
      .catch(() => {})
      .then(() => {
        if (this.client !== client) return;
        try {
          client.activate();
        } catch (e) {
          console.warn("[WS] Re-activate after token refresh failed:", e);
        }
      });
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
      // Not yet connected — record in subscribers so a future onConnect
      // re-subscribes it even if it's the first time. Also push to pendingSubs
      // so the initial activation path picks it up.
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

// src/features/notifications/slices/notificationSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notificationService";

const initialState = {
  items: [],
  page: 1, // UI page (1-based)
  size: 8,
  hasMore: true,

  unreadCount: 0,

  loading: false,
  saving: false,
  error: null,

  dropdownOpen: false,
};

const apiMessage = (err) => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;

  if (err?.response?.status === 401)
    return "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.";
  return msg || "Có lỗi xảy ra";
};

/** =========================
 * Helpers
 * ========================= */
const normalizeNotiItem = (n) => {
  if (!n) return null;

  const actor = n.actor || (n.actorId
    ? { id: n.actorId, fullname: n.actorFullname, avatar: n.actorAvatar }
    : null);

  // deepLink ưu tiên BE trả, fallback theo type
  const deepLink =
    n.deepLink ||
    (n.type === "FRIEND_REQUEST" || n.type === "FRIEND_ACCEPTED"
      ? (actor?.id ? `/profile/${actor.id}` : null)
      : null);

  // image ưu tiên BE trả, fallback avatar actor
  const image =
    n.image ||
    (n.type === "FRIEND_REQUEST" || n.type === "FRIEND_ACCEPTED"
      ? actor?.avatar
      : null);

  return {
    ...n,
    actor,
    deepLink,
    image,
    read: typeof n.read === "boolean" ? n.read : false,
  };
};

// Ưu tiên unreadCount meta nếu BE trả.
// Nếu không có thì fallback đếm items.read === false
const pickUnread = (payloadOrItems) => {
  // payload meta
  if (
    payloadOrItems &&
    typeof payloadOrItems === "object" &&
    !Array.isArray(payloadOrItems)
  ) {
    if (typeof payloadOrItems.unreadCount === "number")
      return payloadOrItems.unreadCount;
    if (typeof payloadOrItems.totalUnread === "number")
      return payloadOrItems.totalUnread;

    if (Array.isArray(payloadOrItems.content)) {
      return payloadOrItems.content.filter((n) => !n?.read).length;
    }
    if (Array.isArray(payloadOrItems.items)) {
      return payloadOrItems.items.filter((n) => !n?.read).length;
    }
  }

  // items array
  const items = Array.isArray(payloadOrItems) ? payloadOrItems : [];
  return items.filter((n) => !n?.read).length;
};

// Normalize BE response:
// - Spring Page => { content, totalElements, size, number(0-based), totalPages ... }
// - custom => { items, total, hasMore, unreadCount ... }
// - direct array => []
const normalizeList = (payload) => {
  if (!payload) {
    return { items: [], total: 0, hasMore: false, unreadCount: 0 };
  }

  // Case 1: Spring Page
  if (Array.isArray(payload?.content)) {
    const items = payload.content;
    const total = payload.totalElements ?? items.length;

    const pageIndex0 = payload.number ?? 0; // 0-based
    const pageSize = payload.size ?? items.length;

    const hasMore = (pageIndex0 + 1) * pageSize < total;

    return {
      items,
      total,
      hasMore,
      unreadCount: pickUnread(payload), // ưu tiên meta nếu có
    };
  }

  // Case 2: custom { items, total, hasMore, unreadCount }
  if (Array.isArray(payload?.items)) {
    return {
      items: payload.items,
      total: payload.total ?? payload.items.length,
      hasMore: typeof payload.hasMore === "boolean" ? payload.hasMore : false,
      unreadCount: pickUnread(payload), // ưu tiên meta nếu có
    };
  }

  // Case 3: direct array
  if (Array.isArray(payload)) {
    return {
      items: payload,
      total: payload.length,
      hasMore: false,
      unreadCount: pickUnread(payload),
    };
  }

  return { items: [], total: 0, hasMore: false, unreadCount: 0 };
};

// Key để chống duplicate giữa:
// - noti persisted: id
// - realtime event: eventId
const getNotiKey = (n) => n?.id ?? n?.eventId ?? null;

/** =========================
 * Thunks
 * ========================= */

export const loadNotifications = createAsyncThunk(
  "notifications/load",
  async (params, { rejectWithValue }) => {
    try {
      return await fetchNotifications(params);
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const loadMoreNotifications = createAsyncThunk(
  "notifications/loadMore",
  async (params, { rejectWithValue }) => {
    try {
      return await fetchNotifications(params);
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const markReadThunk = createAsyncThunk(
  "notifications/markRead",
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const unread = await markNotificationRead(id, params);
      return { id, unread };
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const markAllReadThunk = createAsyncThunk(
  "notifications/markAllRead",
  async (params, { rejectWithValue }) => {
    try {
      const unread = await markAllNotificationsRead(params);
      return unread;
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

/** =========================
 * Slice
 * ========================= */

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setDropdownOpen(state, action) {
      state.dropdownOpen = !!action.payload;
    },
    toggleDropdown(state) {
      state.dropdownOpen = !state.dropdownOpen;
    },
    resetNotifications(state) {
      Object.assign(state, initialState);
    },

    // realtime push từ socket
    receiveNotificationEvent(state, action) {
      const event = action.payload;
      const raw = event?.notification || event;
      const noti = normalizeNotiItem(raw);
      if (!noti) return;

      const key = getNotiKey(noti);
      if (!key) return;

      const idx = state.items.findIndex((x) => getNotiKey(x) === key);

      if (idx === -1) {
        state.items.unshift(noti);
      } else {
        // merge để bổ sung field (actor/deepLink/image) nếu trước đó thiếu
        state.items[idx] = { ...state.items[idx], ...noti };
      }

      if (typeof noti?.unreadCount === "number") {
        state.unreadCount = noti.unreadCount;
      } else {
        if (!noti.read) state.unreadCount = (state.unreadCount || 0) + 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      /* LOAD (reset) */
      .addCase(loadNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.loading = false;

        const { items, hasMore, unreadCount } = normalizeList(action.payload);

        // reset list
        state.items = items.map(normalizeNotiItem).filter(Boolean);
        state.page = 1; // UI page reset
        state.hasMore = hasMore;
        state.unreadCount = unreadCount;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      /* LOAD MORE (append) */
      .addCase(loadMoreNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMoreNotifications.fulfilled, (state, action) => {
        state.loading = false;

        const { items, hasMore, unreadCount } = normalizeList(action.payload);
        const nextItems = items.map(normalizeNotiItem).filter(Boolean);

        const byKey = new Map();
        state.items.forEach((x) => {
          const k = getNotiKey(x);
          if (k) byKey.set(k, x);
        });

        // trang sau: thêm những cái chưa có, giữ thứ tự append
        nextItems.forEach((x) => {
          const k = getNotiKey(x);
          if (!k) return;
          if (!byKey.has(k)) byKey.set(k, x);
        });

        state.items = Array.from(byKey.values());

        state.hasMore = hasMore;
        state.unreadCount = unreadCount;

        const reqPage = action.meta.arg?.page;
        state.page = typeof reqPage === "number" ? reqPage : state.page + 1;
      })
      .addCase(loadMoreNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      /* MARK READ */
      .addCase(markReadThunk.pending, (state) => {
        state.saving = true;
      })
      .addCase(markReadThunk.fulfilled, (state, action) => {
        state.saving = false;
        const { id, unread } = action.payload;

        const idx = state.items.findIndex((n) => n?.id === id);
        if (idx !== -1 && state.items[idx]) {
          const wasUnread = !state.items[idx].read;
          state.items[idx].read = true;

          // nếu BE không trả unread => giảm 1 khi chuyển từ unread -> read
          if (typeof unread !== "number" && wasUnread) {
            state.unreadCount = Math.max(0, (state.unreadCount || 0) - 1);
          }
        }

        if (typeof unread === "number") {
          state.unreadCount = unread;
        }
      })
      .addCase(markReadThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || action.error.message;
      })

      /* MARK ALL READ */
      .addCase(markAllReadThunk.pending, (state) => {
        state.saving = true;
      })
      .addCase(markAllReadThunk.fulfilled, (state, action) => {
        state.saving = false;
        state.items.forEach((n) => {
          if (n) n.read = true;
        });

        // nếu BE trả unreadCount => dùng, không thì set 0
        state.unreadCount =
          typeof action.payload === "number" ? action.payload : 0;
      })
      .addCase(markAllReadThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const {
  setDropdownOpen,
  toggleDropdown,
  resetNotifications,
  receiveNotificationEvent,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchConversations,
  fetchConversationDetail,
  fetchMessages,
  sendMessage as sendMessageApi,
  markSeen as markSeenApi,
  fetchFriends,
} from "../services/chatService";

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const loadConversations = createAsyncThunk(
  "chat/loadConversations",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchConversations();
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Không thể tải danh sách cuộc trò chuyện");
    }
  }
);

export const loadConversationDetail = createAsyncThunk(
  "chat/loadConversationDetail",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchConversationDetail(id);
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Không thể tải thông tin cuộc trò chuyện");
    }
  }
);

export const loadMessages = createAsyncThunk(
  "chat/loadMessages",
  async ({ conversationId, before, size = 30 }, { rejectWithValue }) => {
    try {
      const data = await fetchMessages(conversationId, { before, size });
      return { conversationId, ...data };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Không thể tải tin nhắn");
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ conversationId, content }, { rejectWithValue }) => {
    try {
      const msg = await sendMessageApi(conversationId, content);
      return { conversationId, message: msg };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Không thể gửi tin nhắn");
    }
  }
);

export const loadFriends = createAsyncThunk(
  "chat/loadFriends",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchFriends();
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Không thể tải danh sách bạn bè");
    }
  }
);

export const markConversationSeen = createAsyncThunk(
  "chat/markSeen",
  async ({ conversationId, lastMessageId }, { rejectWithValue }) => {
    try {
      await markSeenApi(conversationId, lastMessageId);
      return { conversationId, lastMessageId };
    } catch {
      return rejectWithValue(null);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  conversations: [],
  conversationsLoading: false,
  conversationsLoaded: false,

  activeConversationId: null,

  // { [conversationId]: ConversationDetail }
  conversationDetails: {},

  // { [conversationId]: Message[] }
  messages: {},
  messagesLoading: {},
  // { [conversationId]: nextCursor (Long) | null }
  messagesCursors: {},
  // { [conversationId]: boolean }
  messagesHasMore: {},

  // { [conversationId]: { [userId]: { name, timestamp } } }
  typingUsers: {},

  friends: [],
  friendsLoading: false,
  friendsLoaded: false,

  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
      // Reset unreadCount when conversation becomes active
      if (action.payload) {
        const idx = state.conversations.findIndex((c) => c.id === action.payload);
        if (idx !== -1) {
          state.conversations[idx] = { ...state.conversations[idx], unreadCount: 0 };
        }
      }
    },

    // Called by useChatRealtime when a new realtime event arrives
    receiveChatEvent(state, action) {
      const event = action.payload;
      const { eventType, conversationId } = event;
      if (!conversationId) return;

      switch (eventType) {
        case "NEW_MESSAGE": {
          const msg = event.message;
          if (!msg) break;
          // Append to messages list if we have it loaded
          if (state.messages[conversationId]) {
            const exists = state.messages[conversationId].some((m) => m.id === msg.id);
            if (!exists) {
              state.messages[conversationId].push(msg);
            }
          }
          // Update conversation last message + bump to top
          const idx = state.conversations.findIndex((c) => c.id === conversationId);
          if (idx !== -1) {
            const conv = { ...state.conversations[idx] };
            conv.lastMessage = {
              id: msg.id,
              senderId: msg.senderId,
              senderName: msg.senderName,
              content: msg.content,
              messageType: msg.messageType,
              createdAt: msg.createdAt,
              deleted: msg.deleted,
            };
            conv.updatedAt = msg.createdAt;
            // Increment unread for conversations not currently active
            // Don't count SYSTEM messages (e.g., member added) as unread
            if (state.activeConversationId !== conversationId && msg.messageType !== "SYSTEM") {
              conv.unreadCount = (conv.unreadCount || 0) + 1;
            }
            state.conversations.splice(idx, 1);
            state.conversations.unshift(conv);
          } else if (event.conversation) {
            state.conversations.unshift({
              id: conversationId,
              type: event.conversation.type,
              name: event.conversation.name,
              avatarUrl: event.conversation.avatarUrl,
              ownerId: event.conversation.ownerId,
              memberCount: 0,
              lastMessage: {
                id: msg.id,
                senderId: msg.senderId,
                senderName: msg.senderName,
                content: msg.content,
                messageType: msg.messageType,
                createdAt: msg.createdAt,
                deleted: msg.deleted,
              },
              unreadCount: state.activeConversationId !== conversationId && msg.messageType !== "SYSTEM" ? 1 : 0,
              updatedAt: msg.createdAt,
              members: [],
            });
          }

          if (event.conversation) {
            const nextMeta = {
              type: event.conversation.type,
              name: event.conversation.name,
              avatarUrl: event.conversation.avatarUrl,
              ownerId: event.conversation.ownerId,
            };

            if (idx !== -1) {
              state.conversations[idx] = {
                ...state.conversations[idx],
                ...nextMeta,
              };
            }

            if (state.conversationDetails[conversationId]) {
              state.conversationDetails[conversationId] = {
                ...state.conversationDetails[conversationId],
                ...nextMeta,
              };
            }
          }
          break;
        }

        case "SEEN_UPDATE": {
          const { seenByUserId, lastSeenMessageId } = event;
          if (state.messages[conversationId]) {
            state.messages[conversationId] = state.messages[conversationId].map((m) => {
              if (m.id <= lastSeenMessageId) {
                const alreadySeen = m.seenBy?.some((s) => s.userId === seenByUserId);
                if (!alreadySeen) {
                  return { ...m, seenBy: [...(m.seenBy || []), { userId: seenByUserId }] };
                }
              }
              return m;
            });
          }
          break;
        }

        case "TYPING": {
          const typingUserId = event.actorId;
          if (!typingUserId) break;
          if (!state.typingUsers[conversationId]) state.typingUsers[conversationId] = {};
          state.typingUsers[conversationId][typingUserId] = Date.now();
          break;
        }

        case "GROUP_UPDATED": {
          const convPayload = event.conversation;
          if (convPayload) {
            const idx = state.conversations.findIndex((c) => c.id === conversationId);
            if (idx !== -1) {
              state.conversations[idx] = {
                ...state.conversations[idx],
                name: convPayload.name ?? state.conversations[idx].name,
                avatarUrl: convPayload.avatarUrl ?? state.conversations[idx].avatarUrl,
                ownerId: convPayload.ownerId ?? state.conversations[idx].ownerId,
              };
            }
            if (state.conversationDetails[conversationId]) {
              state.conversationDetails[conversationId] = {
                ...state.conversationDetails[conversationId],
                name: convPayload.name ?? state.conversationDetails[conversationId].name,
                avatarUrl: convPayload.avatarUrl ?? state.conversationDetails[conversationId].avatarUrl,
                ownerId: convPayload.ownerId ?? state.conversationDetails[conversationId].ownerId,
              };
            }
          }
          break;
        }

        case "MEMBER_ADDED": {
          const convPayload = event.conversation;
          if (convPayload) {
            const idx = state.conversations.findIndex((c) => c.id === conversationId);
            if (idx !== -1) {
              state.conversations[idx] = {
                ...state.conversations[idx],
                name: convPayload.name ?? state.conversations[idx].name,
                avatarUrl: convPayload.avatarUrl ?? state.conversations[idx].avatarUrl,
                ownerId: convPayload.ownerId ?? state.conversations[idx].ownerId,
              };
            }
          }
          // Invalidate detail so GroupInfoPanel reloads with new member list
          delete state.conversationDetails[conversationId];
          break;
        }

        case "MEMBER_REMOVED":
        case "MEMBER_LEFT": {
          const convPayload = event.conversation;
          const affectedIds = event.affectedUserIds || [];
          if (convPayload) {
            const idx = state.conversations.findIndex((c) => c.id === conversationId);
            if (idx !== -1) {
              state.conversations[idx] = {
                ...state.conversations[idx],
                name: convPayload.name ?? state.conversations[idx].name,
                avatarUrl: convPayload.avatarUrl ?? state.conversations[idx].avatarUrl,
                ownerId: convPayload.ownerId ?? state.conversations[idx].ownerId,
              };
            }
          }
          // Remove affected members from detail in-place (no full reload needed)
          if (affectedIds.length > 0 && state.conversationDetails[conversationId]) {
            const detail = state.conversationDetails[conversationId];
            state.conversationDetails[conversationId] = {
              ...detail,
              members: (detail.members || []).filter((m) => !affectedIds.includes(m.userId)),
              memberCount: Math.max(0, (detail.memberCount || 0) - affectedIds.length),
            };
          }
          break;
        }

        case "ROLE_CHANGED": {
          const convPayload = event.conversation;
          const affectedIds = event.affectedUserIds || [];
          if (convPayload) {
            const idx = state.conversations.findIndex((c) => c.id === conversationId);
            if (idx !== -1) {
              state.conversations[idx] = {
                ...state.conversations[idx],
                name: convPayload.name ?? state.conversations[idx].name,
                avatarUrl: convPayload.avatarUrl ?? state.conversations[idx].avatarUrl,
                ownerId: convPayload.ownerId ?? state.conversations[idx].ownerId,
              };
            }
            if (state.conversationDetails[conversationId]) {
              state.conversationDetails[conversationId] = {
                ...state.conversationDetails[conversationId],
                ownerId: convPayload.ownerId ?? state.conversationDetails[conversationId].ownerId,
              };
            }
          }
          // Invalidate detail so member roles reload fresh (new ownerId may affect multiple members)
          if (affectedIds.length > 0) {
            delete state.conversationDetails[conversationId];
          }
          break;
        }

        default:
          break;
      }
    },

    // Called by useConversationsRealtime when a personal event arrives
    receiveConversationListEvent(state, action) {
      const event = action.payload;
      if (
        event.eventType === "NEW_MESSAGE" ||
        event.eventType === "GROUP_UPDATED" ||
        event.eventType === "MEMBER_ADDED" ||
        event.eventType === "MEMBER_REMOVED" ||
        event.eventType === "MEMBER_LEFT" ||
        event.eventType === "ROLE_CHANGED"
      ) {
        chatSlice.caseReducers.receiveChatEvent(state, action);
      }
    },

    clearTypingUser(state, action) {
      const { conversationId, userId } = action.payload;
      if (state.typingUsers[conversationId]) {
        delete state.typingUsers[conversationId][userId];
      }
    },

    resetConversationUnread(state, action) {
      const id = action.payload;
      const idx = state.conversations.findIndex((c) => c.id === id);
      if (idx !== -1) {
        state.conversations[idx] = { ...state.conversations[idx], unreadCount: 0 };
      }
    },

    upsertConversation(state, action) {
      const conv = action.payload;
      const idx = state.conversations.findIndex((c) => c.id === conv.id);
      if (idx !== -1) {
        state.conversations[idx] = conv;
      } else {
        state.conversations.unshift(conv);
      }
    },

    addOptimisticMessage(state, action) {
      const { conversationId, tempId, content, senderId, senderName, senderAvatar } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push({
        id: tempId,
        conversationId,
        senderId,
        senderName: senderName || `User ${senderId}`,
        senderAvatar: senderAvatar || null,
        content,
        messageType: "TEXT",
        createdAt: new Date().toISOString(),
        deleted: false,
        seenBy: [],
        pending: true,
      });
    },

    removeOptimisticMessage(state, action) {
      const { conversationId, tempId } = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].filter(
          (m) => m.id !== tempId
        );
      }
    },

    removeConversationFromList(state, action) {
      const conversationId = action.payload;
      state.conversations = state.conversations.filter((c) => c.id !== conversationId);
      delete state.conversationDetails[conversationId];
      delete state.messages[conversationId];
      if (state.activeConversationId === conversationId) {
        state.activeConversationId = null;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // loadConversations
      .addCase(loadConversations.pending, (state) => {
        state.conversationsLoading = true;
        state.error = null;
      })
      .addCase(loadConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversationsLoaded = true;
        state.conversations = action.payload || [];
        // Reset unreadCount for active conversation to avoid persistent badges
        if (state.activeConversationId) {
          const idx = state.conversations.findIndex((c) => c.id === state.activeConversationId);
          if (idx !== -1) {
            state.conversations[idx] = { ...state.conversations[idx], unreadCount: 0 };
          }
        }
      })
      .addCase(loadConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.error = action.payload;
      })

      // loadConversationDetail
      .addCase(loadConversationDetail.fulfilled, (state, action) => {
        const conv = action.payload;
        state.conversationDetails[conv.id] = conv;
        const idx = state.conversations.findIndex((c) => c.id === conv.id);
        if (idx !== -1) {
          state.conversations[idx] = { ...state.conversations[idx], ...conv };
        } else {
          state.conversations.unshift(conv);
        }
      })

      // loadMessages
      .addCase(loadMessages.pending, (state, action) => {
        const { conversationId } = action.meta.arg;
        state.messagesLoading[conversationId] = true;
      })
      .addCase(loadMessages.fulfilled, (state, action) => {
        const { conversationId, messages, nextCursor, hasMore } = action.payload;
        const existing = state.messages[conversationId] || [];
        const before = action.meta.arg.before;
        if (before) {
          // Prepend older messages
          const ids = new Set(existing.map((m) => m.id));
          const newMsgs = messages.filter((m) => !ids.has(m.id));
          state.messages[conversationId] = [...newMsgs, ...existing];
        } else {
          const systemMessages = existing.filter((m) => m.messageType === "SYSTEM");
          const ids = new Set(systemMessages.map((m) => m.id));
          const merged = [
            ...systemMessages,
            ...messages.filter((m) => !ids.has(m.id)),
          ];
          merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          state.messages[conversationId] = merged;
        }
        state.messagesCursors[conversationId] = nextCursor;
        state.messagesHasMore[conversationId] = hasMore;
        state.messagesLoading[conversationId] = false;
        // Reset unreadCount when messages are loaded for active conversation
        if (conversationId === state.activeConversationId) {
          const idx = state.conversations.findIndex((c) => c.id === conversationId);
          if (idx !== -1) {
            state.conversations[idx] = { ...state.conversations[idx], unreadCount: 0 };
          }
        }
      })
      .addCase(loadMessages.rejected, (state, action) => {
        const { conversationId } = action.meta.arg;
        state.messagesLoading[conversationId] = false;
      })

      // sendChatMessage
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        const exists = state.messages[conversationId].some((m) => m.id === message.id);
        if (!exists) {
          state.messages[conversationId].push(message);
        }
      })

      // markConversationSeen
      .addCase(markConversationSeen.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        const idx = state.conversations.findIndex((c) => c.id === conversationId);
        if (idx !== -1) {
          state.conversations[idx] = { ...state.conversations[idx], unreadCount: 0 };
        }
      })

      // loadFriends
      .addCase(loadFriends.pending, (state) => {
        state.friendsLoading = true;
      })
      .addCase(loadFriends.fulfilled, (state, action) => {
        state.friendsLoading = false;
        state.friendsLoaded = true;
        state.friends = action.payload || [];
      })
      .addCase(loadFriends.rejected, (state) => {
        state.friendsLoading = false;
      });
  },
});

export const {
  setActiveConversation,
  receiveChatEvent,
  receiveConversationListEvent,
  clearTypingUser,
  resetConversationUnread,
  upsertConversation,
  addOptimisticMessage,
  removeOptimisticMessage,
  removeConversationFromList,
} = chatSlice.actions;

export default chatSlice.reducer;

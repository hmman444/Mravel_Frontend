import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchBoard,
  createList,
  renameList,
  deleteList,
  createCard,
  updateCard,
  deleteCard,
  reorderBoard,
  upsertLabel,
  deleteLabel,
  sendInvite,
  duplicateCard,
  fetchShareInfo,
  updateMemberRole,
  removeMember,
  requestAccess,
  fetchRequests,
  handleRequest,
  clearTrash,
} from "../services/planBoardService";

// helpers

// Chuẩn hóa thời gian để hiển thị ổn định "HH:mm"
function normalizeTime(value) {
  if (value == null) return null;

  // Nếu backend đã trả sẵn "HH:mm" → giữ nguyên
  if (typeof value === "string") {
    const trimmed = value.trim();

    // dd:dd hoặc d:dd → đảm bảo 2 chữ số giờ
    const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
      const hh = timeMatch[1].padStart(2, "0");
      const mm = timeMatch[2];
      return `${hh}:${mm}`;
    }

    // Nếu là dạng "0.1" hoặc "0,1" → coi như số giờ (decimal hours)
    if (trimmed.includes(".") || trimmed.includes(",")) {
      const hours = Number(trimmed.replace(",", "."));
      if (!Number.isNaN(hours) && Number.isFinite(hours)) {
        const totalMinutes = Math.round(hours * 60);
        const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
        const mm = String(totalMinutes % 60).padStart(2, "0");
        return `${hh}:${mm}`;
      }
    }

    return trimmed;
  }

  // Nếu là số (0.1, 3.1, ...) → convert từ decimal hours sang HH:mm
  if (typeof value === "number") {
    const hours = value;
    if (!Number.isNaN(hours) && Number.isFinite(hours)) {
      const totalMinutes = Math.round(hours * 60);
      const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
      const mm = String(totalMinutes % 60).padStart(2, "0");
      return `${hh}:${mm}`;
    }
  }

  // Fallback
  return String(value);
}

// Chuẩn hóa 1 card (chủ yếu là start/end time)
function normalizeCard(card) {
  if (!card) return card;
  return {
    ...card,
    startTime: normalizeTime(card.startTime),
    endTime: normalizeTime(card.endTime),
  };
}

// Chuẩn hóa toàn bộ BoardResponse từ server (API hoặc WS)
function normalizeBoard(rawBoard) {
  if (!rawBoard) return rawBoard;

  return {
    ...rawBoard,
    lists: (rawBoard.lists || []).map((list) => ({
      ...list,
      cards: (list.cards || []).map(normalizeCard),
    })),
  };
}

const initialState = {
  board: null,
  share: null,
  loading: false,
  actionLoading: false,
  error: null,
  requests: [],
};

export const loadBoard = createAsyncThunk("planBoard/loadBoard", async (planId) => {
  return await fetchBoard(planId);
});

export const addList = createAsyncThunk(
  "planBoard/addList",
  async ({ planId, payload }) => {
    return await createList(planId, payload);
  }
);

export const editListTitle = createAsyncThunk(
  "planBoard/editListTitle",
  async ({ planId, listId, payload }) => {
    return await renameList(planId, listId, payload);
  }
);

export const removeList = createAsyncThunk(
  "planBoard/removeList",
  async ({ planId, listId }) => {
    console.log("DELETE LIST:", planId, listId);
    return await deleteList(planId, listId);
  }
);

export const addCard = createAsyncThunk(
  "planBoard/addCard",
  async ({ planId, listId, payload }) => {
    return await createCard(planId, listId, payload);
  }
);

export const editCard = createAsyncThunk(
  "planBoard/editCard",
  async ({ planId, listId, cardId, payload }) => {
    return await updateCard(planId, listId, cardId, payload);
  }
);

export const removeCard = createAsyncThunk(
  "planBoard/removeCard",
  async ({ planId, listId, cardId }) => {
    return await deleteCard(planId, listId, cardId);
  }
);

export const clearTrashThunk = createAsyncThunk(
  "planBoard/clearTrash",
  async (planId) => {
    return await clearTrash(planId);
  }
);

export const copyCard = createAsyncThunk(
  "planBoard/copyCard",
  async ({ planId, listId, cardId }) => {
    return await duplicateCard(planId, listId, cardId);
  }
);

export const reorder = createAsyncThunk(
  "planBoard/reorder",
  async ({ planId, payload }) => {
    // payload: { type, sourceListId, destListId, sourceIndex, destIndex }
    return await reorderBoard(planId, payload);
  }
);

export const saveLabel = createAsyncThunk(
  "planBoard/saveLabel",
  async ({ planId, payload }) => {
    return await upsertLabel(planId, payload);
  }
);

export const removeLabel = createAsyncThunk(
  "planBoard/removeLabel",
  async ({ planId, labelId }) => {
    return await deleteLabel(planId, labelId);
  }
);

export const inviteMembers = createAsyncThunk(
  "planBoard/inviteMembers",
  async ({ planId, payload }) => {
    return await sendInvite(planId, payload);
  }
);

export const loadShareInfo = createAsyncThunk(
  "planBoard/loadShareInfo",
  async (planId) => {
    return await fetchShareInfo(planId);
  }
);

export const changeMemberRole = createAsyncThunk(
  "planBoard/changeMemberRole",
  async ({ planId, userId, role }) => {
    await updateMemberRole(planId, { userId, role });
    return { userId, role };
  }
);

export const deleteMember = createAsyncThunk(
  "planBoard/deleteMember",
  async ({ planId, userId }) => {
    await removeMember(planId, userId);
    return { userId };
  }
);

export const sendAccessRequest = createAsyncThunk(
  "planBoard/sendAccessRequest",
  async ({ planId, type }, { rejectWithValue }) => {
    try {
      return await requestAccess(planId, { type });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể gửi yêu cầu truy cập";

      return rejectWithValue(message);
    }
  }
);

export const loadRequests = createAsyncThunk(
  "planBoard/loadRequests",
  async (planId) => {
    return await fetchRequests(planId);
  }
);

export const decideRequest = createAsyncThunk(
  "planBoard/decideRequest",
  async ({ planId, reqId, action, role }) => {
    return await handleRequest(planId, reqId, { action, role });
  }
);

const planBoardSlice = createSlice({
  name: "planBoard",
  initialState,
  reducers: {
    resetBoard(state) {
      state.board = null;
      state.loading = false;
      state.error = null;
    },

    // Reorder local (kéo thả UI) – không đụng tới normalize time
    localReorder(state, action) {
      const { type, sourceListId, destListId, sourceIndex, destIndex } =
        action.payload;
      if (!state.board?.lists) return;

      // Deep clone lists + cards để tránh tham chiếu cũ
      const lists = state.board.lists.map((l) => ({
        ...l,
        cards: l.cards ? l.cards.map((c) => ({ ...c })) : [],
      }));

      if (type === "list") {
        const [movedList] = lists.splice(sourceIndex, 1);
        if (movedList) lists.splice(destIndex, 0, movedList);
      } else {
        const srcIdx = lists.findIndex(
          (l) => String(l.id) === String(sourceListId)
        );
        const dstIdx = lists.findIndex(
          (l) => String(l.id) === String(destListId)
        );
        if (srcIdx === -1 || dstIdx === -1) return;

        const sourceList = lists[srcIdx];
        const destList = lists[dstIdx];
        const sourceCards = [...sourceList.cards];
        const [movedCard] = sourceCards.splice(sourceIndex, 1);
        if (!movedCard) return;

        if (srcIdx === dstIdx) {
          sourceCards.splice(destIndex, 0, movedCard);
          lists[srcIdx] = { ...sourceList, cards: sourceCards };
        } else {
          const destCards = [...destList.cards];
          movedCard.listId = destList.id;
          destCards.splice(destIndex, 0, movedCard);
          lists[srcIdx] = { ...sourceList, cards: sourceCards };
          lists[dstIdx] = { ...destList, cards: destCards };
        }
      }

      state.board = {
        ...state.board,
        lists,
      };

      console.log(
        "After local reorder:",
        state.board.lists.map((l) => ({
          id: l.id,
          cards: l.cards.map((c) => c.id),
        }))
      );
    },

    // 🔥 Sync từ realtime – luôn replace toàn bộ board đã normalize
    syncBoardFromRealtime(state, action) {
      const incoming = action.payload;
      if (!incoming) return;

      state.board = normalizeBoard(incoming);
    },
  },
  extraReducers: (builder) => {
    builder
      // Load
      .addCase(loadBoard.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loadBoard.fulfilled, (s, a) => {
        s.loading = false;
        s.board = normalizeBoard(a.payload);
      })
      .addCase(loadBoard.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      })

      // Add list
      .addCase(addList.fulfilled, (s, a) => {
        if (!s.board?.lists) return;
        s.board.lists.push(a.payload);
      })

      // Edit list title
      .addCase(editListTitle.fulfilled, (s, a) => {
        const { listId, payload } = a.meta.arg;
        const list = s.board?.lists?.find(
          (l) => String(l.id) === String(listId)
        );
        if (list && payload?.title) {
          list.title = payload.title;
        }
      })

      // Remove list
      .addCase(removeList.fulfilled, (s, a) => {
        const { listId } = a.meta.arg;
        if (!s.board?.lists) return;
        s.board.lists = s.board.lists.filter(
          (l) => String(l.id) !== String(listId)
        );
      })

      // Add card
      .addCase(addCard.fulfilled, (s, a) => {
        const { listId } = a.meta.arg;
        const list = s.board?.lists?.find(
          (l) => String(l.id) === String(listId)
        );
        if (list) {
          list.cards = list.cards || [];
          list.cards.push(normalizeCard(a.payload));
        }
      })

      // Edit card
      .addCase(editCard.fulfilled, (s, a) => {
        const { listId, cardId } = a.meta.arg;
        const updatedCard = normalizeCard(a.payload);
        const list = s.board?.lists?.find(
          (l) => String(l.id) === String(listId)
        );
        if (!list) return;
        list.cards = (list.cards || []).map((c) =>
          String(c.id) === String(cardId) ? updatedCard : c
        );
      })

      // Copy card
      .addCase(copyCard.fulfilled, (s, a) => {
        const { listId } = a.meta.arg;
        const list = s.board?.lists?.find(
          (l) => String(l.id) === String(listId)
        );
        if (list) {
          list.cards = list.cards || [];
          list.cards.push(normalizeCard(a.payload));
        }
      })

      // Remove card
      .addCase(removeCard.fulfilled, (s, a) => {
        const { listId, cardId } = a.meta.arg;
        const list = s.board?.lists?.find(
          (l) => String(l.id) === String(listId)
        );
        if (list && list.cards) {
          list.cards = list.cards.filter(
            (c) => String(c.id) !== String(cardId)
          );
        }
      })

      // Clear trash
      .addCase(clearTrashThunk.fulfilled, (state) => {
        if (!state.board?.lists) return;

        const trash = state.board.lists.find((l) => l.type === "TRASH");
        if (trash) trash.cards = [];
      })

      // Reorder (server ok)
      .addCase(reorder.fulfilled, (s) => {
        s.error = null;
      })
      .addCase(reorder.rejected, (s, a) => {
        s.error = a.error.message;
      })

      // Labels
      .addCase(saveLabel.fulfilled, (s, a) => {
        if (!s.board) return;
        const label = a.payload;
        if (!s.board.labels) s.board.labels = [];

        const idx = s.board.labels.findIndex((l) => l.id === label.id);
        if (idx >= 0) {
          s.board.labels[idx] = label;
        } else {
          s.board.labels.push(label);
        }
      })
      .addCase(removeLabel.fulfilled, (s, a) => {
        if (!s.board?.labels) return;
        const { labelId } = a.meta.arg;
        s.board.labels = s.board.labels.filter(
          (l) => String(l.id) !== String(labelId)
        );
      })

      // Invites
      .addCase(inviteMembers.fulfilled, (s, a) => {
        if (!s.board) return;
        if (!s.board.invites) s.board.invites = [];
        const newInvites = a.payload || [];
        s.board.invites = [...s.board.invites, ...newInvites];
      })

      // Share info
      .addCase(loadShareInfo.fulfilled, (s, a) => {
        s.share = a.payload;
      })

      // Member role
      .addCase(changeMemberRole.fulfilled, (state, action) => {
        if (!state.board?.members) return;

        const { userId, role } = action.payload;
        const member = state.board.members.find((m) => m.userId === userId);
        if (member) {
          member.role = role;
        }
      })

      // Delete member
      .addCase(deleteMember.fulfilled, (state, action) => {
        if (!state.board?.members) return;

        const { userId } = action.payload;
        state.board.members = state.board.members.filter(
          (m) => m.userId !== userId
        );
      })

      // Access requests
      .addCase(loadRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      })
      .addCase(decideRequest.fulfilled, (state, action) => {
        const { reqId } = action.meta.arg;
        state.requests = state.requests.filter((r) => r.id !== reqId);
      })

      // Action loading matcher
      .addMatcher(
        (action) =>
          action.type.startsWith("planBoard/") &&
          !action.type.startsWith("planBoard/loadBoard") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.actionLoading = true;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("planBoard/") &&
          !action.type.startsWith("planBoard/loadBoard") &&
          (action.type.endsWith("/fulfilled") ||
            action.type.endsWith("/rejected")),
        (state) => {
          state.actionLoading = false;
        }
      );
  },
});

export const { resetBoard, localReorder, syncBoardFromRealtime } =
  planBoardSlice.actions;

export default planBoardSlice.reducer;

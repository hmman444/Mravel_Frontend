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
  duplicateList,
  fetchShareInfo,
  updateMemberRole,
  removeMember,
  requestAccess,
  fetchRequests,
  handleRequest,
  clearTrash,
  copyPlan
} from "../services/planBoardService";
import {
  normalizeBoardPayload,
  normalizeCardTimes,
} from "../utils/timeUtils";

const initialState = {
  board: null,
  share: null,
  loading: false,
  actionLoading: false,
  error: null,
  errorStatus: null,
  requests: [],
};

export const loadBoard = createAsyncThunk(
  "planBoard/loadBoard",
  async (planId, { rejectWithValue }) => {
    try {
      return await fetchBoard(planId);
    } catch (err) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Không thể tải kế hoạch";

      return rejectWithValue({ status, message });
    }
  }
);

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

export const duplicateListThunk = createAsyncThunk(
  "planBoard/duplicateList",
  async ({ planId, listId }) => {
    return await duplicateList(planId, listId);
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

export const duplicateCardThunk = createAsyncThunk(
  "planBoard/duplicateCard",
  async ({ planId, listId, cardId }) => {
    return await duplicateCard(planId, listId, cardId);
  }
);


export const clearTrashThunk = createAsyncThunk(
  "planBoard/clearTrash",
  async (planId) => {
    return await clearTrash(planId);
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

export const copyPlanThunk = createAsyncThunk(
  "planBoard/copyPlan",
  async (planId) => {
    return await copyPlan(planId);
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

    syncBoardFromRealtime(state, action) {
      const incoming = action.payload;
      if (!incoming) return;

      const prevBoard = state.board;
      const prevMyRole = prevBoard?.myRole;

      // Nếu action.payload là wrapper { eventType, board, ... }
      const rawBoard = incoming.board ?? incoming;

      const normalized = normalizeBoardPayload(rawBoard);
      normalized.myRole = prevMyRole;

      state.board = normalized;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load
      .addCase(loadBoard.pending, (s) => {
        s.loading = true;
        s.error = null;
        s.errorStatus = null;
      })
      .addCase(loadBoard.fulfilled, (s, a) => {
        s.loading = false;
        s.error = null;
        s.errorStatus = null;
        const prevMyRole = s.board?.myRole || null; 
        const normalized = normalizeBoardPayload(a.payload);
        normalized.myRole = prevMyRole ?? normalized.myRole ?? null;
        s.board = normalized;
      })
      .addCase(loadBoard.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload?.message || a.error?.message || "Không thể tải kế hoạch";
        s.errorStatus = a.payload?.status || null; 
      })

      // Add list
      .addCase(addList.fulfilled, (s, a) => {})

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
        s.error = null;
      })

      // Edit card
      .addCase(editCard.fulfilled, (s, a) => {
        const { listId, cardId } = a.meta.arg;
        const updatedCard = normalizeCardTimes(a.payload);
        const list = s.board?.lists?.find(
          (l) => String(l.id) === String(listId)
        );
        if (!list) return;
        list.cards = (list.cards || []).map((c) =>
          String(c.id) === String(cardId) ? updatedCard : c
        );
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

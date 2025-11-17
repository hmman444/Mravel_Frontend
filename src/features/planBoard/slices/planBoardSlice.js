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
} from "../services/planBoardService";
import cloneDeep from "lodash.clonedeep";
const initialState = {
  board: null,
  loading: false,
  error: null,
};


export const loadBoard = createAsyncThunk("planBoard/loadBoard", async (planId) => {
  return await fetchBoard(planId);
});

export const addList = createAsyncThunk("planBoard/addList", async ({ planId, payload }) => {
  return await createList(planId, payload);
});

export const editListTitle = createAsyncThunk(
  "planBoard/editListTitle",
  async ({ planId, listId, payload }) => {
    return await renameList(planId, listId, payload);
  }
);

export const removeList = createAsyncThunk("planBoard/removeList", async ({ planId, listId }) => {
  return await deleteList(planId, listId);
});

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

const planBoardSlice = createSlice({
  name: "planBoard",
  initialState,
  reducers: {
    resetBoard(state) {
      state.board = null;
      state.loading = false;
      state.error = null;
    },
localReorder(state, action) {
  const { type, sourceListId, destListId, sourceIndex, destIndex } = action.payload;
  if (!state.board?.lists) return;

  // Deep clone hoàn toàn để tránh tham chiếu cũ
  const lists = state.board.lists.map(l => ({
    ...l,
    cards: l.cards ? l.cards.map(c => ({ ...c })) : []
  }));

  if (type === "list") {
    const [movedList] = lists.splice(sourceIndex, 1);
    if (movedList) lists.splice(destIndex, 0, movedList);
  } else {
    const srcIdx = lists.findIndex(l => String(l.id) === String(sourceListId));
    const dstIdx = lists.findIndex(l => String(l.id) === String(destListId));
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

  // 🚀 Cực kỳ quan trọng: ép tạo object mới hoàn toàn
  state.board = JSON.parse(JSON.stringify({
    ...state.board,
    lists
  }));

  console.log("✅ After local reorder:", state.board.lists.map(l => ({
    id: l.id,
    cards: l.cards.map(c => c.id)
  })));
}
,
  },
  extraReducers: (builder) => {
    builder
      // Load
      .addCase(loadBoard.pending, (s) => {
        s.loading = true;
      })
      .addCase(loadBoard.fulfilled, (s, a) => {
        s.loading = false;
        s.board = JSON.parse(JSON.stringify(a.payload));
      })
      .addCase(loadBoard.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      })

      // Add list
      .addCase(addList.fulfilled, (s, a) => {
        s.board?.lists.push(a.payload);
      })
      .addCase(editListTitle.fulfilled, (s, a) => {
        const { listId } = a.meta.arg;
        const updated = a.payload;
        const list = s.board?.lists.find((l) => String(l.id) === String(listId));
        if (list) {
          list.title = updated.title;
        }
      })

      // Remove list
      .addCase(removeList.fulfilled, (s, a) => {
        const { listId } = a.meta.arg;
        if (!s.board?.lists) return;
        s.board.lists = s.board.lists.filter((l) => String(l.id) !== String(listId));
      })

      // Add card
      .addCase(addCard.fulfilled, (s, a) => {
        const { listId } = a.meta.arg;
        const list = s.board?.lists.find((l) => String(l.id) === String(listId));
        if (list) {
          list.cards = list.cards || [];
          list.cards.push(a.payload);
        }
      })
      .addCase(editCard.fulfilled, (s, a) => {
        const { listId, cardId } = a.meta.arg;
        const updatedCard = a.payload;
        const list = s.board?.lists.find((l) => String(l.id) === String(listId));
        if (!list) return;
        list.cards = list.cards.map((c) =>
            String(c.id) === String(cardId) ? updatedCard : c
        );
      })
      .addCase(copyCard.fulfilled, (s, a) => {
        const { listId } = a.meta.arg;
        const list = s.board?.lists.find((l) => String(l.id) === String(listId));
        if (list) list.cards.push(a.payload);
      })

      // Remove card
      .addCase(removeCard.fulfilled, (s, a) => {
        const { listId, cardId } = a.meta.arg;
        const list = s.board?.lists.find((l) => String(l.id) === String(listId));
        if (list && list.cards) {
          list.cards = list.cards.filter((c) => String(c.id) !== String(cardId));
        }
      })

      .addCase(reorder.fulfilled, (s, a) => {
        s.error = null;
      })

      .addCase(reorder.rejected, (s, a) => {
        s.error = a.error.message;
      })

      .addCase(saveLabel.fulfilled, (s, a) => {
        if (!s.board) return;
        const label = a.payload;
        if (!s.board.labels) s.board.labels = [];

        // Tìm xem đã tồn tại nhãn cùng id chưa
        const idx = s.board.labels.findIndex((l) => l.id === label.id);
        if (idx >= 0) {
          s.board.labels[idx] = label; // cập nhật màu/text mới
        } else {
          s.board.labels.push(label); // thêm mới
        }
      })

      // khi xóa nhãn
      .addCase(removeLabel.fulfilled, (s, a) => {
        if (!s.board?.labels) return;
        const { labelId } = a.meta.arg;
        s.board.labels = s.board.labels.filter(
          (l) => String(l.id) !== String(labelId)
        );
      })
      .addCase(inviteMembers.fulfilled, (s, a) => {
        if (!s.board) return;
        if (!s.board.invites) s.board.invites = [];
        const newInvites = a.payload || [];
        // append, tránh mất invites cũ
        s.board.invites = [...s.board.invites, ...newInvites];
      });
  },
});

export const { resetBoard, localReorder } = planBoardSlice.actions;
export default planBoardSlice.reducer;

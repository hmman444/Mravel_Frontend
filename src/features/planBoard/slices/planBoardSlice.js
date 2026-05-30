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
  copyPlan,
  createListCmd,
  renameListCmd,
  deleteListCmd,
  createCardCmd,
  updateCardCmd,
  deleteCardCmd,
  reorderListsCmd,
  reorderCardsInListCmd,
} from "../services/planBoardService";

/** True when the granular board command API is enabled via env var */
const GRANULAR_CMDS = import.meta.env.VITE_ENABLE_GRANULAR_BOARD_COMMANDS === "true";

function isCommandUnavailableError(err) {
  const status = err?.response?.status ?? err?.status;
  return status === 403 || status === 404 || status === 405 || status === 501;
}
import {
  normalizeBoardPayload,
  normalizeCardTimes,
} from "../utils/timeUtils";
import i18n from "../../../i18n";

const initialState = {
  board: null,
  share: null,
  loading: false,
  actionLoading: false,
  error: null,
  errorStatus: null,
  requests: [],
  lastRevision: null,
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
        i18n.t("plan.error.load_board");

      return rejectWithValue({ status, message });
    }
  }
);

export const addList = createAsyncThunk(
  "planBoard/addList",
  async ({ planId, payload }, { dispatch }) => {
    if (GRANULAR_CMDS) {
      try {
        const cmd = await createListCmd(planId, payload);
        dispatch(applyPatchEvent(cmd));
        return cmd;
      } catch (err) {
        if (!isCommandUnavailableError(err)) throw err;
      }
    }
    return await createList(planId, payload);
  }
);

export const editListTitle = createAsyncThunk(
  "planBoard/editListTitle",
  async ({ planId, listId, payload }, { dispatch }) => {
    if (GRANULAR_CMDS) {
      try {
        const cmd = await renameListCmd(planId, listId, payload);
        dispatch(applyPatchEvent(cmd));
        return cmd;
      } catch (err) {
        if (!isCommandUnavailableError(err)) throw err;
      }
    }
    return await renameList(planId, listId, payload);
  }
);

export const removeList = createAsyncThunk(
  "planBoard/removeList",
  async ({ planId, listId }, { dispatch }) => {
    if (GRANULAR_CMDS) {
      try {
        const cmd = await deleteListCmd(planId, listId);
        dispatch(applyPatchEvent(cmd));
        return cmd;
      } catch (err) {
        if (!isCommandUnavailableError(err)) throw err;
      }
    }
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
  async ({ planId, listId, payload }, { dispatch }) => {
    if (GRANULAR_CMDS) {
      try {
        const cmd = await createCardCmd(planId, listId, payload);
        dispatch(applyPatchEvent(cmd));
        return cmd;
      } catch (err) {
        if (!isCommandUnavailableError(err)) throw err;
      }
    }
    return await createCard(planId, listId, payload);
  }
);

export const editCard = createAsyncThunk(
  "planBoard/editCard",
  async ({ planId, listId, cardId, payload }, { dispatch }) => {
    if (GRANULAR_CMDS) {
      try {
        const cmd = await updateCardCmd(planId, listId, cardId, payload);
        dispatch(applyPatchEvent(cmd));
        return cmd;
      } catch (err) {
        if (!isCommandUnavailableError(err)) throw err;
      }
    }
    return await updateCard(planId, listId, cardId, payload);
  }
);

export const removeCard = createAsyncThunk(
  "planBoard/removeCard",
  async ({ planId, listId, cardId }, { dispatch }) => {
    if (GRANULAR_CMDS) {
      try {
        const cmd = await deleteCardCmd(planId, listId, cardId);
        dispatch(applyPatchEvent(cmd));
        return cmd;
      } catch (err) {
        if (!isCommandUnavailableError(err)) throw err;
      }
    }
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
  async ({ planId, payload }, { dispatch, getState }) => {
    // payload: { type, sourceListId, destListId, sourceIndex, destIndex }
    if (GRANULAR_CMDS) {
      const stateBoard = getState()?.planBoard?.board;

      if (payload?.type === "list") {
        try {
          const board = stateBoard || (await fetchBoard(planId));
          const lists = (board?.lists || [])
            .filter((l) => l.type !== "TRASH")
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

          const moved = [...lists];
          const [item] = moved.splice(payload.sourceIndex, 1);
          moved.splice(payload.destIndex, 0, item);

          const positions = moved.map((l, idx) => ({
            listId: l.id,
            position: idx,
          }));

          const cmd = await reorderListsCmd(planId, positions);
          dispatch(applyPatchEvent(cmd));
          return cmd;
        } catch (err) {
          if (!isCommandUnavailableError(err)) throw err;
        }
      }

      if (payload?.type === "card") {
        try {
          const board = stateBoard || (await fetchBoard(planId));
          const lists = board?.lists || [];
          const sourceList = lists.find(
            (l) => String(l.id) === String(payload.sourceListId)
          );
          const destList = lists.find(
            (l) => String(l.id) === String(payload.destListId)
          );

          if (!sourceList || !destList) {
            throw new Error(i18n.t("plan.error.list_not_found_reorder"));
          }

          // Cross-list move still uses legacy endpoint to avoid inconsistent
          // server state when command move/reorder APIs are partially deployed.
          if (String(sourceList.id) !== String(destList.id)) {
            return await reorderBoard(planId, payload);
          }

          // IMPORTANT:
          // localReorder() already applied optimistic move before this thunk runs.
          // Re-applying sourceIndex/destIndex here would shift cards by 1 position.
          const cardsInCurrentOrder = [...(sourceList.cards || [])];
          const positions = cardsInCurrentOrder.map((c, idx) => ({
            cardId: c.id,
            position: idx,
          }));
          const cmd = await reorderCardsInListCmd(planId, sourceList.id, positions);
          dispatch(applyPatchEvent(cmd));
          return cmd;
        } catch (err) {
          if (!isCommandUnavailableError(err)) throw err;
        }
      }
    }

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
      const status = err?.response?.status;
      const code = err?.response?.data?.data?.code;
      const message =
        err?.response?.data?.message ||
        err?.message ||
        i18n.t("plan.error.send_access_request");

      return rejectWithValue({ status, code, message });
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

      // console.log(
      //   "After local reorder:",
      //   state.board.lists.map((l) => ({
      //     id: l.id,
      //     cards: l.cards.map((c) => c.id),
      //   }))
      // );
    },

    syncBoardFromRealtime(state, action) {
      const incoming = action.payload;
      if (!incoming) return;

      const prevBoard = state.board;
      const prevMyRole = prevBoard?.myRole;

      const rawBoard = incoming.board ?? incoming;

      const normalized = normalizeBoardPayload(rawBoard);
      normalized.myRole = prevMyRole;

      state.board = normalized;

      if (normalized.boardRevision != null) {
        state.lastRevision = normalized.boardRevision;
      }
    },

    setLastRevision(state, action) {
      state.lastRevision = action.payload;
    },

    rollbackToSnapshot(state, action) {
      if (action.payload) {
        state.board = action.payload;
      }
    },

    applyPatchEvent(state, action) {
      if (!state.board) return;

      const { entityType, entityId, operationType, patch, revision } = action.payload;

      // Deduplication guard — discard events already applied or out of order
      if (revision != null && state.lastRevision != null && revision <= state.lastRevision) {
        return;
      }

      const lists = state.board.lists;
      if (!lists) return;

      if (entityType === "LIST") {
        switch (operationType) {
          case "CREATE": {
            // Avoid duplicate if realtime and optimistic update both fired
            const alreadyExists = lists.some((l) => String(l.id) === String(patch.listId));
            if (!alreadyExists) {
              const position = patch.position ?? lists.length;
              // Insert at correct position instead of pushing + sorting
              // This avoids disrupting DragDropContext when new lists arrive via realtime
              const newList = {
                id: patch.listId,
                title: patch.title,
                position,
                type: patch.type ?? "NORMAL",
                dayDate: patch.dayDate || null,
                cards: [],
              };
              
              // Insert at the correct position to maintain sorted order
              let inserted = false;
              for (let i = 0; i < lists.length; i++) {
                if ((lists[i].position ?? 0) > position) {
                  lists.splice(i, 0, newList);
                  inserted = true;
                  break;
                }
              }
              if (!inserted) {
                lists.push(newList);
              }
            }
            break;
          }

          case "UPDATE": {
            const list = lists.find((l) => String(l.id) === String(entityId));
            if (list) {
              if (patch.title != null) list.title = patch.title;
              // Don't update position here — position changes should only happen via REORDER events
              // Updating position on every UPDATE can break DragDropContext tracking
              if (patch.type != null) list.type = patch.type;
              if (patch.dayDate !== undefined) list.dayDate = patch.dayDate || null;
            }
            break;
          }

          case "DELETE": {
            const deleteId = patch.listId ?? entityId;
            state.board.lists = lists.filter((l) => String(l.id) !== String(deleteId));
            break;
          }

          case "REORDER": {
            // patch.positions: [{ listId, position }, ...]
            if (Array.isArray(patch.positions)) {
              const posMap = {};
              patch.positions.forEach((p) => { posMap[String(p.listId)] = p.position; });
              lists.forEach((l) => {
                const newPos = posMap[String(l.id)];
                if (newPos != null) l.position = newPos;
              });
              lists.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            }
            break;
          }

          default:
            break;
        }
      } else if (entityType === "CARD") {
        switch (operationType) {
          case "CREATE": {
            const targetList = lists.find((l) => String(l.id) === String(patch.listId));
            if (targetList) {
              if (!targetList.cards) targetList.cards = [];
              const alreadyExists = targetList.cards.some((c) => String(c.id) === String(patch.id ?? entityId));
              if (!alreadyExists) {
                const { listId: _listId, ...cardFields } = patch;
                const cardPosition = cardFields.position ?? targetList.cards.length;
                const newCard = { ...cardFields, id: patch.id ?? entityId, position: cardPosition };
                
                // Insert at correct position instead of pushing + sorting
                // This avoids disrupting DragDropContext when new cards arrive via realtime
                let inserted = false;
                for (let i = 0; i < targetList.cards.length; i++) {
                  if ((targetList.cards[i].position ?? 0) > cardPosition) {
                    targetList.cards.splice(i, 0, newCard);
                    inserted = true;
                    break;
                  }
                }
                if (!inserted) {
                  targetList.cards.push(newCard);
                }
              }
            }
            break;
          }

          case "UPDATE": {
            // Merge patch into existing card — find card across all lists
            for (const list of lists) {
              const card = (list.cards || []).find(
                (c) => String(c.id) === String(entityId)
              );
              if (card) {
                // Merge all patch fields except cardId (internal key)
                const { cardId: _cid, ...fields } = patch;
                Object.assign(card, fields);
                break;
              }
            }
            break;
          }

          case "DELETE": {
            const deleteCardId = patch.cardId ?? entityId;
            const ownerList = lists.find((l) => String(l.id) === String(patch.listId));
            if (ownerList && ownerList.cards) {
              ownerList.cards = ownerList.cards.filter(
                (c) => String(c.id) !== String(deleteCardId)
              );
            } else {
              // Fallback: search all lists
              for (const list of lists) {
                if (list.cards) {
                  list.cards = list.cards.filter(
                    (c) => String(c.id) !== String(deleteCardId)
                  );
                }
              }
            }
            break;
          }

          case "MOVE": {
            // patch: { cardId, sourceListId, targetListId, targetPosition }
            const srcList = lists.find((l) => String(l.id) === String(patch.sourceListId));
            const dstList = lists.find((l) => String(l.id) === String(patch.targetListId));
            if (!srcList || !dstList) break;

            const cardIdx = (srcList.cards || []).findIndex(
              (c) => String(c.id) === String(patch.cardId)
            );
            if (cardIdx === -1) break;

            const [card] = srcList.cards.splice(cardIdx, 1);
            const targetPosition = patch.targetPosition ?? 0;
            card.position = targetPosition;
            
            // Insert at correct position instead of pushing + sorting
            // This avoids disrupting DragDropContext when cards move between lists
            if (!dstList.cards) dstList.cards = [];
            let inserted = false;
            for (let i = 0; i < dstList.cards.length; i++) {
              if ((dstList.cards[i].position ?? 0) > targetPosition) {
                dstList.cards.splice(i, 0, card);
                inserted = true;
                break;
              }
            }
            if (!inserted) {
              dstList.cards.push(card);
            }
            break;
          }

          case "REORDER": {
            // patch: { listId, positions: [{ cardId, position }, ...] }
            const reorderList = lists.find((l) => String(l.id) === String(patch.listId));
            if (reorderList && Array.isArray(patch.positions)) {
              const posMap = {};
              patch.positions.forEach((p) => { posMap[String(p.cardId)] = p.position; });
              (reorderList.cards || []).forEach((c) => {
                const newPos = posMap[String(c.id)];
                if (newPos != null) c.position = newPos;
              });
              reorderList.cards.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            }
            break;
          }

          default:
            break;
        }
      } else if (entityType === "PLAN" && operationType === "UPDATE") {
        Object.assign(state.board, patch);
      } else if (entityType === "BOARD" && operationType === "CLEAR_TRASH") {
        const trash = lists.find((l) => l.type === "TRASH");
        if (trash) trash.cards = [];
      }

      // Advance revision watermark
      if (revision != null) {
        state.lastRevision = revision;
      }
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
        if (normalized.boardRevision != null) {
          s.lastRevision = normalized.boardRevision;
        }
      })
      .addCase(loadBoard.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload?.message || a.error?.message || i18n.t("plan.error.load_board");
        s.errorStatus = a.payload?.status || null; 
      })

      // Add list
      .addCase(addList.fulfilled, (s, a) => {})

      // Edit list title
      .addCase(editListTitle.fulfilled, (s, a) => {
        // CommandResponse already applied via applyPatchEvent dispatch inside the thunk
        if (a.payload?.patch != null) return;
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
        if (a.payload?.patch != null) return;
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
        if (a.payload?.patch != null) return;
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
        if (a.payload?.patch != null) return;
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

      // Duplicate card
      .addCase(duplicateCardThunk.fulfilled, (s, a) => {
        if (!s.board?.lists || !a.payload?.id) return;
        const card = normalizeCardTimes(a.payload);
        const { listId } = a.meta.arg;
        const list = s.board.lists.find((l) => String(l.id) === String(listId));
        if (list) {
          if (!list.cards) list.cards = [];
          const alreadyExists = list.cards.some((c) => String(c.id) === String(card.id));
          if (!alreadyExists) {
            list.cards = [...list.cards, card];
            list.cards.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
          }
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

export const {
  resetBoard,
  localReorder,
  syncBoardFromRealtime,
  setLastRevision,
  applyPatchEvent,
  rollbackToSnapshot,
} = planBoardSlice.actions;

export default planBoardSlice.reducer;

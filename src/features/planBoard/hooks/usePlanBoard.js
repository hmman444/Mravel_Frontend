// src/features/planBoard/hooks/usePlanBoard.js
import { useDispatch, useSelector } from "react-redux";
import {
  loadBoard,
  addList,
  editListTitle,
  removeList,
  addCard,
  editCard,
  removeCard,
  reorder,
  saveLabel,
  removeLabel,
  inviteMembers,
  localReorder,
} from "../slices/planBoardSlice";
import { updateVisibility, removeInvite } from "../services/planBoardService";
import { showSuccess, showError } from "../../../utils/toastUtils";
export function usePlanBoard(planId) {
  const dispatch = useDispatch();
  const board = useSelector((s) => s.planBoard.board);
  const loading = useSelector((s) => s.planBoard.loading);
  const error = useSelector((s) => s.planBoard.error);

  return {
    board,
    loading,
    error,

    load: () => dispatch(loadBoard(planId)),

    // Lists
    createList: (payload) => dispatch(addList({ planId, payload })),
    renameList: (listId, payload) =>
      dispatch(editListTitle({ planId, listId, payload })),
    deleteList: (listId) => dispatch(removeList({ planId, listId })),

    // Cards
    createCard: (listId, payload) => dispatch(addCard({ planId, listId, payload })),
    updateCard: (listId, cardId, payload) =>
      dispatch(editCard({ planId, listId, cardId, payload })),
    deleteCard: (listId, cardId) => dispatch(removeCard({ planId, listId, cardId })),

    // Reorder
    localReorder: (payload) => dispatch(localReorder(payload)),
    reorder: (payload) => dispatch(reorder({ planId, payload })),

    // Labels
    upsertLabel: (payload) => dispatch(saveLabel({ planId, payload })),
    deleteLabel: (labelId) => dispatch(removeLabel({ planId, labelId })),

    // Invites (chia sẻ)
    invite: (payload) => dispatch(inviteMembers({ planId, payload })),

    updateVisibility: async (visibility) => {
      try {
        await updateVisibility(planId, visibility);
        showSuccess("Đã cập nhật chế độ hiển thị");
      } catch (err) {
        console.error("Visibility update failed", err);
        showError("Không thể cập nhật hiển thị");
      }
    },

    removeInvite: async (email) => {
      try {
        await removeInvite(planId, email);
        showSuccess("Đã xóa quyền truy cập");
      } catch (err) {
        console.error("Remove invite failed", err);
        showError("Không thể xóa người này");
      }
    },
  };
}

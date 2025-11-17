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
  loadShareInfo,
  changeMemberRole,
  deleteMember,
  sendAccessRequest,
  loadRequests,
  decideRequest,
} from "../slices/planBoardSlice";
import { updateVisibility } from "../services/planBoardService";
import { showSuccess, showError } from "../../../utils/toastUtils";

// api error handling with toast
async function tryCall(promise, fallbackMessage) {
  try {
    const res = await promise;
    return res;
  } catch (err) {
    console.error("❌ API Error:", err);
    showError(fallbackMessage);
    throw err;
  }
}

// hook
export function usePlanBoard(planId) {
  const dispatch = useDispatch();

  const board = useSelector((s) => s.planBoard.board);
  const share = useSelector((s) => s.planBoard.share);
  const loading = useSelector((s) => s.planBoard.loading);
  const error = useSelector((s) => s.planBoard.error);
  const requests = useSelector((s) => s.planBoard.requests);

  // role helpers
  const myRole = (() => {
    if (!board?.members) return null;
    const me = board.members.find((m) => m.isCurrentUser);
    return me?.role || null;
  })();

  const isOwner = myRole === "OWNER";
  const isEditor = myRole === "EDITOR";
  const isViewer = myRole === "VIEWER";

  const canEdit = isOwner || isEditor;
  const canView = !!board; // vì backend đã filter permission


  return {
    board,
    share,
    loading,
    error,
    requests,

    // load data
    load: () => dispatch(loadBoard(planId)),
    loadShare: () => dispatch(loadShareInfo(planId)),
    loadRequests: () => dispatch(loadRequests(planId)),

    // role info
    myRole,
    isOwner,
    isEditor,
    isViewer,
    canEdit,
    canView,

    // lists
    createList: (payload) =>
      tryCall(
        dispatch(addList({ planId, payload })),
        "Không thể tạo danh sách"
      ),

    renameList: (listId, payload) =>
      tryCall(
        dispatch(editListTitle({ planId, listId, payload })),
        "Không thể đổi tên danh sách"
      ),

    deleteList: (listId) =>
      tryCall(
        dispatch(removeList({ planId, listId })),
        "Không thể xoá danh sách"
      ),

    // cards
    createCard: (listId, payload) =>
      tryCall(
        dispatch(addCard({ planId, listId, payload })),
        "Không thể tạo thẻ"
      ),

    updateCard: (listId, cardId, payload) =>
      tryCall(
        dispatch(editCard({ planId, listId, cardId, payload })),
        "Không thể cập nhật thẻ"
      ),

    deleteCard: (listId, cardId) =>
      tryCall(
        dispatch(removeCard({ planId, listId, cardId })),
        "Không thể xoá thẻ"
      ),

    // drag drop
    localReorder: (payload) => dispatch(localReorder(payload)),

    reorder: (payload) =>
      tryCall(
        dispatch(reorder({ planId, payload })),
        "Không thể cập nhật vị trí"
      ),

    // label
    upsertLabel: (payload) =>
      tryCall(
        dispatch(saveLabel({ planId, payload })),
        "Không thể lưu nhãn"
      ),

    deleteLabel: (labelId) =>
      tryCall(
        dispatch(removeLabel({ planId, labelId })),
        "Không thể xoá nhãn"
      ),

    // invite
    invite: (payload) =>
      tryCall(
        dispatch(inviteMembers({ planId, payload })),
        "Không thể gửi lời mời"
      ),

    updateVisibility: async (visibility) => {
      await tryCall(
        updateVisibility(planId, visibility),
        "Không thể cập nhật chế độ hiển thị"
      );
      showSuccess("Đã cập nhật chế độ hiển thị");
    },

    updateMemberRole: (userId, role) =>
      tryCall(
        dispatch(changeMemberRole({ planId, userId, role })),
        "Không thể đổi quyền thành viên"
      ),

    removeMember: (userId) =>
      tryCall(
        dispatch(deleteMember({ planId, userId })),
        "Không thể xoá thành viên"
      ),

    // request access
    requestAccess: (type) =>
      tryCall(
        dispatch(sendAccessRequest({ planId, type })),
        "Không thể gửi yêu cầu truy cập"
      ),

    decideRequest: (reqId, action) =>
      tryCall(
        dispatch(decideRequest({ planId, reqId, action })),
        "Không thể xử lý yêu cầu"
      ),
  };
}

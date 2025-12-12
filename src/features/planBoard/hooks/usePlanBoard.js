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
  removeLabel,
  inviteMembers,
  localReorder,
  loadShareInfo,
  changeMemberRole,
  duplicateListThunk,
  deleteMember,
  sendAccessRequest,
  loadRequests as loadRequestsThunk,
  decideRequest as decideRequestThunk,
  clearTrashThunk,
  duplicateCardThunk,
  copyPlanThunk
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
    if (fallbackMessage) showError(fallbackMessage);
    throw err;
  }
}

// hook
export function usePlanBoard(planId) {
  const dispatch = useDispatch();
  const { board, loading, actionLoading, error, errorStatus, share, requests } = useSelector(
    (state) => state.planBoard
  );

  // role helpers
  const myRole = board?.myRole || null;
  const isOwner = myRole === "OWNER";
  const isEditor = myRole === "EDITOR";
  const isViewer = myRole === "VIEWER";

  const canEditBoard = isOwner || isEditor;   // add list/card, drag/drop
  const canInvite = isOwner || isEditor;      // mời thêm người
  const canChangeVisibility = isOwner;        // PRIVATE/PUBLIC
  const canSeeRequests = isOwner;             // tab "Yêu cầu tham gia"
  const canManageMembers = isOwner;           // đổi role, xoá thành viên

  const memberCostSummary = board?.memberCostSummary || null;
  const planMembers = board?.memberCostSummary?.members || [];
  return {
    board,
    share,
    loading,
    actionLoading,
    error,
    errorStatus,
    requests,
    memberCostSummary,
    planMembers,

    // load data
    load: () => dispatch(loadBoard(planId)),
    loadShare: () => dispatch(loadShareInfo(planId)),
    loadRequests: () => dispatch(loadRequestsThunk(planId)),

    // role info
    myRole,
    isOwner,
    isEditor,
    isViewer,
    canEditBoard,
    canInvite,
    canChangeVisibility,
    canSeeRequests,
    canManageMembers,

    copyPlan: (targetPlanId) =>
      tryCall(
        dispatch(copyPlanThunk(targetPlanId)).unwrap(),
        "Không thể sao chép lịch trình"
      ),
      
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

    duplicateList: (listId) =>
      tryCall(
        (async () => {
          await dispatch(duplicateListThunk({ planId, listId }));

          await dispatch(loadBoard(planId));
        })(),
        "Không thể sao chép danh sách"
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

    duplicateCard: (listId, cardId) =>
     tryCall(
       (async () => {
         await dispatch(
           duplicateCardThunk({ planId, listId, cardId })
         ).unwrap();
       })(),
       "Không thể sao chép thẻ"
     ),

    clearTrash: () =>
      tryCall(
        dispatch(clearTrashThunk(planId)),
        "Không thể xoá toàn bộ thùng rác"
      ),

    // drag drop
    localReorder: (payload) => dispatch(localReorder(payload)),

    reorder: (payload) =>
      tryCall(
        dispatch(reorder({ planId, payload })),
        "Không thể cập nhật vị trí"
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

    // request access (người khác xin quyền)
    requestAccess: async (type) => {
      try {
        const result = await dispatch(
          sendAccessRequest({ planId, type })
        ).unwrap();
        return result;
      } catch (err) {
        console.log(err);
        // Toast thông báo lỗi
        showError("Bạn đã gửi yêu cầu trước đó, vui lòng đợi xác nhận!");
        return null;
      }
    },

    // owner xử lý yêu cầu
    decideRequest: (reqId, action, role) =>
      tryCall(
        (async () => {
          await dispatch(
            decideRequestThunk({ planId, reqId, action, role })
          ).unwrap();

          if (action === "APPROVE") {
            // load lại share để cập nhật danh sách member
            dispatch(loadShareInfo(planId));
          } else {
            showSuccess("Đã từ chối yêu cầu truy cập");
          }
        })(),
        "Không thể xử lý yêu cầu"
      ),
  };
}

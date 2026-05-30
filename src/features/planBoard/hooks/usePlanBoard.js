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
  copyPlanThunk,
  rollbackToSnapshot,
} from "../slices/planBoardSlice";
import { updateVisibility, deletePlan  } from "../services/planBoardService";
import { showSuccess, showError } from "../../../utils/toastUtils";
import { ErrorCodes } from "../../../constants/errorCodes";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";

// api error handling with toast
async function tryCall(promise, fallbackMessage) {
  try {
    const res = await promise;
    return res;
  } catch (err) {
    console.error("❌ API Error:", err);
    const status = err?.response?.status ?? err?.status;
    if (status === 409) {
      // Optimistic lock conflict — a different collaborator edited this item
      showError(i18n.t("plan.error.conflict_content"));
    } else if (fallbackMessage) {
      showError(fallbackMessage);
    }
    throw err;
  }
}

// hook
export function usePlanBoard(planId) {
  const { t } = useTranslation();
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
        t("plan.error.copy_plan")
      ),
      
    // lists
    createList: (payload) =>
      tryCall(
        dispatch(addList({ planId, payload })),
        t("plan.error.create_list")
      ),

    renameList: (listId, payload) =>
      tryCall(
        dispatch(editListTitle({ planId, listId, payload })),
        t("plan.error.rename_list")
      ),

    deleteList: (listId) =>
      tryCall(
        dispatch(removeList({ planId, listId })),
        t("plan.error.delete_list")
      ),

    duplicateList: (listId) =>
      tryCall(
        (async () => {
          await dispatch(duplicateListThunk({ planId, listId })).unwrap();

          await dispatch(loadBoard(planId));
          showSuccess(t("plan.success.duplicate_list"));
        })(),
        t("plan.error.duplicate_list")
      ),

    // cards
    createCard: (listId, payload) =>
      tryCall(
        dispatch(addCard({ planId, listId, payload })),
        t("plan.error.create_card")
      ),

    updateCard: async (listId, cardId, payload) => {
      try {
        return await dispatch(editCard({ planId, listId, cardId, payload })).unwrap();
      } catch (err) {
        const status = err?.response?.status ?? err?.status;
        if (status === 409) {
          showError(t("plan.error.conflict_card"));
          dispatch(loadBoard(planId));
        } else {
          showError(t("plan.error.update_card"));
        }
        throw err;
      }
    },

    deleteCard: (listId, cardId) =>
      tryCall(
        dispatch(removeCard({ planId, listId, cardId })),
        t("plan.error.delete_card")
      ),

    duplicateCard: (listId, cardId) =>
     tryCall(
       (async () => {
         await dispatch(
           duplicateCardThunk({ planId, listId, cardId })
         ).unwrap();
         showSuccess(t("plan.success.duplicate_card"));
       })(),
       t("plan.error.duplicate_card")
     ),

    clearTrash: () =>
      tryCall(
        dispatch(clearTrashThunk(planId)),
        t("plan.error.clear_trash")
      ),

    // drag drop — snapshot → optimistic update → server confirm → rollback on failure
    localReorder: (payload) => dispatch(localReorder(payload)),

    reorder: async (payload, boardSnapshot) => {
      try {
        await dispatch(reorder({ planId, payload })).unwrap();
      } catch (err) {
        console.error("❌ Reorder failed:", err);
        const status = err?.response?.status ?? err?.status;
        if (boardSnapshot) {
          dispatch(rollbackToSnapshot(boardSnapshot));
        }
        if (status === 409) {
          showError(t("plan.error.conflict_reorder"));
          dispatch(loadBoard(planId));
        } else {
          showError(t("plan.error.reorder"));
        }
        throw err;
      }
    },

    deleteLabel: (labelId) =>
      tryCall(
        dispatch(removeLabel({ planId, labelId })),
        t("plan.error.delete_label")
      ),

    // invite
    invite: (payload) =>
      tryCall(
        dispatch(inviteMembers({ planId, payload })),
        t("plan.error.invite")
      ),

    updateVisibility: async (visibility) => {
      await tryCall(
        updateVisibility(planId, visibility),
        t("plan.error.update_visibility")
      );
      showSuccess(t("plan.success.update_visibility"));
    },

    updateMemberRole: (userId, role) =>
      tryCall(
        dispatch(changeMemberRole({ planId, userId, role })),
        t("plan.error.change_member_role")
      ),

    removeMember: (userId) =>
      tryCall(
        dispatch(deleteMember({ planId, userId })),
        t("plan.error.delete_member")
      ),

    // request access (người khác xin quyền)
    requestAccess: async (type) => {
      try {
        const result = await dispatch(
          sendAccessRequest({ planId, type })
        ).unwrap();
        showSuccess(t("plan.success.send_request"));
        return result;
      } catch (err) {
        console.error(err);
        const code = err?.code;

        if (code === ErrorCodes.ACCESS_REQUEST_ALREADY_SUBMITTED) {
          showError(t("plan.error.request_already_submitted"));
        } else if (
          code === ErrorCodes.ACCESS_ALREADY_GRANTED ||
          code === ErrorCodes.ACCESS_VIEW_ALREADY_GRANTED
        ) {
          showError(t("plan.error.access_already_granted"));
        } else {
          showError(err?.message || t("plan.error.send_access_request"));
        }
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
            showSuccess(t("plan.success.reject_request"));
          }
        })(),
        t("plan.error.decide_request")
      ),

    deletePlan: (targetPlanId) =>
      tryCall(
        deletePlan(targetPlanId),
        t("plan.error.delete_plan")
      ),
  };
}

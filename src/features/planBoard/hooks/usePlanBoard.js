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

export function usePlanBoard(planId) {
  const dispatch = useDispatch();
  const { board, loading, error } = useSelector((s) => s.planBoard);

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

    // Invites
    invite: (payload) => dispatch(inviteMembers({ planId, payload })),
  };
}

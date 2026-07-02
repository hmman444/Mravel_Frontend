"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { FaPlus, FaTrashAlt, FaFileExcel } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import PlanList from "./PlanList";
import ConfirmModal from "../../../../components/ConfirmModal";
import { exportPlanToExcel } from "../../utils/planExcelExport";
import { showError } from "../../../../utils/toastUtils";

// 9 activity modals
import ActivityModals from "../modals/ActivityModals";
import PlanDayMapModal from "../modals/PlanDayMapModal";

export default function PlanBoard({
  board,
  isViewer,
  planMembers,
  canEditBoard,
  // LIST
  handleAddList,
  renameList,
  deleteList,
  clearTrash,
  duplicateList,

  // ACTIVITY
  createActivityCard,
  updateActivityCard,

  // CARD đơn giản
  toggleDone,
  duplicateCard,

  // DRAG
  handleDragEnd,

  // UI
  editingListId,
  setEditingListId,
  setConfirmDeleteCard,
  setConfirmDeleteList,
}) {
  const { t } = useTranslation();
  // trạng thái mở/đóng 9 modal activity
  const modalStates = {
    TRANSPORT: useState(false),
    FOOD: useState(false),
    STAY: useState(false),
    SIGHTSEEING: useState(false),
    ENTERTAIN: useState(false),
    SHOPPING: useState(false),
    CINEMA: useState(false),
    EVENT: useState(false),
    OTHER: useState(false),
  };

  const [editingCard, setEditingCard] = useState(null);
  const [activeListForActivity, setActiveListForActivity] = useState(null);
  const [activeActivityType, setActiveActivityType] = useState(null);

  const [dayMapList, setDayMapList] = useState(null);
  const [dayMapIndex, setDayMapIndex] = useState(0);

  const handleOpenDayMap = (list, idx) => {
    setDayMapList(list);
    setDayMapIndex(idx);
  };

  const handleCloseDayMap = () => {
    setDayMapList(null);
  };
  const [readOnlyModal, setReadOnlyModal] = useState(false);
  // trash logic
  const [showTrash, setShowTrash] = useState(false);
  const [confirmClearTrash, setConfirmClearTrash] = useState(false);
  const [trashPanelTop, setTrashPanelTop] = useState(96);

  const lists = board?.lists || [];
  const dayLists = lists.filter((l) => l.type !== "TRASH");
  const trashList = lists.find((l) => l.type === "TRASH");
  const boardRef = useRef(null);
  const trashButtonRef = useRef(null);
  const prevDayListCountRef = useRef(dayLists.length);
  const shouldFollowNextCreatedListRef = useRef(false);
  const lastKnownScrollLeftRef = useRef(0);

  // Track current horizontal position so realtime updates can preserve collaborator viewport.
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const onScroll = () => {
      lastKnownScrollLeftRef.current = el.scrollLeft;
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // When list count increases: only local creator follows to the right.
  // Realtime collaborators keep their current scroll position.
  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) {
      prevDayListCountRef.current = dayLists.length;
      return;
    }

    const prevCount = prevDayListCountRef.current;
    const nextCount = dayLists.length;

    if (nextCount > prevCount) {
      if (shouldFollowNextCreatedListRef.current) {
        requestAnimationFrame(() => {
          el.scrollLeft = el.scrollWidth;
          lastKnownScrollLeftRef.current = el.scrollLeft;
        });
      } else {
        const preserved = lastKnownScrollLeftRef.current;
        requestAnimationFrame(() => {
          const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
          el.scrollLeft = Math.min(preserved, maxScrollLeft);
          lastKnownScrollLeftRef.current = el.scrollLeft;
        });
      }

      shouldFollowNextCreatedListRef.current = false;
    }

    prevDayListCountRef.current = nextCount;
  }, [dayLists.length]);

  // Keep trash panel fixed on the right viewport edge and always under the trash button.
  useEffect(() => {
    if (!showTrash) return;

    const updateTrashPanelPosition = () => {
      const rect = trashButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setTrashPanelTop(Math.round(rect.bottom + 8));
    };

    updateTrashPanelPosition();
    window.addEventListener("resize", updateTrashPanelPosition);
    window.addEventListener("scroll", updateTrashPanelPosition, true);

    return () => {
      window.removeEventListener("resize", updateTrashPanelPosition);
      window.removeEventListener("scroll", updateTrashPanelPosition, true);
    };
  }, [showTrash]);

  const openModal = (type) => modalStates[type][1](true);
  const closeModal = (type) => modalStates[type][1](false);

  const handleActivityPicked = (listId, type) => {
    setEditingCard(null);
    setActiveListForActivity(listId);
    setActiveActivityType(type);
    openModal(type);
  };

  const openEditModal = (listId, card) => {
    const type = card.activityType || "OTHER";
    setEditingCard(card);
    setActiveListForActivity(listId);
    setActiveActivityType(type);
    setReadOnlyModal(isViewer);
    openModal(type);
  };

  const handleSubmitActivity = async (formData) => {
    if (!activeListForActivity || !activeActivityType) return;

    if (editingCard) {
      await updateActivityCard(activeListForActivity, editingCard.id, formData);
    } else {
      await createActivityCard(activeListForActivity, formData);
    }

    closeModal(activeActivityType);
    setEditingCard(null);
  };

  const handleConfirmClearTrash = async () => {
    setConfirmClearTrash(false);
    if (!clearTrash || !canEditBoard) return;
    await clearTrash();
  };

  const handleAddListClick = async () => {
    if (!canEditBoard) return;

    // Mark next list increase as locally initiated so only this client follows to the right.
    shouldFollowNextCreatedListRef.current = true;
    await handleAddList?.();
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {t("plan.board.title")}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("plan.board.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              try {
                exportPlanToExcel(board);
              } catch (e) {
                console.error(e);
                showError(t("plan.board.export_error"));
              }
            }}
            className="
              inline-flex items-center gap-2 rounded-full px-3 py-2
              text-xs font-semibold shadow-sm transition-all
              bg-emerald-50 text-emerald-700 hover:bg-emerald-100
            "
          >
            <FaFileExcel className="text-[11px]" />
            <span>{t("plan.board.export")}</span>
          </button>

          {trashList && (
            <button
              ref={trashButtonRef}
              type="button"
              onClick={() => setShowTrash((prev) => !prev)}
              className={`
                inline-flex items-center gap-2 rounded-full px-3 py-2
                text-xs font-semibold shadow-sm transition-all
                ${
                  showTrash
                    ? "bg-rose-500 text-white"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }
              `}
            >
              <FaTrashAlt className="text-[11px]" />
              <span>{t("plan.board.trash")}</span>
            </button>
          )}

          {canEditBoard && (
            <button
              onClick={handleAddListClick}
              className="
                inline-flex items-center gap-2 rounded-full px-3 py-2
                text-xs font-semibold shadow-sm transition-all
                bg-blue-50 text-blue-700 hover:bg-blue-100
              "
            >
              <FaPlus className="text-[11px]" />
              <span>{t("plan.board.add_day")}</span>
            </button>
          )}
          
        </div>
      </div>

      {/* Lists + Trash trong board */}
      <div
        ref={boardRef}
        className="
          relative w-full 
          overflow-x-auto 
          overflow-y-visible
          min-h-[480px]
        "
      >
        <DragDropContext 
          onDragEnd={(result) => {
            if (!canEditBoard) return;      // <- viewer stop here
            handleDragEnd?.(result);
          }}>
          {/* các list ngày – scroll ngang */}
          <Droppable droppableId="all-lists" direction="horizontal" type="list" isDropDisabled={!canEditBoard}> 
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex w-max min-w-full items-start gap-5 overflow-y-visible"
              >
                {dayLists.map((list, idx) => (
                  <PlanList
                    key={`list-${list.id}`}
                    list={list}
                    index={idx}
                    dayNumber={idx + 1}
                    isTrash={false}
                    editingListId={editingListId}
                    setEditingListId={setEditingListId}
                    setConfirmDeleteCard={setConfirmDeleteCard}
                    setConfirmDeleteList={setConfirmDeleteList}
                    renameList={renameList}
                    deleteList={deleteList}
                    duplicateList={duplicateList}
                    toggleDone={toggleDone}
                    duplicateCard={duplicateCard}
                    onActivityTypeSelected={handleActivityPicked}
                    onOpenActivityModal={openEditModal}
                    canEdit={canEditBoard}
                    onOpenListMap={() => handleOpenDayMap(list, idx)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Trash panel (toggle by header button) */}
          <AnimatePresence>
            {trashList && showTrash && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="fixed right-6 z-30 w-[290px] overflow-y-auto rounded-2xl bg-white/95 dark:bg-gray-900/95 shadow-xl border border-rose-100/80 dark:border-rose-900/60"
                style={{
                  top: trashPanelTop,
                  maxHeight: `calc(100vh - ${trashPanelTop + 12}px)`,
                }}
              >
                <div className="flex items-center justify-between px-3 pt-3 pb-1">
                  <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
                    <FaTrashAlt className="text-[10px]" />
                    {t("plan.board.trash")}
                  </span>

                  {canEditBoard && trashList?.cards?.length > 0 && clearTrash && (
                    <button
                      type="button"
                      onClick={() => setConfirmClearTrash(true)}
                      className="
                        text-[10px] px-3 py-1 rounded-full
                        bg-red-500/10 text-red-600
                        hover:bg-red-500/20 hover:text-red-700
                        transition-all font-medium
                      "
                    >
                      {t("plan.board.clear_trash")}
                    </button>
                  )}
                </div>

                <div className="px-2 pb-2">
                  <PlanList
                    list={trashList}
                    index={dayLists.length}
                    isTrash={true}
                    editingListId={editingListId}
                    setEditingListId={setEditingListId}
                    setConfirmDeleteCard={setConfirmDeleteCard}
                    setConfirmDeleteList={setConfirmDeleteList}
                    renameList={renameList}
                    deleteList={deleteList}
                    duplicateList={duplicateList}
                    toggleDone={toggleDone}
                    duplicateCard={duplicateCard}
                    onActivityTypeSelected={handleActivityPicked}
                    onOpenActivityModal={openEditModal}
                    canEdit={canEditBoard}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DragDropContext>
      </div>

      {/* 9 modals */}
      <ActivityModals
        modalStates={modalStates}
        closeModal={closeModal}
        handleSubmitActivity={handleSubmitActivity}
        editingCard={editingCard}
        planMembers={planMembers}
        readOnly={!canEditBoard}
      />

      {confirmClearTrash && (
        <ConfirmModal
          open={true}
          title={t("plan.board.clear_trash_confirm_title")}
          message={t("plan.board.clear_trash_confirm_message")}
          confirmText={t("plan.board.clear_trash_confirm_button")}
          onClose={() => setConfirmClearTrash(false)}
          onConfirm={handleConfirmClearTrash}
        />
      )}
      <PlanDayMapModal
        open={!!dayMapList}
        onClose={handleCloseDayMap}
        list={dayMapList}
        dayIndex={dayMapIndex}
      />

    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";
import PlanList from "./PlanList";
import ConfirmModal from "../../../../components/ConfirmModal";

// 9 activity modals
import ActivityModals from "../modals/ActivityModals";
import PlanDayMapModal from "../modals/PlanDayMapModal";

export default function PlanBoard({
  board,
  isViewer,
  planMembers,

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
  activeListMenu,
  setActiveListMenu,
  activeCardMenu,
  setActiveCardMenu,
  setConfirmDeleteCard,
  setConfirmDeleteList,
}) {
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

  // trash logic
  const [showTrash, setShowTrash] = useState(false);
  const [confirmClearTrash, setConfirmClearTrash] = useState(false);

  const lists = board?.lists || [];
  const dayLists = lists.filter((l) => l.type !== "TRASH");
  const trashList = lists.find((l) => l.type === "TRASH");
  const boardRef = useRef(null);
  const trashRef = useRef(null);

  // trash position
  const [trashPos, setTrashPos] = useState({ x: 0, y: 0 });
  const [trashInitialized, setTrashInitialized] = useState(false);
  const [isDraggingTrash, setIsDraggingTrash] = useState(false);

  // trash state
  const [isDocked, setIsDocked] = useState(true);
  const trashDockRef = useRef({ x: 0, y: 0 });

  // info drag
  const trashDragRef = useRef({
    dragging: false,
    startMouseX: 0,
    startMouseY: 0,
    offsetX: 0,
    offsetY: 0,
    lastX: 0,
    lastY: 0,
  });

  // auto scroll
  const autoScrollRef = useRef({ vx: 0, vy: 0, raf: null });

  // padding dưới của board
  const [bottomPadding, setBottomPadding] = useState(40);

  // canh thùng rác lần đầu: dock cố định trên "thanh" của board (mép trên vùng scroll)
  useEffect(() => {
    if (!boardRef.current || trashInitialized) return;

    const rect = boardRef.current.getBoundingClientRect();
    const TRASH_WIDTH = 280;
    const marginRight = 16;
    const dockX = Math.max(rect.width - TRASH_WIDTH - marginRight, 0);
    const dockY = 0; // dính trên thanh của PlanBoard

    trashDockRef.current = { x: dockX, y: dockY };

    setTrashPos({ x: dockX, y: dockY });
    setIsDocked(true);
    setTrashInitialized(true);
  }, [trashInitialized]);

  // paddingBottom động
  useEffect(() => {
    if (!boardRef.current || isDraggingTrash) return;

    // Nếu không show trash thì trả padding về 40
    if (!showTrash || !trashRef.current) {
      setBottomPadding((prev) => (prev === 40 ? prev : 40));
      return;
    }

    const boardRect = boardRef.current.getBoundingClientRect();
    const trashRect = trashRef.current.getBoundingClientRect();
    const desiredGap = 24;

    const diff = trashRect.bottom + desiredGap - boardRect.bottom;
    const epsilon = 6;

    setBottomPadding((prev) => {
      let target = prev;

      if (diff > epsilon) {
        // đủ khoảng cách + làm tròn cho đỡ nhảy lắt nhắt
        target = Math.round(40 + diff);
      } else if (diff < -epsilon) {
        target = 40;
      }

      // Nếu chênh lệch quá nhỏ thì giữ nguyên, tránh setState vô ích
      if (Math.abs(target - prev) < 1) return prev;
      return target;
    });
  }, [showTrash, trashPos.y, trashList?.cards?.length, isDraggingTrash]);

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

  // auto-scroll với rAF
  const startAutoScroll = () => {
    if (autoScrollRef.current.raf) return;

    const step = () => {
      const { vx, vy } = autoScrollRef.current;

      if (vx === 0 && vy === 0) {
        autoScrollRef.current.raf = null;
        return;
      }

      if (boardRef.current && vx !== 0) {
        boardRef.current.scrollLeft += vx;
      }

      if (vy !== 0) {
        window.scrollBy(0, vy);
      }

      autoScrollRef.current.raf = requestAnimationFrame(step);
    };

    autoScrollRef.current.raf = requestAnimationFrame(step);
  };

  const stopAutoScroll = () => {
    if (autoScrollRef.current.raf) {
      cancelAnimationFrame(autoScrollRef.current.raf);
      autoScrollRef.current.raf = null;
    }
    autoScrollRef.current.vx = 0;
    autoScrollRef.current.vy = 0;
  };

  const handleTrashPointerDown = (e) => {
    setIsDraggingTrash(true);
    e.preventDefault();
    e.stopPropagation();

    if (!boardRef.current) return;

    const boardEl = boardRef.current;
    const br = boardEl.getBoundingClientRect();

    const pointerXBoard = e.clientX - br.left + boardEl.scrollLeft;
    const pointerYBoard = e.clientY - br.top;

    trashDragRef.current = {
      dragging: false,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      offsetX: pointerXBoard - trashPos.x,
      offsetY: pointerYBoard - trashPos.y,
      lastX: trashPos.x,
      lastY: trashPos.y,
    };

    const onMove = (ev) => {
      const moveDx = ev.clientX - trashDragRef.current.startMouseX;
      const moveDy = ev.clientY - trashDragRef.current.startMouseY;

      if (
        !trashDragRef.current.dragging &&
        (Math.abs(moveDx) > 3 || Math.abs(moveDy) > 3)
      ) {
        trashDragRef.current.dragging = true;
        // kéo ra khỏi "bãi đỗ"
        setIsDocked(false);
      }

      const boardRect = boardEl.getBoundingClientRect();

      // toạ độ con trỏ trong content board
      const pointerXBoardNow =
        ev.clientX - boardRect.left + boardEl.scrollLeft;
      const pointerYBoardNow = ev.clientY - boardRect.top;

      let newX = pointerXBoardNow - trashDragRef.current.offsetX;
      let newY = pointerYBoardNow - trashDragRef.current.offsetY;

      const TRASH_WIDTH = 280;
      const trashHeight = trashRef.current
        ? trashRef.current.offsetHeight
        : showTrash
        ? 260
        : 40;

      const scrollWidth = boardEl.scrollWidth;
      const boardHeight = boardEl.scrollHeight;

      const maxX = scrollWidth - TRASH_WIDTH;
      const maxY = boardHeight - trashHeight - 24;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      setTrashPos({ x: newX, y: newY });
      trashDragRef.current.lastX = newX;
      trashDragRef.current.lastY = newY;

      // AUTO-SCROLL: ngang theo board, dọc theo viewport
      const edgeH = 80;
      const edgeV = 80;
      const maxSpeed = 20;

      if (ev.clientX < boardRect.left + edgeH) {
        autoScrollRef.current.vx =
          -maxSpeed * (1 - (ev.clientX - boardRect.left) / edgeH);
      } else if (ev.clientX > boardRect.right - edgeH) {
        autoScrollRef.current.vx =
          maxSpeed *
          (1 - (boardRect.right - ev.clientX) / edgeH);
      } else {
        autoScrollRef.current.vx = 0;
      }

      const vh = window.innerHeight;
      if (ev.clientY < edgeV) {
        autoScrollRef.current.vy =
          -maxSpeed * (1 - ev.clientY / edgeV);
      } else if (ev.clientY > vh - edgeV) {
        autoScrollRef.current.vy =
          maxSpeed *
          (1 - (vh - ev.clientY) / edgeV);
      } else {
        autoScrollRef.current.vy = 0;
      }

      if (autoScrollRef.current.vx !== 0 || autoScrollRef.current.vy !== 0) {
        startAutoScroll();
      } else {
        stopAutoScroll();
      }
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);

      const { dragging, lastX, lastY } = trashDragRef.current;

      if (!dragging) {
        // click nhẹ: chỉ ẩn/mở thùng rác
        setShowTrash((prev) => !prev);
      } else {
        // nếu thả gần thanh dock trên cùng thì "đỗ" lại lên thanh
        const dock = trashDockRef.current;
        const dist = Math.hypot(lastX - dock.x, lastY - dock.y);
        const SNAP_RADIUS = 80;

        if (dist <= SNAP_RADIUS) {
          setTrashPos(dock);
          setIsDocked(true);
        }
      }

      stopAutoScroll();
      setIsDraggingTrash(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleConfirmClearTrash = async () => {
    setConfirmClearTrash(false);
    if (!clearTrash || isViewer) return;
    await clearTrash();
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Lịch trình chi tiết
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Kéo thả để sắp xếp, thêm ngày và thẻ cho từng hoạt động
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddList}
            className="
              fixed bottom-6 right-6 z-50 rounded-full p-4 
              bg-gradient-to-r from-blue-500 to-indigo-500 text-white 
              shadow-lg shadow-blue-500/40 hover:shadow-xl hover:-translate-y-1 
              transition-all
            "
          >
            <FaPlus />
          </button>
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
        style={{ paddingBottom: bottomPadding }}
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* các list ngày – scroll ngang */}
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex items-start gap-5 overflow-y-visible pr-[280px] pt-10"
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
                    activeListMenu={activeListMenu}
                    setActiveListMenu={setActiveListMenu}
                    activeCardMenu={activeCardMenu}
                    setActiveCardMenu={setActiveCardMenu}
                    setConfirmDeleteCard={setConfirmDeleteCard}
                    setConfirmDeleteList={setConfirmDeleteList}
                    renameList={renameList}
                    deleteList={deleteList}
                    duplicateList={duplicateList}
                    toggleDone={toggleDone}
                    duplicateCard={duplicateCard}
                    onActivityTypeSelected={handleActivityPicked}
                    onOpenActivityModal={openEditModal}
                    canEdit={!isViewer}
                    onOpenListMap={() => handleOpenDayMap(list, idx)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Container tay cầm + thùng rác */}
          {trashList && (
            <motion.div
              ref={trashRef}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                left: trashPos.x,
                top: trashPos.y,
                zIndex: 40,
                width: 280,
              }}
            >
              {/* Tay cầm */}
              <div
                onPointerDown={handleTrashPointerDown}
                className={`
                  mb-2 inline-flex items-center gap-2
                  rounded-full px-3 py-1
                  text-xs font-semibold text-white shadow-md
                  cursor-move transition-all
                  ${isDocked ? "bg-rose-500" : "bg-rose-500/90"}
                `}
              >
                <FaTrashAlt className="text-[11px]" />
                <span>
                  Thùng rác (Kéo lên để gắn)
                </span>
              </div>

              {/* List thùng rác */}
              <AnimatePresence>
                {showTrash && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl bg-white/95 dark:bg-gray-900/95 shadow-xl border border-rose-100/80 dark:border-rose-900/60"
                  >
                    <div className="flex items-center justify-between px-3 pt-3 pb-1">
                      <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
                        <FaTrashAlt className="text-[10px]" />
                        Thùng rác
                      </span>

                      {!isViewer &&
                        trashList?.cards?.length > 0 &&
                        clearTrash && (
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
                            Xóa tất cả
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
                        activeListMenu={activeListMenu}
                        setActiveListMenu={setActiveListMenu}
                        activeCardMenu={activeCardMenu}
                        setActiveCardMenu={setActiveCardMenu}
                        setConfirmDeleteCard={setConfirmDeleteCard}
                        setConfirmDeleteList={setConfirmDeleteList}
                        renameList={renameList}
                        deleteList={deleteList}
                        duplicateList={duplicateList}
                        toggleDone={toggleDone}
                        duplicateCard={duplicateCard}
                        onActivityTypeSelected={handleActivityPicked}
                        onOpenActivityModal={openEditModal}
                        canEdit={!isViewer}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </DragDropContext>
      </div>

      {/* 9 modals */}
      <ActivityModals
        modalStates={modalStates}
        closeModal={closeModal}
        handleSubmitActivity={handleSubmitActivity}
        editingCard={editingCard}
        planMembers={planMembers}
      />

      {confirmClearTrash && (
        <ConfirmModal
          open={true}
          title="Xóa toàn bộ thẻ trong thùng rác"
          message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa tất cả thẻ trong thùng rác?"
          confirmText="Xóa hết"
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

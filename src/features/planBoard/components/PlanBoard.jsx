"use client";
import { useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

import PlanList from "./PlanList";

// 9 activity modals
import TransportActivityModal from "./modals/TransportActivityModal";
import FoodActivityModal from "./modals/FoodActivityModal";
import StayActivityModal from "./modals/StayActivityModal";
import SightseeingActivityModal from "./modals/SightseeingActivityModal";
import EntertainmentActivityModal from "./modals/EntertainActivityModal";
import EventActivityModal from "./modals/EventActivityModal";
import ShoppingActivityModal from "./modals/ShoppingActivityModal";
import CinemaActivityModal from "./modals/CinemaActivityModal";
import OtherActivityModal from "./modals/OtherActivityModal";

export default function PlanBoard({
  board,
  isViewer,

  // LIST
  handleAddList,
  renameList,
  deleteList,
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
  // trạng thái 9 modal
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

  // Hiển thị / ẩn thùng rác
  const [showTrash, setShowTrash] = useState(false);

  const lists = board?.lists || [];
  const dayLists = lists.filter((l) => l.type !== "TRASH");
  const trashList = lists.find((l) => l.type === "TRASH");

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

        <div className="flex items-center gap-3">
          {trashList && (
            <button
              onClick={() => setShowTrash((v) => !v)}
              className="
                hidden sm:inline-flex items-center gap-2 rounded-full
                border border-rose-200 bg-rose-50 px-3 py-1.5
                text-xs font-semibold text-rose-600
                hover:bg-rose-100 hover:border-rose-300
                transition
              "
            >
              <FaTrashAlt className="text-[11px]" />
              <span>{showTrash ? "Ẩn thùng rác" : "Hiện thùng rác"}</span>
            </button>
          )}
        </div>

        {/* nút + thêm ngày (floating) */}
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

      {/* Lists */}
      <div className="relative overflow-x-auto overflow-y-visible pb-4 w-full min-h-[60vh]">
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* các list ngày – scroll ngang */}
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="
                  flex items-start gap-5 overflow-y-visible
                  pr-[280px]  /* chừa chỗ bên phải cho thùng rác cố định */
                "
              >
                {dayLists.map((list, idx) => (
                  <PlanList
                    key={list.id}
                    list={list}
                    index={idx}
                    dayNumber={idx + 1}
                    isTrash={false}
                    // edit list title
                    editingListId={editingListId}
                    setEditingListId={setEditingListId}
                    // menu list
                    activeListMenu={activeListMenu}
                    setActiveListMenu={setActiveListMenu}
                    // menu card
                    activeCardMenu={activeCardMenu}
                    setActiveCardMenu={setActiveCardMenu}
                    // confirm delete
                    setConfirmDeleteCard={setConfirmDeleteCard}
                    setConfirmDeleteList={setConfirmDeleteList}
                    // list operations
                    renameList={renameList}
                    deleteList={deleteList}
                    duplicateList={duplicateList}
                    // card operations
                    toggleDone={toggleDone}
                    duplicateCard={duplicateCard}
                    // CREATE activity
                    onActivityTypeSelected={handleActivityPicked}
                    // EDIT activity
                    onOpenActivityModal={openEditModal}
                    // quyền
                    canEdit={!isViewer}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Thùng rác cố định bên phải */}
          {trashList && (
            <AnimatePresence>
              {showTrash && (
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.2 }}
                  className="
                    fixed z-40
                    right-3 bottom-24
                    sm:right-4 sm:bottom-24
                    lg:right-8 lg:bottom-auto lg:top-[210px]
                  "
                >
                  <PlanList
                    list={trashList}
                    index={dayLists.length} // chỉ để Draggable card dùng index, list này không draggable cột
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
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </DragDropContext>
      </div>

      {/* 9 MODALS */}
      <TransportActivityModal
        open={modalStates.TRANSPORT[0]}
        onClose={() => closeModal("TRANSPORT")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
      />
      <FoodActivityModal
        open={modalStates.FOOD[0]}
        onClose={() => closeModal("FOOD")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
      />
      <StayActivityModal
        open={modalStates.STAY[0]}
        onClose={() => closeModal("STAY")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
      />
      <SightseeingActivityModal
        open={modalStates.SIGHTSEEING[0]}
        onClose={() => closeModal("SIGHTSEEING")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
      />
      <EntertainmentActivityModal
        open={modalStates.ENTERTAIN[0]}
        onClose={() => closeModal("ENTERTAIN")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
      />
      <ShoppingActivityModal
        open={modalStates.SHOPPING[0]}
        onClose={() => closeModal("SHOPPING")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
      />
      <CinemaActivityModal
        open={modalStates.CINEMA[0]}
        onClose={() => closeModal("CINEMA")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
      />
      <EventActivityModal
        open={modalStates.EVENT[0]}
        onClose={() => closeModal("EVENT")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
      />
      <OtherActivityModal
        open={modalStates.OTHER[0]}
        onClose={() => closeModal("OTHER")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
      />
    </div>
  );
}

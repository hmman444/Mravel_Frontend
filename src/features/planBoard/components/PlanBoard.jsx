"use client";

import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { FaPlus } from "react-icons/fa";
import PlanList from "./PlanList";

export default function PlanBoard({
  board,
  isViewer,

  // LIST
  handleAddList,
  renameList,
  deleteList,
  duplicateList,

  // CARD
  newCardListId,
  setNewCardListId,
  newCardText,
  setNewCardText,
  handleAddCard,
  toggleDone,
  duplicateCard,
  deleteCard,

  // DRAG
  handleDragEnd,

  // UI STATES
  editingListId,
  setEditingListId,
  activeListMenu,
  setActiveListMenu,
  activeCardMenu,
  setActiveCardMenu,
  setConfirmDeleteCard,
  setConfirmDeleteList,
  setEditCard,
  setActiveCard,
}) {
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

        {/* Add List */}
        <button
          onClick={handleAddList}
          className="
            fixed bottom-6 right-6 
            z-50 rounded-full p-4 
            bg-gradient-to-r from-blue-500 to-indigo-500 text-white 
            shadow-lg shadow-blue-500/40 
            hover:shadow-xl hover:-translate-y-1 
            transition-all
          "
        >
          <FaPlus />
        </button>
      </div>

      {/* Board */}
      <div className="relative overflow-x-auto overflow-y-visible pb-4 w-full min-h-[60vh]">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="
                  flex items-start gap-5
                  overflow-y-visible
                  pr-4
                "
              >
                {board?.lists?.map((list, idx) => (
                  <PlanList
                    key={list.id}
                    list={list}
                    index={idx}
                    editingListId={editingListId}
                    setEditingListId={setEditingListId}
                    newCardListId={newCardListId}
                    setNewCardListId={setNewCardListId}
                    newCardText={newCardText}
                    setNewCardText={setNewCardText}
                    handleAddCard={handleAddCard}
                    setActiveCard={setActiveCard}
                    setEditCard={setEditCard}
                    deleteList={deleteList}
                    deleteCard={setConfirmDeleteCard}
                    duplicateCard={duplicateCard}
                    activeListMenu={activeListMenu}
                    setActiveListMenu={setActiveListMenu}
                    activeCardMenu={activeCardMenu}
                    setActiveCardMenu={setActiveCardMenu}
                    toggleDone={toggleDone}
                    setConfirmDeleteCard={setConfirmDeleteCard}
                    setConfirmDeleteList={setConfirmDeleteList}
                    renameList={renameList}
                    duplicateList={duplicateList}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>

  );
}

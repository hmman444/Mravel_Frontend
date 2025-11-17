import { Droppable, Draggable } from "@hello-pangea/dnd";
import {
  FaPlus,
  FaEllipsisV,
  FaCheck,
  FaTimes,
  FaCopy,
} from "react-icons/fa";
import PlanCard from "./PlanCard";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function PlanList({
  list,
  index,
  editingListId,
  setEditingListId,
  renameList,
  newCardListId,
  setNewCardListId,
  newCardText,
  setNewCardText,
  handleAddCard,
  setEditCard,
  duplicateCard,
  activeListMenu,
  setActiveListMenu,
  activeCardMenu,
  setActiveCardMenu,
  toggleDone,
  setConfirmDeleteCard,
  setConfirmDeleteList,
  duplicateList,
  setActiveCard,
  canEdit = true,
}) {
  const [tempTitle, setTempTitle] = useState(list.title);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (activeListMenu === list.id && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const width = 160;

      setPos({
        top: rect.bottom + window.scrollY + 5,
        left: rect.right - width + window.scrollX,
      });
    }
  }, [activeListMenu]);

  useEffect(() => {
    if (activeListMenu !== list.id) return;

    const close = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) {
        setActiveListMenu(null);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [activeListMenu]);

  // menu 
  const menu =
    activeListMenu === list.id
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] w-40 rounded-lg shadow-lg border
              bg-white dark:bg-gray-800 animate-dropdown-slide"
            style={{ top: pos.top, left: pos.left }}
          >
            {/* Duplicate */}
            {canEdit && (
              <button
                onClick={() => {
                  duplicateList(list);
                  setActiveListMenu(null);
                }}
                className="flex items-center w-full px-3 py-2 text-sm 
                text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 gap-2"
              >
                <FaCopy className="text-gray-500" /> Tạo bản sao
              </button>
            )}

            {/* Delete */}
            {canEdit && (
              <button
                onClick={() => {
                  setConfirmDeleteList(list);
                  setActiveListMenu(null);
                }}
                className="flex items-center w-full px-3 py-2 text-sm 
                text-red-600 hover:bg-red-50 dark:hover:bg-red-800 gap-2"
              >
                <FaTimes className="text-red-500" /> Xóa
              </button>
            )}

            {!canEdit && (
              <div className="px-3 py-2 text-sm text-gray-400">
                Không có quyền chỉnh sửa
              </div>
            )}
          </div>,
          document.body
        )
      : null;

  // render list
  return (
    <>
      <Draggable draggableId={`list-${list.id}`} index={index} isDragDisabled={!canEdit}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 w-64 flex-shrink-0
              shadow-md border border-transparent hover:border-blue-400 hover:shadow-lg
              transition-all duration-200"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3" {...provided.dragHandleProps}>
              
              {/* Title */}
              {editingListId === list.id ? (
                <input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={async () => {
                    try {
                      if (tempTitle.trim() && tempTitle !== list.title) {
                        await renameList(list.id, { title: tempTitle }).unwrap();
                      }
                    } finally {
                      setEditingListId(null);
                    }
                  }}
                  autoFocus
                  className="font-semibold w-full bg-transparent outline-none"
                />
              ) : (
                <h3
                  onClick={() => canEdit && setEditingListId(list.id)}
                  className={`font-semibold cursor-pointer ${
                    canEdit ? "hover:underline" : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  {list.title}
                </h3>
              )}

              {/* List menu button */}
              <button
                ref={btnRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveListMenu(activeListMenu === list.id ? null : list.id);
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaEllipsisV />
              </button>
            </div>

            {/* Cards */}
            <Droppable droppableId={String(list.id)} type="card" isDropDisabled={!canEdit}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[1px] pb-1">
                  {list.cards?.map((card, idx) => (
                    <Draggable
                      key={`card-${card.id}`}
                      draggableId={`card-${card.id}`}
                      index={idx}
                      isDragDisabled={!canEdit}
                    >
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <PlanCard
                            card={card}
                            listId={list.id}
                            toggleDone={toggleDone}
                            duplicateCard={duplicateCard}
                            setEditCard={setEditCard}
                            setConfirmDeleteCard={setConfirmDeleteCard}
                            activeMenu={activeCardMenu}
                            setActiveMenu={setActiveCardMenu}
                            canEdit={canEdit}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add card */}
            {newCardListId === list.id ? (
              <div className="mt-2">
                <textarea
                  className="w-full border rounded-lg px-2 py-1 text-sm"
                  value={newCardText}
                  onChange={(e) => setNewCardText(e.target.value)}
                  autoFocus
                  placeholder="Nhập tên thẻ..."
                />
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => handleAddCard(list.id)}
                    className="px-2 py-1 bg-primary text-white rounded-lg text-sm flex items-center gap-1"
                  >
                    <FaCheck /> Lưu
                  </button>
                  <button
                    onClick={() => setNewCardListId(null)}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm flex items-center gap-1"
                  >
                    <FaTimes /> Hủy
                  </button>
                </div>
              </div>
            ) : (
              canEdit && (
                <button
                  onClick={() => setNewCardListId(list.id)}
                  className="flex items-center gap-1 text-sm text-primary mt-2"
                >
                  <FaPlus /> Thêm thẻ
                </button>
              )
            )}
          </div>
        )}
      </Draggable>

      {menu}
    </>
  );
}

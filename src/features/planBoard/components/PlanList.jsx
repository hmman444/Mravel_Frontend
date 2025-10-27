import { Droppable, Draggable } from "@hello-pangea/dnd";
import { FaPlus, FaEllipsisV, FaCheck, FaTimes, FaCopy } from "react-icons/fa";
import PlanCard from "./PlanCard";
import { useState, useRef, useEffect } from "react";

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
  confirmAddCard,
  setActiveCard,
  setEditCard,
  deleteCard,
  duplicateCard,
  activeListMenu,
  setActiveListMenu,
  activeCardMenu,
  setActiveCardMenu,
  toggleDone,
  setConfirmDeleteCard,
  setConfirmDeleteList,
  duplicateList,
}) {
  const [tempTitle, setTempTitle] = useState(list.title);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // ✅ Đóng menu khi click ra ngoài, nhưng KHÔNG khi click nút menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setActiveListMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setActiveListMenu]);

  return (
    <Draggable draggableId={String(list.id)} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 w-64 flex-shrink-0 shadow-md border border-transparent hover:border-blue-400 hover:shadow-lg transition-all duration-200"
        >
          {/* HEADER */}
          <div
            className="flex justify-between items-center mb-3"
            {...provided.dragHandleProps}
          >
            {editingListId === list.id ? (
              <input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={async () => {
                  if (tempTitle.trim() && tempTitle !== list.title) {
                    await renameList(list.id, { title: tempTitle });
                  }
                  setEditingListId(null);
                }}
                autoFocus
                className="font-semibold w-full bg-transparent outline-none"
              />
            ) : (
              <h3
                onClick={() => {
                  setEditingListId(list.id);
                  setTempTitle(list.title);
                }}
                className="font-semibold cursor-pointer hover:underline"
              >
                {list.title}
              </h3>
            )}

            {/* ⋮ Nút menu */}
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  // toggle menu chính xác
                  setActiveListMenu((prev) => (prev === list.id ? null : list.id));
                }}
              >
                <FaEllipsisV />
              </button>

              {activeListMenu === list.id && (
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-1 bg-white dark:bg-gray-700 shadow-lg rounded-lg w-40 z-50 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      duplicateList(list);
                      setActiveListMenu(null);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 gap-2"
                  >
                    <FaCopy className="text-gray-500" /> Tạo bản sao
                  </button>
                  <button
                    onClick={() => {
                      setActiveListMenu(null);
                      setConfirmDeleteList(list);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-700 gap-2"
                  >
                    <FaTimes className="text-red-500" /> Xóa
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CARDS */}
          <Droppable droppableId={String(list.id)} type="card">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2 min-h-[20px] pb-1"
              >
                {Array.isArray(list.cards) && list.cards.length > 0 ? (
                  list.cards.map((card, idx) => (
                    <Draggable key={String(card.id)} draggableId={String(card.id)} index={idx}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <PlanCard
                            card={card}
                            listId={list.id}
                            toggleDone={toggleDone}
                            setActiveCard={setActiveCard}
                            setEditCard={setEditCard}
                            deleteCard={deleteCard}
                            duplicateCard={duplicateCard}
                            activeMenu={activeCardMenu}
                            setActiveMenu={setActiveCardMenu}
                            setConfirmDeleteCard={setConfirmDeleteCard}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <div className="text-gray-400 italic text-sm select-none">
                    Chưa có thẻ
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* ADD CARD */}
          {newCardListId === list.id ? (
            <div className="mt-2">
              <textarea
                value={newCardText}
                onChange={(e) => setNewCardText(e.target.value)}
                className="w-full border rounded-lg px-2 py-1 text-sm"
                placeholder="Nhập tên thẻ..."
                autoFocus
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => confirmAddCard(list.id)}
                  className="px-2 py-1 bg-primary text-white rounded-lg text-sm flex items-center gap-1"
                >
                  <FaCheck /> Lưu
                </button>
                <button
                  onClick={() => setNewCardListId(null)}
                  className="px-2 py-1 bg-gray-200 rounded-lg text-sm flex items-center gap-1"
                >
                  <FaTimes /> Hủy
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setNewCardListId(list.id)}
              className="flex items-center gap-1 text-sm text-primary mt-2"
            >
              <FaPlus /> Thêm thẻ
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
}

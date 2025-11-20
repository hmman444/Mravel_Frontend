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
  canEdit = true,
}) {
  const [tempTitle, setTempTitle] = useState(list.title);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (activeListMenu === list.id && btnRef.current && menuRef.current) {
      const btnRect = btnRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();

      const spacing = 6; 

      setPos({
        top: btnRect.bottom + spacing,
        left: btnRect.right - menuRect.width,
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

  const menu =
    activeListMenu === list.id
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] w-44 rounded-xl shadow-xl border border-gray-200/50 
              bg-white/90 backdrop-blur dark:bg-gray-800/90 animate-fadeIn"
            style={{ top: pos.top, left: pos.left }}
          >
            {canEdit && (
              <button
                onClick={() => {
                  duplicateList(list);
                  setActiveListMenu(null);
                }}
                className="flex items-center w-full px-3 py-2 text-sm 
                  text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-t-xl gap-2"
              >
                <FaCopy className="text-gray-500" /> Tạo bản sao
              </button>
            )}

            {canEdit && (
              <button
                onClick={() => {
                  setConfirmDeleteList(list);
                  setActiveListMenu(null);
                }}
                className="flex items-center w-full px-3 py-2 text-sm 
                text-red-600 hover:bg-red-50/70 dark:hover:bg-red-900/30 rounded-b-xl gap-2"
              >
                <FaTimes className="text-red-500" /> Xóa
              </button>
            )}

            {!canEdit && (
              <div className="px-3 py-2 text-sm text-gray-400">Không có quyền chỉnh sửa</div>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <Draggable draggableId={`list-${list.id}`} index={index} isDragDisabled={!canEdit}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="w-64 flex-shrink-0 rounded-2xl bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            shadow-sm"
          >
            <div
              className="flex items-center justify-between px-3 pt-3 pb-2"
              {...provided.dragHandleProps}
            >
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
                  className="font-semibold w-full bg-transparent outline-none text-gray-900 dark:text-gray-200"
                />
              ) : (
                <h3
                  onClick={() => canEdit && setEditingListId(list.id)}
                  className={`font-semibold truncate ${
                    canEdit
                      ? "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                      : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  {list.title}
                </h3>
              )}

              <button
                ref={btnRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveListMenu(activeListMenu === list.id ? null : list.id);
                }}
                className="p-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition"
              >
                <FaEllipsisV className="text-gray-500 dark:text-gray-300" />
              </button>
            </div>

            <Droppable droppableId={String(list.id)} type="card" isDropDisabled={!canEdit}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="px-3 pb-2 min-h-[1px]"
                >
                  {list.cards?.map((card, idx) => (
                    <Draggable
                      key={`card-${card.id}`}
                      draggableId={`card-${card.id}`}
                      index={idx}
                      isDragDisabled={!canEdit}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-2 drag-card-wrapper"
                        >
                          <div className="no-transform no-blur no-shadow">
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
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {newCardListId === list.id ? (
              <div className="px-3 pb-3">
                <textarea
                  className="w-full border rounded-xl bg-white/80 dark:bg-gray-800 
                    px-3 py-2 text-sm outline-none"
                  value={newCardText}
                  onChange={(e) => setNewCardText(e.target.value)}
                  autoFocus
                  placeholder="Nhập tên thẻ..."
                />

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleAddCard(list.id)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 
                      text-white text-sm font-medium shadow hover:shadow-md transition"
                  >
                    Lưu
                  </button>

                  <button
                    onClick={() => setNewCardListId(null)}
                    className="px-3 py-1.5 text-sm rounded-xl bg-gray-200 dark:bg-gray-700 
                      text-gray-700 dark:text-gray-200 hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              canEdit && (
                <button
                  onClick={() => setNewCardListId(list.id)}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 
                  px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-xl transition mt-1"
                >
                  <FaPlus className="text-xs" /> Thêm thẻ
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

import { Droppable, Draggable } from "@hello-pangea/dnd";
import {
  FaPlus,
  FaEllipsisV,
  FaTimes,
  FaCopy,
  FaTrashAlt,
} from "react-icons/fa";
import PlanCard from "./PlanCard";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

const ACTIVITY_TYPES = [
  {
    id: "TRANSPORT",
    label: "Di chuyển",
    icon: "🚕",
    description: "Taxi, xe máy, xe buýt...",
    pillClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    id: "FOOD",
    label: "Ăn uống",
    icon: "🥘",
    description: "Quán ăn, cafe, uống...",
    pillClass: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    id: "STAY",
    label: "Nghỉ ngơi",
    icon: "🛏️",
    description: "Khách sạn, homestay...",
    pillClass: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    id: "ENTERTAIN",
    label: "Vui chơi",
    icon: "🎡",
    description: "Biển, công viên, trò chơi...",
    pillClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "SIGHTSEEING",
    label: "Tham quan",
    icon: "🏛️",
    description: "Địa điểm du lịch, chụp ảnh...",
    pillClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "SHOPPING",
    label: "Mua sắm",
    icon: "🛍️",
    description: "Chợ, TTTM, quà lưu niệm...",
    pillClass: "bg-pink-50 text-pink-700 border-pink-200",
  },
  {
    id: "CINEMA",
    label: "Xem phim",
    icon: "🎬",
    description: "Rạp phim, combo bắp nước...",
    pillClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    id: "EVENT",
    label: "Sự kiện",
    icon: "🎤",
    description: "Show, hội nghị, gặp mặt...",
    pillClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    id: "OTHER",
    label: "Khác",
    icon: "📝",
    description: "Hoạt động khác",
    pillClass: "bg-slate-50 text-slate-700 border-slate-200",
  },
];

export default function PlanList({
  list,
  index,
  isTrash,
  dayNumber,
  editingListId,
  setEditingListId,
  renameList,
  setEditCard, // chưa dùng, giữ lại
  duplicateCard,
  activeListMenu,
  setActiveListMenu,
  activeCardMenu,
  setActiveCardMenu,
  toggleDone,
  setConfirmDeleteCard,
  setConfirmDeleteList,
  deleteList,
  duplicateList,
  canEdit = true,
  onActivityTypeSelected,
  onOpenActivityModal,
}) {
  const [tempTitle, setTempTitle] = useState(list.title || "");
  const [showTypePicker, setShowTypePicker] = useState(false);

  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setTempTitle(list.title || "");
  }, [list.title]);

  // Tính vị trí menu 3 chấm
  useEffect(() => {
    if (isTrash) return;
    if (activeListMenu === list.id && btnRef.current && menuRef.current) {
      const btnRect = btnRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const spacing = 6;

      setPos({
        top: btnRect.bottom + spacing,
        left: btnRect.right - menuRect.width,
      });
    }
  }, [activeListMenu, isTrash, list.id]);

  // Click ra ngoài đóng menu
  useEffect(() => {
    if (isTrash) return;
    if (activeListMenu !== list.id) return;

    const close = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !btnRef.current?.contains(e.target)
      ) {
        setActiveListMenu(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [activeListMenu, isTrash, list.id, setActiveListMenu]);

  const menu =
    !isTrash && activeListMenu === list.id
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] w-44 rounded-xl shadow-xl border border-gray-200/50 
              bg-white/90 backdrop-blur dark:bg-gray-800/90 animate-fadeIn"
            style={{ top: pos.top, left: pos.left }}
          >
            {canEdit && (
              <>
                <button
                  onClick={() => {
                    duplicateList(list);
                    setActiveListMenu(null);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm 
                    text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 gap-2"
                >
                  <FaCopy className="text-gray-500" /> Tạo bản sao
                </button>
                <button
                  onClick={() => {
                    setConfirmDeleteList(list);
                    setActiveListMenu(null);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm 
                    text-red-600 hover:bg-red-50/70 dark:hover:bg-red-900/30 gap-2"
                >
                  <FaTimes className="text-red-500" /> Xóa
                </button>
              </>
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

  const handlePickActivityType = (type) => {
    setShowTypePicker(false);
    if (onActivityTypeSelected) {
      onActivityTypeSelected(list.id, type.id);
    }
  };

  const wrapperClass = `
    w-64 flex-shrink-0 rounded-2xl border shadow-sm
    ${
      isTrash
        ? "bg-rose-50/90 dark:bg-slate-900/80 border-dashed border-rose-300/80 dark:border-rose-500/70"
        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
    }
  `;

  const headerClass = `
    flex items-center justify-between px-3 pt-3 pb-2
    ${isTrash ? "border-b border-rose-100/80 dark:border-rose-500/40" : ""}
  `;

  if (isTrash) {
    return (
      <div className="w-64 flex-shrink-0 rounded-2xl bg-rose-50/70 dark:bg-rose-900/20 p-2">
        
        {/* HƯỚNG DẪN: tinh gọn, nhẹ, không box đậm */}
        <div className="text-[11px] text-rose-600/80 px-2 py-1.5 leading-snug">
          <span className="flex items-start gap-1.5">
            <span className="text-center">
              Kéo những hoạt động không dùng nữa vào đây
              để tạm ẩn khỏi tuyến plan chính.
            </span>
          </span>
        </div>

        <Droppable droppableId={String(list.id)} type="card" isDropDisabled={!canEdit}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2 min-h-[10px] mt-1"
            >

              {/* Cards */}
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
                    >
                      <PlanCard
                        card={card}
                        listId={list.id}
                        toggleDone={toggleDone}
                        duplicateCard={duplicateCard}
                        setConfirmDeleteCard={setConfirmDeleteCard}
                        activeMenu={activeCardMenu}
                        setActiveMenu={setActiveCardMenu}
                        canEdit={canEdit}
                        onOpenActivityModal={onOpenActivityModal}
                        isInTrash={true}
                      />
                    </div>
                  )}
                </Draggable>
              ))}

              {/* Empty state */}
              {list.cards?.length === 0 && (
                <div className="py-6 text-[11px] text-rose-500/70 text-center">
                  (Trống)
                </div>
              )}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  }


  const handleBlurRename = async () => {
    try {
      const trimmed = tempTitle.trim();

      // Không đổi gì
      if (!trimmed || trimmed === (list.title || "")) {
        setTempTitle(list.title || "");
        return;
      }

      // Gọi hàm renameList từ hook – KHÔNG dùng .unwrap()
      await renameList(list.id, { title: trimmed });
    } finally {
      // Dù thành công hay lỗi cũng thoát chế độ edit
      setEditingListId(null);
    }
  };

  return (
    <>
      <Draggable
        draggableId={`list-${list.id}`}
        index={index}
        isDragDisabled={!canEdit}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={wrapperClass}
          >
            <div className={headerClass} {...provided.dragHandleProps}>
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {dayNumber ? `Ngày ${dayNumber}` : "Danh sách"}
                  </span>

                  {editingListId === list.id ? (
                    <input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onBlur={handleBlurRename}
                      autoFocus
                      placeholder="Tên ngày (tuỳ chọn)"
                      className="
                        mt-0.5 w-full bg-transparent outline-none
                        text-sm font-medium text-gray-900 dark:text-gray-200
                        border-b border-blue-300/60 focus:border-blue-500
                      "
                    />
                  ) : (
                    list.title && (
                      <button
                        onClick={() => canEdit && setEditingListId(list.id)}
                        className="
                          mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100 
                          text-left truncate hover:text-blue-600 dark:hover:text-blue-400
                        "
                      >
                        {list.title}
                      </button>
                    )
                  )}
                </div>

                <button
                  ref={btnRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveListMenu(
                      activeListMenu === list.id ? null : list.id
                    );
                  }}
                  className="p-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition"
                >
                  <FaEllipsisV className="text-gray-500 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <Droppable
              droppableId={String(list.id)}
              type="card"
              isDropDisabled={!canEdit}
            >
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
                              setConfirmDeleteCard={setConfirmDeleteCard}
                              activeMenu={activeCardMenu}
                              setActiveMenu={setActiveCardMenu}
                              canEdit={canEdit}
                              onOpenActivityModal={onOpenActivityModal}
                              isInTrash={false}
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

            {canEdit && (
              <div className="px-3 pb-3 space-y-2">
                <AnimatePresence initial={false}>
                  {showTypePicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="border border-dashed border-blue-200 dark:border-blue-700/60 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 p-2.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                          Chọn loại hoạt động
                        </span>
                        <button
                          onClick={() => setShowTypePicker(false)}
                          className="p-1 rounded-full hover:bg-blue-100/80 dark:hover:bg-blue-900/60 text-blue-500"
                        >
                          <FaTimes className="text-[10px]" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {ACTIVITY_TYPES.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => handlePickActivityType(type)}
                            className={`
                              group flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-left
                              text-[11px] leading-snug hover:shadow-md hover:-translate-y-0.5
                              transition-all ${type.pillClass}
                            `}
                          >
                            <span className="text-base mt-[1px]">
                              {type.icon}
                            </span>
                            <div className="flex-1">
                              <div className="font-semibold">{type.label}</div>
                              <div className="opacity-80 text-[10px]">
                                {type.description}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!showTypePicker && (
                  <button
                    onClick={() => setShowTypePicker(true)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 
                      px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-xl transition w-full justify-center"
                  >
                    <FaPlus className="text-xs" /> Thêm hoạt động
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Draggable>

      {menu}
    </>
  );
}

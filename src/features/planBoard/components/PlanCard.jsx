import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaCalendarAlt, FaCheck, FaEllipsisV, FaCopy, FaTimes } from "react-icons/fa";

export default function PlanCard({
  card,
  listId,
  toggleDone,
  setActiveCard,
  setEditCard,
  duplicateCard,
  activeMenu,
  setActiveMenu,
  setConfirmDeleteCard,
}) {
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // 📍 Cập nhật vị trí menu theo nút ...
  useEffect(() => {
    if (activeMenu === card.id && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.top + window.scrollY - 10,
        left: rect.right + window.scrollX + 8,
      });
    }
  }, [activeMenu, card.id]);

  // 📍 Đóng menu khi click ra ngoài
  useEffect(() => {
    if (activeMenu !== card.id) return;
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenu, card.id, setActiveMenu]);

  return (
    <div
      className="p-3 rounded-lg mb-2 shadow-sm bg-gray-100 dark:bg-gray-700 cursor-pointer transition hover:shadow-md"
      onClick={() => {
        setActiveCard(card);
        setEditCard({ ...card, listId });
      }}
    >
      {/* 🔹 Nhãn */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.slice(0, 4).map((lbl, idx) => (
            <span
              key={idx}
              className={`${lbl.color} text-[10px] text-white px-2 py-[2px] rounded-md leading-none`}
            >
              {lbl.text}
            </span>
          ))}
          {card.labels.length > 4 && (
            <span className="text-[10px] text-gray-500">
              +{card.labels.length - 4}
            </span>
          )}
        </div>
      )}

      {/* 🔹 Nội dung thẻ */}
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleDone(listId, card.id);
          }}
          className={`w-5 h-5 p-1 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
            card.done
              ? "bg-green-500 text-white border-green-600"
              : "bg-white border-gray-400"
          }`}
        >
          {card.done && <FaCheck className="text-xs" />}
        </button>

        <span
          className={`flex-1 text-sm ${
            card.done ? "text-gray-400" : "text-gray-800 dark:text-gray-100"
          }`}
        >
          {card.text}
        </span>

        <div className="ml-auto">
          <button
            ref={btnRef}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === card.id ? null : card.id);
            }}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
          >
            <FaEllipsisV />
          </button>
        </div>
      </div>

      {/* 🔹 Thời gian */}
      {card.start && card.end && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
          <FaCalendarAlt /> {card.start} → {card.end}
        </div>
      )}

      {/* 🔹 Mức ưu tiên */}
      {card.priority && (
        <div
          className={`text-xs font-medium mt-2 inline-block px-2 py-[2px] rounded ${
            card.priority === "high"
              ? "bg-red-500 text-white"
              : card.priority === "medium"
              ? "bg-yellow-400 text-black"
              : "bg-green-500 text-white"
          }`}
        >
          Ưu tiên:{" "}
          {card.priority === "high"
            ? "Cao"
            : card.priority === "medium"
            ? "Trung bình"
            : "Thấp"}
        </div>
      )}

      {/* 🔹 Menu context */}
      {activeMenu === card.id &&
        createPortal(
          <div
            ref={menuRef}
            className="absolute bg-white dark:bg-gray-700 shadow-md rounded-md w-32 z-[9999]"
            style={{
              position: "absolute",
              top: menuPos.top,
              left: menuPos.left,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateCard(card, listId);
                setActiveMenu(null);
              }}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 gap-2"
            >
              <FaCopy className="text-gray-500" /> Tạo bản sao
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(null);
                setConfirmDeleteCard({ listId, card });
              }}
              className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-700 gap-2"
            >
              <FaTimes className="text-red-500" /> Xóa
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}

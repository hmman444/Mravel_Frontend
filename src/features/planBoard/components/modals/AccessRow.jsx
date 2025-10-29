import { useEffect, useRef } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  FaUserCircle,
  FaChevronDown,
  FaCalendarAlt,
  FaCrown,
  FaTrashAlt,
} from "react-icons/fa";

function AccessRow({
  user,
  activeMenu,
  setActiveMenu,
  onChangeRole,
  onRemoveUser,
  onTransferOwnership,
  onAddExpiry,
}) {
  const open = activeMenu === user.email;
  const roles = ["Người xem", "Người nhận xét", "Người chỉnh sửa"];
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.right - 224, width: 224 }); // 224px ~ w-56
    }
  }, [open]);

  const dropdown = open
    ? createPortal(
        <div
          className="fixed z-[9999] bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg w-56 py-2"
          style={{ top: pos.top, left: pos.left }}
        >
          {roles.map((r) => (
            <div
              key={r}
              onClick={() => onChangeRole(user.email, r)}
              className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                user.role === r ? "text-blue-600 font-medium" : "text-gray-700"
              }`}
            >
              {r}
            </div>
          ))}

          {!user.owner && (
            <>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <div
                onClick={() => onAddExpiry(user.email)}
                className="px-3 py-1.5 text-sm flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700"
              >
                <FaCalendarAlt size={12} /> Thêm ngày hết hạn
              </div>
              <div
                onClick={() => onTransferOwnership(user.email)}
                className="px-3 py-1.5 text-sm flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700"
              >
                <FaCrown size={12} /> Chuyển quyền sở hữu
              </div>
              <div
                onClick={() => onRemoveUser(user.email)}
                className="px-3 py-1.5 text-sm flex items-center gap-2 cursor-pointer hover:bg-red-50 dark:hover:bg-gray-700 text-red-600"
              >
                <FaTrashAlt size={12} /> Xóa quyền truy cập
              </div>
            </>
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <div
      ref={ref}
      className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer relative"
      onClick={() => setActiveMenu(open ? null : user.email)}
    >
      <div className="flex items-center gap-3">
        <FaUserCircle className="text-3xl text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        {user.role}
        <FaChevronDown className="text-gray-400" />
      </div>
      {dropdown}
    </div>
  );
}

export default AccessRow;

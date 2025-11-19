// src/features/planBoard/components/modals/AccessRow.jsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaUserCircle, FaChevronDown, FaTrashAlt } from "react-icons/fa";

export default function AccessRow({
  user,
  activeMenu,
  setActiveMenu,
  onChangeRole,
  onRemoveUser,
  canChangeRole,
  canRemove,
}) {
  // row chủ
  const isOwnerRow = user.owner;
  const hasMenu = (canChangeRole || canRemove) && !isOwnerRow;
  const open = activeMenu === user.email;

  const rowRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [posReady, setPosReady] = useState(false);

  // tính vị trí dropdown
  useEffect(() => {
    if (open && rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      const dropdownWidth = 224;

      setPos({
        top: rect.bottom + 4,
        left: rect.right - dropdownWidth,
      });

      requestAnimationFrame(() => setPosReady(true));
    } else {
      setPosReady(false);
    }
  }, [open]);

  // click outside để đóng dropdown
  useEffect(() => {
    if (!open) return;

    const close = (e) => {
      if (rowRef.current && !rowRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open, setActiveMenu]);

  const handleToggleMenu = () => {
    if (!hasMenu) return; // không có quyền gì thì không mở menu
    setActiveMenu(open ? null : user.email);
  };

  const handleSelectRole = (role) => {
    // Không đổi role nếu không có quyền hoặc user là pending invite
    if (!canChangeRole || user.pending) return;
    if (onChangeRole) onChangeRole(role);
    setActiveMenu(null);
  };

  const handleRemove = () => {
    if (!canRemove) return;
    if (onRemoveUser) onRemoveUser(user);
    setActiveMenu(null);
  };

  // dropdown qua portal
  const dropdown =
    open && posReady
      ? createPortal(
          <div
            className="
              fixed z-[99999]
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-700
              w-56 rounded-xl shadow-lg
              origin-top-right
              transition-all duration-150 ease-out
              opacity-100 scale-100
            "
            style={{ top: pos.top, left: pos.left }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              {/* Chỉ render các option đổi role nếu có quyền đổi và user không pending */}
              {["Người xem", "Người chỉnh sửa"].map((r) => (
                <button
                  key={r}
                  onClick={() => handleSelectRole(r)}
                  disabled={!canChangeRole || user.pending}
                  className={`
                    w-full text-left px-3 py-1.5 text-sm
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition
                    ${
                      user.role === r
                        ? "text-blue-600 font-semibold"
                        : "text-gray-700 dark:text-gray-200"
                    }
                    ${
                      !canChangeRole || user.pending
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }
                  `}
                >
                  {r}
                </button>
              ))}
            </div>

            {canRemove && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                <button
                  onClick={handleRemove}
                  className="
                    w-full text-left px-3 py-1.5 text-sm
                    text-red-600 hover:bg-red-50 dark:hover:bg-gray-800
                    flex items-center gap-2 transition
                  "
                >
                  <FaTrashAlt size={12} />
                  Xóa quyền truy cập
                </button>
              </>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div
        ref={rowRef}
        className="
          flex items-center justify-between
          px-3 py-2 rounded-lg
          hover:bg-gray-50 dark:hover:bg-gray-800
          transition
        "
      >
        {/* info */}
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="text-3xl text-gray-400" />
          )}

          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </p>

            {user.pending && (
              <p className="text-[11px] mt-0.5 text-amber-600 dark:text-amber-300">
                Đã gửi lời mời
              </p>
            )}
          </div>
        </div>

        {/* role */}
        <div>
          {/* chủ */}
          {isOwnerRow && (
            <span
              className="
                px-3 py-1 rounded-full text-xs font-semibold
                bg-amber-100 text-amber-700
                dark:bg-amber-500/10 dark:text-amber-300
              "
            >
              Chủ sở hữu
            </span>
          )}

          {/* k đổi đc role thì là label */}
          {!isOwnerRow && !canChangeRole && (
            <span
              className="
                px-3 py-1 rounded-full text-xs font-medium
                bg-gray-100 text-gray-600
                dark:bg-gray-800 dark:text-gray-300
                select-none
              "
            >
              {user.role}
            </span>
          )}

          {/* có quyền đổi role (owner) - dropdown */}
          {!isOwnerRow && canChangeRole && (
            <button
              onClick={handleToggleMenu}
              className="
                flex items-center gap-1.5 px-2.5 py-1
                rounded-full border border-gray-300 dark:border-gray-700
                text-xs text-gray-700 dark:text-gray-200
                bg-white dark:bg-gray-900
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition
              "
            >
              {user.role}
              <FaChevronDown
                className={`text-[10px] transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>

              </div>

              {dropdown}
            </>
          );
        }

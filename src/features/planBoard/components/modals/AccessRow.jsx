// src/features/planBoard/components/modals/AccessRow.jsx
"use client";

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
    if (!hasMenu) return;
    setActiveMenu(open ? null : user.email);
  };

  const handleSelectRole = (role) => {
    if (!canChangeRole || user.pending) return;
    if (onChangeRole) onChangeRole(role);
    setActiveMenu(null);
  };

  const handleRemove = () => {
    if (!canRemove) return;
    if (onRemoveUser) onRemoveUser(user);
    setActiveMenu(null);
  };

  const dropdown =
    open && posReady
      ? createPortal(
          <div
            className="
              fixed z-[99999]
              bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-700
              w-56 rounded-xl shadow-lg
              origin-top-right
              animate-[fadeDown_0.16s_ease-out]
            "
            style={{ top: pos.top, left: pos.left }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              {["Người xem", "Người chỉnh sửa"].map((r) => (
                <button
                  key={r}
                  onClick={() => handleSelectRole(r)}
                  disabled={!canChangeRole || user.pending}
                  className={`
                    w-full text-left px-3 py-1.5 text-sm
                    hover:bg-slate-100 dark:hover:bg-slate-800
                    ${
                      user.role === r
                        ? "text-blue-600 font-semibold"
                        : "text-slate-700 dark:text-slate-200"
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
                <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
                <button
                  onClick={handleRemove}
                  className="
                    w-full text-left px-3 py-1.5 text-sm
                    text-rose-600 hover:bg-rose-50/80 dark:hover:bg-slate-800
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
          px-3 py-2.5 rounded-xl
          hover:bg-slate-50/90 dark:hover:bg-slate-900/80
          border border-transparent
          transition-all
        "
      >
        {/* info */}
        <div className="flex items-center gap-3 min-w-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover shadow-sm"
            />
          ) : (
            <FaUserCircle className="text-3xl text-slate-400" />
          )}

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {user.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </p>

            {user.pending && (
              <p className="text-[11px] mt-0.5 text-amber-600 dark:text-amber-300">
                Đã gửi lời mời
              </p>
            )}
          </div>
        </div>

        {/* role & actions */}
        <div className="flex items-center gap-2">
          {isOwnerRow && (
            <span
              className="
                px-3 py-1 rounded-full text-[11px] font-semibold
                bg-amber-50 text-amber-700
                dark:bg-amber-500/10 dark:text-amber-300
              "
            >
              Chủ sở hữu
            </span>
          )}

          {!isOwnerRow && !canChangeRole && (
            <span
              className="
                px-3 py-1 rounded-full text-[11px] font-medium
                bg-slate-100 text-slate-600
                dark:bg-slate-800 dark:text-slate-300
                select-none
              "
            >
              {user.role}
            </span>
          )}

          {!isOwnerRow && canChangeRole && (
            <button
              onClick={handleToggleMenu}
              className={`
                flex items-center gap-1.5 px-3 py-1
                rounded-full border text-[11px] font-medium
                ${
                  open
                    ? "border-blue-400 bg-blue-50/80 dark:border-blue-500/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                }
                hover:bg-slate-50 dark:hover:bg-slate-800
                transition
              `}
            >
              {user.role}
              <FaChevronDown
                className={`text-[9px] transition-transform ${
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

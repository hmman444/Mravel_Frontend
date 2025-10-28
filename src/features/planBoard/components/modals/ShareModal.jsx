import { useState } from "react";
import {
  FaTimes,
  FaCopy,
  FaChevronDown,
  FaChevronUp,
  FaUserCircle,
  FaTrashAlt,
  FaCrown,
  FaCalendarAlt,
} from "react-icons/fa";

export default function ShareModal({ isOpen, onClose, planName }) {
  const [phase, setPhase] = useState("default");
  const [emailInput, setEmailInput] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [role, setRole] = useState("editor");
  const [message, setMessage] = useState("");
  const [notify, setNotify] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [linkRole, setLinkRole] = useState("Người chỉnh sửa");
  const [showDropdown, setShowDropdown] = useState(false);
  const [accessList, setAccessList] = useState([
    {
      name: "Do Phu Luan (you)",
      email: "22110372@student.hcmute.edu.vn",
      role: "Chủ sở hữu",
      owner: true,
    },
    {
      name: "22110377@student.hcmute.edu.vn",
      email: "22110377@student.hcmute.edu.vn",
      role: "Người chỉnh sửa",
      owner: false,
    },
  ]);
  const [activeMenu, setActiveMenu] = useState(null);

  if (!isOpen) return null;

  // thêm email mời
  const handleAddEmail = () => {
    const trimmed = emailInput.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!valid) {
      setEmailValid(false);
      return;
    }
    setEmailValid(true);
    setTimeout(() => setPhase("invite"), 150);
  };

  // gửi lời mời
  const handleSend = () => {
    if (!emailInput.trim()) return;
    const newPerson = {
      name: emailInput,
      email: emailInput,
      role:
        role === "editor"
          ? "Người chỉnh sửa"
          : role === "commenter"
          ? "Người nhận xét"
          : "Người xem",
      owner: false,
    };

    setAccessList((prev) => [...prev, newPerson]);
    setPhase("default");
    setEmailInput("");
    setRole("editor");
    setMessage("");
    setNotify(true);
  };

  // copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  // đổi quyền
  const handleChangeRole = (email, newRole) => {
    setAccessList((prev) =>
      prev.map((u) => (u.email === email ? { ...u, role: newRole } : u))
    );
    setActiveMenu(null);
  };

  // xóa quyền truy cập
  const handleRemoveUser = (email) => {
    setAccessList((prev) => prev.filter((u) => u.email !== email));
  };

  // chuyển quyền sở hữu
  const handleTransferOwnership = (email) => {
    setAccessList((prev) =>
      prev.map((u) => ({
        ...u,
        role:
          u.email === email
            ? "Chủ sở hữu"
            : u.role === "Chủ sở hữu"
            ? "Người chỉnh sửa"
            : u.role,
        owner: u.email === email,
      }))
    );
    setActiveMenu(null);
  };

  // thêm ngày hết hạn (demo)
  const handleAddExpiry = (email) => {
    alert(`Chức năng thêm ngày hết hạn cho ${email} (demo)`);
    setActiveMenu(null);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[480px] max-w-[90vw] p-6 relative overflow-hidden transition-all duration-500 ease-in-out">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
        >
          <FaTimes />
        </button>

        <div
          className={`transition-all duration-300 ease-in-out ${
            phase === "default"
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-3 pointer-events-none absolute"
          }`}
        >
          <h2 className="text-xl font-semibold mb-3">
            Chia sẻ “{planName}”
          </h2>

          <input
            type="text"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setEmailValid(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleAddEmail();
            }}
            onBlur={() => {
              const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim());
              if (valid) handleAddEmail();
            }}
            placeholder="Thêm người, nhóm, không gian và sự kiện trên lịch"
            className={`w-full border rounded-md px-3 py-2 mb-4 focus:outline-none transition ${
              emailValid
                ? "focus:ring-2 focus:ring-blue-400"
                : "border-red-500 focus:ring-red-500"
            }`}
          />
          {!emailValid && (
            <p className="text-sm text-red-500 mb-3">
              Email không hợp lệ. Vui lòng nhập lại.
            </p>
          )}

          <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
            Những người có quyền truy cập
          </h3>
          <div className="space-y-2 mb-5">
            {accessList.map((user, idx) => (
              <AccessRow
                key={idx}
                user={user}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                onChangeRole={handleChangeRole}
                onRemoveUser={handleRemoveUser}
                onTransferOwnership={handleTransferOwnership}
                onAddExpiry={handleAddExpiry}
              />
            ))}
          </div>

          <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
            Quyền truy cập chung
          </h3>

          <div className="relative border rounded-lg p-3 mb-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <div
              className="flex items-start justify-between"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-200">
                  Bất kỳ ai có đường liên kết
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ai có liên kết đều có thể {linkRole.toLowerCase()}
                </p>
              </div>
              {showDropdown ? (
                <FaChevronUp className="text-gray-500 mt-1" />
              ) : (
                <FaChevronDown className="text-gray-500 mt-1" />
              )}
            </div>

            {showDropdown && (
              <div className="mt-3 border-t pt-2 space-y-2">
                {["Người xem", "Người chỉnh sửa"].map((r) => (
                  <div
                    key={r}
                    className={`px-3 py-1 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      linkRole === r
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                    onClick={() => {
                      setLinkRole(r);
                      setShowDropdown(false);
                    }}
                  >
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end items-center gap-3 mt-4">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 border rounded-full px-4 py-2 text-blue-600 hover:bg-blue-50 transition"
            >
              <FaCopy />
              {copySuccess ? "Đã sao chép!" : "Sao chép liên kết"}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
              Xong
            </button>
          </div>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out ${
            phase === "invite"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3 pointer-events-none absolute"
          }`}
        >
          <button
            onClick={() => setPhase("default")}
            className="text-blue-600 text-sm mb-3 hover:underline"
          >
            ← Quay lại
          </button>

          <h2 className="text-xl font-semibold mb-3">
            Chia sẻ “{planName}”
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              readOnly
              value={emailInput}
              className="flex-1 border rounded-md px-3 py-2 bg-gray-50 text-gray-700"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border rounded-md px-2 py-2 text-sm cursor-pointer"
            >
              <option value="viewer">Người xem</option>
              <option value="commenter">Người nhận xét</option>
              <option value="editor">Người chỉnh sửa</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 mb-3">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
            />
            Thông báo cho người này
          </label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Lời nhắn"
            className="w-full border rounded-md px-3 py-2 mb-5 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setPhase("default")}
              className="px-4 py-2 rounded-full border text-gray-700 hover:bg-gray-100 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleSend}
              className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Component hàng người truy cập ---- */
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

  return (
    <div className="relative">
      <div
        className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
        onClick={() => setActiveMenu(open ? null : user.email)}
      >
        <div className="flex items-center gap-3">
          <FaUserCircle className="text-3xl text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          {user.role}
          <FaChevronDown className="text-gray-400" />
        </div>
      </div>

      {/* Dropdown quyền */}
      {open && (
        <div className="absolute right-2 top-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg w-56 z-20 py-2">
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
        </div>
      )}
    </div>
  );
}

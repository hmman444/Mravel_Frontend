import { useState } from "react";
import {
  FaTimes,
  FaCopy,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { showSuccess, showError } from "../../../../utils/toastUtils";
import AccessRow from "./AccessRow";
import { usePlanBoard } from "../../hooks/usePlanBoard";
export default function ShareModal({
  isOpen,
  onClose,
  planName,
  planId,
  initialVisibility = "PRIVATE",
}) {
  const [phase, setPhase] = useState("default");
  const [emailInput, setEmailInput] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [role, setRole] = useState("editor");
  const [message, setMessage] = useState("");
  const [notify, setNotify] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [linkRole, setLinkRole] = useState("Người xem");
  const [showDropdown, setShowDropdown] = useState(false);
  const [visibility, setVisibility] = useState(initialVisibility);
  const [activeMenu, setActiveMenu] = useState(null);
  const [accessList, setAccessList] = useState([
    {
      name: "Bạn (Owner)",
      email: "you@example.com",
      role: "Chủ sở hữu",
      owner: true,
    },
  ]);
  const { invite, updateVisibility, removeInvite } = usePlanBoard(planId);

  if (!isOpen) return null;

  /* ---------------------- Xử lý gửi lời mời ---------------------- */
  const handleAddEmail = () => {
    const trimmed = emailInput.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!valid) {
      setEmailValid(false);
      return;
    }
    setEmailValid(true);
    setPhase("invite");
  };

  const handleSend = async () => {
    if (!emailInput.trim()) return;

    try {
      const payload = {
        emails: [emailInput],
        role: role.toUpperCase(),
      };
      await invite(payload);

      setAccessList((prev) => [
        ...prev,
        {
          name: emailInput,
          email: emailInput,
          role:
            role === "editor"
              ? "Người chỉnh sửa"
              : role === "commenter"
              ? "Người nhận xét"
              : "Người xem",
          owner: false,
        },
      ]);

      showSuccess("✅ Đã gửi lời mời chia sẻ!");
      setPhase("default");
      setEmailInput("");
      setRole("editor");
      setMessage("");
      setNotify(true);
    } catch (err) {
      console.error("❌ Invite error:", err);
      showError("Không gửi được lời mời");
    }
  };

  /* ---------------------- Cập nhật hiển thị ---------------------- */
  const handleVisibilityChange = async (value) => {
    try {
      setVisibility(value);
      await updateVisibility(value);
    } catch (err) {
      console.error("❌ Visibility update failed:", err);
      showError("Không thể cập nhật hiển thị");
    }
  };

  /* ---------------------- Sao chép liên kết ---------------------- */
  const handleCopyLink = async () => {
    try {
      const link = `${window.location.origin}/plans/${planId}`;
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  /* ---------------------- Quản lý quyền ---------------------- */
  const handleChangeRole = (email, newRole) => {
    setAccessList((prev) =>
      prev.map((u) => (u.email === email ? { ...u, role: newRole } : u))
    );
    setActiveMenu(null);
  };

  const handleRemoveUser = async (email) => {
    try {
      await removeInvite(email);
      setAccessList((prev) => prev.filter((u) => u.email !== email));
      showSuccess("Đã xóa quyền truy cập");
    } catch {
      showError("Không thể xóa người này");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[480px] max-w-[90vw] max-h-[90vh] flex flex-col relative transition-all duration-500 ease-in-out">
        <div className="overflow-y-auto p-6">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
          >
            <FaTimes />
          </button>

          {/* ----------- PHASE DEFAULT ----------- */}
          {phase === "default" && (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Chia sẻ “{planName}”
              </h2>

              {/* Hiển thị */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Hiển thị:
                </span>
                <select
                  value={visibility}
                  onChange={(e) => handleVisibilityChange(e.target.value)}
                  className="border rounded-md px-2 py-1 dark:bg-gray-800 dark:text-white"
                >
                  <option value="PRIVATE">Riêng tư</option>
                  <option value="FRIENDS">Bạn bè</option>
                  <option value="PUBLIC">Công khai</option>
                </select>
              </div>

              {/* Nhập email */}
              <input
                type="text"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setEmailValid(true);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                placeholder="Thêm người hoặc nhóm"
                className={`w-full border rounded-md px-3 py-2 mb-4 focus:outline-none ${
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

              {/* Danh sách quyền truy cập */}
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
                  />
                ))}
              </div>

              {/* Quyền qua liên kết */}
              {visibility !== "PRIVATE" && (
                <>
                  <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                    Quyền truy cập qua liên kết
                  </h3>

                  <div className="relative border rounded-lg p-3 mb-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <div
                      className="flex items-start justify-between"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          Bất kỳ ai có liên kết
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
                </>
              )}

              {/* Buttons */}
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
            </>
          )}

          {/* ----------- PHASE INVITE ----------- */}
          {phase === "invite" && (
            <div>
              <button
                onClick={() => setPhase("default")}
                className="text-blue-600 text-sm mb-3 hover:underline"
              >
                ← Quay lại
              </button>

              <h2 className="text-xl font-semibold mb-3">
                Mời chia sẻ “{planName}”
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
                Gửi thông báo cho người này
              </label>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Lời nhắn (tuỳ chọn)"
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
          )}
        </div>
      </div>
    </div>
  );
}

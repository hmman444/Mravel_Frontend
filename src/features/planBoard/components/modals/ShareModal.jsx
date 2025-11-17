import { useEffect, useState } from "react";
import { FaTimes, FaCopy } from "react-icons/fa";
import { showSuccess, showError } from "../../../../utils/toastUtils";
import AccessRow from "./AccessRow";
import ConfirmModal from "../../../../components/ConfirmModal";
import { usePlanBoard } from "../../hooks/usePlanBoard";
import VisibilityDropdown from "../VisibilityDropdown"

export default function ShareModal({ isOpen, onClose, planName, planId }) {
  const {
    share,
    loadShare,
    invite,
    updateVisibility,
    updateMemberRole,
    removeMember,
    requests,
    loadRequests,
    decideRequest,
  } = usePlanBoard(planId);

  // UI state
  const [phase, setPhase] = useState("default");
  const [emailInput, setEmailInput] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [inviteRole, setInviteRole] = useState("editor");

  const [visibility, setVisibility] = useState("PRIVATE");
  const [accessList, setAccessList] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);

  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("members");

  // animation flag khi modal vừa mở
  const [mounted, setMounted] = useState(false);

  // Confirm remove
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);

  /* -------------------- Load share + requests -------------------- */
  useEffect(() => {
    if (isOpen) {
      loadShare();
      loadRequests();
      setPhase("default");
      setActiveMenu(null);
      setMounted(true);
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  /* -------------------- Build member list -------------------- */
  useEffect(() => {
    if (!share) return;

    setVisibility(share.visibility);

    const ROLE_UI = {
      OWNER: "Chủ sở hữu",
      EDITOR: "Người chỉnh sửa",
      VIEWER: "Người xem",
    };

    const members = share.members || [];
    const invites = share.invites || [];

    const owner = members.find((m) => m.role === "OWNER");

    const ownerRow = owner
      ? {
          userId: owner.userId,
          name: owner.fullname || owner.email,
          email: owner.email,
          avatar: owner.avatar,
          role: "Chủ sở hữu",
          backendRole: "OWNER",
          owner: true,
          pending: false,
        }
      : null;

    const memberRows = members
      .filter((m) => m.role !== "OWNER")
      .map((m) => ({
        userId: m.userId,
        name: m.fullname || m.email,
        email: m.email,
        avatar: m.avatar,
        role: ROLE_UI[m.role],
        backendRole: m.role,
        owner: false,
        pending: false,
      }));

    const inviteRows = invites.map((inv) => ({
      userId: null,
      name: inv.email,
      email: inv.email,
      avatar: null,
      role: ROLE_UI[inv.role],
      backendRole: inv.role,
      owner: false,
      pending: true,
    }));

    setAccessList([ownerRow, ...memberRows, ...inviteRows].filter(Boolean));
  }, [share]);

  if (!isOpen) return null;

  /* ---------------------- Invite email ---------------------- */
  const handleAddEmail = () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim());
    if (!valid) return setEmailValid(false);
    setEmailValid(true);
    setPhase("invite");
  };

  const handleSendInvite = async () => {
    try {
      await invite({ emails: [emailInput], role: inviteRole.toUpperCase() });
      showSuccess("Đã gửi lời mời!");
      setEmailInput("");
      setInviteRole("editor");
      setPhase("default");
      loadShare();
    } catch {
      showError("Không gửi được lời mời");
    }
  };

  /* ---------------------- Update role ---------------------- */
  const handleChangeRole = async (user, newRoleDisplay) => {
    if (user.pending || user.owner) return;

    const MAP = {
      "Người xem": "VIEWER",
      "Người chỉnh sửa": "EDITOR",
    };

    const backend = MAP[newRoleDisplay];
    if (!backend) return;

    try {
      await updateMemberRole(user.userId, backend);

      setAccessList((prev) =>
        prev.map((u) =>
          u.email === user.email
            ? { ...u, role: newRoleDisplay, backendRole: backend }
            : u
        )
      );

      showSuccess("Đã cập nhật quyền");
    } catch {
      showError("Không thể cập nhật");
    }
  };

  /* ---------------------- Remove member ---------------------- */
  const openRemoveDialog = (u) => {
    setUserToRemove(u);
    setConfirmOpen(true);
  };

  const confirmRemove = async () => {
    try {
      // nếu là invite (userId null) tuỳ backend, ở đây vẫn dùng userId
      await removeMember(userToRemove.userId);
      setAccessList((prev) =>
        prev.filter((u) => u.email !== userToRemove.email)
      );
      showSuccess("Đã xoá người này");
      setConfirmOpen(false);
    } catch {
      showError("Không thể xoá");
    }
  };

  /* ---------------------- Copy link ---------------------- */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/plans/${planId}`
      );
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    } catch {
      // ignore
    }
  };

  /* ---------------------- Visibility change ---------------------- */
  const handleVisibilityChange = async (value) => {
    setVisibility(value); // cho UI phản hồi nhanh + transition
    try {
      await updateVisibility(value);
      showSuccess("Đã cập nhật chế độ hiển thị");
    } catch {
      showError("Không thể cập nhật hiển thị");
      // rollback nếu lỗi
      setVisibility(share?.visibility || "PRIVATE");
    }
  };

  return (
    <>
      {/* OVERLAY + MODAL */}
      <div className="fixed inset-0 z-[2000] flex items-center justify-center">
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />

        {/* modal */}
        <div
          className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[520px] max-w-[90vw] transform transition-all duration-200 ${
            mounted
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-2 scale-95"
          }`}
        >
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              <FaTimes />
            </button>

            {/* ----------------------------- INVITE PHASE ----------------------------- */}
            {phase === "invite" && (
              <>
                <button
                  onClick={() => setPhase("default")}
                  className="text-blue-600 text-sm mb-3 hover:underline"
                >
                  ← Quay lại
                </button>

                <h2 className="text-xl font-semibold mb-4">
                  Mời chia sẻ “{planName}”
                </h2>

                <div className="flex gap-3 mb-5">
                  <input
                    readOnly
                    value={emailInput}
                    className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-sm"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-2 text-sm dark:bg-gray-900"
                  >
                    <option value="viewer">Người xem</option>
                    <option value="editor">Người chỉnh sửa</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setPhase("default")}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSendInvite}
                    className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                  >
                    Gửi lời mời
                  </button>
                </div>
              </>
            )}

            {/* ----------------------------- DEFAULT PHASE ----------------------------- */}
            {phase === "default" && (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  Chia sẻ “{planName}”
                </h2>

                {/* Visibility */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-sm">Hiển thị:</span>
                  <VisibilityDropdown
                    value={visibility}
                    onChange={handleVisibilityChange}
                  />
                </div>

                {/* Invite email */}
                <div className="mb-2">
                  <input
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setEmailValid(true);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                    placeholder="Nhập email để mời"
                    className={`w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 transition-colors ${
                      emailValid ? "" : "border-red-500"
                    }`}
                  />
                  {!emailValid && (
                    <p className="text-xs text-red-500 mt-1">
                      Email không hợp lệ.
                    </p>
                  )}
                </div>

                {/* TABS */}
                <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 mb-4">
                  <button
                    className={`pb-2 text-sm font-medium relative transition-colors duration-150 ${
                      activeTab === "members"
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("members")}
                  >
                    Thành viên lịch trình
                    <span
                      className={`absolute left-0 -bottom-[1px] h-[2px] rounded-full transition-all duration-200 ${
                        activeTab === "members"
                          ? "w-full bg-blue-600"
                          : "w-0 bg-transparent"
                      }`}
                    />
                  </button>

                  <button
                    className={`pb-2 text-sm font-medium relative transition-colors duration-150 ${
                      activeTab === "requests"
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("requests")}
                  >
                    Yêu cầu tham gia ({requests?.length || 0})
                    <span
                      className={`absolute left-0 -bottom-[1px] h-[2px] rounded-full transition-all duration-200 ${
                        activeTab === "requests"
                          ? "w-full bg-blue-600"
                          : "w-0 bg-transparent"
                      }`}
                    />
                  </button>
                </div>

                {/* MEMBERS */}
                {activeTab === "members" && (
                  <div className="space-y-1.5 mb-5 transition-opacity duration-150">
                    {accessList.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Chưa có thành viên nào.
                      </p>
                    )}

                    {accessList.map((u, idx) => (
                      <AccessRow
                        key={idx}
                        user={u}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        onChangeRole={(role) => handleChangeRole(u, role)}
                        onRemoveUser={openRemoveDialog}
                      />
                    ))}
                  </div>
                )}

                {/* REQUESTS */}
                {activeTab === "requests" && (
                  <div className="space-y-3 mb-5 transition-opacity duration-150">
                    {requests?.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Không có yêu cầu nào.
                      </p>
                    )}

                    {requests?.map((r) => (
                      <div
                        key={r.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                      >
                        <p className="font-medium mb-1 text-sm">
                          User ID: {r.userId}
                        </p>
                        <p className="text-xs text-gray-500">
                          Loại:{" "}
                          {r.type === "EDIT"
                            ? "Quyền chỉnh sửa"
                            : "Quyền xem"}
                        </p>

                        <div className="flex justify-end gap-2 mt-3">
                          <button
                            onClick={() => decideRequest(r.id, "REJECT")}
                            className="px-3 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => decideRequest(r.id, "APPROVE")}
                            className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                          >
                            Chấp nhận
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Copy link + Done */}
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FaCopy />
                    {copySuccess ? "Đã sao chép!" : "Sao chép liên kết"}
                  </button>

                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors"
                  >
                    Xong
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {confirmOpen && (
        <ConfirmModal
          open={confirmOpen}
          title="Xoá thành viên"
          message={`Bạn có chắc muốn xoá ${userToRemove?.name}?`}
          confirmText="Xoá"
          onClose={() => setConfirmOpen(false)}
          onConfirm={confirmRemove}
        />
      )}
    </>
  );
}

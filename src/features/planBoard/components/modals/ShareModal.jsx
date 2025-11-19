// src/features/planBoard/components/modals/ShareModal.jsx
import { useEffect, useState } from "react";
import { FaTimes, FaCopy, FaUserCircle } from "react-icons/fa";
import { showSuccess, showError } from "../../../../utils/toastUtils";
import AccessRow from "./AccessRow";
import ConfirmModal from "../../../../components/ConfirmModal";
import VisibilityDropdown from "../VisibilityDropdown";
import { usePlanBoard } from "../../hooks/usePlanBoard";
import LoadingOverlay from "../../../../components/LoadingOverlay";
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
    requestAccess,
    isOwner,
    isEditor,
    isViewer,
    loading,
    actionLoading 
  } = usePlanBoard(planId);

  const canInvite = isOwner;            // chỉ Owner
  const canChangeVisibility = isOwner;  // chỉ Owner
  const canSeeRequests = isOwner;       // chỉ Owner xem/xử lý request

  const currentUserId =
    share?.members?.find((m) => m.isCurrentUser)?.userId ?? null;

  const [phase, setPhase] = useState("default"); // "default" | "invite"
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeTab, setActiveTab] = useState("members");

  const [emailInput, setEmailInput] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [inviteRole, setInviteRole] = useState("editor");

  const [visibility, setVisibility] = useState("PRIVATE");

  const [accessList, setAccessList] = useState([]);

  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);

  const [confirmRequest, setConfirmRequest] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [requestRoles, setRequestRoles] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    loadShare();
    setPhase("default");
    setActiveMenu(null);
    setActiveTab("members");
    setMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !canSeeRequests) return;
    loadRequests();
  }, [isOpen, canSeeRequests]);

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

    const buildDisplayName = (m) => {
      const base = m.fullname || m.email;
      return m.isCurrentUser ? `${base} (Bạn)` : base;
    };

    const owner = members.find((m) => m.role === "OWNER");

    const ownerRow = owner
      ? {
          userId: owner.userId,
          name: buildDisplayName(owner),
          email: owner.email,
          avatar: owner.avatar,
          role: ROLE_UI[owner.role],
          backendRole: owner.role,
          owner: true,
          pending: false,
        }
      : null;

    const memberRows = members
      .filter((m) => m.role !== "OWNER")
      .map((m) => ({
        userId: m.userId,
        name: buildDisplayName(m),
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

  const handleAddEmail = () => {
    if (!canInvite) return;
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim());
    if (!valid) return setEmailValid(false);
    setEmailValid(true);
    setPhase("invite");
  };

  const handleSendInvite = async () => {
    if (!canInvite) return;
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

  const handleChangeRole = async (user, newDisplayRole) => {
    if (user.pending || user.owner) return; // không đổi owner & pending

    const map = {
      "Người xem": "VIEWER",
      "Người chỉnh sửa": "EDITOR",
    };
    const backend = map[newDisplayRole];
    if (!backend) return;

    const isSelf = user.userId && currentUserId && user.userId === currentUserId;

    // viewer k có quyền gì
    if (isViewer) return;

    if (isEditor) {
      if (!isSelf) return;
    }

    // owner
    try {
      await updateMemberRole(user.userId, backend);

      setAccessList((prev) =>
        prev.map((u) =>
          u.email === user.email
            ? { ...u, backendRole: backend, role: newDisplayRole }
            : u
        )
      );
      showSuccess("Đã cập nhật quyền");
    } catch {
      showError("Không thể cập nhật quyền");
    }
  };

  // remove member
  const openRemoveDialog = (u) => {
    setUserToRemove(u);
    setConfirmRemoveOpen(true);
  };

  const confirmRemove = async () => {
    if (!userToRemove) return;

    try {
      await removeMember(userToRemove.userId);
      setAccessList((prev) =>
        prev.filter((m) => m.email !== userToRemove.email)
      );
      showSuccess("Đã xoá thành viên");
      setConfirmRemoveOpen(false);
    } catch {
      showError("Không thể xoá thành viên");
    }
  };

  // visibitity plan
  const handleVisibilityChange = async (value) => {
    if (!canChangeVisibility) return;
    setVisibility(value);
    try {
      await updateVisibility(value);
    } catch {
      setVisibility(share?.visibility || "PRIVATE");
      showError("Không thể cập nhật hiển thị");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/plans/${planId}`
      );
      showSuccess("Đã sao chép liên kết!");
    } catch {
      // ignore
    }
  };

  const handleRequestEdit = async () => {
    try {
      await requestAccess("EDIT");
      showSuccess("Đã gửi yêu cầu quyền chỉnh sửa");
      onClose();
    } catch {
      showError("Lỗi khi gửi yêu cầu quyền chỉnh sửa")
    }
  };

  return (
    <>
      {/* overlay */}
      <div className="fixed inset-0 z-[2000] flex items-center justify-center">
        <div
          className={`
            absolute inset-0 bg-black/40 backdrop-blur-[2px]
            transition-opacity duration-200
            ${mounted ? "opacity-100" : "opacity-0"}
          `}
          onClick={onClose}
        />

        {/* modal */}
        <div
          className={`
            relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl
            w-[520px] max-w-[90vw]
            transform transition-all duration-200
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
          `}
        >
          <LoadingOverlay open={actionLoading} message="Đang xử lý, vui lòng chờ..." />

          <div className="p-6 max-h-[75vh] overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
            >
              <FaTimes />
            </button>

            {/* invite */}
            {phase === "invite" && canInvite && (
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
                    className="
                      flex-1 border rounded-lg px-3 py-2
                      bg-gray-50 dark:bg-gray-800 text-sm
                    "
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="
                      border rounded-lg px-2 py-2 text-sm
                      dark:bg-gray-900
                    "
                  >
                    <option value="viewer">Người xem</option>
                    <option value="editor">Người chỉnh sửa</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setPhase("default")}
                    className="
                      px-4 py-2 border rounded-full text-sm
                      hover:bg-gray-50 dark:hover:bg-gray-800
                    "
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSendInvite}
                    className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
                  >
                    Gửi lời mời
                  </button>
                </div>
              </>
            )}

            {/* default */}
            {phase === "default" && (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  Chia sẻ “{planName}”
                </h2>

                {/* visibitity */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-sm">Hiển thị:</span>
                  <div
                    className={
                      !canChangeVisibility
                        ? "opacity-80 pointer-events-none"
                        : ""
                    }
                  >
                    <VisibilityDropdown
                      value={visibility}
                      onChange={handleVisibilityChange}
                    />
                  </div>
                </div>

                {/* invite email */}
                {canInvite && (
                  <div className="mb-2">
                    <input
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setEmailValid(true);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                      placeholder="Nhập email để mời"
                      className={`
                        w-full border rounded-lg px-3 py-2 text-sm
                        dark:bg-gray-900 dark:border-gray-700
                        ${emailValid ? "" : "border-red-500"}
                      `}
                    />
                    {!emailValid && (
                      <p className="text-xs text-red-500">Email không hợp lệ</p>
                    )}
                  </div>
                )}

                {/* tab */}
                <div className="flex gap-6 border-b mb-4">
                  <button
                    className={`
                      pb-2 text-sm font-medium relative
                      ${
                        activeTab === "members"
                          ? "text-blue-600"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                      }
                    `}
                    onClick={() => setActiveTab("members")}
                  >
                    Thành viên lịch trình
                    {activeTab === "members" && (
                      <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-blue-600" />
                    )}
                  </button>

                  {canSeeRequests && (
                    <button
                      className={`
                        pb-2 text-sm font-medium relative
                        ${
                          activeTab === "requests"
                            ? "text-blue-600"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                        }
                      `}
                      onClick={() => setActiveTab("requests")}
                    >
                      Yêu cầu tham gia ({requests?.length || 0})
                      {activeTab === "requests" && (
                        <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-blue-600" />
                      )}
                    </button>
                  )}
                </div>

                {/* member */}
                {activeTab === "members" && (
                  <div className="space-y-1.5 mb-5">
                    {accessList.map((u, idx) => {
                      const isSelf =
                        u.userId && currentUserId && u.userId === currentUserId;

                      let canChangeRoleRow = false;
                      let canRemoveRow = false;

                      if (isOwner) {
                        if (!u.owner && !u.pending) {
                          canChangeRoleRow = true;
                          canRemoveRow = true;
                        }
                      } else if (isEditor) {
                        if (u.owner) {
                          canChangeRoleRow = false;
                          canRemoveRow = false;
                        } else if (isSelf) {
                          canChangeRoleRow = false;
                          canRemoveRow = false;
                        } else {
                          canChangeRoleRow = false;
                          canRemoveRow = !u.pending;
                        }
                      } else if (isViewer) {
                        canChangeRoleRow = false;
                        canRemoveRow = false;
                      }

                      return (
                        <AccessRow
                          key={idx}
                          user={u}
                          activeMenu={activeMenu}
                          setActiveMenu={setActiveMenu}
                          onChangeRole={(r) => handleChangeRole(u, r)}
                          onRemoveUser={openRemoveDialog}
                          canChangeRole={canChangeRoleRow}
                          canRemove={canRemoveRow}
                        />
                      );
                    })}
                  </div>
                )}

                {/* request */}
                {canSeeRequests && activeTab === "requests" && (
                  <div className="space-y-3 mt-3">
                    {requests?.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Không có yêu cầu nào.
                      </p>
                    )}

                    {requests?.map((r) => (
                      <div
                        key={r.id}
                        className="
                          group relative
                          p-4 border border-gray-200 dark:border-gray-700
                          rounded-xl bg-gray-50 dark:bg-gray-800/40
                          hover:bg-white dark:hover:bg-gray-800
                          hover:shadow-md transition-all
                          flex items-start gap-4
                        "
                      >
                        {/* avt */}
                        <div className="pt-1">
                          {r.avatar ? (
                            <img
                              src={r.avatar}
                              className="w-11 h-11 rounded-full shadow-sm object-cover"
                            />
                          ) : (
                            <FaUserCircle className="text-5xl text-gray-400" />
                          )}
                        </div>

                        {/* info */}
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {r.fullname || r.email}
                          </p>

                          <p className="text-xs text-gray-500">{r.email}</p>

                          <p className="mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                            • Yêu cầu quyền{" "}
                            {r.type === "EDIT" ? "chỉnh sửa" : "xem"}
                          </p>
                        </div>

                        {/* action */}
                        <div className="flex flex-col items-end gap-2 min-w-[140px]">
                          <DropdownRoleRequest
                            requestId={r.id}
                            defaultRole={
                              r.type === "EDIT" ? "EDITOR" : "VIEWER"
                            }
                            selectedRole={requestRoles[r.id]}
                            onChange={(role) =>
                              setRequestRoles((prev) => ({
                                ...prev,
                                [r.id]: role,
                              }))
                            }
                          />

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setConfirmRequest(r);
                                setConfirmAction("REJECT");
                              }}
                              className="
                                px-3 py-1.5 rounded-lg text-xs font-medium
                                bg-gray-200 dark:bg-gray-700
                                hover:bg-gray-300 dark:hover:bg-gray-600
                                transition
                              "
                            >
                              Từ chối
                            </button>

                            <button
                              onClick={async () => {
                                const role =
                                  requestRoles[r.id] ||
                                  (r.type === "EDIT" ? "EDITOR" : "VIEWER");

                                try {
                                  await decideRequest(r.id, "APPROVE", role);
                                  showSuccess(
                                    "Đã chấp nhận yêu cầu truy cập"
                                  );
                                  loadRequests();
                                } catch {
                                  showError("Không thể chấp nhận yêu cầu");
                                }
                              }}
                              className="
                                px-3 py-1.5 rounded-lg text-xs font-medium
                                bg-blue-600 text-white
                                hover:bg-blue-700 transition
                                shadow-sm
                              "
                            >
                              Chấp nhận
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* footer */}
                <div className="flex justify-end gap-3 mt-4">
                  {isViewer && (
                    <button
                      onClick={handleRequestEdit}
                      className="
                        mr-auto px-4 py-2 rounded-full text-sm
                        border border-blue-500 text-blue-600
                        hover:bg-blue-50 dark:hover:bg-blue-900/20
                        disabled:opacity-60 disabled:cursor-not-allowed
                      "
                      disabled={loading}
                    >
                      {loading ? "Đang gửi yêu cầu..." : "Yêu cầu quyền chỉnh sửa"}
                    </button>
                  )}

                  <button
                    onClick={handleCopyLink}
                    className="
                      flex items-center gap-2 border rounded-full px-4 py-2 text-sm
                      hover:bg-gray-50 dark:hover:bg-gray-800
                    "
                  >
                    <FaCopy />
                    Sao chép liên kết
                  </button>

                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 rounded-full text-white text-sm"
                  >
                    Xong
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* remove member */}
      {confirmRemoveOpen && (
        <ConfirmModal
          open={confirmRemoveOpen}
          title="Xoá thành viên"
          message={`Bạn có chắc muốn xoá ${userToRemove?.name}?`}
          confirmText="Xoá"
          onClose={() => setConfirmRemoveOpen(false)}
          onConfirm={confirmRemove}
        />
      )}

      {/* remove request */}
      {confirmRequest && confirmAction === "REJECT" && (
        <ConfirmModal
          open={true}
          title="Từ chối yêu cầu"
          message={`Bạn có chắc muốn TỪ CHỐI yêu cầu ${
            confirmRequest.type === "EDIT" ? "quyền chỉnh sửa" : "quyền xem"
          } của ${confirmRequest.fullname || confirmRequest.email}?`}
          confirmText="Từ chối"
          onClose={() => {
            setConfirmRequest(null);
            setConfirmAction(null);
          }}
          onConfirm={async () => {
            const role =
              requestRoles[confirmRequest.id] ||
              (confirmRequest.type === "EDIT" ? "EDITOR" : "VIEWER");

            await decideRequest(confirmRequest.id, "REJECT", role);
            setConfirmRequest(null);
            setConfirmAction(null);
            loadRequests();
          }}
        />
      )}

    </>
  );
}

function DropdownRoleRequest({ defaultRole, selectedRole, onChange }) {
  const [open, setOpen] = useState(false);

  const role = selectedRole || defaultRole;

  const LABEL = {
    VIEWER: "Quyền xem",
    EDITOR: "Quyền chỉnh sửa",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center justify-between gap-2
          px-3 py-1.5 text-xs font-medium
          rounded-full border border-gray-300 dark:border-gray-700
          bg-white dark:bg-gray-900
          text-gray-700 dark:text-gray-200
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition-all
          min-w-[130px]
        "
      >
        {LABEL[role]}

        <span
          className={`text-[10px] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          className="
            absolute right-0 mt-2 w-40 z-[9999]
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-lg
            animate-[fadeDown_0.18s_ease-out]
            origin-top
          "
        >
          <button
            onClick={() => {
              onChange("VIEWER");
              setOpen(false);
            }}
            className={`
              w-full text-left px-4 py-2 text-sm
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition
              ${role === "VIEWER" ? "text-blue-600 font-semibold" : ""}
            `}
          >
            Quyền xem
          </button>

          <button
            onClick={() => {
              onChange("EDITOR");
              setOpen(false);
            }}
            className={`
              w-full text-left px-4 py-2 text-sm
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition
              ${role === "EDITOR" ? "text-blue-600 font-semibold" : ""}
            `}
          >
            Quyền chỉnh sửa
          </button>
        </div>
      )}
    </div>
  );
}

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
    actionLoading,
  } = usePlanBoard(planId);

  const canInvite = isOwner;
  const canChangeVisibility = isOwner;
  const canSeeRequests = isOwner;

  const currentUserId =
    share?.members?.find((m) => m.isCurrentUser)?.userId ?? null;

  const [phase, setPhase] = useState("default");
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

    const buildName = (m) =>
      m.isCurrentUser ? `${m.fullname || m.email} (Bạn)` : m.fullname || m.email;

    const owner = share.members.find((m) => m.role === "OWNER");

    const ownerRow = owner
      ? {
          ...owner,
          name: buildName(owner),
          role: ROLE_UI[owner.role],
          owner: true,
          pending: false,
        }
      : null;

    const memberRows = share.members
      .filter((m) => m.role !== "OWNER")
      .map((m) => ({
        ...m,
        name: buildName(m),
        role: ROLE_UI[m.role],
        owner: false,
        pending: false,
      }));

    const inviteRows = share.invites.map((i) => ({
      ...i,
      name: i.email,
      pending: true,
      owner: false,
      role: ROLE_UI[i.role],
    }));

    setAccessList([ownerRow, ...memberRows, ...inviteRows].filter(Boolean));
  }, [share]);

  if (!isOpen) return null;

  const handleAddEmail = () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim());
    if (!valid) return setEmailValid(false);
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

  const handleChangeRole = async (user, newDisplayRole) => {
    if (user.pending || user.owner) return;

    const map = { "Người xem": "VIEWER", "Người chỉnh sửa": "EDITOR" };
    const backend = map[newDisplayRole];
    if (!backend) return;

    if (isViewer) return;

    if (isEditor && user.userId !== currentUserId) return;

    try {
      await updateMemberRole(user.userId, backend);
      setAccessList((prev) =>
        prev.map((u) =>
          u.email === user.email ? { ...u, role: newDisplayRole } : u
        )
      );
      showSuccess("Đã cập nhật quyền");
    } catch {
      showError("Không thể cập nhật quyền");
    }
  };

  const openRemoveDialog = (u) => {
    setUserToRemove(u);
    setConfirmRemoveOpen(true);
  };

  const confirmRemove = async () => {
    try {
      await removeMember(userToRemove.userId);
      setAccessList((x) => x.filter((u) => u.email !== userToRemove.email));
      showSuccess("Đã xoá thành viên");
      setConfirmRemoveOpen(false);
    } catch {
      showError("Không thể xoá thành viên");
    }
  };

  const handleVisibilityChange = async (v) => {
    setVisibility(v);
    try {
      await updateVisibility(v);
    } catch {
      setVisibility(share.visibility);
      showError("Không thể cập nhật hiển thị");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/plans/${planId}`
      );
      showSuccess("Đã sao chép liên kết!");
    } catch {}
  };

  const handleRequestEdit = async () => {
    try {
      await requestAccess("EDIT");
      showSuccess("Đã gửi yêu cầu quyền chỉnh sửa");
      onClose();
    } catch {
      showError("Lỗi khi gửi yêu cầu");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center">
        <div
          className={`
            absolute inset-0 bg-black/40 backdrop-blur-[3px]
            transition-opacity duration-200
            ${mounted ? "opacity-100" : "opacity-0"}
          `}
          onClick={onClose}
        />

        <div
          className={`
            relative rounded-2xl bg-white/95 dark:bg-gray-900/95
            shadow-[0_15px_45px_rgba(0,0,0,0.18)]
            border border-gray-200/60 dark:border-gray-700/60
            backdrop-blur-xl
            w-[520px] max-w-[90vw]
            transform transition-all duration-200
            ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"}
          `}
        >
          <LoadingOverlay open={actionLoading} message="Đang xử lý..." />

          <div className="p-6 max-h-[76vh] overflow-y-auto">

            <button
              onClick={onClose}
              className="
                absolute top-3 right-3 p-2 rounded-full
                bg-gray-200/70 dark:bg-gray-700/70
                text-gray-600 dark:text-gray-300
                hover:bg-red-500 hover:text-white transition
              "
            >
              <FaTimes size={14} />
            </button>

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
                    className="
                      flex-1 border rounded-xl px-3 py-2
                      bg-gray-50 dark:bg-gray-800 shadow-sm text-sm
                    "
                  />

                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="
                      border rounded-xl px-3 py-2 text-sm
                      bg-white/80 dark:bg-gray-900/80 shadow-sm
                    "
                  >
                    <option value="viewer">Người xem</option>
                    <option value="editor">Người chỉnh sửa</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setPhase("default")}
                    className="
                      px-4 py-2 rounded-xl text-sm border
                      hover:bg-gray-50 dark:hover:bg-gray-800
                    "
                  >
                    Hủy
                  </button>

                  <button
                    onClick={handleSendInvite}
                    className="
                      px-4 py-2 rounded-xl text-sm
                      bg-gradient-to-r from-blue-500 to-indigo-500
                      text-white shadow hover:brightness-110
                    "
                  >
                    Gửi lời mời
                  </button>
                </div>
              </>
            )}

            {phase === "default" && (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  Chia sẻ “{planName}”
                </h2>

                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                    Hiển thị:
                  </span>

                  <div className={!canChangeVisibility ? "opacity-60" : ""}>
                    <VisibilityDropdown
                      value={visibility}
                      onChange={handleVisibilityChange}
                    />
                  </div>
                </div>

                {canInvite && (
                  <div className="mb-3">
                    <input
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setEmailValid(true);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                      placeholder="Nhập email để mời"
                      className={`
                        w-full px-4 py-2 rounded-xl shadow-sm text-sm
                        bg-white/80 dark:bg-gray-900/80 border
                        ${
                          emailValid
                            ? "border-gray-300 dark:border-gray-700"
                            : "border-red-500"
                        }
                      `}
                    />

                    {!emailValid && (
                      <p className="text-xs text-red-500 mt-1">
                        Email không hợp lệ
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-6 border-b mb-4">
                  <button
                    onClick={() => setActiveTab("members")}
                    className={`
                      pb-3 text-sm font-medium relative
                      ${
                        activeTab === "members"
                          ? "text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }
                    `}
                  >
                    Thành viên lịch trình
                    {activeTab === "members" && (
                      <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-blue-600" />
                    )}
                  </button>

                  {canSeeRequests && (
                    <button
                      onClick={() => setActiveTab("requests")}
                      className={`
                        pb-3 text-sm font-medium relative
                        ${
                          activeTab === "requests"
                            ? "text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }
                      `}
                    >
                      Yêu cầu ({requests?.length || 0})
                      {activeTab === "requests" && (
                        <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-blue-600" />
                      )}
                    </button>
                  )}
                </div>

                {activeTab === "members" && (
                  <div className="space-y-2 mb-5">
                    {accessList.map((u, i) => {
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
                        if (!u.owner && !isSelf) {
                          canRemoveRow = !u.pending;
                        }
                      }

                      return (
                        <AccessRow
                          key={i}
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

                {activeTab === "requests" && (
                  <div className="space-y-3 mt-2">
                    {requests?.length === 0 && (
                      <p className="text-sm text-gray-500">Không có yêu cầu nào.</p>
                    )}

                    {requests?.map((r) => (
                      <div
                        key={r.id}
                        className="
                          p-4 rounded-xl border shadow-sm
                          bg-white/80 dark:bg-gray-800/60
                          border-gray-200 dark:border-gray-700
                          flex items-start gap-4
                          hover:shadow-md hover:bg-white dark:hover:bg-gray-800
                          transition-all
                        "
                      >
                        <div className="pt-1">
                          {r.avatar ? (
                            <img
                              src={r.avatar}
                              className="w-11 h-11 rounded-full shadow object-cover"
                            />
                          ) : (
                            <FaUserCircle className="text-5xl text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {r.fullname || r.email}
                          </p>
                          <p className="text-xs text-gray-500">{r.email}</p>
                          <p className="mt-1 text-[11px] text-blue-600 font-medium">
                            • Yêu cầu quyền {r.type === "EDIT" ? "chỉnh sửa" : "xem"}
                          </p>
                        </div>

                        <RequestAction
                          request={r}
                          requestRoles={requestRoles}
                          setRequestRoles={setRequestRoles}
                          decideRequest={decideRequest}
                          loadRequests={loadRequests}
                          setConfirmRequest={setConfirmRequest}
                          setConfirmAction={setConfirmAction}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-5">
                  {isViewer && (
                    <button
                      onClick={handleRequestEdit}
                      disabled={loading}
                      className="
                        mr-auto px-4 py-2 rounded-xl text-sm
                        border border-blue-500 text-blue-600
                        hover:bg-blue-50 dark:hover:bg-blue-900/20
                      "
                    >
                      {loading ? "Đang gửi yêu cầu..." : "Yêu cầu quyền chỉnh sửa"}
                    </button>
                  )}

                  <button
                    onClick={handleCopyLink}
                    className="
                      px-4 py-2 rounded-xl text-sm border
                      flex items-center gap-2 shadow-sm
                      bg-white/80 dark:bg-gray-900/80
                      hover:bg-gray-50 dark:hover:bg-gray-800
                    "
                  >
                    <FaCopy />
                    Sao chép liên kết
                  </button>

                  <button
                    onClick={onClose}
                    className="
                      px-4 py-2 rounded-xl text-sm
                      bg-gradient-to-r from-blue-500 to-indigo-500
                      text-white shadow hover:brightness-110
                    "
                  >
                    Xong
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

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

      {confirmRequest && confirmAction === "REJECT" && (
        <ConfirmModal
          open
          title="Từ chối yêu cầu"
          message={`Từ chối yêu cầu ${
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

function RequestAction({
  request,
  requestRoles,
  setRequestRoles,
  decideRequest,
  loadRequests,
  setConfirmRequest,
  setConfirmAction,
}) {
  const [roleOpen, setRoleOpen] = useState(false);

  const currentRole =
    requestRoles[request.id] ||
    (request.type === "EDIT" ? "EDITOR" : "VIEWER");

  const ROLE_LABEL = {
    VIEWER: "Quyền xem",
    EDITOR: "Quyền chỉnh sửa",
  };

  return (
    <div className="flex flex-col items-end gap-2 min-w-[150px] relative">
      <button
        onClick={() => setRoleOpen(!roleOpen)}
        className="
          px-3 py-1.5 rounded-xl text-xs font-medium w-full
          bg-white/80 dark:bg-gray-900/80
          border border-gray-300 dark:border-gray-700
          shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800
          flex items-center justify-between
        "
      >
        {ROLE_LABEL[currentRole]}
        <span className={`text-[10px] ${roleOpen ? "rotate-180" : ""}`}>▼</span>
      </button>

      {roleOpen && (
        <div
          className="
            absolute right-0 mt-2 w-full z-[9999]
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-lg
            animate-[fadeDown_0.18s_ease-out]
          "
        >
          <button
            onClick={() => {
              setRequestRoles((x) => ({ ...x, [request.id]: "VIEWER" }));
              setRoleOpen(false);
            }}
            className={`
              w-full text-left px-4 py-2 text-sm rounded-t-xl
              hover:bg-gray-100 dark:hover:bg-gray-800
              ${currentRole === "VIEWER" ? "text-blue-600 font-semibold" : ""}
            `}
          >
            Quyền xem
          </button>

          <button
            onClick={() => {
              setRequestRoles((x) => ({ ...x, [request.id]: "EDITOR" }));
              setRoleOpen(false);
            }}
            className={`
              w-full text-left px-4 py-2 text-sm rounded-b-xl
              hover:bg-gray-100 dark:hover:bg-gray-800
              ${currentRole === "EDITOR" ? "text-blue-600 font-semibold" : ""}
            `}
          >
            Quyền chỉnh sửa
          </button>
        </div>
      )}

      <div className="flex gap-2 w-full justify-end">
        <button
          onClick={() => {
            setConfirmRequest(request);
            setConfirmAction("REJECT");
          }}
          className="
            px-3 py-1.5 rounded-xl text-xs font-medium
            bg-gray-200/80 dark:bg-gray-700/70
            hover:bg-gray-300 dark:hover:bg-gray-600
          "
        >
          Từ chối
        </button>

        <button
          onClick={async () => {
            try {
              await decideRequest(request.id, "APPROVE", currentRole);
              showSuccess("Đã chấp nhận yêu cầu");
              loadRequests();
            } catch {
              showError("Không thể chấp nhận yêu cầu");
            }
          }}
          className="
            px-3 py-1.5 rounded-xl text-xs font-medium
            bg-gradient-to-r from-blue-500 to-indigo-500
            text-white shadow hover:brightness-110
          "
        >
          Chấp nhận
        </button>
      </div>
    </div>
  );
}

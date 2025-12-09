// src/features/planBoard/components/modals/ShareModal.jsx
"use client";

import { useEffect, useState } from "react";
import {
  FaTimes,
  FaCopy,
  FaUserCircle,
  FaShareAlt,
} from "react-icons/fa";
import { showSuccess, showError } from "../../../../utils/toastUtils";
import AccessRow from "./AccessRow";
import ConfirmModal from "../../../../components/ConfirmModal";
import VisibilityDropdown from "./VisibilityDropdown";
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
      showError("Lỗi khi gửi yêu cầu");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center">
        {/* overlay */}
        <div
          className={`
            absolute inset-0 bg-black/45 backdrop-blur-[3px]
            transition-opacity duration-200
            ${mounted ? "opacity-100" : "opacity-0"}
          `}
          onClick={onClose}
        />

        {/* modal */}
        <div
          className={`
            relative rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50
            dark:from-slate-900 dark:via-slate-950 dark:to-slate-900
            shadow-[0_18px_50px_rgba(15,23,42,0.4)]
            border border-white/60 dark:border-slate-700/70
            backdrop-blur-xl
            w-[540px] max-w-[92vw]
            transform transition-all duration-200
            ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"}
          `}
        >
          <LoadingOverlay open={actionLoading} message="Đang xử lý..." />

          {/* Close button */}
          <button
            onClick={onClose}
            className="
              absolute top-3 right-3 p-2 rounded-full
              bg-slate-100/90 dark:bg-slate-800/80
              text-slate-600 dark:text-slate-300
              hover:bg-rose-500 hover:text-white
              shadow-sm hover:shadow-md
              transition
            "
          >
            <FaTimes size={14} />
          </button>

          <div className="p-6 max-h-[78vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300/80 scrollbar-track-transparent dark:scrollbar-thumb-slate-700/80">
            {/* HEADER TITLE */}
            {phase === "default" && (
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                  <FaShareAlt />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    Chia sẻ lịch trình
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {planName}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Quản lý quyền truy cập, hiển thị và lời mời tham gia lịch trình.
                  </p>
                </div>
              </div>
            )}

            {phase === "invite" && (
              <div className="mb-5">
                <button
                  onClick={() => setPhase("default")}
                  className="text-xs text-blue-600 hover:text-blue-500 flex items-center gap-1 mb-3"
                >
                  <span className="text-base leading-none">←</span>
                  <span>Quay lại chia sẻ</span>
                </button>

                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  Mời tham gia “{planName}”
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Xác nhận email &amp; chọn quyền trước khi gửi lời mời.
                </p>

                <div className="space-y-3 mb-4">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Email được mời
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      readOnly
                      value={emailInput}
                      className="
                        flex-1 border rounded-xl px-3 py-2 text-sm
                        bg-slate-50 dark:bg-slate-900/80
                        border-slate-200 dark:border-slate-700
                        shadow-sm
                      "
                    />

                    <div className="flex items-center gap-2">
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="
                          border rounded-xl px-3 py-2 text-sm
                          bg-white/90 dark:bg-slate-900/90
                          border-slate-200 dark:border-slate-700
                          shadow-sm
                        "
                      >
                        <option value="viewer">Người xem</option>
                        <option value="editor">Người chỉnh sửa</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setPhase("default")}
                    className="
                      px-4 py-2 rounded-xl text-sm
                      border border-slate-200 dark:border-slate-700
                      text-slate-600 dark:text-slate-200
                      bg-white/80 dark:bg-slate-900/80
                      hover:bg-slate-50 dark:hover:bg-slate-800
                      transition
                    "
                  >
                    Hủy
                  </button>

                  <button
                    onClick={handleSendInvite}
                    className="
                      px-4 py-2 rounded-xl text-sm font-semibold
                      bg-gradient-to-r from-blue-500 to-indigo-500
                      text-white shadow-md hover:shadow-lg hover:brightness-110
                      transition
                    "
                  >
                    Gửi lời mời
                  </button>
                </div>
              </div>
            )}

            {phase === "default" && (
              <>
                {/* VISIBILITY + INVITE */}
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 p-3 mb-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Quyền hiển thị
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ai có thể tìm và xem lịch trình này.
                      </span>
                    </div>

                    <div className={!canChangeVisibility ? "opacity-60" : ""}>
                      <VisibilityDropdown
                        value={visibility}
                        onChange={handleVisibilityChange}
                      />
                    </div>
                  </div>

                  {canInvite && (
                    <div className="mt-2">
                      <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                        Mời bằng email
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                          <input
                            value={emailInput}
                            onChange={(e) => {
                              setEmailInput(e.target.value);
                              setEmailValid(true);
                            }}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddEmail()
                            }
                            placeholder="Nhập email người được mời..."
                            className={`
                              w-full px-4 py-2.5 rounded-xl text-sm
                              bg-slate-50/90 dark:bg-slate-900/80
                              border
                              ${
                                emailValid
                                  ? "border-slate-200 dark:border-slate-700"
                                  : "border-rose-500"
                              }
                              shadow-sm focus:outline-none focus:ring-[1.5px]
                              focus:ring-blue-400/80
                            `}
                          />
                          {!emailValid && (
                            <p className="text-[11px] text-rose-500 mt-1">
                              Email không hợp lệ.
                            </p>
                          )}
                        </div>

                        <button
                          onClick={handleAddEmail}
                          disabled={!emailInput.trim()}
                          className="
                            px-4 py-2.5 rounded-xl text-sm font-medium
                            bg-gradient-to-r from-blue-500 to-indigo-500
                            text-white shadow-sm hover:shadow-md
                            hover:brightness-110 active:scale-[0.98]
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition
                          "
                        >
                          Mời
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* TABS */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="inline-flex rounded-full bg-slate-100/90 dark:bg-slate-900/80 p-1">
                    <button
                      onClick={() => setActiveTab("members")}
                      className={`
                        px-3.5 py-1.5 rounded-full text-xs font-medium
                        transition-all
                        ${
                          activeTab === "members"
                            ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        }
                      `}
                    >
                      Thành viên ({accessList.length})
                    </button>

                    {canSeeRequests && (
                      <button
                        onClick={() => setActiveTab("requests")}
                        className={`
                          px-3.5 py-1.5 rounded-full text-xs font-medium
                          transition-all
                          ${
                            activeTab === "requests"
                              ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm"
                              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                          }
                        `}
                      >
                        Yêu cầu
                        {requests?.length ? (
                          <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-rose-500 text-[10px] text-white">
                            {requests.length}
                          </span>
                        ) : null}
                      </button>
                    )}
                  </div>
                </div>

                {/* MEMBERS TAB */}
                {activeTab === "members" && (
                  <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 p-2.5 space-y-1.5 mb-5">
                    {accessList.length === 0 && (
                      <div className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
                        Chưa có thành viên nào khác ngoài bạn.
                      </div>
                    )}

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

                {/* REQUESTS TAB */}
                {activeTab === "requests" && (
                  <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 p-3 space-y-3 mb-5">
                    {requests?.length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Không có yêu cầu nào.
                      </p>
                    )}

                    {requests?.map((r) => (
                      <div
                        key={r.id}
                        className="
                          p-3.5 rounded-xl border
                          bg-slate-50/90 dark:bg-slate-900/70
                          border-slate-200 dark:border-slate-700
                          flex items-start gap-3.5
                          hover:shadow-md hover:bg-white dark:hover:bg-slate-900
                          transition-all
                        "
                      >
                        <div className="pt-0.5">
                          {r.avatar ? (
                            <img
                              src={r.avatar}
                              className="w-10 h-10 rounded-full shadow object-cover"
                            />
                          ) : (
                            <FaUserCircle className="text-4xl text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {r.fullname || r.email}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {r.email}
                          </p>
                          <p className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                            <span className="text-[10px]">•</span>
                            Yêu cầu quyền{" "}
                            {r.type === "EDIT" ? "chỉnh sửa" : "xem"}
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

                {/* FOOTER ACTIONS */}
                <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-slate-200/70 dark:border-slate-800">
                  {isViewer && (
                    <button
                      onClick={handleRequestEdit}
                      disabled={loading}
                      className="
                        mr-auto px-4 py-2 rounded-xl text-xs sm:text-sm
                        border border-blue-500/80 text-blue-600 dark:text-blue-400
                        bg-blue-50/60 dark:bg-blue-900/10
                        hover:bg-blue-100 dark:hover:bg-blue-900/30
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition
                      "
                    >
                      {loading ? "Đang gửi yêu cầu..." : "Yêu cầu quyền chỉnh sửa"}
                    </button>
                  )}

                  <button
                    onClick={handleCopyLink}
                    className="
                      px-4 py-2 rounded-xl text-xs sm:text-sm
                      border border-slate-200 dark:border-slate-700
                      flex items-center gap-2 shadow-sm
                      bg-white/85 dark:bg-slate-900/80
                      text-slate-700 dark:text-slate-200
                      hover:bg-slate-50 dark:hover:bg-slate-800
                      transition
                    "
                  >
                    <FaCopy />
                    Sao chép liên kết
                  </button>

                  <button
                    onClick={onClose}
                    className="
                      px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold
                      bg-gradient-to-r from-blue-500 to-indigo-500
                      text-white shadow-md hover:shadow-lg
                      hover:brightness-110 active:scale-[0.98]
                      transition
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
    <div className="flex flex-col items-end gap-2 min-w-[160px] relative">
      {/* dropdown chọn role duyệt */}
      <button
        onClick={() => setRoleOpen(!roleOpen)}
        className="
          px-3 py-1.5 rounded-xl text-[11px] font-medium w-full
          bg-white/90 dark:bg-slate-900/90
          border border-slate-200 dark:border-slate-700
          shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800
          flex items-center justify-between
          transition
        "
      >
        {ROLE_LABEL[currentRole]}
        <span
          className={`text-[9px] transition-transform ${
            roleOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {roleOpen && (
        <div
          className="
            absolute right-0 mt-1.5 w-full z-[9999]
            bg-white dark:bg-slate-900
            border border-slate-200 dark:border-slate-700
            rounded-xl shadow-lg overflow-hidden
          "
        >
          <button
            onClick={() => {
              setRequestRoles((x) => ({ ...x, [request.id]: "VIEWER" }));
              setRoleOpen(false);
            }}
            className={`
              w-full text-left px-4 py-2 text-xs
              hover:bg-slate-100 dark:hover:bg-slate-800
              ${
                currentRole === "VIEWER"
                  ? "text-blue-600 font-semibold"
                  : "text-slate-700 dark:text-slate-200"
              }
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
              w-full text-left px-4 py-2 text-xs
              hover:bg-slate-100 dark:hover:bg-slate-800
              ${
                currentRole === "EDITOR"
                  ? "text-blue-600 font-semibold"
                  : "text-slate-700 dark:text-slate-200"
              }
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
            px-3 py-1.5 rounded-xl text-[11px] font-medium
            bg-slate-100/90 dark:bg-slate-800/80
            text-slate-600 dark:text-slate-200
            hover:bg-slate-200 dark:hover:bg-slate-700
            transition
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
            px-3 py-1.5 rounded-xl text-[11px] font-semibold
            bg-gradient-to-r from-blue-500 to-indigo-500
            text-white shadow-sm hover:shadow-md
            hover:brightness-110 active:scale-[0.98]
            transition
          "
        >
          Chấp nhận
        </button>
      </div>
    </div>
  );
}

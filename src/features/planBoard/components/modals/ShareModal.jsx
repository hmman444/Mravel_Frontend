// src/features/planBoard/components/modals/ShareModal.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaTimes, FaCopy, FaUserCircle, FaShareAlt } from "react-icons/fa";
import { showSuccess, showError } from "../../../../utils/toastUtils";
import AccessRow from "./AccessRow";
import ConfirmModal from "../../../../components/ConfirmModal";
import VisibilityDropdown from "./VisibilityDropdown";
import { usePlanBoard } from "../../hooks/usePlanBoard";
import LoadingOverlay from "../../../../components/LoadingOverlay";

export default function ShareModal({ isOpen, onClose, planName, planId }) {
  const { t } = useTranslation();
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

  //  guest = xem được board nhưng không phải member (myRole = null)
  const isGuestViewer = !isOwner && !isEditor && !isViewer;

  // Quyền trong modal (giống PlanDashboardPage: chỉ member mới sửa)
  const canInvite = isOwner; // chỉ owner mới invite
  const canChangeVisibility = isOwner; // chỉ owner đổi visibility
  const canSeeRequests = isOwner; // chỉ owner xem requests
  const canManageMembers = isOwner || isEditor; // editor có thể remove (tuỳ logic row)

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

  //  nếu BE không cho guest gọi shareInfo -> fallback modal vẫn chạy
  const [shareError, setShareError] = useState(null);

  const currentUserId = useMemo(() => {
    return share?.members?.find((m) => m.isCurrentUser)?.userId ?? null;
  }, [share]);

  useEffect(() => {
    if (!isOpen) return;

    setPhase("default");
    setActiveMenu(null);
    setActiveTab("members");
    setMounted(true);
    setShareError(null);

    // load share info (có thể fail 403 nếu BE chặn guest)
    (async () => {
      try {
        await loadShare();
      } catch (e) {
        setShareError(e);
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !canSeeRequests) return;
    loadRequests();
  }, [isOpen, canSeeRequests]);

  useEffect(() => {
    if (!share) return;

    setVisibility(share.visibility);

    const ROLE_UI = {
      OWNER: t("plan.share.role_owner"),
      EDITOR: t("plan.share.role_editor"),
      VIEWER: t("plan.share.role_viewer"),
    };

    const buildName = (m) =>
      m.isCurrentUser
        ? `${m.fullname || m.email} ${t("plan.share.you_suffix")}`
        : m.fullname || m.email;

    const owner = share.members?.find((m) => m.role === "OWNER");

    const ownerRow = owner
      ? {
          ...owner,
          name: buildName(owner),
          role: ROLE_UI[owner.role],
          owner: true,
          pending: false,
        }
      : null;

    const memberRows = (share.members || [])
      .filter((m) => m.role !== "OWNER")
      .map((m) => ({
        ...m,
        name: buildName(m),
        role: ROLE_UI[m.role],
        owner: false,
        pending: false,
      }));

    const inviteRows = (share.invites || []).map((i) => ({
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
      showSuccess(t("plan.share.invite_sent"));
      setEmailInput("");
      setInviteRole("editor");
      setPhase("default");
      loadShare();
    } catch {
      /* surfaced by usePlanBoard tryCall */
    }
  };

  const handleChangeRole = async (user, newDisplayRole) => {
    if (!canManageMembers) return;
    if (user.pending || user.owner) return;

    const map = {
      [t("plan.share.role_viewer")]: "VIEWER",
      [t("plan.share.role_editor")]: "EDITOR",
    };
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
      showSuccess(t("plan.share.role_updated"));
    } catch {
      /* surfaced by usePlanBoard tryCall */
    }
  };

  const openRemoveDialog = (u) => {
    if (!canManageMembers) return;
    setUserToRemove(u);
    setConfirmRemoveOpen(true);
  };

  const confirmRemove = async () => {
    try {
      await removeMember(userToRemove.userId);
      setAccessList((x) => x.filter((u) => u.email !== userToRemove.email));
      showSuccess(t("plan.share.member_removed"));
      setConfirmRemoveOpen(false);
    } catch {
      /* surfaced by usePlanBoard tryCall */
    }
  };

  const handleVisibilityChange = async (v) => {
    if (!canChangeVisibility) return;
    setVisibility(v);
    try {
      await updateVisibility(v);
    } catch {
      // revert optimistic UI; error already surfaced by usePlanBoard tryCall
      setVisibility(share?.visibility || "PRIVATE");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/plans/${planId}`
      );
      showSuccess(t("plan.share.link_copied"));
    } catch {
      // ignore
    }
  };

  const handleRequestView = async () => {
    try {
      await requestAccess("VIEW");
      onClose();
    } catch {
      showError(t("plan.share.request_failed"));
    }
  };

  const handleRequestEdit = async () => {
    try {
      await requestAccess("EDIT");
      onClose();
    } catch {
      showError(t("plan.share.request_failed"));
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
          <LoadingOverlay open={actionLoading} message={t("common.processing")} />

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
            {/* HEADER */}
            {phase === "default" && (
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                  <FaShareAlt />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    {t("plan.share.title")}
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {planName}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t("plan.share.subtitle")}
                  </p>
                </div>
              </div>
            )}

            {/*  Banner chế độ chỉ xem (guest) */}
            {phase === "default" && isGuestViewer && (
              <div className="mb-4 rounded-xl border border-amber-200/70 dark:border-amber-500/20 bg-amber-50/80 dark:bg-amber-900/10 p-3">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  {t("plan.share.guest_banner_title")}
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-200/70 mt-1">
                  {t("plan.share.guest_banner_desc")}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={handleRequestView}
                    className="
                      px-3.5 py-2 rounded-xl text-xs font-semibold
                      bg-gradient-to-r from-blue-500 to-indigo-500
                      text-white shadow-sm hover:shadow-md hover:brightness-110
                      transition
                    "
                  >
                    {t("plan.share.request_membership_view")}
                  </button>

                </div>
              </div>
            )}

            {/* INVITE PHASE */}
            {phase === "invite" && (
              <div className="mb-5">
                <button
                  onClick={() => setPhase("default")}
                  className="text-xs text-blue-600 hover:text-blue-500 flex items-center gap-1 mb-3"
                >
                  <span className="text-base leading-none">←</span>
                  <span>{t("plan.share.back_to_share")}</span>
                </button>

                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  {t("plan.share.invite_to_plan", { name: planName })}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {t("plan.share.invite_confirm_hint")}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t("plan.share.invited_email")}
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
                        <option value="viewer">{t("plan.share.role_viewer")}</option>
                        <option value="editor">{t("plan.share.role_editor")}</option>
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
                    {t("common.cancel")}
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
                    {t("plan.share.send_invite")}
                  </button>
                </div>
              </div>
            )}

            {/* DEFAULT PHASE */}
            {phase === "default" && (
              <>
                {/* VISIBILITY + INVITE */}
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 p-3 mb-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {t("plan.share.visibility_label")}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t("plan.share.visibility_hint")}
                      </span>
                    </div>

                    {/*  nếu không phải owner => disable thật sự */}
                    <div
                      className={!canChangeVisibility ? "opacity-60 pointer-events-none" : ""}
                      title={!canChangeVisibility ? t("plan.share.visibility_owner_only") : ""}
                    >
                      <VisibilityDropdown value={visibility} onChange={handleVisibilityChange} />
                    </div>
                  </div>

                  {/*  Chỉ owner mới thấy phần invite */}
                  {canInvite && (
                    <div className="mt-2">
                      <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                        {t("plan.share.invite_by_email")}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                          <input
                            value={emailInput}
                            onChange={(e) => {
                              setEmailInput(e.target.value);
                              setEmailValid(true);
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                            placeholder={t("plan.share.email_placeholder")}
                            className={`
                              w-full px-4 py-2.5 rounded-xl text-sm
                              bg-slate-50/90 dark:bg-slate-900/80
                              border
                              ${emailValid ? "border-slate-200 dark:border-slate-700" : "border-rose-500"}
                              shadow-sm focus:outline-none focus:ring-[1.5px]
                              focus:ring-blue-400/80
                            `}
                          />
                          {!emailValid && (
                            <p className="text-[11px] text-rose-500 mt-1">
                              {t("plan.share.email_invalid")}
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
                          {t("plan.share.invite")}
                        </button>
                      </div>
                    </div>
                  )}

                  {/*  Nếu là guest, show tip */}
                  {isGuestViewer && (
                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      {t("plan.share.guest_copy_tip")}
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
                        ${activeTab === "members"
                          ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}
                      `}
                    >
                      {t("plan.share.tab_members", { count: share ? accessList.length : "—" })}
                    </button>

                    {/*  chỉ owner mới có tab requests */}
                    {canSeeRequests && (
                      <button
                        onClick={() => setActiveTab("requests")}
                        className={`
                          px-3.5 py-1.5 rounded-full text-xs font-medium
                          transition-all
                          ${activeTab === "requests"
                            ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}
                        `}
                      >
                        {t("plan.share.tab_requests")}
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
                    {/*  fallback khi loadShare fail */}
                    {!share && shareError && (
                      <div className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
                        {t("plan.share.members_load_failed")}
                      </div>
                    )}

                    {!share && !shareError && (
                      <div className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
                        {t("plan.share.members_loading")}
                      </div>
                    )}

                    {share && accessList.length === 0 && (
                      <div className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
                        {t("plan.share.no_members")}
                      </div>
                    )}

                    {share &&
                      accessList.map((u, i) => {
                        const isSelf =
                          u.userId && currentUserId && u.userId === currentUserId;

                        let canChangeRoleRow = false;
                        let canRemoveRow = false;

                        //  guest: không có action
                        if (!isGuestViewer) {
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
                {activeTab === "requests" && canSeeRequests && (
                  <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 p-3 space-y-3 mb-5">
                    {requests?.length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t("plan.share.no_requests")}
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
                          <p className="text-xs text-slate-500 truncate">{r.email}</p>
                          <p className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                            <span className="text-[10px]">•</span>
                            {r.type === "EDIT"
                              ? t("plan.share.request_edit_access")
                              : t("plan.share.request_view_access")}
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
                  {/*  viewer member -> request edit (cũ) */}
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
                      {loading ? t("plan.share.sending_request") : t("plan.share.request_edit_permission")}
                    </button>
                  )}

                  {/*  guest -> cũng cho request edit (giống PlanDashboardPage: xem được nhưng không sửa) */}
                  {isGuestViewer && (
                    <button
                      onClick={handleRequestEdit}
                      className="
                        mr-auto px-4 py-2 rounded-xl text-xs sm:text-sm
                        border border-blue-500/80 text-blue-600 dark:text-blue-400
                        bg-blue-50/60 dark:bg-blue-900/10
                        hover:bg-blue-100 dark:hover:bg-blue-900/30
                        transition
                      "
                    >
                      {t("plan.share.request_edit_permission")}
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
                    {t("plan.share.copy_link")}
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
                    {t("plan.share.done")}
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
          title={t("plan.share.remove_member_title")}
          message={t("plan.share.remove_member_confirm", { name: userToRemove?.name })}
          confirmText={t("common.delete")}
          onClose={() => setConfirmRemoveOpen(false)}
          onConfirm={confirmRemove}
        />
      )}

      {confirmRequest && confirmAction === "REJECT" && (
        <ConfirmModal
          open
          title={t("plan.share.reject_request_title")}
          message={t("plan.share.reject_request_confirm", {
            permission:
              confirmRequest.type === "EDIT"
                ? t("plan.share.edit_permission")
                : t("plan.share.view_permission"),
            name: confirmRequest.fullname || confirmRequest.email,
          })}
          confirmText={t("plan.share.reject")}
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
  const { t } = useTranslation();
  const [roleOpen, setRoleOpen] = useState(false);

  const currentRole =
    requestRoles[request.id] || (request.type === "EDIT" ? "EDITOR" : "VIEWER");

  const ROLE_LABEL = {
    VIEWER: t("plan.share.view_permission"),
    EDITOR: t("plan.share.edit_permission"),
  };

  return (
    <div className="flex flex-col items-end gap-2 min-w-[160px] relative">
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
        <span className={`text-[9px] transition-transform ${roleOpen ? "rotate-180" : ""}`}>
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
              ${currentRole === "VIEWER"
                ? "text-blue-600 font-semibold"
                : "text-slate-700 dark:text-slate-200"}
            `}
          >
            {t("plan.share.view_permission")}
          </button>

          <button
            onClick={() => {
              setRequestRoles((x) => ({ ...x, [request.id]: "EDITOR" }));
              setRoleOpen(false);
            }}
            className={`
              w-full text-left px-4 py-2 text-xs
              hover:bg-slate-100 dark:hover:bg-slate-800
              ${currentRole === "EDITOR"
                ? "text-blue-600 font-semibold"
                : "text-slate-700 dark:text-slate-200"}
            `}
          >
            {t("plan.share.edit_permission")}
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
          {t("plan.share.reject")}
        </button>

        <button
          onClick={async () => {
            try {
              await decideRequest(request.id, "APPROVE", currentRole);
              showSuccess(t("plan.share.request_approved"));
              loadRequests();
            } catch {
              /* surfaced by usePlanBoard tryCall */
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
          {t("plan.share.approve")}
        </button>
      </div>
    </div>
  );
}

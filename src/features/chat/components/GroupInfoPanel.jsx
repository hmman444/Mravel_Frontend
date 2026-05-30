import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  loadConversationDetail,
  removeConversationFromList,
} from "../slices/chatSlice";
import { useChatPresence } from "../hooks/useChatPresence";
import {
  removeMember,
  leaveConversation,
  changeMemberRole,
  transferOwnership,
  renameGroup,
} from "../services/chatService";
import AddMembersModal from "./AddMembersModal";
import {
  XMarkIcon,
  PencilIcon,
  UserMinusIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const ROLE_LABEL_KEYS = { OWNER: "chat.role_owner", ADMIN: "chat.role_admin", MEMBER: "chat.role_member" };
const ROLE_COLORS = {
  OWNER: "text-yellow-600 bg-yellow-50",
  ADMIN: "text-blue-600 bg-blue-50",
  MEMBER: "text-gray-500 bg-gray-100",
};

function MemberItem({ member, myRole, myUserId, conversationId, onRefresh, isOnline }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const isMe = member.userId === myUserId;
  const canManage = (myRole === "OWNER" || myRole === "ADMIN") && !isMe && member.role !== "OWNER";
  const canPromote = myRole === "OWNER" && member.role === "MEMBER";
  const canDemote = myRole === "OWNER" && member.role === "ADMIN";

  const doRemove = async () => {
    await removeMember(conversationId, member.userId);
    onRefresh();
  };
  const doPromote = async () => {
    await changeMemberRole(conversationId, member.userId, "ADMIN");
    onRefresh();
  };
  const doDemote = async () => {
    await changeMemberRole(conversationId, member.userId, "MEMBER");
    onRefresh();
  };
  const doTransfer = async () => {
    await transferOwnership(conversationId, member.userId);
    onRefresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => canManage && setOpen((v) => !v)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${canManage ? "hover:bg-gray-50 cursor-pointer" : ""}`}
      >
        <div className="relative flex-shrink-0">
          {member.avatar ? (
            <img src={member.avatar} alt={member.fullname} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-400 text-white text-xs flex items-center justify-center font-semibold">
              {(member.fullname || "?")[0].toUpperCase()}
            </div>
          )}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {member.fullname}{isMe && <span className="text-gray-400 ml-1">{t("chat.you_suffix")}</span>}
          </p>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_COLORS[member.role]}`}>
            {t(ROLE_LABEL_KEYS[member.role])}
          </span>
        </div>
        {canManage && <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
      </button>

      {open && canManage && (
        <div className="absolute right-2 top-10 bg-white shadow-xl rounded-xl border border-gray-100 z-20 min-w-44 py-1 text-sm">
          {canPromote && (
            <button onClick={doPromote} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50">
              <ShieldCheckIcon className="w-4 h-4 text-blue-500" /> {t("chat.promote_to_admin")}
            </button>
          )}
          {canDemote && (
            <button onClick={doDemote} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50">
              <ShieldCheckIcon className="w-4 h-4 text-gray-400" /> {t("chat.demote_to_member")}
            </button>
          )}
          {myRole === "OWNER" && (
            <button onClick={doTransfer} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-orange-600">
              <ShieldCheckIcon className="w-4 h-4" /> {t("chat.transfer_ownership")}
            </button>
          )}
          <button onClick={doRemove} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-red-500">
            <UserMinusIcon className="w-4 h-4" /> {t("chat.remove_from_group")}
          </button>
          <button onClick={() => setOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-gray-500">
            <XMarkIcon className="w-4 h-4" /> {t("common.close")}
          </button>
        </div>
      )}
    </div>
  );
}

export default function GroupInfoPanel({ conversationId, onClose, compact = false }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const myUserId = useSelector((s) => s.auth?.user?.id);
  const detail = useSelector((s) => s.chat.conversationDetails[conversationId]);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState(detail?.name || "");
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const memberUserIds = (detail?.members || []).map((m) => m.userId);
  const onlineIds = useChatPresence(memberUserIds);

  // Auto-load detail if invalidated (e.g. after member event)
  useEffect(() => {
    if (!detail && conversationId) {
      dispatch(loadConversationDetail(conversationId));
    }
  }, [detail, conversationId, dispatch]);

  const panelCls = compact
    ? "w-full flex flex-col h-full bg-white"
    : "w-72 flex flex-col h-full bg-white border-l border-gray-200";

  if (!detail) {
    return (
      <div className={`${panelCls} items-center justify-center`}>
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const myMember = detail.members?.find((m) => m.userId === myUserId);
  const myRole = myMember?.role;

  const refresh = () => {
    dispatch(loadConversationDetail(conversationId));
  };

  const handleRename = async () => {
    if (newName.trim() && newName.trim() !== detail.name) {
      await renameGroup(conversationId, newName.trim());
      refresh();
    }
    setEditName(false);
  };

  const handleLeave = async () => {
    await leaveConversation(conversationId);
    dispatch(removeConversationFromList(conversationId));
    onClose();
  };

  return (
    <>
      <div className={panelCls}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">{t("chat.group_info")}</h3>
          <div className="flex items-center gap-1">
            {(myRole === "OWNER" || myRole === "ADMIN") && (
              <button
                onClick={() => setShowAddMembersModal(true)}
                className="p-1 rounded hover:bg-blue-50 text-blue-500 transition-colors"
                title={t("chat.add_member")}
              >
                <UserPlusIcon className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

      <div className="flex-1 overflow-y-auto">
        {/* Group Name */}
        <div className="px-4 py-4 border-b border-gray-100">
          {editName ? (
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
              />
              <button onClick={handleRename} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm">
                {t("common.save")}
              </button>
              <button onClick={() => setEditName(false)} className="px-2 py-1.5 text-gray-500">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{detail.name}</span>
              {(myRole === "OWNER" || myRole === "ADMIN") && (
                <button onClick={() => { setNewName(detail.name); setEditName(true); }}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400">
                  <PencilIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">{t("chat.member_count", { count: detail.memberCount })}</p>
        </div>

        {/* Members */}
        <div className="px-2 py-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-2">
            {t("chat.members")}
          </p>
          <div className="space-y-0.5">
            {(detail.members || []).map((m) => (
              <MemberItem
                key={m.userId}
                member={m}
                myRole={myRole}
                myUserId={myUserId}
                conversationId={conversationId}
                onRefresh={refresh}
                isOnline={onlineIds.has(m.userId)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Leave */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLeave}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          {t("chat.leave_group")}
        </button>
      </div>
    </div>

    {/* Add Members Modal */}
    {showAddMembersModal && (
      <AddMembersModal
        conversationId={conversationId}
        members={detail.members}
        onClose={() => setShowAddMembersModal(false)}
        onAdded={refresh}
      />
    )}
  </>
  );
}

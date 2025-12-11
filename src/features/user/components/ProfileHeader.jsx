"use client";

import {
  UserPlus,
  MessageCircle,
  MoreHorizontal,
  Search,
  Check,
  XCircle,
  Lock,
  UserMinus,
  Clock,
} from "lucide-react";

export default function ProfileHeader({
  userView,
  relationship,
  friendActions,
  activeTab,
  onChangeTab,
  error,
  onOpenEdit,
}) {
  const tabs = [
    { key: "feed", label: "Bài viết" },
    { key: "about", label: "Giới thiệu" },
    { key: "photos", label: "Ảnh" },
    { key: "friends", label: "Bạn bè" },
  ];

  const isMe = friendActions.isMe;

  const renderFriendMainButton = () => {
    const { uiState, loadingAction } = friendActions;

    if (uiState.mode === "FRIEND") {
      return (
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-full bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 transition"
          disabled={loadingAction}
        >
          <Check className="w-4 h-4" />
          <span>Bạn bè</span>
        </button>
      );
    }

    if (uiState.mode === "REQUEST_SENT") {
      return (
        <button
          type="button"
          onClick={friendActions.handleRemoveOrCancel}
          disabled={loadingAction}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <Clock className="w-4 h-4" />
          <span>Đã gửi lời mời</span>
        </button>
      );
    }

    if (uiState.mode === "REQUEST_RECEIVED") {
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={friendActions.handleAcceptRequest}
            disabled={loadingAction}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-full bg-sky-500 text-white shadow-sm hover:bg-sky-600 transition"
          >
            <Check className="w-4 h-4" />
            <span>Chấp nhận</span>
          </button>
          <button
            type="button"
            onClick={friendActions.handleRemoveOrCancel}
            disabled={loadingAction}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Hủy</span>
          </button>
        </div>
      );
    }

    if (uiState.mode === "BLOCKED") {
      return (
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
        >
          <Lock className="w-4 h-4" />
          <span>Đã chặn</span>
        </button>
      );
    }

    // NONE / default
    return (
      <button
        type="button"
        onClick={friendActions.handleSendRequest}
        disabled={friendActions.loadingAction}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-full bg-sky-500 text-white shadow-sm hover:bg-sky-600 transition"
      >
        <UserPlus className="w-4 h-4" />
        <span>Kết bạn</span>
      </button>
    );
  };

  return (
    <section className="bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm overflow-hidden mb-6">
      {/* Cover */}
      <div className="relative h-40 sm:h-56 md:h-64 bg-slate-200 dark:bg-slate-800">
        {userView?.cover ? (
          <img
            src={userView.cover}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-sky-200 to-indigo-200 dark:from-slate-800 dark:to-slate-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      </div>

      <div className="px-4 sm:px-6 pb-4 sm:pb-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12">
          {/* Avatar + name */}
          <div className="flex items-end gap-4">
            <div className="relative">
              {userView?.avatar ? (
                <img
                  src={userView.avatar}
                  alt={userView.fullname}
                  className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-md"
                />
              ) : (
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-slate-900 bg-slate-300 dark:bg-slate-700 shadow-md flex items-center justify-center text-xl font-semibold text-slate-700 dark:text-slate-200">
                  {userView?.fullname?.[0] || "U"}
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
                  {userView?.fullname || "Người dùng Mravel"}
                </h1>
                {relationship?.type && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70">
                    {relationship.friend && <Check className="w-3 h-3" />}
                    <span>
                      {relationship.type === "SELF" && "Đây là bạn"}
                      {relationship.type === "FRIEND" && "Bạn bè"}
                      {relationship.type === "REQUEST_SENT" &&
                        "Đã gửi lời mời"}
                      {relationship.type === "REQUEST_RECEIVED" &&
                        "Đã gửi lời mời cho bạn"}
                      {relationship.type === "NONE" && "Chưa kết nối"}
                      {relationship.type === "BLOCKED" && "Đã chặn"}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                @{userView?.username || "mravel.user"} ·{" "}
                {userView?.totalFriends ?? 0} bạn ·{" "}
                {userView?.mutualFriends ?? 0} bạn chung
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-1 flex justify-start sm:justify-end items-center gap-2 mb-1">
            {isMe ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-full bg-sky-500 text-white shadow-sm hover:bg-sky-600 transition"
                onClick={onOpenEdit}
              >
                <UserPlus className="w-4 h-4" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            ) : (
              <>
                {renderFriendMainButton()}

                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Nhắn tin</span>
                </button>

                {friendActions.isFriend && (
                  <button
                    type="button"
                    onClick={friendActions.handleRemoveOrCancel}
                    disabled={friendActions.loadingAction}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    title="Xóa bạn"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs + search */}
        <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-2 flex flex-wrap gap-2 text-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChangeTab(tab.key)}
              className={`px-3 pb-2 border-b-2 -mb-[1px] transition ${
                activeTab === tab.key
                  ? "border-sky-500 text-sky-600 dark:text-sky-300 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}

        </div>

        {error && (
          <p className="mt-2 text-xs text-red-500">
            Không thể tải hồ sơ: {error}
          </p>
        )}
      </div>
    </section>
  );  
}

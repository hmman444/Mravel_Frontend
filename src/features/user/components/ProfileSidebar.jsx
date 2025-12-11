"use client";

import { useNavigate } from "react-router-dom";
import AboutBlock from "./AboutBlock";

export default function ProfileSidebar({
  userView,
  profile,
  loading,
  photosFromPlans,
  friendsPreview,
  onViewPhotos,
  onViewFriends,
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 md:sticky md:top-24 self-start">
      {/* About */}
      <section className="bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-3">
          Giới thiệu
        </h2>
        <AboutBlock userView={userView} profile={profile} loading={loading} />
      </section>

      {/* Photos from plans */}
      <section className="bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            Ảnh từ lịch trình
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-2.5 py-1 text-[11px] rounded-full bg-sky-500 text-white hover:bg-sky-600 transition"
              onClick={() => {
                console.log("Thêm tất cả ảnh từ lịch trình");
              }}
            >
              Thêm tất cả
            </button>
            <button
              type="button"
              className="text-xs text-sky-600 dark:text-sky-300 hover:underline"
              onClick={onViewPhotos}
            >
              Xem tất cả
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          {userView?.totalPhotos ?? photosFromPlans.length} ảnh từ các chuyến đi
          gần đây.
        </p>

        {photosFromPlans.length === 0 && !loading ? (
          <p className="text-xs text-slate-400">Chưa có ảnh nào được chia sẻ.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {(photosFromPlans.length ? photosFromPlans : Array(6).fill(null)).map(
                (url, idx) => (
                  <div
                    key={idx}
                    className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800"
                  >
                    {url ? (
                      <img
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full animate-pulse" />
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </section>

      {/* Friends preview */}
      <section className="bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Bạn bè
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {userView?.totalFriends ?? 0} bạn ·{" "}
              {userView?.mutualFriends ?? 0} bạn chung với bạn
            </p>
          </div>
          <button
            className="text-xs text-sky-600 dark:text-sky-300 hover:underline"
            type="button"
            onClick={onViewFriends}
          >
            Xem tất cả
          </button>
        </div>

        {(!friendsPreview || friendsPreview.length === 0) && !loading ? (
          <p className="text-xs text-slate-400">
            Người dùng này chưa kết nối bạn bè công khai.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {(friendsPreview || []).map((friend) => {
              const name =
                friend.fullname ||
                friend.fullName ||
                friend.name ||
                "Người dùng";
              const avatar = friend.avatar || null;
              const mutual = friend.mutualFriends ?? 0;

              return (
                <button
                  key={friend.id}
                  type="button"
                  className="text-left group"
                  onClick={() => navigate(`/u/${friend.id}`)}
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 mb-1.5">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {name[0]}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-slate-800 dark:text-slate-100 line-clamp-2">
                    {name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {mutual} bạn chung
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

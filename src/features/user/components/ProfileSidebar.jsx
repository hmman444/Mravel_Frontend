"use client";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const previewPhotos = photosFromPlans.slice(0, 9);
  return (
    <div className="space-y-4 md:sticky md:top-24 self-start">
      {/* About */}
      <section className="bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-3">
          {t("user.about_title")}
        </h2>
        <AboutBlock userView={userView} profile={profile} loading={loading} />
      </section>

      {/* Photos from plans */}
      <section className="bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            {t("user.photos_from_plans_title")}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-xs text-sky-600 dark:text-sky-300 hover:underline"
              onClick={onViewPhotos}
            >
              {t("user.view_all")}
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          {t("user.photos_recent_count", {
            n: userView?.totalPhotos ?? previewPhotos.length,
          })}
        </p>

        {previewPhotos.length === 0 && !loading ? (
          <p className="text-xs text-slate-400">{t("user.no_photos_shared")}</p>
        ) : (
          <div className="max-h-64 overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {(previewPhotos.length ? previewPhotos : Array(6).fill(null)).map(
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
              {t("user.friends_title")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("user.friends_summary", {
                total: userView?.totalFriends ?? 0,
                mutual: userView?.mutualFriends ?? 0,
              })}
            </p>
          </div>
          <button
            className="text-xs text-sky-600 dark:text-sky-300 hover:underline"
            type="button"
            onClick={onViewFriends}
          >
            {t("user.view_all")}
          </button>
        </div>

        {(!friendsPreview || friendsPreview.length === 0) && !loading ? (
          <p className="text-xs text-slate-400">
            {t("user.no_public_friends")}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {(friendsPreview || []).map((friend) => {
              const name =
                friend.fullname ||
                friend.fullName ||
                friend.name ||
                t("user.default_user_name");
              const avatar = friend.avatar || null;
              const mutual = friend.mutualFriends ?? 0;

              return (
                <button
                  key={friend.id}
                  type="button"
                  className="text-left group"
                  onClick={() => navigate(`/profile/${friend.id}`)}
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
                    {t("user.mutual_friends_count", { n: mutual })}
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

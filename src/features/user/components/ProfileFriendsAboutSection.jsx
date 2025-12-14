"use client";

import { useNavigate } from "react-router-dom";
import AboutBlock from "./AboutBlock";
import PlanMedia from "../../planFeed/components/PlanMedia";
export default function ProfileFriendsAboutSection({
  activeTab,
  userView,
  profile,
  loading,
  friendsPreview,
  photosFromPlans = [],
}) {
  const navigate = useNavigate();

  const renderAboutSection = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Giới thiệu
        </h3>
      </div>

      <AboutBlock userView={userView} profile={profile} loading={loading} />
    </div>
  );

  const renderPhotosSection = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Ảnh từ các lịch trình du lịch
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {userView?.totalPhotos ?? photosFromPlans.length} ảnh được tổng hợp từ
          các chuyến đi công khai.
        </p>
      </div>

      {photosFromPlans.length === 0 && !loading ? (
        <p className="text-sm text-slate-400">Chưa có ảnh nào để hiển thị.</p>
      ) : (
        <PlanMedia images={photosFromPlans} full />
      )}
    </div>
  );

  const renderFriendsSection = () => {
    if ((!friendsPreview || friendsPreview.length === 0) && !loading) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Bạn bè
            </h3>
          </div>
          <p className="text-sm text-slate-400">
            Chưa có danh sách bạn bè để hiển thị.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Bạn bè của {userView?.fullname || "người dùng"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {userView?.totalFriends ?? 0} bạn ·{" "}
              {userView?.mutualFriends ?? 0} bạn chung
            </p>
          </div>
          <button className="text-xs sm:text-sm text-sky-600 dark:text-sky-300 hover:underline">
            Quản lý danh sách bạn bè
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
          {(friendsPreview || []).map((friend) => {
            const name =
              friend.fullname || friend.fullName || friend.name || "Người dùng";
            const avatar = friend.avatar || null;
            const mutual = friend.mutualFriends ?? 0;

            return (
              <div
                key={friend.id}
                className="flex gap-3 items-center rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-900/70 cursor-pointer hover:bg-slate-100/90 dark:hover:bg-slate-900 transition"
                onClick={() => navigate(`/u/${friend.id}`)}
              >
                <div className="shrink-0">
                  <img
                    src={
                      avatar ||
                      "https://api.dicebear.com/7.x/thumbs/svg?seed=friend"
                    }
                    alt={name}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                    {name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {mutual} bạn chung
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Thứ tự section theo tab đang chọn
  const sectionOrder =
    activeTab === "photos"
      ? ["photos", "about", "friends"]
      : activeTab === "friends"
      ? ["friends", "about", "photos"]
      : ["about", "photos", "friends"]; // default / about

  const renderSectionByKey = (key) => {
    switch (key) {
      case "about":
        return renderAboutSection();
      case "photos":
        return renderPhotosSection();
      case "friends":
        return renderFriendsSection();
      default:
        return null;
    }
  };

  return (
    <section className="bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 md:p-7 shadow-md space-y-6 sm:space-y-7">

      {sectionOrder.map((key, idx) => (
        <div key={key}>
          {/* block */}
          {renderSectionByKey(key)}
          {/* Divider giữa các block */}
          {idx < sectionOrder.length - 1 && (
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-5" />
          )}
        </div>
      ))}
    </section>
  );
}

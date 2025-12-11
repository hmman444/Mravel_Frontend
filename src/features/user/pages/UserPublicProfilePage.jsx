"use client";

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import FadeInSection from "../../../components/FadeInSection";

import PlanPostCard from "../../planFeed/components/PlanPostCard";
import PostSkeleton from "../../planFeed/components/PostSkeleton";

import { useUserProfile } from "../hooks/useUserProfile";
import { useFriendActions } from "../hooks/useFriendActions";
import EditPublicProfileModal from "../components/EditPublicProfileModal";

import ProfileHeader from "../components/ProfileHeader";
import ProfileSidebar from "../components/ProfileSidebar";
import ProfileFriendsAboutSection from "../components/ProfileFriendsAboutSection";
import LoadingOverlay from "../../../components/LoadingOverlay";

// map BasicInfo của BE về shape UI
function buildUserView(profile, photoCount) {
  if (!profile) return null;

  const joinedYear = profile.joinedDate
    ? String(profile.joinedDate).slice(0, 4)
    : "2024";

  return {
    id: profile.id,
    username: profile.username,
    fullname: profile.fullname || profile.fullName,
    avatar: profile.avatar,
    cover: profile.coverImage,
    bio: profile.bio || "Người dùng chưa thêm giới thiệu.",
    city: profile.city || "Chưa cập nhật",
    country: profile.country || "",
    hometown: profile.hometown || null,
    occupation: profile.occupation || null,
    joinedAt: joinedYear,
    totalTrips: null,
    totalPhotos: photoCount ?? 0,
    totalFriends: profile.totalFriends ?? 0,
    mutualFriends: profile.mutualFriends ?? 0,
  };
}

export default function UserPublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { user: me } = useSelector((s) => s.auth);

  const {
    profile,
    relationship,
    plans,
    friendsPreview,
    loading,
    error,
    reload,
  } = useUserProfile(userId);

  const [activeTab, setActiveTab] = useState("feed");
  const [openEdit, setOpenEdit] = useState(false);

  const photosFromPlans = useMemo(() => {
    if (!plans || plans.length === 0) return [];

    const urls = [];

    plans.forEach((p) => {
      if (!Array.isArray(p.images)) return;

      p.images.forEach((img) => {
        let url = null;
        if (typeof img === "string") url = img;
        else if (img?.url) url = img.url;

        if (url) urls.push(url);
      });
    });

    // nếu sợ quá nhiều ảnh thì có thể giới hạn top 50 chẳng hạn:
    // return urls.slice(0, 50);
    return urls;
  }, [plans]);

  const userView = useMemo(
    () => buildUserView(profile, photosFromPlans.length),
    [profile, photosFromPlans.length]
  );

  const isFeedEmpty = !loading && (!plans || plans.length === 0);

  const friendActions = useFriendActions(userView?.id, relationship, reload);

  const isInitialLoading = loading && !profile;
  if (isInitialLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <LoadingOverlay open={isInitialLoading} message="Đang tải hồ sơ du lịch..." />
        
        <Navbar />
        <div className="h-[56px]" aria-hidden />

        <main className="flex-1 flex justify-center pt-4 pb-10 md:pt-6 md:pb-12">
          <div className="w-full md:w-3/4 max-w-6xl px-3 sm:px-4 md:px-6 space-y-4">
            {/* Skeleton cover + avatar */}
            <section className="bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm overflow-hidden">
              <div className="h-40 sm:h-56 md:h-64 bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                <div className="-mt-10 sm:-mt-12 flex gap-4">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-900 animate-pulse" />
                  <div className="flex-1 space-y-2 mt-6">
                    <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
                <div className="mt-4 h-8 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
              </div>
            </section>

            {/* Skeleton main content */}
            <div className="grid gap-6 md:grid-cols-[minmax(260px,320px),1fr]">
              <div className="space-y-4">
                <div className="h-40 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 animate-pulse" />
                <div className="h-40 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 animate-pulse" />
                <div className="h-32 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 animate-pulse" />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <div className="h-[56px]" aria-hidden />

      <main className="flex-1 flex justify-center pt-4 pb-10 md:pt-6 md:pb-12">
        <div className="w-full md:w-3/4 max-w-6xl px-3 sm:px-4 md:px-6">
          {/* HEADER */}
          <ProfileHeader
            userView={userView}
            relationship={relationship}
            friendActions={friendActions}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            error={error}
            onOpenEdit={() => setOpenEdit(true)}
          />

          {/* MAIN AREA */}
          {activeTab === "feed" && (
            <div className="grid gap-6 md:grid-cols-[minmax(260px,320px),1fr]">
              {/* LEFT COLUMN */}
              <ProfileSidebar
                userView={userView}
                profile={profile}
                loading={loading}
                photosFromPlans={photosFromPlans}
                friendsPreview={friendsPreview}
                onViewPhotos={() => setActiveTab("photos")}
                onViewFriends={() => setActiveTab("friends")}
              />

              {/* RIGHT COLUMN */}
              <div className="space-y-4">
                <section>
                  {isFeedEmpty ? (
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                      Người dùng này chưa chia sẻ lịch trình công khai nào.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(plans || []).map((p, i) => (
                        <FadeInSection key={p.id} delay={i * 80}>
                          <PlanPostCard
                            plan={p}
                            me={me}
                            onOpenDetail={() => navigate(`/plans/${p.id}`)}
                          />
                        </FadeInSection>
                      ))}

                      {loading && (
                        <FadeInSection delay={150}>
                          <div className="space-y-4">
                            <PostSkeleton />
                            <PostSkeleton />
                          </div>
                        </FadeInSection>
                      )}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {activeTab !== "feed" && (
            <div className="mt-4">
              <ProfileFriendsAboutSection
                activeTab={activeTab}
                userView={userView}
                profile={profile}
                loading={loading}
                friendsPreview={friendsPreview}
                photosFromPlans={photosFromPlans}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />

      {friendActions.isMe && (
        <EditPublicProfileModal
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          initialData={userView}
          onUpdated={reload}
        />
      )}
    </div>
  );
}

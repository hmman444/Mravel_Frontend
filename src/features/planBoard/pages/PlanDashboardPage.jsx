// src/features/planBoard/pages/PlanDashboardPage.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import PlanLayout from "../components/PlanLayout";
import PlanSummary from "../components/summary/PlanSummary";
import PlanBoard from "../components/board/PlanBoard";
import PlanMembers from "../components/member/PlanMembers";
import PlanCalendar from "../components/calender/PlanCalendar";

import ShareModal from "../components/modals/ShareModal";
import ConfirmModal from "../../../components/ConfirmModal";
import AccessRequestModal from "../components/modals/AccessRequestModal";

import { useMyPlans } from "../hooks/useMyPlans";
import { usePlanBoard } from "../hooks/usePlanBoard";
import { usePlanGeneral } from "../hooks/usePlanGeneral";

import { showSuccess, showError } from "../../../utils/toastUtils";
import { usePlanBoardRealtime } from "../../../realtime/usePlanBoardRealtime";

export default function PlanDashboardPage() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const {
    board,
    loading,
    error,
    load,
    createList,
    renameList,
    deleteList,
    createCard,
    updateCard,
    deleteCard,
    clearTrash,
    reorder,
    localReorder,
    requestAccess,
    duplicateList,
    isViewer,
    isEditor,
    isOwner,
    planMembers,
    duplicateCard,
  } = usePlanBoard(planId);

  const { plans } = useMyPlans();
  const { updateTitle } = usePlanGeneral();
  const [sidebarPlans, setSidebarPlans] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "summary";

    const saved = window.localStorage.getItem(
      `plan-dashboard-tab-${planId || "default"}`
    );
    return saved || "summary";
  });
  const [openShare, setOpenShare] = useState(false);

  const [editingListId, setEditingListId] = useState(null);
  const [activeListMenu, setActiveListMenu] = useState(null);
  const [activeCardMenu, setActiveCardMenu] = useState(null);

  const [confirmDeleteCard, setConfirmDeleteCard] = useState(null);
  const [confirmDeleteList, setConfirmDeleteList] = useState(null);
  const [confirmClearTrash, setConfirmClearTrash] = useState(false);

  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessLoadingType, setAccessLoadingType] = useState(null);

  const [titleInput, setTitleInput] = useState("");

  const canEditGeneral = isOwner || isEditor;

  useEffect(() => {
    setSidebarPlans(plans || []);
  }, [plans]);

  usePlanBoardRealtime(planId);

  useEffect(() => {
    if (!planId) return;
    load();
  }, [planId]);

  useEffect(() => {
    if (
      !loading &&
      !board &&
      typeof error === "string" &&
      error.includes("You don't have permission")
    ) {
      setShowAccessModal(true);
    }
  }, [loading, board, error]);

  useEffect(() => {
    if (!planId || !activeTab) return;
    window.localStorage.setItem(`plan-dashboard-tab-${planId}`, activeTab);
  }, [activeTab, planId]);

  useEffect(() => {
    setTitleInput(board?.planTitle || "");
  }, [board?.planTitle]);

  const handleSaveTitle = async () => {
    if (!canEditGeneral || !planId || !board) return;
    const trimmed = titleInput.trim();
    if (!trimmed || trimmed === board.planTitle) return;

    try {
      await updateTitle(planId, trimmed).unwrap();
      showSuccess("Đã cập nhật tiêu đề");

      setSidebarPlans((prev) =>
        prev.map((p) =>
        String(p.id) === String(planId)
          ? { ...p, title: trimmed, name: trimmed } 
          : p
        )
      );
    } catch {
      showError("Không thể cập nhật tiêu đề");
      setTitleInput(board.planTitle || "");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const payload = {
      type,
      sourceListId: Number(source.droppableId),
      destListId: Number(destination.droppableId),
      sourceIndex: source.index,
      destIndex: destination.index,
    };

    localReorder(payload);

    try {
      await reorder(payload);
    } catch (err) {
      console.error(err);
      load();
    }
  };

  /**
   * Chuẩn hoá payload gửi lên BE từ activityPayload của modal
   * activity = {
   *   type: "TRANSPORT" | "FOOD" | ...,
   *   title, startTime, endTime, estimatedCost, actualCost, note, ...
   * }
   */
  const buildCardPayloadFromActivity = (activity) => {
    if (!activity) return {};

    const {
      type,
      title,
      text,
      description,
      startTime,
      endTime,
      durationMinutes,
      participantCount,
      participants,
      activityData,
      cost,
      split,

      // legacy
      estimatedCost,
      actualCost,
      note,
      ...rest
    } = activity;

    const finalText = text || title || "Hoạt động";
    const finalDescription = description || note || "";

    const parsedEstimated =
      typeof estimatedCost === "number"
        ? estimatedCost
        : cost?.estimatedCost ?? null;

    const parsedActual =
      typeof actualCost === "number"
        ? actualCost
        : cost?.actualCost ?? null;

    const finalParticipantCount =
      participantCount ??
      cost?.participantCount ??
      (Array.isArray(participants) ? participants.length : null);

    const finalParticipants =
      participants ||
      cost?.participants ||
      (Array.isArray(rest.participants) ? rest.participants : []);

    const normalizedCost =
      cost || {
        currencyCode: "VND",
        estimatedCost: parsedEstimated,
        budgetAmount: cost?.budgetAmount ?? null,
        actualCost: parsedActual,
        participantCount: finalParticipantCount,
        participants: finalParticipants,
        extraCosts: cost?.extraCosts || [],
      };

    const normalizedSplit =
      split || {
        splitType: "NONE",
        payerId: null,
        includePayerInSplit: true,
        splitMembers: [],
        splitDetails: [],
        payments: [],
      };

    const activityJson = {
      ...(activityData || {}),
      ...rest,
      type: type || "OTHER",
      title: finalText,
      description: finalDescription,
      startTime,
      endTime,
      estimatedCost: parsedEstimated,
      actualCost: parsedActual,
    };

    return {
      text: finalText,
      description: finalDescription,

      start: startTime || null,
      end: endTime || null,
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,

      activityType: type || "OTHER",

      activityDataJson: JSON.stringify(activityJson),

      participantCount: finalParticipantCount,
      participants: finalParticipants,

      cost: normalizedCost,
      split: normalizedSplit,
    };
  };

  const createActivityCard = async (listId, activityPayload) => {
    try {
      const payload = buildCardPayloadFromActivity(activityPayload);
      await createCard(listId, payload);
      await load();
      showSuccess("Đã thêm hoạt động");
    } catch (e) {
      console.error(e);
      showError("Không thêm được hoạt động");
    }
  };

  const updateActivityCard = async (listId, cardId, activityPayload) => {
    try {
      const payload = buildCardPayloadFromActivity(activityPayload);
      await updateCard(listId, cardId, payload);
      await load();
      showSuccess("Đã cập nhật hoạt động");
    } catch (e) {
      console.error(e);
      showError("Không thể cập nhật hoạt động");
    }
  };

  const handleRemoveCard = async ({ listId, cardId }) => {
    try {
      await deleteCard(listId, cardId);
      await load();
      showSuccess("Đã xoá thẻ");
    } catch {
      showError("Không thể xoá thẻ");
    }
  };

  const toggleDone = async (listId, cardId) => {
    const card = board?.lists
      ?.find((l) => l.id === listId)
      ?.cards?.find((c) => c.id === cardId);

    if (!card) return;

    try {
      await updateCard(listId, cardId, { done: !card.done });
    } catch {
      console.error("Toggle done failed");
    }
  };

  const handleAddList = async () => {
    try {
      await createList({ title: null });
      await load();
      showSuccess("Đã thêm danh sách");
    } catch {
      showError("Không thể thêm danh sách");
    }
  };

  const handleRequestView = async () => {
    try {
      setAccessLoadingType("VIEW");
      await requestAccess("VIEW");
      showSuccess("Đã gửi yêu cầu quyền xem");
      setShowAccessModal(false);
    } finally {
      setAccessLoadingType(null);
    }
  };

  const handleRequestEdit = async () => {
    try {
      setAccessLoadingType("EDIT");
      await requestAccess("EDIT");
      showSuccess("Đã gửi yêu cầu quyền chỉnh sửa");
      setShowAccessModal(false);
    } finally {
      setAccessLoadingType(null);
    }
  };

  if (loading && !board) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  // helper: tìm list DAY theo dayDate (yyyy-MM-dd)
  const findDayListByDate = (dateStr) => {
    return (
      board?.lists?.find(
        (l) => l.type === "DAY" && String(l.dayDate) === String(dateStr)
      ) || null
    );
  };

  return (
    <PlanLayout
      activePlanId={planId}
      plans={sidebarPlans}
      onOpenPlanList={() => navigate("/plans/my-plans")}
      onOpenCalendar={() => navigate("/plans/calendar")}
      onOpenPlanDashboard={(p) => navigate(`/plans/${p.id}`)}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="max-w-[60%]">
          {canEditGeneral ? (
            <input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              placeholder="Tiêu đề kế hoạch..."
              className="
                w-full text-lg font-semibold
                bg-transparent border-b border-transparent
                focus:outline-none focus:border-blue-400/70
                text-gray-900 dark:text-gray-100
                transition-all
              "
            />
          ) : (
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {board?.planTitle}
            </h1>
          )}
          <p className="text-xs text-gray-500">
            Sắp xếp & theo dõi hành trình của bạn trong một nơi.
          </p>
        </div>

        {board && (
          <button
            onClick={() => setOpenShare(true)}
            className="
              inline-flex items-center gap-2 rounded-full 
              bg-gradient-to-r from-blue-500/90 via-blue-500/90 to-indigo-500/90 
              px-4 py-2 text-sm font-semibold text-white 
              shadow-md shadow-blue-500/30 
              transition-all duration-200 
              hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 
              active:translate-y-0
            "
          >
            <span>Chia sẻ</span>
          </button>
        )}
      </div>

      {/* TABS */}
      <div
        className="
        flex gap-2 mb-4 rounded-full bg-gray-100/80 p-1 
        shadow-inner shadow-white/60 
        dark:bg-gray-800/80 dark:shadow-black/40
      "
      >
        {[
          { key: "summary", label: "Tổng quan" },
          { key: "board", label: "Bảng lịch trình" },
          { key: "calendar", label: "Lịch tuần" },
          { key: "members", label: "Thành viên" },
        ].map((t) => {
          const ac = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`
                relative rounded-full px-4 py-1.5 text-xs font-medium 
                transition-all duration-200
                ${
                  ac
                    ? "bg-white dark:bg-gray-900 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-white/70 dark:hover:bg-gray-700/70"
                }
              `}
            >
              {t.label}
              {ac && (
                <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      <div className="h-[calc(100%-150px)] overflow-auto">
        {activeTab === "summary" && (
          <PlanSummary
            plan={board}
            planId={planId}
            canEdit={canEditGeneral}
            reloadBoard={load}
          />
        )}

        {activeTab === "board" && (
          <PlanBoard
            board={board}
            isViewer={isViewer}
            planMembers={planMembers}
            handleAddList={handleAddList}
            renameList={renameList}
            deleteList={deleteList}
            clearTrash={clearTrash}
            duplicateList={duplicateList}
            // ACTIVITY
            createActivityCard={createActivityCard}
            updateActivityCard={updateActivityCard}
            // CARD actions
            handleAddCard={createCard}
            updateCard={updateCard}
            toggleDone={toggleDone}
            duplicateCard={duplicateCard}
            deleteCard={deleteCard}
            // DRAG
            handleDragEnd={handleDragEnd}
            // UI
            editingListId={editingListId}
            setEditingListId={setEditingListId}
            activeListMenu={activeListMenu}
            setActiveListMenu={setActiveListMenu}
            activeCardMenu={activeCardMenu}
            setActiveCardMenu={setActiveCardMenu}
            setConfirmDeleteCard={setConfirmDeleteCard}
            setConfirmDeleteList={setConfirmDeleteList}
          />
        )}

        {activeTab === "calendar" && (
          <PlanCalendar
            board={board}
            canEdit={canEditGeneral}
            planMembers={planMembers}
            
            createActivityCard={createActivityCard}
            updateActivityCard={updateActivityCard}
            
            onMoveCard={async ({
              cardId,
              sourceDate,
              targetDate,
              sourceIndex,
              targetIndex,
              start,
              end,
            }) => {
              try {
                const sourceList = findDayListByDate(sourceDate);
                const targetList = findDayListByDate(targetDate);

                if (!targetList || !sourceList) {
                  console.warn(
                    "Không tìm thấy list DAY khi kéo trong calendar:",
                    sourceDate,
                    targetDate
                  );
                  return;
                }

                // 1) cập nhật lại thời gian card theo block kéo
                await updateCard(targetList.id, cardId, {
                  startTime: start.toISOString(),
                  endTime: end.toISOString(),
                });

                // 2) nếu đổi ngày thì move card sang list mới
                if (sourceList.id !== targetList.id) {
                  const payload = {
                    type: "card",
                    sourceListId: sourceList.id,
                    destListId: targetList.id,
                    sourceIndex,
                    destIndex: targetIndex,
                  };

                  try {
                    await reorder(payload);
                  } catch (err) {
                    console.error("Reorder khi kéo calendar lỗi:", err);
                  }
                }

                await load();
              } catch (e) {
                console.error(e);
                showError("Không thể cập nhật hoạt động từ calendar");
              }
            }}
          />
        )}

        {activeTab === "members" && <PlanMembers planId={planId} />}
      </div>

      {/* MODALS */}
      {board && (
        <ShareModal
          isOpen={openShare}
          planId={planId}
          onClose={() => setOpenShare(false)}
          planName={board.planTitle}
          initialVisibility={board.visibility}
        />
      )}

      {confirmDeleteCard && (
        <ConfirmModal
          open={true}
          title="Xoá thẻ"
          message={`Xoá thẻ "${confirmDeleteCard.card.text}"?`}
          confirmText="Xoá"
          onClose={() => setConfirmDeleteCard(null)}
          onConfirm={() => {
            handleRemoveCard(confirmDeleteCard);
            setConfirmDeleteCard(null);
          }}
        />
      )}

      {confirmClearTrash && (
        <ConfirmModal
          open={true}
          title="Xóa toàn bộ thẻ trong thùng rác"
          message="Hành động này không thể hoàn tác. Xóa toàn bộ thẻ?"
          confirmText="Xóa hết"
          onClose={() => setConfirmClearTrash(false)}
          onConfirm={async () => {
            try {
              await clearTrash();
              showSuccess("Đã xóa toàn bộ thẻ trong thùng rác");
            } catch {
              showError("Không thể xóa thùng rác");
            }
            setConfirmClearTrash(false);
          }}
        />
      )}

      {confirmDeleteList && (
        <ConfirmModal
          open={true}
          title="Xoá danh sách"
          message={`Xác nhận xóa "${confirmDeleteList.title}"? Các thẻ của danh sách sẽ được chuyển vào thùng rác!`}
          confirmText="Xoá"
          onClose={() => setConfirmDeleteList(null)}
          onConfirm={async () => {
            await deleteList(confirmDeleteList.id);
            await load();
            setConfirmDeleteList(null);
          }}
        />
      )}

      <AccessRequestModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        visibility={board?.visibility}
        onRequestView={handleRequestView}
        onRequestEdit={handleRequestEdit}
        loadingType={accessLoadingType}
      />
    </PlanLayout>
  );
}

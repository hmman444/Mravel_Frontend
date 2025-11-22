"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import PlanLayout from "../components/PlanLayout";
import PlanSummary from "../components/PlanSummary";
import PlanBoard from "../components/PlanBoard";

import ShareModal from "../components/modals/ShareModal";
import ConfirmModal from "../../../components/ConfirmModal";
import AccessRequestModal from "../components/modals/AccessRequestModal";

import { useMyPlans } from "../hooks/useMyPlans";
import { usePlanBoard } from "../hooks/usePlanBoard";
import { usePlanGeneral } from "../hooks/usePlanGeneral";

import { showSuccess, showError } from "../../../utils/toastUtils";

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
    reorder,
    localReorder,
    requestAccess,
    isViewer,
    isEditor,
    isOwner,
  } = usePlanBoard(planId);

  const { plans } = useMyPlans();
  const { updateTitle } = usePlanGeneral();

  const [activeTab, setActiveTab] = useState("summary");
  const [openShare, setOpenShare] = useState(false);

  const [editingListId, setEditingListId] = useState(null);
  const [activeListMenu, setActiveListMenu] = useState(null);
  const [activeCardMenu, setActiveCardMenu] = useState(null);

  const [confirmDeleteCard, setConfirmDeleteCard] = useState(null);
  const [confirmDeleteList, setConfirmDeleteList] = useState(null);

  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessLoadingType, setAccessLoadingType] = useState(null);

  const [titleInput, setTitleInput] = useState("");

  const canEditGeneral = isOwner || isEditor;

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
    setTitleInput(board?.planTitle || "");
  }, [board?.planTitle]);

  const handleSaveTitle = async () => {
    if (!canEditGeneral || !planId || !board) return;
    const trimmed = titleInput.trim();
    if (!trimmed || trimmed === board.planTitle) return;

    try {
      await updateTitle(planId, trimmed).unwrap();
      showSuccess("Đã cập nhật tiêu đề");
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
      startTime,
      endTime,
      estimatedCost,
      actualCost,
      note,
      ...rest
    } = activity;

    return {
      text: title || "Hoạt động",
      description: note || "",
      start: startTime || null,
      end: endTime || null,
      activityType: type || "OTHER",
      activityDataJson: JSON.stringify({
        ...rest,
        type: type || "OTHER",
        title,
        note,
        startTime,
        endTime,
        estimatedCost,
        actualCost,
      }),
      estimatedCost:
        typeof estimatedCost === "number" ? estimatedCost : null,
      actualCost: typeof actualCost === "number" ? actualCost : null,
    };
  };

  const createActivityCard = async (listId, activityPayload) => {
    try {
      const payload = buildCardPayloadFromActivity(activityPayload);
      await createCard(listId, payload);
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
      showSuccess("Đã cập nhật hoạt động");
    } catch (e) {
      console.error(e);
      showError("Không thể cập nhật hoạt động");
    }
  };

  const handleRemoveCard = async ({ listId, cardId }) => {
    try {
      await deleteCard(listId, cardId);
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

  const duplicateCard = async (card, listId) => {
    try {
      const payload = {
        text: (card.text || "") + " (Copy)",
        description: card.description,
        start: card.startTime,
        end: card.endTime,
        done: false,
        activityType: card.activityType,
        activityDataJson: card.activityDataJson,
        estimatedCost: card.estimatedCost,
        actualCost: card.actualCost,
      };
      await createCard(listId, payload);
      showSuccess("Đã sao chép thẻ");
    } catch {
      showError("Không thể sao chép thẻ");
    }
  };

  const handleAddList = async () => {
    try {
      await createList({ title: null });
      showSuccess("Đã thêm danh sách");
    } catch {
      showError("Không thể thêm danh sách");
    }
  };

  const duplicateList = async (list) => {
    try {
      const newListAction = await createList({
        title: list.title + " (Copy)",
      });
      const newList = newListAction.payload || newListAction;

      for (const card of list.cards || []) {
        await createCard(newList.id, {
          text: card.text,
          description: card.description,
          start: card.startTime,
          end: card.endTime,
          done: false,
          activityType: card.activityType,
          activityDataJson: card.activityDataJson,
          estimatedCost: card.estimatedCost,
          actualCost: card.actualCost,
        });
      }
      showSuccess("Đã sao chép danh sách");
    } catch {
      showError("Không thể sao chép danh sách");
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

  return (
    <PlanLayout
      activePlanId={planId}
      plans={plans}
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
          { key: "timeline", label: "Biểu đồ thời gian" },
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
          />
        )}

        {activeTab === "board" && (
          <PlanBoard
            board={board}
            isViewer={isViewer}

            handleAddList={handleAddList}
            renameList={renameList}
            deleteList={deleteList}
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

        {activeTab === "timeline" && (
          <div className="p-6 text-center text-gray-500">Chưa phát triển</div>
        )}

        {activeTab === "members" && (
          <div className="p-6 text-center text-gray-500">
            Quản lý thành viên đang cập nhật
          </div>
        )}
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

      {confirmDeleteList && (
        <ConfirmModal
          open={true}
          title="Xoá danh sách"
          message={`Xác nhận xóa "${confirmDeleteList.title}"? Các thẻ của danh sách sẽ được chuyển vào thùng rác!`}
          confirmText="Xoá"
          onClose={() => setConfirmDeleteList(null)}
          onConfirm={() => {
            deleteList(confirmDeleteList.id);
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

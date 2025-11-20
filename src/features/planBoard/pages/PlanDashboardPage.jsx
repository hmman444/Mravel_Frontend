"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import {
  FaChevronLeft,
  FaChevronRight,
  FaShareAlt,
  FaPlus,
  FaUserCircle,
} from "react-icons/fa";

import Navbar from "../../../components/Navbar";
import SidebarPlans from "../components/SidebarPlans";
import PlanList from "../components/PlanList";
import ShareModal from "../components/modals/ShareModal";
import EditCardModal from "../components/modals/EditCardModal";
import LabelModal from "../components/modals/LabelModal";
import ConfirmModal from "../../../components/ConfirmModal";
import PlanSummary from "../components/PlanSummary";
import AccessRequestModal from "../components/modals/AccessRequestModal";

import { usePlanBoard } from "../hooks/usePlanBoard";
import { showSuccess, showError } from "../../../utils/toastUtils";

export default function PlanDashboardPage() {
  const { planId } = useParams();

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
    isOwner
  } = usePlanBoard(planId);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  const [editingListId, setEditingListId] = useState(null);
  const [activeListMenu, setActiveListMenu] = useState(null);
  const [activeCardMenu, setActiveCardMenu] = useState(null);

  const [editCard, setEditCard] = useState(null);
  const [showLabelModal, setShowLabelModal] = useState(false);

  const [newCardListId, setNewCardListId] = useState(null);
  const [newCardText, setNewCardText] = useState("");

  const [confirmDeleteCard, setConfirmDeleteCard] = useState(null);
  const [confirmDeleteList, setConfirmDeleteList] = useState(null);

  const [, setActiveCard] = useState(null);

  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessLoadingType, setAccessLoadingType] = useState(null);

  useEffect(() => {
    if (!planId) return;
    load();
  }, [planId]);

  useEffect(() => {
    if (
      !loading &&
      !board &&
      typeof error === "string" &&
      error.includes("You don't have permission to view this board")
    ) {
      setShowAccessModal(true);
    } else {
      setShowAccessModal(false);
    }
  }, [loading, board, error]);

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
      console.error("❌ Reorder failed:", err);
      load();
    }
  };

  const handleAddList = async () => {
    try {
      await createList({ title: `Ngày ${(board?.lists?.length || 0) + 1}` });
      showSuccess("Đã thêm danh sách");
    } catch {
      showError("Không thể thêm danh sách");
    }
  };

  const handleAddCard = async (listId) => {
    if (!newCardText.trim()) return;
    try {
      await createCard(listId, { text: newCardText });
      showSuccess("Đã thêm thẻ");
    } catch {
      showError("Không thêm được thẻ");
    }
    setNewCardListId(null);
    setNewCardText("");
  };

  const handleUpdateCard = async (listId, cardId, data) => {
    try {
      const payload = {
        text: data.text,
        description: data.description,
        priority: data.priority,
        start: data.start,
        end: data.end,
        done: data.done,
        labelIds: (data.labels || []).map((l) => l.id),
      };

      await updateCard(listId, cardId, payload);
      showSuccess("Đã cập nhật");
      setEditCard(null);
    } catch {
      showError("Không thể cập nhật");
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
      ?.cards.find((c) => c.id === cardId);
    if (!card) return;

    try {
      const updated = { ...card, done: !card.done };
      await updateCard(listId, cardId, updated);
    } catch (err) {
      console.error("❌ Lỗi toggle done:", err);
    }
  };

  const duplicateCard = async (card, listId) => {
    try {
      const payload = {
        text: card.text + " (Copy)",
        description: card.description,
        priority: card.priority,
        start: card.start,
        end: card.end,
        done: false,
        labelIds: (card.labels || []).map((l) => l.id),
      };

      await createCard(listId, payload);
      showSuccess("Đã sao chép thẻ");
    } catch {
      showError("Không thể sao chép thẻ");
    }
  };

  const duplicateList = async (list) => {
    try {
      const newListAction = await createList({
        title: list.title + " (Copy)",
      });
      const newList = newListAction.payload || newListAction;

      for (const card of list.cards || []) {
        const payload = {
          text: card.text,
          description: card.description,
          priority: card.priority,
          start: card.start,
          end: card.end,
          done: false,
          labelIds: (card.labels || []).map((l) => l.id),
        };
        await createCard(newList.id, payload);
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
      showSuccess("Đã gửi yêu cầu quyền xem đến chủ sở hữu.");
      setShowAccessModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAccessLoadingType(null);
    }
  };

  const handleRequestEdit = async () => {
    try {
      setAccessLoadingType("EDIT");
      await requestAccess("EDIT");
      showSuccess("Đã gửi yêu cầu quyền chỉnh sửa đến chủ sở hữu.");
      setShowAccessModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAccessLoadingType(null);
    }
  };

  if (loading && !board) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-6 py-4 shadow-xl shadow-gray-200/60 backdrop-blur dark:bg-gray-800/90 dark:shadow-black/40 animate-fadeIn">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-200">
            Đang tải lịch trình...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <Navbar fixedWhite />

      <div className="relative mt-16 flex flex-1 overflow-hidden">
        <div
          className={`fixed top-16 left-0 z-30 h-[calc(100vh-4rem)]  bg-white/80 shadow-xl shadow-gray-200/70 backdrop-blur-md transition-transform duration-300 ease-out dark:bg-gray-900/90 dark:shadow-black/40 ${
            sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <SidebarPlans activePlanId={planId} collapsed={sidebarCollapsed} />
        </div>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`fixed z-40 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow-lg shadow-gray-300/60 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/90 dark:shadow-black/40 ${
            sidebarCollapsed ? "left-3" : "left-72"
          }`}
          style={{
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {sidebarCollapsed ? (
            <FaChevronRight size={14} className="text-gray-600" />
          ) : (
            <FaChevronLeft size={14} className="text-gray-600" />
          )}
        </button>

        <div
          className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-out ${
            sidebarCollapsed ? "ml-0" : "ml-72"
          }`}
        >
          <div className="flex items-center gap-4 border-b border-gray-100 bg-white/80 px-6 py-3 shadow-sm shadow-gray-200/60 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-black/30">
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {board?.planTitle || "Lịch trình"}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sắp xếp, chia sẻ và theo dõi hành trình của bạn
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="flex -space-x-2">
                {(board?.invites || []).slice(0, 3).map((inv, i) => (
                  <span
                    key={i}
                    title={inv.email}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-gray-500 shadow-sm dark:border-gray-900 dark:bg-gray-800"
                  >
                    <FaUserCircle />
                  </span>
                ))}
              </div>

              {board && (
                <button
                  onClick={() => setOpenShare(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/90 via-blue-500/90 to-indigo-500/90 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0"
                >
                  <FaShareAlt className="text-[13px]" />
                  <span>Chia sẻ</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-gray-100 bg-white/90 px-4 pt-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
            <div className="flex gap-2 rounded-full bg-gray-100/80 p-1 text-sm text-gray-500 shadow-inner shadow-white/60 dark:bg-gray-800/80 dark:text-gray-300 dark:shadow-black/40">
              {[
                { key: "summary", label: "Tổng quan" },
                { key: "board", label: "Bảng lịch trình" },
                { key: "timeline", label: "Biểu đồ thời gian" },
                { key: "members", label: "Thành viên" },
              ].map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                      active
                        ? "bg-white text-primary shadow-sm shadow-blue-500/20 dark:bg-gray-900"
                        : "text-gray-500 hover:text-gray-800 hover:bg-white/70 dark:hover:bg-gray-700/70 dark:hover:text-gray-100"
                    }`}
                  >
                    {tab.label}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50/90 to-gray-100/90 p-5 pb-6 dark:from-gray-900/90 dark:to-gray-950/90">
            <div className="h-full rounded-2xl bg-white/90 p-4 shadow dark:bg-gray-900/90 animate-opacityFade">
              {activeTab === "summary" && board && (
                <div className="h-full overflow-auto pr-1">
                  <PlanSummary plan={board} />
                </div>
              )}

              {activeTab === "board" && board && (
                <div className="flex h-full flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                        Lịch trình chi tiết
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Kéo thả để sắp xếp, thêm ngày và thẻ cho từng hoạt động
                      </p>
                    </div>
                    <button
                      onClick={!isViewer ? handleAddList : undefined}
                      className={`
                        inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white
                        ${isViewer 
                          ? "opacity-40 cursor-not-allowed bg-gray-400" 
                          : "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md hover:-translate-y-0.5 hover:shadow-lg"
                        }
                      `}
                    >
                      <FaPlus className="text-xs" />
                      <span>Thêm ngày</span>
                    </button>
                  </div>

                  <div className="relative flex-1 overflow-hidden">
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent dark:from-gray-900 dark:via-gray-900/80" />
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable
                        droppableId="all-lists"
                        direction="horizontal"
                        type="list"
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex h-full items-start gap-5 overflow-x-auto pb-3 pr-4 no-transform"
                          >
                            {board.lists?.map((list, idx) => (
                              <PlanList
                                key={`list-${list.id}`}
                                list={list}
                                index={idx}
                                editingListId={editingListId}
                                setEditingListId={setEditingListId}
                                newCardListId={newCardListId}
                                setNewCardListId={setNewCardListId}
                                newCardText={newCardText}
                                setNewCardText={setNewCardText}
                                handleAddCard={handleAddCard}
                                setActiveCard={setActiveCard}
                                setEditCard={setEditCard}
                                deleteList={deleteList}
                                deleteCard={setConfirmDeleteCard}
                                duplicateCard={duplicateCard}
                                activeListMenu={activeListMenu}
                                setActiveListMenu={setActiveListMenu}
                                activeCardMenu={activeCardMenu}
                                setActiveCardMenu={setActiveCardMenu}
                                toggleDone={toggleDone}
                                setConfirmDeleteCard={setConfirmDeleteCard}
                                setConfirmDeleteList={setConfirmDeleteList}
                                renameList={renameList}
                                duplicateList={duplicateList}
                              />
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>
              )}

              {activeTab === "timeline" && (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 shadow-inner shadow-blue-100/70 dark:bg-blue-900/20 dark:text-blue-300">
                    🕓
                  </div>
                  <p className="text-sm font-medium">
                    Biểu đồ thời gian đang được phát triển
                  </p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Sắp tới bạn sẽ xem được dòng thời gian trực quan của toàn
                    bộ lịch trình.
                  </p>
                </div>
              )}

              {activeTab === "members" && (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shadow-inner shadow-emerald-100/70 dark:bg-emerald-900/20 dark:text-emerald-300">
                    👥
                  </div>
                  <p className="text-sm font-medium">
                    Quản lý thành viên đang được phát triển
                  </p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Bạn sẽ sớm có thể theo dõi và phân quyền chi tiết cho từng
                    người tham gia.
                  </p>
                </div>
              )}

              {!board && !loading && (
                <div className="mt-8 flex flex-col items-center justify-center text-center text-sm text-gray-500 dark:text-gray-400">
                  <p className="mb-2">
                    Bạn chưa có quyền truy cập đầy đủ vào lịch trình này.
                  </p>
                  <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">
                    Gửi yêu cầu để chủ sở hữu cấp quyền xem hoặc chỉnh sửa.
                  </p>
                  <button
                    onClick={() => setShowAccessModal(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0"
                  >
                    Yêu cầu quyền truy cập
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {board && (
        <ShareModal
          isOpen={openShare}
          planId={planId}
          onClose={() => setOpenShare(false)}
          planName={board.planTitle}
          initialVisibility={board.visibility}
        />
      )}

      {editCard && board && (
        <EditCardModal
          editCard={editCard}
          setEditCard={setEditCard}
          saveCard={() =>
            handleUpdateCard(editCard.listId, editCard.id, editCard)
          }
          labels={board.labels || []}
          setShowLabelModal={setShowLabelModal}
          onClose={() => setEditCard(null)}
        />
      )}

      {showLabelModal && (
        <LabelModal
          planId={planId}
          editCard={editCard}
          setEditCard={setEditCard}
          onClose={() => setShowLabelModal(false)}
        />
      )}

      {confirmDeleteCard && (
        <ConfirmModal
          open={true}
          title="Xoá thẻ"
          message={`Xoá thẻ "${confirmDeleteCard.card.text}"?`}
          confirmText="Xoá"
          cancelText="Hủy"
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
          message={`Xoá "${confirmDeleteList.title}" và toàn bộ thẻ?`}
          confirmText="Xoá"
          cancelText="Hủy"
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
        visibility={board?.visibility || "PRIVATE"}
        onRequestView={handleRequestView}
        onRequestEdit={handleRequestEdit}
        loadingType={accessLoadingType}
      />
    </div>
  );
}

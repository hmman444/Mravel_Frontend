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
import { useDispatch } from "react-redux";

import Navbar from "../../../components/Navbar";
import SidebarPlans from "../components/SidebarPlans";
import PlanList from "../components/PlanList";
import ShareModal from "../components/modals/ShareModal";
import EditCardModal from "../components/modals/EditCardModal";
import LabelModal from "../components/modals/LabelModal";
import ConfirmModal from "../../../components/ConfirmModal";
import PlanSummary from "../components/PlanSummary";

import { usePlanBoard } from "../hooks/usePlanBoard";
import { showSuccess, showError } from "../../../utils/toastUtils";

export default function PlanDashboardPage() {
  const { planId } = useParams();
  const dispatch = useDispatch();

  const {
    board,
    loading,
    load,
    createList,
    renameList,
    deleteList,
    createCard,
    updateCard,
    deleteCard,
    reorder,
    localReorder,
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

  const [activeCard, setActiveCard] = useState(null);

  // đổi plan
  useEffect(() => {
    if (planId) load();
  }, [planId]);

  // drag drop
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
      // rollback lại từ server nếu có lỗi
      load();
    }
  };

  // crud list card
  const handleAddList = async () => {
    try {
      await createList({ title: `Ngày ${board?.lists?.length + 1}` });
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

  // toggleDone
  const toggleDone = async (listId, cardId) => {
    const card = board.lists
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

  // duplicate
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
      const newList = await createList({
        title: list.title + " (Copy)",
      }).unwrap();

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

  // render loading
  if (loading || !board)
    return (
      <div className="p-8 text-center text-gray-500">
        Đang tải lịch trình...
      </div>
    );

  // render page
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar fixedWhite />

      <div className="flex flex-1 mt-16 overflow-hidden relative">
        {/* sidebar */}
        <div
          className={`fixed top-16 left-0 h-[calc(100vh-4rem)] transition-transform duration-300 z-30 ${
            sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <SidebarPlans activePlanId={planId} collapsed={sidebarCollapsed} />
        </div>

        {/* toggle sidebar */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="fixed z-40 flex items-center justify-center w-8 h-8 rounded-full bg-white border shadow-md hover:bg-gray-100 dark:bg-gray-800 transition"
          style={{
            top: "50%",
            left: sidebarCollapsed ? "10px" : "280px",
            transform: "translateY(-50%)",
          }}
        >
          {sidebarCollapsed ? (
            <FaChevronRight size={14} className="text-gray-600" />
          ) : (
            <FaChevronLeft size={14} className="text-gray-600" />
          )}
        </button>

        {/* main*/}
        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
            sidebarCollapsed ? "ml-0" : "ml-72"
          }`}
        >
          {/* header */}
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center gap-3 border-b">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {board.planTitle}
            </h1>

            <div className="ml-auto flex items-center -space-x-2">
              {(board.invites || []).slice(0, 3).map((inv, i) => (
                <span
                  key={i}
                  title={inv.email}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-gray-800 bg-gray-200"
                >
                  <FaUserCircle className="text-gray-500" />
                </span>
              ))}
            </div>

            <button
              onClick={() => setOpenShare(true)}
              className="ml-3 inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-700 px-3 py-2 hover:bg-blue-200"
            >
              <FaShareAlt /> Chia sẻ
            </button>
          </div>

          {/* tab */}
          <div className="flex gap-6 border-b bg-white dark:bg-gray-800 px-4">
            {["summary", "board", "timeline", "members"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`capitalize pb-2 border-b-2 -mb-px transition ${
                  activeTab === tab
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-gray-500 hover:text-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* tab content */}
          <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
            {activeTab === "summary" && <PlanSummary plan={board} />}

            {activeTab === "board" && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Lịch trình chi tiết</h2>
                  <button
                    onClick={handleAddList}
                    className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2"
                  >
                    <FaPlus /> Thêm ngày
                  </button>
                </div>

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
                        className="flex gap-6 items-start overflow-x-auto pb-4"
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
              </>
            )}

            {activeTab === "timeline" && (
              <div className="text-center text-gray-500 py-10">
                🕓 Biểu đồ thời gian – đang phát triển
              </div>
            )}

            {activeTab === "members" && (
              <div className="text-center text-gray-500 py-10">
                👥 Thành viên – đang phát triển
              </div>
            )}
          </div>
        </div>
      </div>

      {/* modals */}
      <ShareModal
        isOpen={openShare}
        planId={planId}
        onClose={() => setOpenShare(false)}
        planName={board.planTitle}
        initialVisibility={board.visibility}
      />

      {editCard && (
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

      {/* Delete Card Confirm */}
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
    </div>
  );
}

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
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal";
import ConfirmModal from "../../../components/ConfirmModal";
import PlanSummary from "../components/PlanSummary";
import { usePlanBoard } from "../hooks/usePlanBoard";
import { addCard } from "../slices/planBoardSlice";
import { showSuccess, showError } from "../../../utils/toastUtils";

export default function PlanDashboardPage() {
  const { planId } = useParams(); // ✅ lấy id từ URL
  const dispatch = useDispatch();

  // Hook Redux kết nối board thật
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
    upsertLabel,
    invite,
    localReorder,
  } = usePlanBoard(planId);

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [editingListId, setEditingListId] = useState(null);
  const [newCardListId, setNewCardListId] = useState(null);
  const [newCardText, setNewCardText] = useState("");
  const [activeListMenu, setActiveListMenu] = useState(null);
  const [activeCardMenu, setActiveCardMenu] = useState(null);
  const [confirmDeleteCard, setConfirmDeleteCard] = useState(null);
  const [confirmDeleteList, setConfirmDeleteList] = useState(null);
  const [description, setDescription] = useState(board?.description || "");
  const [startDate, setStartDate] = useState(board?.startDate ? new Date(board.startDate) : null);
  const [endDate, setEndDate] = useState(board?.endDate ? new Date(board.endDate) : null);
  const [images, setImages] = useState(board?.images || []);
  const [activeCard, setActiveCard] = useState(null);
  // Load dữ liệu khi mở trang
  useEffect(() => {
    if (planId) load();
  }, [planId]);
  

  /* ---------------------- DND logic ---------------------- */
  const handleDragEnd = async (result) => {
    if (!result?.destination) return;
    if (result.reason === "CANCEL") return;

    const { source, destination, type } = result;
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const payload = {
      type,
      sourceListId: Number(source.droppableId),
      destListId: Number(destination.droppableId),
      sourceIndex: source.index,
      destIndex: destination.index,
    };
console.log("Before reorder local", 
  board.lists.map(l => ({ id: l.id, cards: l.cards.map(c => c.id) }))
);
    dispatch(localReorder(payload));
    setTimeout(() => {
      console.log("After reorder local (delayed)",
        JSON.parse(JSON.stringify(board.lists.map(l => ({
          id: l.id,
          cards: l.cards.map(c => c.id)
        }))))
      );
    }, 300);

        console.log("DnD =>", {
  sourceListId: source.droppableId,
  destListId: destination.droppableId,
  sourceIndex: source.index,
  destIndex: destination.index,
});
    try {
      await reorder(payload).unwrap();
    } catch (err) {
      console.error("❌ Lỗi reorder:", err);
      showError("Cập nhật vị trí thất bại");
      await load();
    }
  };

  /* ---------------------- CRUD list & card ---------------------- */
  const handleAddList = async () => {
    try {
      await createList({ title: `Ngày ${board?.lists?.length + 1}` });
      showSuccess("Đã thêm danh sách mới");
    } catch {
      showError("Không thể thêm danh sách");
    }
  };

  const confirmAddCard = async (listId) => {
    if (!newCardText.trim()) return;
    try {
      await createCard(listId, { text: newCardText });
      setNewCardListId(null);
      setNewCardText("");
      showSuccess("Đã thêm thẻ mới");
    } catch {
      showError("Không thể thêm thẻ");
    }
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
      await updateCard(listId, cardId, payload).unwrap();
      showSuccess("Đã cập nhật thẻ");
      setEditCard(null);
    } catch (err) {
      console.error(err);
      showError("Không thể cập nhật thẻ");
    }
  };

  const handleDeleteCard = async (listId, cardId) => {
    try {
      await deleteCard(listId, cardId);
      showSuccess("Đã xóa thẻ");
    } catch {
      showError("Không thể xóa thẻ");
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
        labelIds: card.labels?.map((l) => l.id) || [],
      };
      await dispatch(addCard({ planId, listId, payload })).unwrap();
      showSuccess("Đã sao chép thẻ");
    } catch (err) {
      console.error("❌ Lỗi copy:", err);
    }
  };

  const duplicateList = async (list) => {
    try {
      const newTitle = list.title + " (Copy)";
      const newList = await createList({ title: newTitle }).unwrap();
      for (const card of list.cards || []) {
        const payload = {
          text: card.text,
          description: card.description,
          priority: card.priority,
          start: card.start,
          end: card.end,
          done: false,
          labelIds: card.labels?.map((l) => l.id) || [],
        };
        await createCard(newList.id, payload);
      }
      showSuccess("Đã sao chép danh sách");
    } catch {
      showError("Không thể sao chép danh sách");
    }
  };

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

  const handleInvite = async (payload) => {
    try {
      await invite(payload);
      showSuccess("Đã gửi lời mời");
      setOpenShare(false);
    } catch {
      showError("Không thể gửi lời mời");
    }
  };

  if (loading || !board)
    return (
      <div className="p-8 text-center text-gray-500">Đang tải lịch trình...</div>
    );

  /* ---------------------- RENDER ---------------------- */
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar fixedWhite />

      <div className="flex flex-1 mt-16 overflow-hidden relative">
        {/* Sidebar */}
        <div
          className={`fixed top-16 left-0 h-[calc(100vh-4rem)] transition-transform duration-300 ease-in-out z-30 ${
            sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <SidebarPlans
            onSelectPlan={() => {}}
            activePlanId={planId}
            collapsed={sidebarCollapsed}
            onAddToPlan={() => {}}
          />
        </div>

        {/* Nút toggle sidebar */}
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
            <FaChevronRight className="text-gray-600" size={14} />
          ) : (
            <FaChevronLeft className="text-gray-600" size={14} />
          )}
        </button>

        {/* Main */}
        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
            sidebarCollapsed ? "ml-0" : "ml-72"
          }`}
        >
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center gap-3 border-b">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {board.planTitle}
            </h1>
            <div className="ml-auto flex items-center -space-x-2">
              {board.invites?.slice(0, 3).map((inv, i) => (
                <span
                  key={i}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 text-xs"
                  title={inv.email}
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

          {/* Tabs */}
          <div className="flex gap-6 border-b bg-white dark:bg-gray-800 px-4 sm:px-6">
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

          {/* Nội dung tab */}
          <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
            {activeTab === "summary" && (
              <PlanSummary
                plan={board}
                startDate={board.startDate}
                endDate={board.endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                visibility={board.visibility}
                setVisibility={() => {}}
                images={board.images}
                setImages={setImages}
                description={board.description}
                setDescription={setDescription}
              />
            )}

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
                        key="plan-lists-container"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex gap-6 items-start overflow-x-auto pb-4"
                      >
                        {board.lists?.map((list, idx) => (
                          <PlanList
                            key= {`list-${list.id}`}
                            list={list}
                            index={idx}
                            editingListId={editingListId}
                            setEditingListId={setEditingListId}
                            newCardListId={newCardListId}
                            setNewCardListId={setNewCardListId}
                            newCardText={newCardText}
                            setNewCardText={setNewCardText}
                            confirmAddCard={confirmAddCard}
                            setActiveCard={setActiveCard} 
                            setEditCard={setEditCard}
                            deleteList={deleteList}
                            deleteCard={handleDeleteCard}
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
              <div className="text-gray-600 dark:text-gray-300 text-center p-6">
                🕓 Biểu đồ thời gian (đang phát triển)
              </div>
            )}

            {activeTab === "members" && (
              <div className="text-gray-600 dark:text-gray-300 text-center p-6">
                👥 Danh sách thành viên (đang phát triển)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {editCard && (
        <EditCardModal
          editCard={editCard}
          setEditCard={(data) =>
            setEditCard({ ...data, listId: editCard.listId })
          }
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
          colors={[
            "bg-red-500",
            "bg-green-600",
            "bg-blue-500",
            "bg-yellow-400",
            "bg-purple-600",
            "bg-pink-500",
          ]}
          editCard={editCard}
          setEditCard={setEditCard}
          onClose={() => setShowLabelModal(false)}
        />
      )}

      <ShareModal
        isOpen={openShare}
        planId={planId}
        onClose={() => setOpenShare(false)}
        planName={board.planTitle}
        initialVisibility={board.visibility} 
        invites={board.invites || []}
      />

      {confirmDeleteCard && (
        <ConfirmModal
          open={true}
          title="Xóa thẻ"
          message={`Bạn có chắc muốn xóa thẻ "${confirmDeleteCard.card.text}"?`}
          confirmText="Xóa"
          cancelText="Hủy"
          onClose={() => setConfirmDeleteCard(null)}
          onConfirm={() => {
            handleDeleteCard(
              confirmDeleteCard.listId,
              confirmDeleteCard.card.id
            );
            setConfirmDeleteCard(null);
          }}
        />
      )}

      {confirmDeleteList && (
        <ConfirmModal
          open={true}
          title="Xóa danh sách"
          message={`Bạn có chắc muốn xóa danh sách "${confirmDeleteList.title}" và tất cả thẻ bên trong?`}
          confirmText="Xóa"
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

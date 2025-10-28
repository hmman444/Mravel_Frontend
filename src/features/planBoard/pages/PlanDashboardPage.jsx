"use client";
import { useEffect, useState } from "react";
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
import { addCard } from "../slices/planBoardSlice";
import { usePlanBoard } from "../hooks/usePlanBoard";
import { showSuccess, showError } from "../../../utils/toastUtils";
import ConfirmModal from "../../../components/ConfirmModal";

export default function PlanDashboardPage() {
  const planId = 1; // 🔧 tạm thời hardcode, sau lấy từ URL

  // Lấy các hàm thao tác từ Redux hook
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
    localReorder
  } = usePlanBoard(planId);

  const dispatch = useDispatch();
  // State UI
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingListId, setEditingListId] = useState(null);
  const [newCardListId, setNewCardListId] = useState(null);
  const [newCardText, setNewCardText] = useState("");
  const [activeListMenu, setActiveListMenu] = useState(null);
  const [activeCardMenu, setActiveCardMenu] = useState(null); 
  const [confirmDeleteCard, setConfirmDeleteCard] = useState(null);
  const [confirmDeleteList, setConfirmDeleteList] = useState(null);
  
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const handleDragEnd = async (result) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const payload = {
      type,
      sourceListId: Number(source.droppableId),
      destListId: Number(destination.droppableId),
      sourceIndex: source.index,
      destIndex: destination.index,
    };

    dispatch(localReorder(payload));

    try {
      await reorder(payload).unwrap();
      setTimeout(() => {
        load();
      }, 100);
    } catch (err) {
      console.error("❌ Lỗi reorder:", err);
      showError("Cập nhật vị trí thất bại");

      setTimeout(() => {
        load();
      }, 100);
    }
  };

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
      // đúng format backend yêu cầu
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
        labelIds: card.labels?.map(l => l.id) || [],
      };
      await dispatch(addCard({ planId, listId, payload })).unwrap();
    } catch (err) {
      console.error("❌ Lỗi khi tạo bản sao:", err);
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
          labelIds: card.labels?.map(l => l.id) || [],
        };
        await createCard(newList.id, payload);
      }

      showSuccess("Đã tạo bản sao danh sách");
    } catch (err) {
      console.error("❌ Lỗi khi tạo bản sao danh sách:", err);
      showError("Không thể tạo bản sao danh sách");
    }
  };

  const toggleDone = async (listId, cardId) => {
    try {
      // Đảo trạng thái done
      const card = board.lists
        ?.find((l) => l.id === listId)
        ?.cards.find((c) => c.id === cardId);

      if (!card) return;

      const updated = { ...card, done: !card.done };
      await updateCard(listId, cardId, updated);
    } catch (err) {
      console.error("❌ Lỗi khi toggleDone:", err);
    }
  };

  if (loading || !board)
    return <div className="p-8 text-center text-gray-500">Đang tải bảng...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar fixedWhite />
      <div className="flex flex-1 mt-16 overflow-hidden relative">
        {/* SIDEBAR */}
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

        {/* TOGGLE SIDEBAR BUTTON */}
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

        {/* MAIN */}
        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
            sidebarCollapsed ? "ml-0" : "ml-72"
          }`}
        >
          {/* HEADER */}
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

          {/* CONTENT */}
          <div className="flex-1 p-6">
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
                        key={list.id || idx}
                        list={list}
                        index={idx}
                        editingListId={editingListId}
                        setEditingListId={setEditingListId}
                        newCardListId={newCardListId}
                        setNewCardListId={setNewCardListId}
                        newCardText={newCardText}
                        setNewCardText={setNewCardText}
                        confirmAddCard={confirmAddCard}
                        setActiveCard={() => {}}
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
          </div>
        </div>
      </div>

      {/* MODALS */}
      {editCard && (
        <EditCardModal
          editCard={editCard}
          setEditCard={(data) => setEditCard({ ...data, listId: editCard.listId })}
          saveCard={() =>
            handleUpdateCard(editCard.listId, editCard.id, editCard)
          }
          labels={board.labels || []}
          setShowLabelModal={setShowLabelModal}
          onClose={() => setEditCard(null)}        />
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

      {showDeleteConfirm && (
        <ConfirmDeleteModal
          card={showDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(null)}
          onConfirm={() => {
            handleDeleteCard(showDeleteConfirm.listId, showDeleteConfirm.id);
            setShowDeleteConfirm(null);
          }}
        />
      )}

      <ShareModal
        isOpen={openShare}
        onClose={() => setOpenShare(false)}
        planName={board.planTitle}
        onInvite={handleInvite}
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
            handleDeleteCard(confirmDeleteCard.listId, confirmDeleteCard.card.id);
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

import { useMemo, useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import {
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaShareAlt,
  FaUserCircle,
  FaPlus,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

import Navbar from "../../../components/Navbar";
import SidebarPlans from "../components/SidebarPlans";
import ShareModal from "../components/modals/ShareModal";
import PlanList from "../components/PlanList";
import PlanSummary from "../components/PlanSummary";
import EditCardModal from "../components/modals/EditCardModal";
import LabelModal from "../components/modals/LabelModal";
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal";


export default function PlanDashboardPage() {
  const defaultPlan = useMemo(
    () => ({
      id: "1",
      name: "Chuyến đi Đà Lạt 3N2Đ",
      description:
        "Hành trình khám phá Đà Lạt: Hồ Xuân Hương, chợ đêm, ẩm thực địa phương...",
      startDate: "2025-10-05",
      endDate: "2025-10-07",
      visibility: "shared", // public | private | shared
      inviteList: [
        { email: "lan@example.com", role: "editor" },
        { email: "nam@example.com", role: "viewer" },
      ],
      images: ["https://picsum.photos/300/200?dalat"],
    }),
    []
  );
  const [currentPlan, setCurrentPlan] = useState(defaultPlan);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openShare, setOpenShare] = useState(false);

  const [lists, setLists] = useState([
    {
      id: "day-1",
      title: "Ngày 1",
      cards: [
        {
          id: "c1",
          text: "Tham quan Hồ Xuân Hương",
          start: "08:00",
          end: "09:30",
          done: false,
          labels: [{ text: "Tham quan", color: "bg-pink-600" }],
        },
      ],
    },
    {
      id: "day-2",
      title: "Ngày 2",
      cards: [
        {
          id: "c2",
          text: "Đi chợ đêm Đà Lạt",
          start: "19:00",
          end: "21:00",
          done: true,
          labels: [{ text: "Ăn uống", color: "bg-green-600" }],
        },
      ],
    },
  ]);

  const [editingListId, setEditingListId] = useState(null);
  const [newCardListId, setNewCardListId] = useState(null);
  const [newCardText, setNewCardText] = useState("");
  const [activeCard, setActiveCard] = useState(null);
  const [editCard, setEditCard] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [startDate, setStartDate] = useState(
    currentPlan ? new Date(currentPlan.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState(
    currentPlan ? new Date(currentPlan.endDate) : new Date()
  );

  const [labels, setLabels] = useState([
    { text: "Ăn uống", color: "bg-green-600" },
    { text: "Tham quan", color: "bg-pink-600" },
    { text: "Thể thao", color: "bg-blue-600" },
    { text: "Mua sắm", color: "bg-yellow-600" },
    { text: "Khác", color: "bg-purple-600" },
  ]);

  const [showLabelModal, setShowLabelModal] = useState(false);

  const colors = [
    "bg-green-600",
    "bg-yellow-600",
    "bg-red-600",
    "bg-purple-600",
    "bg-blue-600",
    "bg-pink-600",
    "bg-orange-600",
    "bg-gray-600",
  ];

  // Drag & drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, type } = result;

    if (type === "list") {
      const newLists = Array.from(lists);
      const [removed] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, removed);
      setLists(newLists);
    } else {
      const newLists = Array.from(lists);
      const sourceList = newLists.find((l) => l.id === source.droppableId);
      const destList = newLists.find((l) => l.id === destination.droppableId);
      const [moved] = sourceList.cards.splice(source.index, 1);
      destList.cards.splice(destination.index, 0, moved);
      setLists(newLists);
    }
  };

  // CRUD list & card
  const addList = () => {
    const newId = `day-${lists.length + 1}`;
    setLists([
      ...lists,
      { id: newId, title: `Ngày ${lists.length + 1}`, cards: [] },
    ]);
  };

  const confirmAddCard = (listId) => {
    if (!newCardText.trim()) return;
    setLists(
      lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              cards: [
                ...list.cards,
                {
                  id: `c-${Date.now()}`,
                  text: newCardText,
                  done: false,
                  label: null,
                },
              ],
            }
          : list
      )
    );
    setNewCardListId(null);
    setNewCardText("");
  };

  const toggleDone = (listId, cardId) => {
    setLists(
      lists.map((l) =>
        l.id === listId
          ? {
              ...l,
              cards: l.cards.map((c) =>
                c.id === cardId ? { ...c, done: !c.done } : c
              ),
            }
          : l
      )
    );
  };

  const duplicateCard = (card) => {
    setLists(
      lists.map((l) =>
        l.cards.find((c) => c.id === card.id)
          ? { ...l, cards: [...l.cards, { ...card, id: `c-${Date.now()}` }] }
          : l
      )
    );
  };

  const deleteCard = (card) => {
    setLists(
      lists.map((l) => ({ ...l, cards: l.cards.filter((c) => c.id !== card.id) }))
    );
  };

  const duplicateList = (list) => {
    const newCards = list.cards.map((c) => ({
      ...c,
      id: `c-${Date.now()}-${Math.random()}`,
    }));
    setLists([
      ...lists,
      { ...list, id: `day-${Date.now()}`, title: list.title + " (copy)", cards: newCards },
    ]);
  };

  const deleteList = (list) => {
    setLists(lists.filter((l) => l.id !== list.id));
  };

  const saveCard = () => {
    setLists(
      lists.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c.id === editCard.id ? editCard : c)),
      }))
    );
    setActiveCard(null);
    setEditCard(null);
  };

  const handleAddFromSidebar = (item) => {
    if (!lists.length) return;

    const firstListId = lists[0].id;

    const newCard = {
      id: `c-${Date.now()}`,
      text: item.name,
      description: item.description,
      done: false,
      labels: [{ text: "Được gợi ý", color: "bg-blue-500" }],
      start: "08:00",
      end: "09:30",
    };

    setLists(
      lists.map((list) =>
        list.id === firstListId
          ? { ...list, cards: [...list.cards, newCard] }
          : list
      )
    );
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar cố định */}
      <Navbar fixedWhite />

      <div className="flex flex-1 mt-16 overflow-hidden relative">
        <div
          className={`fixed top-16 left-0 h-[calc(100vh-4rem)] transition-transform duration-300 ease-in-out z-30 ${
            sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <SidebarPlans
            onSelectPlan={(p) => setCurrentPlan(p)}
            activePlanId={currentPlan?.id}
            collapsed={sidebarCollapsed}
            onAddToPlan={handleAddFromSidebar}
            onShowDetail={(item) => setSelectedItem(item)}
          />
        </div>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="fixed z-40 flex items-center justify-center w-8 h-8 rounded-full bg-white border shadow-md hover:bg-gray-100 dark:bg-gray-800 transition"
          style={{
            top: "50%", // luôn giữa theo chiều cao viewport
            left: sidebarCollapsed ? "10px" : "280px", // 280px = width sidebar
            transform: "translateY(-50%)",
            transition: "left 0.3s ease-in-out, background 0.3s",
          }}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? (
            <FaChevronRight className="text-gray-600" size={14} />
          ) : (
            <FaChevronLeft className="text-gray-600" size={14} />
          )}
        </button>

        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "ml-0" : "ml-72"
          }`}
        >
          {/* Topbar */}
          <div className=" bg-white dark:bg-gray-800 px-4 sm:px-6 py-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {currentPlan?.name}
              </h1>

            </div>

            <div className="ml-auto flex items-center -space-x-2">
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-gray-800 bg-gray-200"
                  title={`Member ${i + 1}`}
                >
                  <FaUserCircle className="text-gray-500" />
                </span>
              ))}
            </div>

            <button
              onClick={() => setOpenShare(true)}
              className="ml-3 inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-700 px-3 py-2 hover:bg-blue-200 transition"
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-gray-50 dark:bg-gray-900">
            {activeTab === "summary" && (
              <PlanSummary
                plan={currentPlan}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                visibility={currentPlan.visibility}
                setVisibility={(v) =>
                  setCurrentPlan((p) => ({ ...p, visibility: v }))
                }
                images={currentPlan.images}
                setImages={(imgs) =>
                  setCurrentPlan((p) => ({ ...p, images: imgs }))
                }
                description={currentPlan.description}
                setDescription={(desc) =>
                  setCurrentPlan((p) => ({ ...p, description: desc }))
                }
              />
            )}
            {activeTab === "board" && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Lịch trình chi tiết</h2>
                  <button
                    onClick={addList}
                    className="px-4 py-2 bg-primary text-white rounded-lg"
                  >
                    <FaPlus className="inline mr-2" />
                    Thêm ngày
                  </button>
                </div>

                <DragDropContext onDragEnd={handleDragEnd} >
                  <Droppable droppableId="all-lists" direction="horizontal" type="list">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex gap-6 items-start overflow-x-auto pb-4"
                      >
                        {lists.map((list, idx) => (
                          <PlanList
                            key={list.id}
                            list={list}
                            index={idx}
                            editingListId={editingListId}
                            setEditingListId={setEditingListId}
                            lists={lists}
                            setLists={setLists}
                            newCardListId={newCardListId}
                            setNewCardListId={setNewCardListId}
                            newCardText={newCardText}
                            setNewCardText={setNewCardText}
                            confirmAddCard={confirmAddCard}
                            toggleDone={toggleDone}
                            setActiveCard={setActiveCard}
                            setEditCard={setEditCard}
                            duplicateCard={duplicateCard}
                            deleteCard={deleteCard}
                            activeMenu={activeMenu}
                            setActiveMenu={setActiveMenu}
                            duplicateList={duplicateList}
                            deleteList={deleteList}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}

      {activeCard && editCard && (
        <EditCardModal
          editCard={editCard}
          setEditCard={setEditCard}
          saveCard={saveCard}
          labels={labels}
          setShowLabelModal={setShowLabelModal}
          setActiveCard={setActiveCard}
        />
      )}

      {showLabelModal && (
        <LabelModal
          colors={colors}
          editCard={editCard}
          setEditCard={setEditCard}
          setLabels={setLabels}
          onClose={() => setShowLabelModal(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDeleteModal
          card={showDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(null)}
          onConfirm={() => {
            deleteCard(showDeleteConfirm);
            setShowDeleteConfirm(null);
          }}
        />
      )}


      {/* Share modal */}
      <ShareModal
        isOpen={openShare}
        onClose={() => setOpenShare(false)}
        planName={currentPlan?.name}
        onInvite={(payload) => {
          if (payload?.emails?.length) {
            const newInvites = payload.emails.map((email) => ({
              email,
              role: payload.role,
            }));
            setCurrentPlan((p) => ({
              ...p,
              inviteList: [...(p?.inviteList || []), ...newInvites],
            }));
          }
          setOpenShare(false);
        }}
      />
    </div>
  );
}

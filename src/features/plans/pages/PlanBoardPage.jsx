import { useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import bg from "../../../assets/mountain-bg.jpg";
import PlanInfo from "../components/PlanInfo";
import PlanList from "../components/PlanList";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function PlanBoardPage({ plan }) {
  // State chính
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
          label: { text: "Tham quan", color: "bg-pink-400" },
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
          label: { text: "Ăn uống", color: "bg-green-400" },
        },
      ],
    },
  ]);

  const [startDate, setStartDate] = useState(plan?.startDate ? new Date(plan.startDate) : null);
  const [endDate, setEndDate] = useState(plan?.endDate ? new Date(plan.endDate) : null);
  const [visibility, setVisibility] = useState(plan?.visibility || "public");
  const [inviteList, setInviteList] = useState([]);
  const [images, setImages] = useState(["https://picsum.photos/200/200?1"]);

  const [editingListId, setEditingListId] = useState(null);
  const [newCardListId, setNewCardListId] = useState(null);
  const [newCardText, setNewCardText] = useState("");
  const [activeCard, setActiveCard] = useState(null);
  const [editCard, setEditCard] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [description, setDescription] = useState(plan?.description || "");

  // --- Xử lý drag & drop ---
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

  // --- CRUD cho list & card ---
  const addList = () => {
    const newId = `day-${lists.length + 1}`;
    setLists([...lists, { id: newId, title: `Ngày ${lists.length + 1}`, cards: [] }]);
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
                { id: `c-${Date.now()}`, text: newCardText, done: false, label: null },
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
          ? { ...l, cards: l.cards.map((c) => (c.id === cardId ? { ...c, done: !c.done } : c)) }
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
    setLists(lists.map((l) => ({ ...l, cards: l.cards.filter((c) => c.id !== card.id) })));
  };

  const duplicateList = (list) => {
    const newCards = list.cards.map((c) => ({ ...c, id: `c-${Date.now()}-${Math.random()}` }));
    setLists([...lists, { ...list, id: `day-${Date.now()}`, title: list.title + " (copy)", cards: newCards }]);
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

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bg})` }}>
      <Navbar fixedWhite />

      <main className="flex-1 mt-16 p-6 flex flex-col items-center">
        {/* Thông tin chung */}
        <PlanInfo
          plan={plan}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          visibility={visibility}
          setVisibility={setVisibility}
          inviteList={inviteList}
          setInviteList={setInviteList}
          images={images}
          setImages={setImages}
          description={description}
          setDescription={setDescription}
        />

        {/* Danh sách ngày */}
        <div className="flex justify-between items-center mb-4 w-full md:w-3/5">
          <h2 className="text-xl font-semibold">Lịch trình chi tiết</h2>
          <button onClick={addList} className="px-4 py-2 bg-primary text-white rounded-lg">
            + Thêm ngày
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}  className="flex gap-6 items-start overflow-x-auto pb-4 w-full md:w-3/5">
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
      </main>

      {/* Modal chỉnh sửa thẻ */}
      {activeCard && editCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px] relative">
            <button onClick={() => { setActiveCard(null); setEditCard(null); }} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
              <FaTimes />
            </button>
            <h3 className="text-lg font-bold mb-3">Chỉnh sửa thẻ</h3>
            <input value={editCard.text} onChange={(e) => setEditCard({ ...editCard, text: e.target.value })} className="w-full border rounded-lg px-2 py-1 mb-3" />
            <label className="text-sm block mb-1">Thời gian bắt đầu</label>
            <input type="time" value={editCard.start || ""} onChange={(e) => setEditCard({ ...editCard, start: e.target.value })} className="w-full border rounded-lg px-2 py-1 mb-3" />
            <label className="text-sm block mb-1">Thời gian kết thúc</label>
            <input type="time" value={editCard.end || ""} onChange={(e) => setEditCard({ ...editCard, end: e.target.value })} className="w-full border rounded-lg px-2 py-1 mb-3" />
            <label className="text-sm block mb-1">Mô tả</label>
            <textarea className="w-full border rounded-lg px-2 py-1 mb-3" placeholder="Thêm mô tả chi tiết..." />
            <button onClick={saveCard} className="px-4 py-2 bg-primary text-white rounded-lg mt-4">Lưu</button>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
            <p className="mb-6">Bạn có chắc chắn muốn xóa thẻ "{showDeleteConfirm.text}"?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 bg-gray-200 rounded-lg">Hủy</button>
              <button onClick={() => { deleteCard(showDeleteConfirm); setShowDeleteConfirm(null); }} className="px-4 py-2 bg-red-500 text-white rounded-lg">Xóa</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

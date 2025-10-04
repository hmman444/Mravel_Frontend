import { Droppable, Draggable } from "@hello-pangea/dnd";
import { FaPlus, FaEllipsisV, FaCheck, FaTimes } from "react-icons/fa";
import PlanCard from "./PlanCard";

export default function PlanList({
  list,
  index,
  editingListId,
  setEditingListId,
  lists,
  setLists,
  newCardListId,
  setNewCardListId,
  newCardText,
  setNewCardText,
  confirmAddCard,
  toggleDone,
  setActiveCard,
  setEditCard,
  duplicateCard,
  deleteCard,
  activeMenu,
  setActiveMenu,
  duplicateList,
  deleteList,
}) {
  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 w-64 flex-shrink-0 shadow-md"
        >
          <div
            className="flex justify-between items-center mb-3"
            {...provided.dragHandleProps}
          >
            {editingListId === list.id ? (
              <input
                defaultValue={list.title}
                onBlur={(e) => {
                  setLists(
                    lists.map((l) =>
                      l.id === list.id ? { ...l, title: e.target.value } : l
                    )
                  );
                  setEditingListId(null);
                }}
                autoFocus
                className="font-semibold w-full bg-transparent outline-none"
              />
            ) : (
              <h3
                onClick={() => setEditingListId(list.id)}
                className="font-semibold cursor-pointer hover:underline"
              >
                {list.title}
              </h3>
            )}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === list.id ? null : list.id);
                }}
              >
                <FaEllipsisV />
              </button>
              {activeMenu === list.id && (
                <div
                  className="absolute right-0 mt-1 bg-white dark:bg-gray-700 shadow-md rounded-md w-32 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      duplicateList(list);
                      setActiveMenu(null);
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Tạo bản sao
                  </button>
                  <button
                    onClick={() => {
                      deleteList(list);
                      setActiveMenu(null);
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          </div>

          <Droppable droppableId={list.id} type="card">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2 min-h-[1px] max-h-[560px] overflow-y-auto"
              >
                {list.cards.map((card, idx) => (
                  <Draggable key={card.id} draggableId={card.id} index={idx}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <PlanCard
                          card={card}
                          listId={list.id}
                          toggleDone={toggleDone}
                          setActiveCard={setActiveCard}
                          setEditCard={setEditCard}
                          duplicateCard={duplicateCard}
                          deleteCard={deleteCard}
                          activeMenu={activeMenu}
                          setActiveMenu={setActiveMenu}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {newCardListId === list.id ? (
            <div className="mt-2">
              <textarea
                value={newCardText}
                onChange={(e) => setNewCardText(e.target.value)}
                className="w-full border rounded-lg px-2 py-1 text-sm"
                placeholder="Nhập tên thẻ..."
                autoFocus
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => confirmAddCard(list.id)}
                  className="px-2 py-1 bg-primary text-white rounded-lg text-sm flex items-center gap-1"
                >
                  <FaCheck /> Lưu
                </button>
                <button
                  onClick={() => setNewCardListId(null)}
                  className="px-2 py-1 bg-gray-200 rounded-lg text-sm flex items-center gap-1"
                >
                  <FaTimes /> Hủy
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setNewCardListId(list.id)}
              className="flex items-center gap-1 text-sm text-primary mt-2"
            >
              <FaPlus /> Thêm thẻ
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
}

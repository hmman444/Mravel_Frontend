import { useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import PlanList from "./PlanList";

export default function PlanBoard({ plan }) {
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
          text: "Ăn trưa tại Memory",
          start: "12:00",
          end: "13:30",
          done: false,
          labels: [{ text: "Ăn uống", color: "bg-green-600" }],
        },
      ],
    },
  ]);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Bảng lịch trình</h2>
        <button
          onClick={() =>
            setLists([
              ...lists,
              { id: `day-${Date.now()}`, title: `Ngày ${lists.length + 1}`, cards: [] },
            ])
          }
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          + Thêm ngày
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
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
                  lists={lists}
                  setLists={setLists}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

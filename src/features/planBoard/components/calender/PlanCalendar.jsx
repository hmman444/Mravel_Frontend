// src/features/planBoard/components/PlanCalendar.jsx
"use client";

import { usePlanCalendarLogic } from "../../hooks/usePlanCalendarLogic";
import PlanCalendarSidebar from "./PlanCalendarSidebar";
import PlanCalendarWeekGrid from "./PlanCalendarWeekGrid";
import ActivityTypePicker from "./ActivityTypePicker";
import ActivityModals from "../modals/ActivityModals";

export default function PlanCalendar({
  board,
  canEdit,
  planMembers,
  createActivityCard,
  updateActivityCard,
  onMoveCard,
}) {
  const {
    selectedDate,
    visibleMonth,
    creatingSlot,
    setCreatingSlot,
    modalStates,
    editingCard,
    weekDays,
    dayListMap,
    eventsByDate,
    planStart,
    planEnd,
    monthDays,
    weekLabel,
    handlePrevMonth,
    handleNextMonth,
    handleSelectDate,
    handleOpenCreateFromSlot,
    handleOpenEvent,
    handleSubmitActivity,
    getEventStyle,
    closeModal,
    } = usePlanCalendarLogic({
    board,
    canEdit,
    createActivityCard,
    updateActivityCard,
    });

  return (
    <div className="h-full flex gap-4">
      {/* LEFT SIDEBAR */}
      <PlanCalendarSidebar
        visibleMonth={visibleMonth}
        monthDays={monthDays}
        selectedDate={selectedDate}
        planStart={planStart}
        planEnd={planEnd}
        weekLabel={weekLabel}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onSelectDate={handleSelectDate}
      />

      {/* RIGHT: weekly calendar */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Thời gian biểu
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hiển thị & chỉnh sửa hoạt động theo ngày/giờ từ PlanBoard.
            </p>
          </div>
        </div>

        <PlanCalendarWeekGrid
            weekDays={weekDays}
            selectedDate={selectedDate}
            planStart={planStart}
            planEnd={planEnd}
            dayListMap={dayListMap}
            canEdit={canEdit}
            eventsByDate={eventsByDate}
            getEventStyle={getEventStyle}
            onDoubleClickSlot={(dateStr, hour) =>
                setCreatingSlot({ dateStr, hour })
            }
            onClickCreateSlot={(dateStr, hour) =>
                setCreatingSlot({ dateStr, hour })
            }
            onOpenEvent={handleOpenEvent}
            />

        {canEdit && (
          <ActivityTypePicker
            creatingSlot={creatingSlot}
            onClose={() => setCreatingSlot(null)}
            onOpenCreate={handleOpenCreateFromSlot}
          />
        )}

        <ActivityModals
          modalStates={modalStates}
          closeModal={closeModal}
          handleSubmitActivity={handleSubmitActivity}
          editingCard={editingCard}
          planMembers={planMembers}
        />
      </div>
    </div>
  );
}

// src/features/planBoard/hooks/usePlanCalendarLogic.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { buildCalendarEventsFromBoard } from "../utils/calendarUtils";
import {
  HOURS,
  toDateOnly,
  getWeekDays,
  buildDayListMap,
  buildMonthMatrix,
  getEventPalette,
  assignLanesForDay,
} from "../utils/calendarUtils";

export function usePlanCalendarLogic({
  board,
  canEdit,
  createActivityCard,
  updateActivityCard,
}) {
  const [anchorDate, setAnchorDate] = useState(() =>
    board?.startDate ? new Date(board.startDate) : new Date()
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    board?.startDate ? new Date(board.startDate) : new Date()
  );
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const base = board?.startDate ? new Date(board.startDate) : new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  useEffect(() => {
    if (!board?.startDate) return;
    const base = new Date(board.startDate);
    setAnchorDate(base);
    setSelectedDate(base);
    setVisibleMonth({ year: base.getFullYear(), month: base.getMonth() });
  }, [board?.startDate]);

  // popup chọn activity
  const [creatingSlot, setCreatingSlot] = useState(null); // { dateStr, hour }

  // quản lý 9 modal activity
  const modalStates = {
    TRANSPORT: useState(false),
    FOOD: useState(false),
    STAY: useState(false),
    SIGHTSEEING: useState(false),
    ENTERTAIN: useState(false),
    SHOPPING: useState(false),
    CINEMA: useState(false),
    EVENT: useState(false),
    OTHER: useState(false),
  };

  const [editingCard, setEditingCard] = useState(null);
  const [activeActivityType, setActiveActivityType] = useState(null);
  const [activeListId, setActiveListId] = useState(null);

  const openModal = (type) => modalStates[type][1](true);
  const closeModal = (type) => modalStates[type][1](false);

  const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);
  const dayListMap = useMemo(() => buildDayListMap(board), [board?.lists]);

  // ❗ KHÔNG useMemo nữa để luôn sync với board hiện tại
  const events = buildCalendarEventsFromBoard(board);

  const eventsByDate = useMemo(() => {
    const map = {};
    weekDays.forEach((d) => {
      map[d.dateStr] = [];
    });

    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push({ ...e });
    });

    Object.keys(map).forEach((dateStr) => {
      map[dateStr] = assignLanesForDay(map[dateStr]);
    });

    return map;
  }, [events, weekDays]);

  const planStart = board?.startDate ? toDateOnly(board.startDate) : null;
  const planEnd = board?.endDate ? toDateOnly(board.endDate) : null;

  const monthDays = useMemo(() => {
    const { year, month } = visibleMonth;
    return buildMonthMatrix(year, month);
  }, [visibleMonth]);

  // style block theo thời gian & lane
  const getEventStyle = (event) => {
    let startH = event.start.getHours() + event.start.getMinutes() / 60;
    let endH = event.end.getHours() + event.end.getMinutes() / 60;

    if (!Number.isFinite(endH) || endH <= startH) {
      endH = startH + 0.5;
    }

    const topPercent = (startH / 24) * 100;
    const heightPercent = ((endH - startH) / 24) * 100;

    const { bg, border, text } = getEventPalette(
      event.activityType || event.type
    );

    const lane = event._lane || 0;
    const lanes = event._lanes || 1;
    const baseLeft = 8;
    const baseWidth = 84;
    const laneWidth = baseWidth / lanes;
    const leftPercent = baseLeft + lane * laneWidth;
    const widthPercent = laneWidth * 0.95;

    return {
      top: `${topPercent}%`,
      height: `${heightPercent}%`,
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      backgroundColor: bg,
      border: `1px solid ${border}`,
      color: text,
      borderRadius: 12,
      boxShadow: "0 6px 16px rgba(15,23,42,0.18)",
    };
  };

  // CREATE / EDIT 
  const handleOpenCreateFromSlot = (dateStr, hour, type) => {
    if (!canEdit) return;

    const listId = dayListMap[dateStr];
    if (!listId) {
      console.warn("Không tìm thấy list DAY cho ngày:", dateStr);
      return;
    }

    setEditingCard(null);
    setActiveListId(listId);
    setActiveActivityType(type);
    setCreatingSlot({ dateStr, hour });
    openModal(type);
  };

  const handleOpenEvent = (event) => {
    if (!canEdit) return;

    const { listId, date, id } = event;

    let card = event.card || null;
    if (!card && board?.lists) {
      outer: for (const l of board.lists) {
        for (const c of l.cards || []) {
          if (String(c.id) === String(id)) {
            card = c;
            break outer;
          }
        }
      }
    }

    const resolvedListId = listId || dayListMap[date] || card?.listId || null;
    if (!resolvedListId || !card) {
      console.warn("Không tìm thấy listId/card để sửa từ calendar:", event);
      return;
    }

    setEditingCard(card);
    setActiveListId(resolvedListId);
    const type = card.activityType || event.activityType || "OTHER";
    setActiveActivityType(type);
    openModal(type);
  };

  const handleSubmitActivity = async (formData) => {
    if (!activeListId || !activeActivityType) return;
    if (!createActivityCard || !updateActivityCard) {
      console.warn(
        "Chưa truyền createActivityCard / updateActivityCard vào PlanCalendar"
      );
      return;
    }

    if (editingCard) {
      await updateActivityCard(activeListId, editingCard.id, formData);
    } else {
      await createActivityCard(activeListId, formData);
    }

    closeModal(activeActivityType);
    setEditingCard(null);
    setCreatingSlot(null);
  };

  // MINI CALENDAR 
  const handlePrevMonth = () => {
    setVisibleMonth((prev) => {
      const d = new Date(prev.year, prev.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const handleNextMonth = () => {
    setVisibleMonth((prev) => {
      const d = new Date(prev.year, prev.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const handleSelectDate = (d) => {
    setSelectedDate(d);
    setAnchorDate(d);
    setVisibleMonth({ year: d.getFullYear(), month: d.getMonth() });
  };

  const weekLabel = useMemo(() => {
    if (!weekDays.length) return "";
    const first = weekDays[0].raw;
    const last = weekDays[6].raw;
    const fmt = (d) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`;
    if (
      first.getMonth() === last.getMonth() &&
      first.getFullYear() === last.getFullYear()
    ) {
      return `Tuần ${fmt(first)} - ${fmt(last)} / ${first.getFullYear()}`;
    }
    return `Tuần ${fmt(first)} - ${fmt(last)}`;
  }, [weekDays]);

  return {
    // state
    selectedDate,
    visibleMonth,
    creatingSlot,
    setCreatingSlot,
    modalStates,
    editingCard,

    // data
    weekDays,
    dayListMap,
    eventsByDate,
    planStart,
    planEnd,
    monthDays,
    weekLabel,

    // handlers
    handlePrevMonth,
    handleNextMonth,
    handleSelectDate,
    handleOpenCreateFromSlot,
    handleOpenEvent,
    handleSubmitActivity,
    getEventStyle,

    // util
    HOURS,
    toDateOnly,
    closeModal,
  };
}

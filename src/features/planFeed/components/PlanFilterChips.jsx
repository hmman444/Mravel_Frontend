import { X, SlidersHorizontal } from "lucide-react";

const SORT_LABELS = {
  RELEVANCE:   "Liên quan",
  NEWEST:      "Mới nhất",
  MOST_VIEWED: "Xem nhiều",
  BUDGET_ASC:  "Ngân sách ↑",
  BUDGET_DESC: "Ngân sách ↓",
};

function formatBudget(val) {
  const n = Number(val);
  if (!val || isNaN(n)) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}tr`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

/**
 * Renders a horizontal strip of active filter chips beneath the search bar.
 *
 * Props:
 *   filters       current filter object
 *   onRemove      (key, value?) => void  — value is used for array fields like destinations
 *   onOpenFilter  () => void — opens the sidebar
 *   activeCount   number
 */
export default function PlanFilterChips({ filters, onRemove }) {
  if (!filters) return null;

  const chips = [];

  // Sort (only show if not default)
  if (filters.sortBy && filters.sortBy !== "RELEVANCE") {
    chips.push(
      <Chip
        key="sort"
        label={`Sắp xếp: ${SORT_LABELS[filters.sortBy] ?? filters.sortBy}`}
        onRemove={() => onRemove("sortBy", "RELEVANCE")}
      />
    );
  }

  // Budget
  const bMin = formatBudget(filters.budgetMin);
  const bMax = formatBudget(filters.budgetMax);
  if (bMin || bMax) {
    const label = bMin && bMax
      ? `Ngân sách: ${bMin} – ${bMax}`
      : bMin
        ? `Ngân sách ≥ ${bMin}`
        : `Ngân sách ≤ ${bMax}`;
    chips.push(
      <Chip key="budget" label={label} onRemove={() => onRemove("budget")} />
    );
  }

  // Days
  const dMin = filters.daysMin;
  const dMax = filters.daysMax;
  if (dMin || dMax) {
    const label = dMin && dMax
      ? `${dMin}–${dMax} ngày`
      : dMin
        ? `≥ ${dMin} ngày`
        : `≤ ${dMax} ngày`;
    chips.push(
      <Chip key="days" label={label} onRemove={() => onRemove("days")} />
    );
  }

  // Dates
  if (filters.startDateFrom || filters.startDateTo) {
    const label = filters.startDateFrom && filters.startDateTo
      ? `${filters.startDateFrom} → ${filters.startDateTo}`
      : filters.startDateFrom
        ? `Từ ${filters.startDateFrom}`
        : `Đến ${filters.startDateTo}`;
    chips.push(
      <Chip key="dates" label={label} onRemove={() => onRemove("dates")} />
    );
  }

  // Destinations
  (filters.destinations || []).forEach((dest) => {
    chips.push(
      <Chip
        key={`dest-${dest}`}
        label={`📍 ${dest}`}
        onRemove={() => onRemove("destinations", dest)}
      />
    );
  });

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mt-3">
      {chips}
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="
      inline-flex items-center gap-1.5 h-7 pl-3 pr-2 rounded-full text-xs
      bg-white dark:bg-gray-800
      border border-sky-200 dark:border-sky-800
      text-sky-700 dark:text-sky-300
      shadow-sm
    ">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="
          w-4 h-4 rounded-full flex items-center justify-center
          hover:bg-sky-100 dark:hover:bg-sky-900/60
          transition shrink-0
        "
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

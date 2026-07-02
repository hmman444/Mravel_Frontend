import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Calendar,
  Wallet,
  Clock,
  MapPin,
  ArrowUpDown,
} from "lucide-react";

const SORT_OPTIONS = [
  { value: "RELEVANCE",    labelKey: "feed.filter.sort.relevance" },
  { value: "NEWEST",       labelKey: "feed.filter.sort.newest" },
  { value: "MOST_VIEWED",  labelKey: "feed.filter.sort.mostViewed" },
  { value: "MOST_REACTED", labelKey: "feed.filter.sort.mostReacted" },
  { value: "BUDGET_ASC",   labelKey: "feed.filter.sort.budgetAsc" },
  { value: "BUDGET_DESC",  labelKey: "feed.filter.sort.budgetDesc" },
];

const POPULAR_DESTINATIONS = [
  "Hà Nội", "TP.HCM", "Đà Nẵng", "Hội An", "Nha Trang",
  "Phú Quốc", "Sapa", "Đà Lạt", "Huế", "Hạ Long",
];

const DEFAULT_FILTERS = {
  budgetMin: "",
  budgetMax: "",
  daysMin: "",
  daysMax: "",
  startDateFrom: "",
  startDateTo: "",
  destinations: [],
  sortBy: "RELEVANCE",
};

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pt-5 pb-5 first:pt-0 last:border-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100">
          {Icon && <Icon className="w-4.5 h-4.5 text-sky-500" />}
          {title}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition" />
          : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition" />}
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}

function RangeInputs({ labelMin, labelMax, valMin, valMax, onMin, onMax, placeholder = "0" }) {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">{labelMin}</label>
        <input
          type="number"
          min={0}
          value={valMin}
          onChange={(e) => onMin(e.target.value)}
          placeholder={placeholder}
          className="
            w-full h-9 px-3 rounded-lg text-sm
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-sky-400/50
            transition
          "
        />
      </div>
      <div className="flex-1">
        <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">{labelMax}</label>
        <input
          type="number"
          min={0}
          value={valMax}
          onChange={(e) => onMax(e.target.value)}
          placeholder="∞"
          className="
            w-full h-9 px-3 rounded-lg text-sm
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-sky-400/50
            transition
          "
        />
      </div>
    </div>
  );
}

/**
 * Advanced filter sidebar for the Plan Feed page.
 *
 * Props:
 *   open         boolean — controls visibility (mobile overlay + desktop sidebar)
 *   onClose      () => void
 *   filters      current filter state object
 *   onChange     (newFilters) => void — called on every filter change
 *   onApply      (filters) => void   — called when user clicks "Áp dụng"
 *   onReset      () => void
 *   activeCount  number of active filters (for badge)
 */
export default function PlanFilterSidebar({
  open,
  onClose,
  filters = DEFAULT_FILTERS,
  onChange,
  onApply,
  onReset,
  activeCount = 0,
  loading = false,
}) {
  const { t } = useTranslation();
  const [dateError, setDateError] = useState("");
  const set = useCallback(
    (key, val) => onChange({ ...filters, [key]: val }),
    [filters, onChange]
  );

  const toggleDestination = useCallback(
    (dest) => {
      const next = filters.destinations.includes(dest)
        ? filters.destinations.filter((d) => d !== dest)
        : [...filters.destinations, dest];
      onChange({ ...filters, destinations: next });
    },
    [filters, onChange]
  );

  const handleApply = () => {
    // Guard: start date must not be after end date.
    if (
      filters.startDateFrom &&
      filters.startDateTo &&
      filters.startDateFrom > filters.startDateTo
    ) {
      setDateError(t("feed.newPlan.error.endBeforeStart"));
      return;
    }
    setDateError("");
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  // Shared sidebar content
  const content = (
    <div className="flex flex-col h-auto">
      {/*  Header  */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-sky-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-50">{t("feed.filter.title")}</span>
          {activeCount > 0 && (
            <span className="h-5 px-2 rounded-full bg-sky-500 text-white text-[11px] font-bold flex items-center">
              {activeCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/*  Scrollable filter body  */}
      <div className="flex-1 px-5 py-4 space-y-0">

        {/* Sort */}
        <Section title={t("feed.filter.sort.label")} icon={ArrowUpDown}>
          <div className="grid grid-cols-1 gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm
                  transition select-none
                  ${filters.sortBy === opt.value
                    ? "bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 font-medium ring-1 ring-sky-300/60"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300"}
                `}
              >
                <input
                  type="radio"
                  name="sortBy"
                  value={opt.value}
                  checked={filters.sortBy === opt.value}
                  onChange={() => set("sortBy", opt.value)}
                  className="hidden"
                />
                <span className={`
                  w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                  ${filters.sortBy === opt.value
                    ? "border-sky-500 bg-sky-500"
                    : "border-gray-300 dark:border-gray-600"}
                `}>
                  {filters.sortBy === opt.value && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                {t(opt.labelKey)}
              </label>
            ))}
          </div>
        </Section>

        {/* Budget range */}
        <Section title={t("feed.filter.budget.title")} icon={Wallet}>
          <RangeInputs
            labelMin={t("feed.filter.min")}
            labelMax={t("feed.filter.max")}
            valMin={filters.budgetMin}
            valMax={filters.budgetMax}
            onMin={(v) => set("budgetMin", v)}
            onMax={(v) => set("budgetMax", v)}
          />
          {/* Quick presets */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { labelKey: "feed.filter.budget.preset.lt5m",   min: "",          max: "5000000"  },
              { labelKey: "feed.filter.budget.preset.5to20m",  min: "5000000",   max: "20000000" },
              { labelKey: "feed.filter.budget.preset.20to50m", min: "20000000",  max: "50000000" },
              { labelKey: "feed.filter.budget.preset.gt50m",  min: "50000000",  max: ""         },
            ].map((p) => (
              <button
                key={p.labelKey}
                type="button"
                onClick={() => onChange({ ...filters, budgetMin: p.min, budgetMax: p.max })}
                className={`
                  text-xs px-3 py-1.5 rounded-lg font-medium
                  border-2 transition-all duration-150
                  ${filters.budgetMin === p.min && filters.budgetMax === p.max
                    ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-sky-300 hover:text-sky-600 dark:hover:border-sky-600"}
                `}
              >
                {t(p.labelKey)}
              </button>
            ))}
          </div>
        </Section>

        {/* Duration */}
        <Section title={t("feed.filter.duration.title")} icon={Clock}>
          <RangeInputs
            labelMin={t("feed.filter.min")}
            labelMax={t("feed.filter.max")}
            valMin={filters.daysMin}
            valMax={filters.daysMax}
            onMin={(v) => set("daysMin", v)}
            onMax={(v) => set("daysMax", v)}
            placeholder="1"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { labelKey: "feed.filter.duration.preset.1to3", min: "1", max: "3"  },
              { labelKey: "feed.filter.duration.preset.4to7", min: "4", max: "7"  },
              { labelKey: "feed.filter.duration.preset.1to2w", min: "7", max: "14" },
              { labelKey: "feed.filter.duration.preset.gt2w", min: "14", max: ""  },
            ].map((p) => (
              <button
                key={p.labelKey}
                type="button"
                onClick={() => onChange({ ...filters, daysMin: p.min, daysMax: p.max })}
                className={`
                  text-xs px-3 py-1.5 rounded-lg font-medium
                  border-2 transition-all duration-150
                  ${filters.daysMin === p.min && filters.daysMax === p.max
                    ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-sky-300 hover:text-sky-600 dark:hover:border-sky-600"}
                `}
              >
                {t(p.labelKey)}
              </button>
            ))}
          </div>
        </Section>

        {/* Date range */}
        <Section title={t("feed.filter.date.title")} icon={Calendar} defaultOpen={false}>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">{t("feed.filter.date.from")}</label>
              <input
                type="date"
                value={filters.startDateFrom}
                onChange={(e) => { setDateError(""); set("startDateFrom", e.target.value); }}
                className="
                  w-full h-9 px-3 rounded-lg text-sm
                  bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-700
                  text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-sky-400/50
                  transition
                "
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">{t("feed.filter.date.to")}</label>
              <input
                type="date"
                value={filters.startDateTo}
                onChange={(e) => { setDateError(""); set("startDateTo", e.target.value); }}
                className="
                  w-full h-9 px-3 rounded-lg text-sm
                  bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-700
                  text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-sky-400/50
                  transition
                "
              />
            </div>
            {dateError && (
              <p role="alert" className="text-[11px] font-medium text-rose-500">
                {dateError}
              </p>
            )}
          </div>
        </Section>

        {/* Destinations */}
        <Section title={t("feed.filter.destination.title")} icon={MapPin} defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {POPULAR_DESTINATIONS.map((dest) => {
              const active = filters.destinations.includes(dest);
              return (
                <button
                  key={dest}
                  type="button"
                  onClick={() => toggleDestination(dest)}
                  className={`
                    text-xs px-3 py-1.5 rounded-lg font-medium border-2 transition-all duration-150
                    ${active
                      ? "bg-sky-500 border-sky-500 text-white shadow-sm hover:shadow-md"
                      : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-sky-400 hover:text-sky-600 dark:hover:border-sky-500 dark:hover:text-sky-400"}
                  `}
                >
                  {dest}
                </button>
              );
            })}
          </div>
          {/* Custom destination input */}
          <div className="mt-3 flex gap-2">
            <DestinationInput
              selected={filters.destinations}
              onAdd={(d) => {
                if (!filters.destinations.includes(d)) {
                  onChange({ ...filters, destinations: [...filters.destinations, d] });
                }
              }}
            />
          </div>
        </Section>
      </div>

      {/*  Footer actions  */}
      <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 shrink-0">
        <button
          type="button"
          onClick={handleReset}
          className="
            flex-1 h-10 px-3 rounded-lg border-2 border-gray-300 dark:border-gray-600
            text-sm font-semibold text-gray-700 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-800
            hover:border-gray-400 dark:hover:border-gray-500
            transition-all duration-150
          "
        >
          {t("feed.filter.reset")}
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={loading}
          className="
            flex-1 h-10 px-3 rounded-lg
            bg-gradient-to-r from-sky-500 to-blue-600
            text-white text-sm font-semibold
            shadow-md hover:shadow-lg hover:from-sky-600 hover:to-blue-700
            hover:-translate-y-0.5 transition-all duration-150
            disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
          "
        >
          {t("feed.filter.apply")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/*  Desktop sidebar  */}
      <aside
        className={`
          hidden lg:flex flex-col self-start mb-10 shrink-0 overflow-hidden
          rounded-2xl backdrop-blur-sm
          transition-[width,margin,opacity,transform,border-color,box-shadow] duration-300 ease-out
          ${
            open
              ? "w-72 mr-6 opacity-100 translate-x-0 bg-white/90 dark:bg-gray-900/90 border border-gray-200/70 dark:border-gray-800 shadow-sm"
              : "w-0 mr-0 opacity-0 -translate-x-2 pointer-events-none bg-transparent border border-transparent shadow-none"
          }
        `}
      >
        {content}
      </aside>

      {/*  Mobile drawer overlay  */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[200] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer panel */}
          <div
            className="
              relative ml-auto w-[min(340px,95vw)] h-full
              bg-white dark:bg-gray-950
              shadow-2xl flex flex-col
              animate-slide-in-right
            "
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
}

// Small sub-component: lets user type a custom destination and add it
function DestinationInput({ onAdd }) {
  const { t } = useTranslation();
  const [val, setVal] = useState("");
  const submit = () => {
    const trimmed = val.trim();
    if (trimmed) {
      onAdd(trimmed);
      setVal("");
    }
  };
  return (
    <>
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
        placeholder={t("feed.filter.destination.addPlaceholder")}
        className="
          flex-1 h-9 px-3 rounded-lg text-xs
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          text-gray-900 dark:text-gray-100
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-sky-400/50
          transition
        "
      />
      <button
        type="button"
        onClick={submit}
        className="h-9 px-3 rounded-lg bg-sky-500 text-white text-xs font-medium hover:bg-sky-600 transition shrink-0"
      >
        +
      </button>
    </>
  );
}

// Mravel-themed draft preview: clean card, brand teal accent, generous whitespace.

import i18n from "../../../i18n";

const ACTIVITY_META = {
  STAY:        { labelKey: "aiPlan.draft.type_stay",        color: "text-violet-700 bg-violet-100 dark:text-violet-200 dark:bg-violet-900/40", icon: "🏨" },
  FOOD:        { labelKey: "aiPlan.draft.type_food",        color: "text-orange-700 bg-orange-100 dark:text-orange-200 dark:bg-orange-900/40", icon: "🍜" },
  SIGHTSEEING: { labelKey: "aiPlan.draft.type_sightseeing", color: "text-emerald-700 bg-emerald-100 dark:text-emerald-200 dark:bg-emerald-900/40", icon: "📍" },
  TRANSPORT:   { labelKey: "aiPlan.draft.type_transport",   color: "text-sky-700 bg-sky-100 dark:text-sky-200 dark:bg-sky-900/40", icon: "🚗" },
  ENTERTAIN:   { labelKey: "aiPlan.draft.type_entertain",   color: "text-pink-700 bg-pink-100 dark:text-pink-200 dark:bg-pink-900/40", icon: "🎉" },
  EVENT:       { labelKey: "aiPlan.draft.type_event",       color: "text-amber-700 bg-amber-100 dark:text-amber-200 dark:bg-amber-900/40", icon: "🎪" },
  SHOPPING:    { labelKey: "aiPlan.draft.type_shopping",    color: "text-yellow-700 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/40", icon: "🛍️" },
  CINEMA:      { labelKey: "aiPlan.draft.type_cinema",      color: "text-fuchsia-700 bg-fuchsia-100 dark:text-fuchsia-200 dark:bg-fuchsia-900/40", icon: "🎬" },
  OTHER:       { labelKey: "aiPlan.draft.type_other",       color: "text-slate-700 bg-slate-200 dark:text-slate-200 dark:bg-slate-700/60", icon: "•" },
};

const formatVnd = (value) =>
  typeof value === "number" ? value.toLocaleString("vi-VN") + " ₫" : "";

export default function DraftPreview({ draft }) {
  if (!draft) return null;

  const totalActivities = draft.days?.reduce((acc, d) => acc + (d.activities?.length || 0), 0) || 0;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      {/* Summary header — brand teal gradient strip on top */}
      <div className="h-1 bg-gradient-to-r from-primary via-secondaryDark to-accent" />
      <div className="border-b border-slate-200 bg-secondary/10 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/80">
        <div className="font-heading text-[15px] font-bold text-slate-800 dark:text-slate-100">
          {draft.summary || i18n.t("aiPlan.draft.default_summary", { destination: draft.destination })}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-4">
          <Meta label={i18n.t("aiPlan.draft.meta_destination")} value={draft.destination} />
          <Meta label={i18n.t("aiPlan.draft.meta_range")} value={`${draft.start_date} → ${draft.end_date}`} />
          <Meta label={i18n.t("aiPlan.draft.meta_travelers")} value={i18n.t("aiPlan.draft.travelers_count", { count: draft.travelers || 1 })} />
          <Meta label={i18n.t("aiPlan.draft.meta_total_cost")} value={formatVnd(draft.estimated_total_cost_vnd)} />
        </div>
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          {i18n.t("aiPlan.draft.days_activities", { days: draft.days?.length || 0, activities: totalActivities })}
        </div>
        {draft.warnings?.length > 0 && (
          <div className="mt-3 space-y-1 rounded-md border border-amber-200/60 bg-amber-50/80 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-200">
            {draft.warnings.map((w, i) => (
              <div key={`${i}-${w}`} className="flex items-start gap-2">
                <span className="mt-0.5">⚠</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Days */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
        {draft.days.map((day) => (
          <DaySection key={day.day_index} day={day} />
        ))}
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="font-heading text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <span className="font-medium text-slate-700 dark:text-slate-200">{value || "—"}</span>
    </div>
  );
}

function DaySection({ day }) {
  return (
    <div className="px-5 py-4">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 font-heading text-[11px] font-bold text-primary">
            {day.day_index}
          </div>
          <div className="font-heading text-sm font-semibold text-slate-800 dark:text-slate-100">
            {day.title}
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{day.day_date}</div>
      </div>

      <ol className="relative space-y-3 border-l-2 border-secondary/40 pl-4 dark:border-slate-700">
        {day.activities.map((act, idx) => (
          <ActivityItem
            key={act.id ?? `${idx}-${act.start_time ?? ""}-${act.title ?? ""}`}
            act={act}
          />
        ))}
      </ol>
    </div>
  );
}

function ActivityItem({ act }) {
  const meta = ACTIVITY_META[act.activity_type] || ACTIVITY_META.OTHER;
  const timeRange = act.start_time && act.end_time
    ? `${act.start_time} – ${act.end_time}`
    : act.start_time || "";

  return (
    <li className="relative">
      {/* Dot on the timeline — brand teal */}
      <div className="absolute -left-[1.44rem] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-slate-800" />

      <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
        {timeRange}
      </div>

      <div className="mt-0.5 flex items-start gap-2">
        <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${meta.color}`}>
          <span>{meta.icon}</span>
          {i18n.t(meta.labelKey)}
        </span>
        <span className="text-[14px] font-medium text-slate-800 dark:text-slate-100">
          {act.title}
        </span>
      </div>

      {(act.description || act.reason) && (
        <div className="mt-1 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
          {act.description || act.reason}
        </div>
      )}

      <div className="mt-1 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
        {act.address && <div>📍 {act.address}</div>}
        {act.note && <div className="italic">💡 {act.note}</div>}
        {act.route_hint && (
          <div>
            🗺️ {act.route_hint}
            {act.distance_text ? ` · ${act.distance_text}` : ""}
            {act.transport_mode ? ` · ${act.transport_mode}` : ""}
          </div>
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
        {act.estimated_cost_vnd > 0 && (
          <span className="font-mono font-medium text-primary">{formatVnd(act.estimated_cost_vnd)}</span>
        )}
        {act.recommendation?.avg_rating && (
          <span className="text-accent">★ {Number(act.recommendation.avg_rating).toFixed(1)}</span>
        )}
        {act.recommendation?.catalog_kind && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-700/60 dark:text-slate-400">
            {act.recommendation.catalog_kind}
          </span>
        )}
      </div>
    </li>
  );
}

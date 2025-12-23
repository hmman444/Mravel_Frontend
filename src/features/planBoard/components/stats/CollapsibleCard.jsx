// src/features/planBoard/components/stats/components/CollapsibleCard.jsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CollapsibleCard({
  title,
  subtitle,
  right,
  open,
  onToggle,
  children,
}) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white shadow-[0_12px_40px_rgba(2,6,23,0.08)] dark:border-slate-800/70 dark:bg-slate-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {right}
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200/70 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800/70 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60 transition">
            {open ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

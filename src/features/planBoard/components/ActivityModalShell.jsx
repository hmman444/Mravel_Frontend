// ActivityModalShell.jsx
import { AnimatePresence, motion } from "framer-motion";

export default function ActivityModalShell({
  open,
  onClose,
  icon,
  title,
  typeLabel,
  subtitle,
  headerRight,
  footerLeft,
  footerRight,
  children,
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-900/50 backdrop-blur-[3px] px-3 sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-4xl max-h-[calc(100vh-72px)] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/70 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex flex-col"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-4 sm:right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:bg-rose-500 hover:text-white shadow-md transition-all"
            >
              {icon?.close ?? "×"}
            </button>

            <div className="px-5 sm:px-7 pt-5 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/60 backdrop-blur-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-md
                  bg-gradient-to-tr ${icon?.bg || "from-sky-500 to-indigo-500"}`}
                >
                  {icon?.main}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {title}
                    </h3>
                    {typeLabel && (
                      <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wide rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                        {typeLabel}
                      </span>
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {headerRight}
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-7 pb-5 pt-4 space-y-6">
              {children}
            </div>

            <div className="px-5 sm:px-7 py-3.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/95 backdrop-blur-md flex items-center justify-between gap-3">
              {footerLeft}
              {footerRight}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export default function FilterCard({ title, children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        <button
            onClick={() => setOpen(!open)}
            className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-gray-900 dark:text-gray-100"
        >
            <span>{title}</span>
            {open ? (
            <ChevronUpIcon className="w-4 h-4" />
            ) : (
            <ChevronDownIcon className="w-4 h-4" />
            )}
        </button>

        <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
            open ? "max-h-96 opacity-100 p-4" : "max-h-0 opacity-0 p-0"
            }`}
        >
            <div className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
            {children}
            </div>
        </div>
        </div>
  );
}

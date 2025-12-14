import { timeAgo } from "../utils/utils";
import {
  GlobeAltIcon,
  LockClosedIcon,
  UserGroupIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
const visMeta = (v) => {
  const value = (v || "").toLowerCase();
  if (value === "public")
    return {
      icon: <GlobeAltIcon className="w-3.5 h-3.5" />,
      label: "Công khai",
      color: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    };
  if (value === "friends")
    return {
      icon: <UserGroupIcon className="w-3.5 h-3.5" />,
      label: "Bạn bè",
      color:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    };
  return {
    icon: <LockClosedIcon className="w-3.5 h-3.5" />,
    label: "Riêng tư",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };
};

export default function PlanHeader({ author, createdAt, visibility, views }) {
  const meta = visMeta(visibility);

  return (
    <div className="flex items-center gap-3">
      <Link
        to={author?.id ? `/profile/${author.id}` : "#"}
        onClick={(e) => {
          if (!author?.id) e.preventDefault();
        }}
        className="shrink-0"
        title={author?.id ? `Xem trang cá nhân ${author.name}` : ""}
      >
        <img
          src={author.avatar}
          alt={author.name}
          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition"
        />
      </Link>
      <div className="leading-tight">
        <div className="font-semibold text-sm text-gray-900 dark:text-gray-50">
        {author?.id ? (
          <Link
            to={`/profile/${author.id}`}
            className="hover:underline"
            title="Xem trang cá nhân"
          >
            {author.name}
          </Link>
        ) : (
          author.name
        )}
      </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          <span>{timeAgo(createdAt)}</span>
          <span
            className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded-full
              ${meta.color}
            `}
          >
            {meta.icon}
            <span>{meta.label}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <EyeIcon className="w-3.5 h-3.5" /> {views} lượt xem
          </span>
        </div>
      </div>
    </div>
  );
}

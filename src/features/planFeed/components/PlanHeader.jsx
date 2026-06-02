import { timeAgo } from "../utils/utils";
import {
  GlobeAltIcon,
  LockClosedIcon,
  UserGroupIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PostOptionsMenu from "./PostOptionsMenu";
const visMeta = (v) => {
  const value = (v || "").toLowerCase();
  if (value === "public")
    return {
      icon: <GlobeAltIcon className="w-3.5 h-3.5" />,
      labelKey: "feed.visibility.public",
      color: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    };
  if (value === "friends")
    return {
      icon: <UserGroupIcon className="w-3.5 h-3.5" />,
      labelKey: "feed.visibility.friends",
      color:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    };
  return {
    icon: <LockClosedIcon className="w-3.5 h-3.5" />,
    labelKey: "feed.visibility.private",
    color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:bg-gray-800 dark:text-gray-300",
  };
};

export default function PlanHeader({
  author,
  createdAt,
  visibility,
  views,
  isOwnPost = false,
  onHide,
  onBlock,
  onReport,
}) {
  const { t } = useTranslation();
  const meta = visMeta(visibility);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
      <Link
        to={author?.id ? `/profile/${author.id}` : "#"}
        onClick={(e) => {
          if (!author?.id) e.preventDefault();
        }}
        className="shrink-0"
        title={author?.id ? t("feed.viewProfileOf", { name: author.name }) : ""}
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
            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            title={t("feed.viewProfile")}
          >
            {author.name}
          </Link>
        ) : (
          author.name
        )}
      </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1">{timeAgo(createdAt)}</span>
          <span
            className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium
              ${meta.color}
            `}
          >
            {meta.icon}
            <span>{t(meta.labelKey)}</span>
          </span>
          <span className="inline-flex items-center gap-1 font-medium">
            <EyeIcon className="w-3.5 h-3.5" /> {views}
          </span>
        </div>
      </div>
      </div>

      {(onHide || onReport) ? (
        <PostOptionsMenu
          isOwnPost={isOwnPost}
          onHide={onHide}
          onBlock={onBlock}
          onReport={onReport}
        />
      ) : null}
    </div>
  );
}

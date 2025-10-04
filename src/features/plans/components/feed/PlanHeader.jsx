import { timeAgo } from "../../utils/utils";
import { GlobeAltIcon, LockClosedIcon, UserGroupIcon, EyeIcon } from "@heroicons/react/24/outline";

const visIcon = (v) => {
  if (v === "public") return <GlobeAltIcon className="w-4 h-4" />;
  if (v === "friends") return <UserGroupIcon className="w-4 h-4" />;
  return <LockClosedIcon className="w-4 h-4" />;
};

export default function PlanHeader({ author, createdAt, visibility, views }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={author.avatar}
        alt={author.name}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="leading-tight">
        <div className="font-semibold">{author.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span>{timeAgo(createdAt)}</span>
          <span className="flex items-center gap-1">{visIcon(visibility)} {visibility}</span>
          <span className="flex items-center gap-1"><EyeIcon className="w-4 h-4" /> {views} lượt xem</span>
        </div>
      </div>
    </div>
  );
}

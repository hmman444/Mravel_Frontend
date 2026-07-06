import { useTranslation } from "react-i18next";
import { reactionsMeta } from "../utils/reactionsMeta";

const MAX_SHOWN = 3;

export default function ReactionUsersPopup({ reactionUsers = [] }) {
  const { t } = useTranslation();
  if (!reactionUsers.length) return null;

  const shown = reactionUsers.slice(0, MAX_SHOWN);
  const remaining = reactionUsers.length - shown.length;

  return (
    <div
      className="
        bg-white dark:bg-gray-900 rounded-lg
        shadow-xl p-3 border border-gray-200 dark:border-gray-700 w-64
      "
    >
      {shown.map((u, idx) => {
        const name = u.userName || t("feed.user.defaultName");
        const avatar = u.userAvatar || "/default-avatar.png";
        const reaction = reactionsMeta[u.type?.toLowerCase()];

        return (
          <div
            key={u.userId ?? idx}
            className="
              flex items-center justify-between py-1
              hover:bg-gray-50 dark:hover:bg-gray-800
              rounded-md px-2
            "
          >
            <div className="flex items-center gap-2">
              <img
                src={avatar}
                alt={name}
                className="
                  w-7 h-7 rounded-full object-cover
                  border border-gray-300 dark:border-gray-600
                "
              />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">{reaction?.emoji}</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {reaction?.label}
              </span>
            </div>
          </div>
        );
      })}
      {remaining > 0 && (
        <div className="pt-1 px-2 text-xs text-gray-500 dark:text-gray-400">
          {t("feed.reaction.and_others", { n: remaining })}
        </div>
      )}
    </div>
  );
}

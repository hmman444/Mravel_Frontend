import { useMemo, useState } from "react";
import { reactionsMeta } from "../utils/reactionsMeta";
import ReactionUsersPopup from "./ReactionUsersPopup";

export default function ReactionSummaryPopupTrigger({
  reactions = {},
  reactionUsers = [],
  currentReaction = null,
  className = "",
  rootClassName = "relative",
  popupClassName = "absolute z-20 translate-y-1",
}) {
  const [showPopup, setShowPopup] = useState(false);

  const total = useMemo(
    () => Object.values(reactions || {}).reduce((a, b) => a + b, 0),
    [reactions]
  );

  const top3 = useMemo(() => {
    const merged = { ...(reactions || {}) };
    if (currentReaction && !merged[currentReaction]) merged[currentReaction] = 1;

    return Object.entries(merged)
      .filter(([, n]) => Number(n) > 0)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 3)
      .map(([k]) => reactionsMeta[k]?.emoji)
      .filter(Boolean)
      .join(" ");
  }, [reactions, currentReaction]);

  if (total <= 0) return null;

  return (
    <div className={rootClassName}>
      <div
        className={className}
        onMouseEnter={() => setShowPopup(true)}
        onMouseLeave={() => setShowPopup(false)}
      >
        {top3 && <span>{top3}</span>}
        <span>{total}</span>
      </div>

      {showPopup && reactionUsers.length > 0 && (
        <div
          className={popupClassName}
          onMouseEnter={() => setShowPopup(true)}
          onMouseLeave={() => setShowPopup(false)}
        >
          <ReactionUsersPopup reactionUsers={reactionUsers} />
        </div>
      )}
    </div>
  );
}

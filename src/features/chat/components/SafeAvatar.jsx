import { useState, useEffect } from "react";

const SIZE_MAP = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-7 h-7 text-xs",
  md: "w-8 h-8 text-xs",
  lg: "w-9 h-9 text-sm",
  xl: "w-11 h-11 text-sm",
};

function buildInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Google-served avatars frequently 403 on cross-origin <img> loads when the
// browser sends a Referer they don't accept. Forcing no-referrer fixes most
// of these silently broken images.
function isExternalImageHost(url) {
  if (!url || typeof url !== "string") return false;
  return (
    url.includes("googleusercontent.com") ||
    url.includes("ggpht.com") ||
    url.includes("fbcdn.net") ||
    url.includes("graph.facebook.com") ||
    url.includes("twimg.com")
  );
}

/**
 * Robust avatar renderer for chat surfaces.
 *  - Falls back to initials on load error (broken Google avatar, 403, etc).
 *  - Uses `referrerPolicy="no-referrer"` for known social CDNs to avoid 403.
 *  - Resets when the `src` prop changes (so a previously failed user can
 *    succeed if their URL is updated).
 */
export default function SafeAvatar({
  src,
  name,
  size = "md",
  className = "",
  bgClassName = "bg-blue-500",
  textClassName = "text-white font-semibold",
}) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const baseClass = `${sizeClass} ${className} rounded-full overflow-hidden flex-shrink-0 inline-flex items-center justify-center`;

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name || ""}
        className={`${baseClass} object-cover`}
        referrerPolicy={isExternalImageHost(src) ? "no-referrer" : undefined}
        loading="lazy"
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <div className={`${baseClass} ${bgClassName} ${textClassName}`}>
      {buildInitials(name)}
    </div>
  );
}

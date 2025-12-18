import { Icon } from "@iconify/react";

export function AmenityIcon({ iconKey, className = "h-5 w-5" }) {
  // Nếu vẫn còn data cũ chỉ là "wifi", "bathrobe"...
  // thì bạn có thể prefix tạm 1 bộ mặc định:
  const normalized = (iconKey || "").trim();

  // emoji -> hiển thị luôn
  if (normalized && /[\u{1F300}-\u{1FAFF}]/u.test(normalized)) {
    return <span className="text-lg leading-none">{normalized}</span>;
  }

  // Nếu icon đã là kiểu "mdi:xxx" / "lucide:xxx" => render luôn
  if (normalized.includes(":")) {
    return <Icon icon={normalized} className={className} />;
  }

  // fallback tạm cho data cũ: coi như lucide
  if (normalized) {
    return <Icon icon={`lucide:${normalized.replace(/_/g, "-")}`} className={className} />;
  }

  return <span className="text-xs font-bold text-slate-600">?</span>;
}

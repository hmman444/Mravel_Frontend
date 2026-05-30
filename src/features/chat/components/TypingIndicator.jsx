import { useTranslation } from "react-i18next";

export default function TypingIndicator({ names }) {
  const { t } = useTranslation();
  if (!names || names.length === 0) return null;

  const label =
    names.length === 1
      ? t("chat.typing", { name: names[0] })
      : t("chat.typing", { name: names.slice(0, 2).join(", ") });

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-gray-500">
      <span className="flex gap-0.5 items-end h-3">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </span>
      <span>{label}</span>
    </div>
  );
}

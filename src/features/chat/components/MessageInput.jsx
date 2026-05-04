import { useState, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { sendChatMessage } from "../slices/chatSlice";
import { sendTyping } from "../services/chatService";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

export default function MessageInput({ conversationId }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) return; // already sent recently
    sendTyping(conversationId).catch(() => {});
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 2000);
  }, [conversationId]);

  const handleChange = (e) => {
    setContent(e.target.value);
    handleTyping();
  };

  const handleSend = async () => {
    const text = content.trim();
    if (!text || sending) return;
    setSending(true);
    setContent("");
    try {
      await dispatch(sendChatMessage({ conversationId, content: text })).unwrap();
    } catch {
      setContent(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 px-4 py-3 border-t border-gray-100 bg-white">
      <textarea
        className="flex-1 resize-none bg-gray-100 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 max-h-32 leading-relaxed"
        placeholder={t("chat.type_message")}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={1}
        style={{ height: "auto", overflowY: content.split("\n").length > 3 ? "auto" : "hidden" }}
        onInput={(e) => {
          e.target.style.height = "auto";
          e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
        }}
      />
      <button
        onClick={handleSend}
        disabled={!content.trim() || sending}
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors
          ${content.trim() && !sending
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
      >
        <PaperAirplaneIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

import { useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { sendChatMessage, addOptimisticMessage, removeOptimisticMessage } from "../slices/chatSlice";
import { sendTyping } from "../services/chatService";
import { uploadToCloudinary } from "../../../utils/cloudinaryUpload";
import { uploadVideoToCloudinary } from "../../../utils/cloudinaryUpload";
import { PaperAirplaneIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function MessageInput({ conversationId }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth?.user);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null); // { objectUrl, messageType, file }
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) return;
    sendTyping(conversationId).catch(() => {});
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 2000);
  }, [conversationId]);

  const handleChange = (e) => {
    setContent(e.target.value);
    handleTyping();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const objectUrl = URL.createObjectURL(file);
    setMediaPreview({ objectUrl, messageType: isVideo ? "VIDEO" : "IMAGE", file });
    e.target.value = "";
  };

  const clearMedia = () => {
    if (mediaPreview?.objectUrl) URL.revokeObjectURL(mediaPreview.objectUrl);
    setMediaPreview(null);
  };

  const handleSend = async () => {
    const text = content.trim();
    const hasMedia = !!mediaPreview;
    if ((!text && !hasMedia) || sending) return;

    setSending(true);
    const messageType = hasMedia ? mediaPreview.messageType : "TEXT";
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    if (authUser) {
      dispatch(addOptimisticMessage({
        conversationId,
        tempId,
        content: text || null,
        senderId: authUser.id,
        senderName: authUser.fullname || authUser.name || `User ${authUser.id}`,
        senderAvatar: authUser.avatar || null,
        messageType,
        mediaUrl: mediaPreview?.objectUrl || null,
      }));
    }

    setContent("");
    const capturedPreview = mediaPreview;
    setMediaPreview(null);

    try {
      let mediaUrl = null;
      if (capturedPreview) {
        mediaUrl = capturedPreview.messageType === "VIDEO"
          ? await uploadVideoToCloudinary(capturedPreview.file)
          : await uploadToCloudinary(capturedPreview.file);
        URL.revokeObjectURL(capturedPreview.objectUrl);
      }
      await dispatch(sendChatMessage({
        conversationId,
        content: text || null,
        messageType,
        mediaUrl,
      })).unwrap();
    } catch {
      setContent(text);
    } finally {
      dispatch(removeOptimisticMessage({ conversationId, tempId }));
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (content.trim() || mediaPreview) && !sending;

  return (
    <div className="flex flex-col border-t border-gray-100 bg-white">
      {/* Media preview */}
      {mediaPreview && (
        <div className="px-4 pt-3 pb-1 relative inline-flex">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-black">
            {mediaPreview.messageType === "IMAGE" ? (
              <img src={mediaPreview.objectUrl} className="w-full h-full object-cover" />
            ) : (
              <video src={mediaPreview.objectUrl} className="w-full h-full object-cover" muted preload="metadata" />
            )}
            <button
              type="button"
              onClick={clearMedia}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 px-4 py-3">
        {/* Media picker button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-gray-100 transition-colors disabled:opacity-40"
        >
          <PhotoIcon className="w-5 h-5" />
        </button>

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
          disabled={!canSend}
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors
            ${canSend
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

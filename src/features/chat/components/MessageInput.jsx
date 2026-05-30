import { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { sendChatMessage, addOptimisticMessage, removeOptimisticMessage } from "../slices/chatSlice";
import { sendTyping } from "../services/chatService";
import { uploadToCloudinary } from "../../../utils/cloudinaryUpload";
import { uploadVideoToCloudinary } from "../../../utils/cloudinaryUpload";
import { PaperAirplaneIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/solid";

const MAX_MEDIA_BYTES = 25 * 1024 * 1024; // 25 MB

function buildPreviewFromFile(rawFile) {
  if (!rawFile) return null;
  const isImage = rawFile.type.startsWith("image/");
  const isVideo = rawFile.type.startsWith("video/");
  if (!isImage && !isVideo) return null;
  if (rawFile.size > MAX_MEDIA_BYTES) return { error: "too-large" };
  // Pasted images come back as `image.png` from the clipboard — give them a
  // slightly nicer filename so Cloudinary doesn't store duplicate `image.png`s.
  const file = rawFile.name && rawFile.name !== "image.png"
    ? rawFile
    : new File([rawFile], `pasted_${Date.now()}.${rawFile.type.split("/")[1] || "png"}`, {
        type: rawFile.type,
      });
  const objectUrl = URL.createObjectURL(file);
  return { objectUrl, messageType: isVideo ? "VIDEO" : "IMAGE", file };
}

export default function MessageInput({ conversationId }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth?.user);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null); // { objectUrl, messageType, file }
  const [pasteError, setPasteError] = useState(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const mediaPreviewRef = useRef(null);

  // Keep a ref in sync so the unmount cleanup can revoke whatever's current.
  useEffect(() => {
    mediaPreviewRef.current = mediaPreview;
  }, [mediaPreview]);

  // Revoke any in-flight preview URL on unmount only. During send we hand the
  // blob URL to the optimistic message in Redux, so revoking it on every
  // state change would break that preview before the upload finishes.
  useEffect(() => {
    return () => {
      const url = mediaPreviewRef.current?.objectUrl;
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) return;
    sendTyping(conversationId).catch(() => {});
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 2000);
  }, [conversationId]);

  // When the preview is replaced via the file picker / paste / clear button,
  // revoke the previous blob URL. (We don't use a useEffect cleanup so that
  // setMediaPreview(null) during send keeps the URL alive for the optimistic
  // message until the upload finishes.)
  const replacePreview = useCallback((next) => {
    setMediaPreview((prev) => {
      if (prev?.objectUrl && prev.objectUrl !== next?.objectUrl) {
        URL.revokeObjectURL(prev.objectUrl);
      }
      return next;
    });
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = buildPreviewFromFile(file);
    if (preview?.error === "too-large") {
      setPasteError(t("chat.media_too_large", "Tệp quá lớn (tối đa 25 MB)"));
      e.target.value = "";
      return;
    }
    if (preview) replacePreview(preview);
    e.target.value = "";
  };

  const clearMedia = () => {
    replacePreview(null);
  };

  // Ctrl/Cmd+V paste — image or video from clipboard becomes the media preview.
  // Falls back to default text paste when clipboard has no media.
  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items || items.length === 0) return;

    let mediaFile = null;
    for (const item of items) {
      if (item.kind === "file") {
        const f = item.getAsFile();
        if (f && (f.type.startsWith("image/") || f.type.startsWith("video/"))) {
          mediaFile = f;
          break;
        }
      }
    }
    if (!mediaFile) return; // let text paste happen normally

    e.preventDefault();
    const preview = buildPreviewFromFile(mediaFile);
    if (preview?.error === "too-large") {
      setPasteError(t("chat.media_too_large", "Tệp quá lớn (tối đa 25 MB)"));
      return;
    }
    if (preview) {
      replacePreview(preview);
      setPasteError(null);
    }
  }, [replacePreview, t]);

  const handleChange = (e) => {
    setContent(e.target.value);
    handleTyping();
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
    // Detach without revoking — the optimistic message is still rendering the blob URL.
    setMediaPreview(null);

    try {
      let mediaUrl = null;
      if (capturedPreview) {
        mediaUrl = capturedPreview.messageType === "VIDEO"
          ? await uploadVideoToCloudinary(capturedPreview.file)
          : await uploadToCloudinary(capturedPreview.file);
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
      if (capturedPreview?.objectUrl) URL.revokeObjectURL(capturedPreview.objectUrl);
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
      {/* Paste error banner */}
      {pasteError && (
        <div className="px-4 pt-2 text-xs text-red-500 flex items-center justify-between">
          <span>{pasteError}</span>
          <button onClick={() => setPasteError(null)} className="text-gray-400 hover:text-gray-600 ml-2">
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
          title={t("chat.attach_media", "Đính kèm ảnh/video — hoặc Ctrl+V để dán")}
        >
          <PhotoIcon className="w-5 h-5" />
        </button>

        <textarea
          ref={textareaRef}
          className="flex-1 resize-none bg-gray-100 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 max-h-32 leading-relaxed"
          placeholder={t("chat.type_message")}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
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

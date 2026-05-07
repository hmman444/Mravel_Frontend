import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setActiveConversation } from "../slices/chatSlice";
import { useChatRealtime } from "../hooks/useChatRealtime";
import ConversationList from "../components/ConversationList";
import ChatPanel from "../components/ChatPanel";

export default function ChatPage() {
  const { conversationId: paramId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const activeId = useSelector((s) => s.chat.activeConversationId);

  // Sync URL param → redux state
  useEffect(() => {
    if (paramId) {
      dispatch(setActiveConversation(Number(paramId)));
    }
  }, [paramId, dispatch]);

  // Sync redux state → URL
  useEffect(() => {
    if (activeId) {
      navigate(`/chat/${activeId}`, { replace: true });
    } else if (paramId) {
      navigate("/chat", { replace: true });
    }
  }, [activeId]); // eslint-disable-line

  // Realtime subscriptions
  useChatRealtime(activeId);

  const showList = !activeId;
  const showPanel = !!activeId;

  return (
    <div className="fixed inset-0 flex bg-gray-50 overflow-hidden">
      {/* Conversation list — always visible on desktop, hidden on mobile when chat is open */}
      <div
        className={`
          ${showList ? "flex" : "hidden"} sm:flex
          flex-col w-full sm:w-80 lg:w-96 flex-shrink-0
        `}
      >
        <ConversationList activeId={activeId} />
      </div>

      {/* Chat panel */}
      <div
        className={`
          ${showPanel ? "flex" : "hidden"} sm:flex
          flex-1 flex-col overflow-hidden
        `}
      >
        <ChatPanel conversationId={activeId} />
      </div>
    </div>
  );
}

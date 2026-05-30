import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setActiveConversation } from "../slices/chatSlice";
import { PLANNER_CONV_ID } from "../planner";
import ConversationList from "../components/ConversationList";
import ChatPanel from "../components/ChatPanel";
import AIPlanPanel from "../../aiPlan/components/AIPlanPanel";

export default function ChatPage() {
  const { conversationId: paramId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const activeId = useSelector((s) => s.chat.activeConversationId);
  const isPlanner = activeId === PLANNER_CONV_ID;

  // Sync URL param → redux state. Keep the planner sentinel as a string; only real
  // conversation ids are numeric (Number("planner") would be NaN).
  useEffect(() => {
    if (paramId) {
      dispatch(setActiveConversation(paramId === PLANNER_CONV_ID ? PLANNER_CONV_ID : Number(paramId)));
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

  // Realtime subscriptions are handled globally by FloatingChatWidget.

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
        <ConversationList activeId={activeId} showPlanner />
      </div>

      {/* Chat panel (or the embedded Mravel Planner for the sentinel conversation) */}
      <div
        className={`
          ${showPanel ? "flex" : "hidden"} sm:flex
          flex-1 flex-col overflow-hidden
        `}
      >
        {isPlanner ? (
          <AIPlanPanel planId={null} onClose={() => dispatch(setActiveConversation(null))} />
        ) : (
          <ChatPanel conversationId={activeId} />
        )}
      </div>
    </div>
  );
}

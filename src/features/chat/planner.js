// Sentinel "conversation id" for the embedded Mravel Planner inside the chat frame.
// A non-numeric string so it can never collide with a real numeric chat-service
// conversation id (chatSlice.setActiveConversation's findIndex simply no-ops on it).
export const PLANNER_CONV_ID = "planner";

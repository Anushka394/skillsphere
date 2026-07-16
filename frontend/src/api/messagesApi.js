import api from "./axios";
export const getConversationsApi = () => api.get("/messages/conversations");
export const getMessagesApi = (conversationId) => api.get(`/messages/${conversationId}`);
export const sendMessageApi = (data) => api.post("/messages", data);

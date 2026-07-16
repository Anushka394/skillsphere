import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import DashLayout from "../components/DashLayout";
import { getConversationsApi, getMessagesApi, sendMessageApi } from "../api/messagesApi";
import useSocket from "../hooks/useSocket";

export default function Chat() {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, accessToken } = useSelector((s) => s.auth);
  const socketRef = useSocket(accessToken);

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(conversationId || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    getConversationsApi().then((r) => setConversations(r.data.conversations || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    getMessagesApi(activeConv).then((r) => setMessages(r.data.messages || [])).catch(() => {});
    socketRef.current?.emit("joinConversation", activeConv);

    socketRef.current?.on("newMessage", (msg) => {
      if (msg.conversationId === activeConv) setMessages((m) => [...m, msg]);
    });
    socketRef.current?.on("userTyping", () => setOtherTyping(true));
    socketRef.current?.on("userStoppedTyping", () => setOtherTyping(false));

    return () => { socketRef.current?.off("newMessage"); socketRef.current?.off("userTyping"); socketRef.current?.off("userStoppedTyping"); };
  }, [activeConv]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    const conv = conversations.find((c) => c.conversationId === activeConv);
    const receiverId = conv?.otherUser?._id;
    try {
      const { data } = await sendMessageApi({ conversationId: activeConv, receiverId, text: text.trim() });
      setMessages((m) => [...m, data.message]);
      socketRef.current?.emit("sendMessage", { conversationId: activeConv, receiverId, text: text.trim() });
      setText("");
    } catch {}
  };

  const handleTyping = (val) => {
    setText(val);
    if (!typing) { setTyping(true); socketRef.current?.emit("typing", { conversationId: activeConv, userId: user._id }); }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { setTyping(false); socketRef.current?.emit("stopTyping", { conversationId: activeConv, userId: user._id }); }, 1500);
  };

  const getInitial = (name) => name?.[0]?.toUpperCase() || "?";

  return (
    <DashLayout title="Messages">
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, height: "calc(100vh - 200px)" }}>
        {/* Conversation list */}
        <div className="glass-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--glass-border)", fontWeight: 700, fontSize: 14 }}>Conversations</div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {conversations.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                No conversations yet
              </div>
            )}
            {conversations.map((c) => (
              <div key={c.conversationId} onClick={() => setActiveConv(c.conversationId)}
                style={{ padding: "14px 20px", cursor: "pointer", transition: "background 0.2s", borderBottom: "1px solid rgba(255,255,255,0.03)",
                  background: activeConv === c.conversationId ? "rgba(108,99,255,0.12)" : "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(168,85,247,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                    {getInitial(c.otherUser?.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{c.otherUser?.name || "User"}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.lastMessage || "Start chatting"}</div>
                  </div>
                  {c.unread > 0 && <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--primary)", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{c.unread}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message area */}
        {activeConv ? (
          <div className="glass-card" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(168,85,247,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                {getInitial(conversations.find((c) => c.conversationId === activeConv)?.otherUser?.name)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{conversations.find((c) => c.conversationId === activeConv)?.otherUser?.name || "User"}</div>
                <div style={{ fontSize: 11, color: "#10b981" }}>● Online</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>
                  Send a message to get started
                </div>
              )}
              {messages.map((m, i) => {
                const isMine = m.sender?._id === user._id || m.sender === user._id;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                    <div className={isMine ? "chat-bubble-sent" : "chat-bubble-received"}>{m.text}</div>
                  </div>
                );
              })}
              {otherTyping && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div className="chat-bubble-received" style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    {[0, 1, 2].map((i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animation: `bounce 1s infinite ${i * 0.2}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: "16px 24px", borderTop: "1px solid var(--glass-border)", display: "flex", gap: 10 }}>
              <input className="input-glass" placeholder="Type a message…" value={text} onChange={(e) => handleTyping(e.target.value)} style={{ flex: 1 }} />
              <button className="btn-primary" type="submit" disabled={!text.trim()} style={{ borderRadius: 12, padding: "10px 20px", flexShrink: 0 }}>Send →</button>
            </form>
          </div>
        ) : (
          <div className="glass-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <p style={{ fontSize: 15 }}>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </DashLayout>
  );
}

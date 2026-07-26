import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import DashLayout from "../components/DashLayout";
import api from "../api/axios";
import useSocket from "../hooks/useSocket";

export default function Chat() {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, accessToken } = useSelector((s) => s.auth);
  const socketRef = useSocket(accessToken);

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [activeUserId, setActiveUserId] = useState(null);
  const [activeUserName, setActiveUserName] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const fetchConversations = () => {
    api.get("/messages").then((r) => {
      const raw = r.data.conversations || [];
      const seen = new Set();
      const convs = raw.map((m) => {
        const myId = user?._id;
        const senderId = m.sender?._id || m.sender;
        const isSender = senderId?.toString() === myId?.toString();
        const otherInfo = isSender ? m.receiverInfo?.[0] : m.senderInfo?.[0];
        return {
          conversationId: m.conversationId,
          otherUser: otherInfo,
          lastMessage: m.text,
        };
      }).filter((c) => {
        if (seen.has(c.conversationId)) return false;
        seen.add(c.conversationId);
        return true;
      });
      setConversations(convs);
    }).catch(() => { });
  };

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [user]);

  // If userId in query params — start new conversation
  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId && user) {
      const convId = [user._id, userId].sort().join("_");
      setActiveConv(convId);
      setActiveUserId(userId);
      api.get(`/profile/freelancer/${userId}`)
        .then((r) => setActiveUserName(r.data.user?.name || "User"))
        .catch(() => setActiveUserName("User"));
      loadMessages(convId, userId);
    }
  }, [searchParams, user]);

  // If conversationId in URL params
  useEffect(() => {
    if (conversationId) {
      setActiveConv(conversationId);
      loadMessages(conversationId);
    }
  }, [conversationId]);

  const loadMessages = (convId, forcedUserId) => {
    if (!convId) return;
    const parts = convId.split("_");
    const otherId = forcedUserId || parts.find((p) => p !== user?._id?.toString());
    if (otherId) {
      setActiveUserId(otherId);
      api.get(`/messages/${otherId}`).then((r) => {
        setMessages(r.data.messages || []);
        setActiveConv(r.data.conversationId || convId);
      }).catch(() => { });
    }
  };

  const openConversation = (conv) => {
    setActiveConv(conv.conversationId);
    setActiveUserName(conv.otherUser?.name || "User");
    const parts = conv.conversationId.split("_");
    const otherId = parts.find((p) => p !== user?._id?.toString());
    setActiveUserId(otherId);
    api.get(`/messages/${otherId}`).then((r) => {
      setMessages(r.data.messages || []);
    }).catch(() => { });
    socketRef.current?.emit("joinConversation", conv.conversationId);
  };

  // Socket listeners
  useEffect(() => {
    if (!activeConv || !socketRef.current) return;
    socketRef.current.emit("joinConversation", activeConv);

    const handleNewMessage = (msg) => {
      if (msg.conversationId === activeConv) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socketRef.current.on("newMessage", handleNewMessage);
    socketRef.current.on("userTyping", () => setOtherTyping(true));
    socketRef.current.on("userStoppedTyping", () => setOtherTyping(false));

    return () => {
      socketRef.current?.off("newMessage", handleNewMessage);
      socketRef.current?.off("userTyping");
      socketRef.current?.off("userStoppedTyping");
    };
  }, [activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUserId) return;
    try {
      const { data } = await api.post("/messages", {
        receiverId: activeUserId,
        text: text.trim(),
        conversationId: activeConv,
      });
      setMessages((prev) => [...prev, data.message]);
      setText("");
      fetchConversations();
    } catch { }
  };

  const handleTyping = (val) => {
    setText(val);
    socketRef.current?.emit("typing", { conversationId: activeConv, userId: user._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit("stopTyping", { conversationId: activeConv, userId: user._id });
    }, 1500);
  };

  const getInitial = (name) => name?.[0]?.toUpperCase() || "?";

  return (
    <DashLayout title="Messages">
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, height: "calc(100vh - 200px)" }}>

        {/* Conversation list */}
        <div className="glass-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--glass-border)", fontWeight: 700, fontSize: 14 }}>
            Conversations
            {conversations.length > 0 && (
              <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>
                ({conversations.length})
              </span>
            )}
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {conversations.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                <p style={{ marginBottom: 6 }}>No conversations yet</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  Go to a gig → click Message Client/Freelancer to start chatting
                </p>
              </div>
            ) : (
              conversations.map((c, i) => (
                <div key={i} onClick={() => openConversation(c)}
                  style={{
                    padding: "14px 20px", cursor: "pointer", transition: "background 0.2s",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    background: activeConv === c.conversationId ? "rgba(108,99,255,0.12)" : "transparent"
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: activeConv === c.conversationId
                        ? "linear-gradient(135deg, #6c63ff, #a855f7)"
                        : "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(168,85,247,0.2))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 16, flexShrink: 0, color: "white"
                    }}>
                      {getInitial(c.otherUser?.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: activeConv === c.conversationId ? "#a5a0ff" : "var(--text-primary)" }}>
                        {c.otherUser?.name || "User"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.lastMessage || "Start chatting"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message area */}
        {activeConv ? (
          <div className="glass-card" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Chat header */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #6c63ff, #a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white"
              }}>
                {getInitial(activeUserName)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{activeUserName || "User"}</div>
                <div style={{ fontSize: 11, color: "#10b981" }}>● Active now</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 40 }}>👋</div>
                  <p style={{ fontSize: 15 }}>Say hello to {activeUserName}!</p>
                  <p style={{ fontSize: 13 }}>Start the conversation below</p>
                </div>
              )}
              {messages.map((m, i) => {
                const isMine = m.sender?._id?.toString() === user?._id?.toString() || m.sender?.toString() === user?._id?.toString();
                return (
                  <div key={i} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
                    {!isMine && (
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(168,85,247,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {getInitial(activeUserName)}
                      </div>
                    )}
                    <div style={{
                      maxWidth: "65%", padding: "10px 14px", fontSize: 14, lineHeight: 1.6,
                      borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: isMine ? "linear-gradient(135deg, #6c63ff, #a855f7)" : "rgba(255,255,255,0.07)",
                      color: "white", border: isMine ? "none" : "1px solid var(--glass-border)",
                      wordBreak: "break-word"
                    }}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
              {otherTyping && (
                <div style={{ display: "flex", justifyContent: "flex-start", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(168,85,247,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                    {getInitial(activeUserName)}
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.07)", border: "1px solid var(--glass-border)", display: "flex", gap: 4, alignItems: "center" }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animation: `pulse 1s infinite ${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: "16px 24px", borderTop: "1px solid var(--glass-border)", display: "flex", gap: 10 }}>
              <input
                className="input-glass"
                placeholder={`Message ${activeUserName}…`}
                value={text}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(e)}
                style={{ flex: 1 }}
              />
              <button
                className="btn-primary"
                type="submit"
                disabled={!text.trim()}
                style={{ borderRadius: 12, padding: "10px 20px", flexShrink: 0 }}>
                Send →
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 56 }}>💬</div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>Your Messages</p>
              <p style={{ fontSize: 14, marginBottom: 6 }}>Select a conversation from the left</p>
              <p style={{ fontSize: 13 }}>or go to a gig and click 💬 Message</p>
            </div>
          </div>
        )}
      </div>
    </DashLayout>
  );
}
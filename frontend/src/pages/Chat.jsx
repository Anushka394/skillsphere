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

  // Load conversations on mount
  useEffect(() => {
    api.get("/messages").then((r) => {
      const raw = r.data.conversations || [];
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
      });
      setConversations(convs);
    }).catch(() => {});
  }, [user]);

  // If userId in query params — start new conversation
  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId && user) {
      const convId = [user._id, userId].sort().join("_");
      setActiveConv(convId);
      setActiveUserId(userId);
      // fetch user name
      api.get(`/profile/freelancer/${userId}`).then((r) => {
        setActiveUserName(r.data.user?.name || "User");
      }).catch(() => setActiveUserName("User"));
      loadMessages(convId);
    }
  }, [searchParams, user]);

  // If conversationId in URL params
  useEffect(() => {
    if (conversationId) {
      setActiveConv(conversationId);
      loadMessages(conversationId);
    }
  }, [conversationId]);

  const loadMessages = (convId) => {
    // extract other userId from convId
    if (!convId) return;
    const parts = convId.split("_");
    const otherId = parts.find((p) => p !== user?._id?.toString());
    if (otherId) {
      setActiveUserId(otherId);
      api.get(`/messages/${otherId}`).then((r) => {
        setMessages(r.data.messages || []);
        setActiveConv(r.data.conversationId || convId);
      }).catch(() => {});
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
    }).catch(() => {});
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
      // refresh conversations
      api.get("/messages").then((r) => {
        const raw = r.data.conversations || [];
        const convs = raw.map((m) => {
          const myId = user?._id;
          const senderId = m.sender?._id || m.sender;
          const isSender = senderId?.toString() === myId?.toString();
          const otherInfo = isSender ? m.receiverInfo?.[0] : m.senderInfo?.[0];
          return { conversationId: m.conversationId, otherUser: otherInfo, lastMessage: m.text };
        });
        setConversations(convs);
      }).catch(() => {});
    } catch {}
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
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {conversations.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                <p>No conversations yet</p>
                <p style={{ fontSize: 11, marginTop: 8 }}>Go to a freelancer profile and click Message</p>
              </div>
            ) : (
              conversations.map((c, i) => (
                <div key={i} onClick={() => openConversation(c)}
                  style={{ padding: "14px 20px", cursor: "pointer", transition: "background 0.2s", borderBottom: "1px solid rgba(255,255,255,0.03)",
                    background: activeConv === c.conversationId ? "rgba(108,99,255,0.12)" : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(168,85,247,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                      {getInitial(c.otherUser?.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{c.otherUser?.name || "User"}</div>
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
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(168,85,247,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                {getInitial(activeUserName)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{activeUserName || "User"}</div>
                <div style={{ fontSize: 11, color: "#10b981" }}>● Online</div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>
                  Send a message to start the conversation!
                </div>
              )}
              {messages.map((m, i) => {
                const isMine = m.sender?._id?.toString() === user?._id?.toString() || m.sender?.toString() === user?._id?.toString();
                return (
                  <div key={i} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "70%", padding: "10px 14px", borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", fontSize: 14, lineHeight: 1.5,
                      background: isMine ? "linear-gradient(135deg, #6c63ff, #a855f7)" : "rgba(255,255,255,0.07)",
                      color: "white", border: isMine ? "none" : "1px solid var(--glass-border)"
                    }}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
              {otherTyping && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ padding: "10px 14px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.07)", border: "1px solid var(--glass-border)", display: "flex", gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)" }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: "16px 24px", borderTop: "1px solid var(--glass-border)", display: "flex", gap: 10 }}>
              <input className="input-glass" placeholder="Type a message…" value={text}
                onChange={(e) => handleTyping(e.target.value)}
                style={{ flex: 1 }} />
              <button className="btn-primary" type="submit" disabled={!text.trim()}
                style={{ borderRadius: 12, padding: "10px 20px", flexShrink: 0 }}>
                Send →
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <p style={{ fontSize: 15 }}>Select a conversation or start a new one</p>
            <p style={{ fontSize: 13 }}>Go to a freelancer's public profile → click Message</p>
          </div>
        )}
      </div>
    </DashLayout>
  );
}
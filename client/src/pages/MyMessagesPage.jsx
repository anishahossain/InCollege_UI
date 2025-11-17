// client/src/pages/MyMessagesPage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";

const API_BASE = "http://localhost:4000/api";

export default function MyMessagesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Guest";

  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch(
          `${API_BASE}/messages/${encodeURIComponent(username)}`
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Failed to load messages.");
        }
        const data = await res.json();
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setMessages(sorted);
        setStatus({ loading: false, error: null });
      } catch (err) {
        setStatus({ loading: false, error: err.message });
      }
    }

    loadMessages();
  }, [username]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Epilogue, sans-serif",
      }}
    >
      <header
        style={{
          height: "64px",
          background: "#f7f3ea",
          color: "#050816",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ fontFamily: "'Anton', sans-serif",
          fontSize: "2rem",
          letterSpacing: "2px",
          margin: 0,
          color: "#000413", }}>InCollege</h1>
        <button
            onClick={() =>
              navigate("/messages", { state: { username } })
            }
            style={{
              backgroundColor: "#000413",
          color: "#e5e7eb",
          border: "none",
          padding: "0.6rem 1.3rem",
          borderRadius: "999px",
          fontSize: "0.95rem",
          cursor: "pointer",
          fontFamily: "'Epilogue', sans-serif",
            }}
          >
            ← Back
          </button>
      </header>

      <main
        style={{
          flex: 1,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <h2 style={{ fontSize: "22px", fontWeight: 700, fontFamily: "'Anton', sans-serif", marginLeft: "70px", marginRight: "70px",color: "#fecaca", }}>
            Your Received Messages
          </h2>
          
        </div>

        {status.loading && <p>Loading messages...</p>}

        {status.error && (
          <p style={{ color: "#fca5a5" }}>{status.error}</p>
        )}

        {!status.loading && !status.error && messages.length === 0 && (
          <p>You have no messages at this time.</p>
        )}

        {!status.loading &&
          !status.error &&
          messages.map((msg) => (
            <article
              key={msg.id}
              style={{
                background: "rgba(15,23,42,0.9)",
                borderRadius: "16px",
                padding: "16px",
                border: "1px solid rgba(148,163,184,0.4)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
              }}
            >
              <header
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "#e5e7eb",
                }}
              >
                <span>
                  <strong>From:</strong> {msg.sender}
                </span>
                <span style={{ opacity: 0.8 }}>
                  {msg.displayTimestamp || msg.timestamp}
                </span>
              </header>
              <hr
                style={{
                  borderColor: "rgba(55,65,81,0.7)",
                  margin: "4px 0 10px",
                }}
              />
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "15px",
                  lineHeight: 1.6,
                }}
              >
                {msg.text}
              </p>

              {/* ▼ NEW: Reply button */}
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() =>
                    navigate("/messages/send", {
                      state: {
                        username,
                        replyTo: {
                          recipient: msg.sender,
                          originalId: msg.id,
                          originalPreview: msg.text.slice(0, 120),
                        },
                      },
                    })
                  }
                  style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    border: "1px solid #38bdf8",
                    background: "transparent",
                    color: "#e0f2fe",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Reply
                </button>
              </div>
            </article>
          ))}
      </main>
    </div>
  );
}

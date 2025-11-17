// client/src/pages/SendMessagePage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE = "https://incollege-ui-byanishahossain.onrender.com/api";

export default function SendMessagePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Guest";

  // 👇 replyTo info passed from MyMessagesPage (may be undefined)
  const replyTo = location.state?.replyTo || null;

  const [recipient, setRecipient] = useState(replyTo?.recipient || "");
  const [text, setText] = useState("");
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If replyTo changes for some reason, keep recipient in sync
  useEffect(() => {
    if (replyTo?.recipient) {
      setRecipient(replyTo.recipient);
    }
  }, [replyTo]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    if (!recipient.trim() || !text.trim()) {
      setStatus({
        type: "error",
        message: "Recipient and message text are required.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: username,
          recipient: recipient.trim(),
          text,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({
          type: "error",
          message: data?.error || "Failed to send message.",
        });
      } else {
        setStatus({
          type: "success",
          message: data?.message || "Message sent successfully!",
        });
        // For replies, keep the recipient; for new messages, clear everything
        setText("");
        if (!replyTo) {
          setRecipient("");
        }
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: "Network error while sending message.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <h1 style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: "2rem",
            letterSpacing: "0.2rem",
          }}>InCollege</h1>
        <span style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: "1.3rem",
            letterSpacing: "0.08rem",
          }}>Logged in as {username}</span>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "620px",
            width: "100%",
            background: "rgba(15,23,42,0.9)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            border: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          <h2
            style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: "22px",
              fontWeight: 700,
              marginBottom: "16px",
              color: "#fecaca",
            }}
          >
            {replyTo ? "Reply to Message" : "Send a Message"}
          </h2>

          {replyTo && (
            <div
              style={{
                marginBottom: "12px",
                padding: "8px 12px",
                borderRadius: "10px",
                background: "rgba(15,118,110,0.3)",
                fontSize: "13px",
              }}
            >
              Replying to <strong>{replyTo.recipient}</strong>
              {replyTo.originalPreview && (
                <div style={{ marginTop: "6px", opacity: 0.8 }}>
                  <em>“{replyTo.originalPreview}...”</em>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                color: "#e5e7eb",
              }}
            >
              Recipient Username
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                style={inputStyle}
                placeholder="Enter recipient username"
                // If you want to lock the recipient field on replies:
                // readOnly={!!replyTo}
              />
            </label>

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                color: "#e5e7eb",
              }}
            >
              Message
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
                placeholder="Type your message..."
              />
            </label>

            {status && (
              <div
                style={{
                  marginBottom: "12px",
                  fontSize: "14px",
                  color:
                    status.type === "success" ? "#4ade80" : "#fca5a5",
                }}
              >
                {status.message}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  navigate("/messages", { state: { username } })
                }
                style={{
                  ...buttonStyle,
                  
                  background: "#020617",
                  color: "#f9fafb",
                  border: "1px solid #4b5563",
                }}
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...buttonStyle,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? "default" : "pointer",
                }}
              >
                {isSubmitting ? "Sending..." : replyTo ? "Send Reply" : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

const inputStyle = {
  width: "96%",
  marginTop: "8px",
  marginBottom: "12px",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #4b5563",
  backgroundColor: "#020617",
  color: "#f9fafb",
  fontSize: "14px",
  outline: "none",
};

const buttonStyle = {
  padding: "0.7rem 1.4rem",
    borderRadius: "999px",
    border: "none",
    background:"linear-gradient(135deg, #22c55e, #38bdf8, #a855f7)",
    color: "#020617",
    fontWeight: 600,
    fontSize: "0.9rem",
};

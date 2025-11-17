// client/src/pages/SentMessagesPage.jsx - to view sent messages
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSentMessages } from "../api";

export default function SentMessagesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Guest";

  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    async function load() {
      try {
        const data = await getSentMessages(username);
        setMessages(data);
        setStatus({ loading: false, error: null });
      } catch (err) {
        setStatus({ loading: false, error: err.message });
      }
    }
    load();
  }, [username]);

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "white" }}>
      <header style={{
        height: "64px", background: "#f7f3ea", color: "#050816",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px"
      }}>
        <h1 style={{fontFamily: "'Anton', sans-serif",
          fontSize: "2rem",
          letterSpacing: "2px",
          margin: 0,
          color: "#000413",}}>InCollege</h1>
        <span style={{fontFamily: "'Anton', sans-serif",
          fontSize: "1.3rem",
          letterSpacing: "0.08px",
          margin: 0,
          color: "#000413",}}>Logged in as {username}</span>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "24px", }}>
        <h2 style={{ fontFamily: "'Anton', sans-serif", color: "#b1e8f5ff" }}
        >Messages You Sent</h2>

        <button
          onClick={() => navigate("/messages", { state: { username } })}
          style={{  padding: "0.7rem 1.4rem",
    borderRadius: "999px",
    fontWeight: 600,
    fontSize: "0.9rem",
  background: "#020617",
                  color: "#f9fafb",
                  border: "1px solid #4b5563", }}
        >
          Back
        </button>

        {status.loading && <p>Loading...</p>}
        {status.error && <p style={{ color: "red" }}>{status.error}</p>}
        {!status.loading && messages.length === 0 && <p>You haven't sent any messages.</p>}

        {messages.map(m => (
          <article key={m.id}
            style={{
              background: "rgba(15,23,42,0.9)",
              borderRadius: "16px",
              padding: "16px",
              marginTop: "12px",
              border: "1px solid rgba(148,163,184,0.4)"
            }}
          >
            <header style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px"
            }}>
              <span><strong>To:</strong> {m.recipient}</span>
              <span>{m.displayTimestamp}</span>
            </header>

            <p style={{ whiteSpace: "pre-wrap" }}>{m.text}</p>
          </article>
        ))}
      </main>
    </div>
  );
}

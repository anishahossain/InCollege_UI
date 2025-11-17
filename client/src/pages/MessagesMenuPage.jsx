// client/src/pages/MessagesMenuPage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import "./MainMenu.css";

export default function MessagesMenuPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Guest";

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
      {/* HEADER — same as MainMenu */}
      <header
        style={{
          height: "64px",
          background: "#f7f3ea",
          color: "#050816",
          display: "flex",
          alignItems: "center",
          padding: "0 2.5rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        }}
      >
        <span
          style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: "2rem",
            letterSpacing: "0.2rem",
          }}
        >
          INCOLLEGE
        </span>
      </header>

      {/* MAIN CONTENT — matches MainMenu layout */}
      <main
        style={{
          flex: 1,
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", fontFamily: "'Anton', sans-serif", }}>Messages 📩</h1>

        <p style={{ opacity: 0.8 }}>
          Choose a messaging option below:
        </p>

        {/* GRID of buttons — same style as MainMenu */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1rem",
          }}
        >
          <button
            className="menu-btn"
            onClick={() =>
              navigate("/messages/send", { state: { username } })
            }
          >
            Send a New Message
          </button>

          <button
            className="menu-btn"
            onClick={() =>
              navigate("/messages/inbox", { state: { username } })
            }
          >
            View Received Messages
          </button>

          <button
            className="menu-btn"
            onClick={() =>
              navigate("/messages/sent", { state: { username } })
            }
          >
            View Sent Messages
          </button>
        </div>

        {/* Return Button */}
        <button
          className="menu-btn"
          onClick={() => navigate("/menu", { state: { username } })}
          style={{ marginTop: "1rem", maxWidth: "250px" }}
        >
          Return to Main Menu
        </button>
      </main>
    </div>
  );
}

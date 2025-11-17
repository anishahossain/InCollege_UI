// client/src/pages/MainMenu.jsx
import { useLocation, useNavigate } from "react-router-dom";
import "./MainMenu.css";


export default function MainMenu() {
  const location = useLocation();
  const navigate = useNavigate();

  // username passed from AuthPage: navigate("/menu", { state: { username } })
  const username = location.state?.username || "Guest";

  function handleLogout() {
    navigate("/"); // go back to login/signup page
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
          padding: "0 2.5rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        }}
      >
        <span
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: "2rem",
            letterSpacing: "0.12em",
          }}
        >
          INCOLLEGE
        </span>
      </header>

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
        <h1 style={{ fontSize: "1.8rem", fontFamily: "'Anton', sans-serif", }}>Welcome, {username} 👋</h1>

        <p style={{ opacity: 0.8 }}>
          Choose an option from the InCollege main menu:
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          <button
  className="menu-btn"
  onClick={() => navigate("/jobs", { state: { username } })}
>
  Jobs / Internships
</button>


          <button
  className="menu-btn"
  onClick={() => navigate("/find-someone", { state: { username } })}
>
  Find Someone You Know
</button>

          <button
            className="menu-btn"
            onClick={() => navigate("/profile", { state: { username } })}
          >
            Create / Edit My Profile
          </button>
          <button
            className="menu-btn"
            onClick={() => navigate("/profile/view", { state: { username } })} // ⬅️ NEW
            >
            View My Profile
        </button>
          <button
        className="menu-btn"
        onClick={() =>
          navigate("/connections/pending", { state: { username } })
        }
      >
        View my pending connection requests
      </button>
          <button
        className="menu-btn"
        onClick={() =>
          navigate("/connections/network", { state: { username } })
        }
      >
        View my network
      </button>
      <button
        className="menu-btn"
        onClick={() =>
          navigate("/messages", { state: { username } })
        }
      >
        Direct Messaging
      </button>
        </div>

        <button className="menu-btn"
          onClick={handleLogout}
          style={{ marginTop: "1rem", maxWidth: "200px" }}
        >
          Log Out
        </button>
      </main>
    </div>
  );
}

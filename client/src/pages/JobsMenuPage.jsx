import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./MainMenu.css";

export default function JobsMenuPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Guest";

  const containerStyle = {
    minHeight: "100vh",
    background: "#020617",
    color: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Epilogue, sans-serif",
  };

  const headerStyle = {
    height: "64px",
    background: "#f7f3ea",
    color: "#050816",
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    justifyContent: "space-between",
    fontWeight: 600,
  };

  const mainStyle = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const cardStyle = {
    background: "#020617",
    borderRadius: "18px",
    border: "1px solid #e5e7eb",
    padding: "32px",
    width: "100%",
    maxWidth: "520px",
    boxShadow: "0 24px 60px rgba(15,23,42,0.7)",
  };

  const titleStyle = {
    fontSize: "1.6rem",
    fontWeight: 700,
    marginBottom: "16px",
    fontFamily: "'Anton', sans-serif",
    color: "#fecaca",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px 16px",
    marginBottom: "12px",
    borderRadius: "999px",
  };

  return (
     <div style={{ backgroundColor: "#000413", minHeight: "100vh" }}>
                <Header onBack={() => navigate("/menu", { state: { username } })} />
    <div style={containerStyle}>
      <main style={mainStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Jobs / Internships</h1>
          <p style={{ fontSize: "0.9rem", marginBottom: "20px", color: "#9ca3af" }}>
            Choose an option below to post a new job, browse opportunities, or review your applications.
          </p>

          <button
            className="menu-btn"
            style={buttonStyle}
            onClick={() => navigate("/jobs/post", { state: { username } })}
          >
            1. Post a Job / Internship
          </button>

          <button
          className="menu-btn"
            style={buttonStyle}
            onClick={() => navigate("/jobs/search", { state: { username } })}
          >
            2. Browse Jobs / Internships
          </button>

          <button
          className="menu-btn"
            style={buttonStyle}
            onClick={() => navigate("/jobs/applications", { state: { username } })}
          >
            3. View My Applications
          </button>

         
        </div>
      </main>
    </div>
    </div>
  );
}

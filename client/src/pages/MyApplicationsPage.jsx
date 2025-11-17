import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyApplications } from "../api";
import Header from "../components/Header";

export default function MyApplicationsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Guest";

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getMyApplications(username);
        setApplications(data);
      } catch (err) {
        setError(err.message || "Failed to load applications.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  const containerStyle = {
    minHeight: "100vh",
    background: "#020617",
    color: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Epilogue, sans-serif",
  };

  
  const mainStyle = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  };

  const cardStyle = {
    background: "#020617",
    borderRadius: "18px",
    border: "1px solid #e5e7eb",
    padding: "34px 28px",
    width: "100%",
    maxWidth: "720px",
    boxShadow: "0 24px 60px rgba(15,23,42,0.7)",
  };

  const itemStyle = {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #1f2937",
    background: "#020617",
    marginBottom: "10px",
  };

  return (
    <div style={{ backgroundColor: "#000413", minHeight: "100vh" }}>
                        <Header onBack={() => navigate("/menu", { state: { username } })} />
    <div style={containerStyle}>

      <main style={mainStyle}>
        <div style={cardStyle}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px", fontFamily: "'Anton', sans-serif" }}>
            Your Job Applications
          </h1>

          {loading && <p style={{ fontSize: "0.9rem" }}>Loading...</p>}

          {error && !loading && (
            <p style={{ fontSize: "0.9rem", color: "#fecaca" }}>{error}</p>
          )}

          {!loading && !error && applications.length === 0 && (
            <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
              You have not applied to any jobs yet.
            </p>
          )}

          {!loading && !error && applications.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              {applications.map((app, idx) => (
                <div key={idx} style={itemStyle}>
                  <div style={{ fontWeight: 600 }}>
                    {app.jobTitle || app.title || "(Untitled Job)"}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                    {app.employer || app.jobEmployer} –{" "}
                    {app.location || app.jobLocation}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            style={{
            marginTop: "16px",
            padding: "0.5rem 1.2rem",
            borderRadius: "999px",
            border: "none",
            background:"linear-gradient(135deg, #22c55e, #38bdf8, #a855f7)",
            color: "#020617",
            fontWeight: 600,
            fontSize: "0.9rem",
            }}
            onClick={() => navigate("/jobs", { state: { username } })}
          >
            Back to Job Search Menu
          </button>
        </div>
      </main>
    </div>
    </div>
  );
}

// client/src/pages/ViewNetworkPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getNetwork } from "../api";
import Header from "../components/Header";

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#0f172a",
  color: "#f9fafb",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "2rem",
};

const cardStyle = {
  maxWidth: "800px",
  width: "100%",
  backgroundColor: "#111827",
  borderRadius: "0.75rem",
  padding: "1.75rem",
  boxShadow: "0 20px 45px rgba(0,0,0,0.6)",
};

const buttonRowStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  marginTop: "0.75rem",
};

const secondaryButton = {
  padding: "0.4rem 0.9rem",
  borderRadius: "999px",
  border: "none",
  backgroundColor: "#1f2937",
  color: "#e5e7eb",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.85rem",
};

const messageBar = (bg, color) => ({
  marginTop: "0.75rem",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.5rem",
  backgroundColor: bg,
  color,
  fontSize: "0.9rem",
});

const tagStyle = (bg) => ({
  display: "inline-block",
  padding: "0.15rem 0.5rem",
  borderRadius: "999px",
  fontSize: "1rem",
  backgroundColor: bg,
  marginRight: "0.4rem",
  marginTop: "0.25rem",
});

export default function ViewNetworkPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Guest";

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (username === "Guest") {
      setError("You must be logged in to view your network.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError("");
      setInfo("");

      try {
        const data = await getNetwork(username);
        setConnections(data.connections || []);
        if (!data.connections || data.connections.length === 0) {
          setInfo("You don't have any connections yet.");
        }
      } catch (err) {
        setError(err.message || "Failed to load your network.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [username]);

  return (
    <div style={{ backgroundColor: "#000413", minHeight: "100vh" }}>
            <Header onBack={() => navigate("/menu", { state: { username } })} />
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "'Anton', sans-serif", color: "#C3E7E6",}}>
          My Network
        </h1>
        <p style={{ color: "#9ca3af", marginBottom: "1rem", fontSize: "1.2rem" }}>
          See everyone you are connected with on InCollege.
        </p>

        {loading && (
          <div style={messageBar("#020617", "#e5e7eb")}>
            Loading your network...
          </div>
        )}

        {error && !loading && (
          <div style={messageBar("#450a0a", "#fecaca")}>{error}</div>
        )}

        {info && !loading && !error && (
          <div style={messageBar("#022c22", "#bbf7d0")}>{info}</div>
        )}

        {!loading && !error && connections.length > 0 && (
          <div style={{ marginTop: "1.25rem" }}>
            {connections.map((c) => (
              <div
                key={c.username}
                style={{
                  borderRadius: "0.75rem",
                  border: "1px solid #1f2937",
                  padding: "0.75rem 0.9rem",
                  marginBottom: "1rem",
                  backgroundColor: "#020617",
                }}
              >
                <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                  {c.firstName || c.lastName
                    ? `${c.firstName} ${c.lastName}`.trim()
                    : c.username}
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    color: "#9ca3af",
                    marginTop: "0.1rem",
                  }}
                >
                  @{c.username}
                </div>

                {(c.school || c.major || c.gradYear) && (
                  <div style={{ fontSize: "1rem", marginTop: "0.6rem" }}>
                    {c.school && <span style={tagStyle("#312e81")}>{c.school}</span>}
                    {c.major && <span style={tagStyle("#064e3b")}>{c.major}</span>}
                    {c.gradYear && (
                      <span style={tagStyle("#042f2e")}>
                        Class of {c.gradYear}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

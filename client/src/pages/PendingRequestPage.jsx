import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPendingRequests, respondToRequest } from "../api";
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

const primaryButton = {
  padding: "0.4rem 0.9rem",
  borderRadius: "999px",
  border: "none",
  backgroundColor: "#4fd781ff",
  color: "#022c22",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.85rem",
};

const dangerButton = {
  ...primaryButton,
  backgroundColor: "#d23434ff",
  color: "#fee2e2",
};

const secondaryButton = {
  ...primaryButton,
  backgroundColor: "#1f2937",
  color: "#e5e7eb",
  padding: "0.6rem 1.5rem",
};

const messageBar = (bg, color) => ({
  marginTop: "0.75rem",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.5rem",
  backgroundColor: bg,
  color,
  fontSize: "0.9rem",
});

export default function PendingRequestsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Guest";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (username === "Guest") {
      setError("You must be logged in to view pending connection requests.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError("");
      setInfo("");
      try {
        const data = await getPendingRequests(username);
        setRequests(data.requests || []);
        if (!data.requests || data.requests.length === 0) {
          setInfo("You have no pending connection requests.");
        }
      } catch (err) {
        setError(err.message || "Failed to load pending requests.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [username]);

  const handleRespond = async (senderUsername, action) => {
    setError("");
    setInfo("");

    try {
      setLoading(true);
      const res = await respondToRequest(senderUsername, username, action);
      setRequests((prev) =>
        prev.filter((r) => r.senderUsername !== senderUsername)
      );
      setInfo(res.message || `Request ${action}ed.`);
    } catch (err) {
      setError(err.message || "Failed to update request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#000413", minHeight: "100vh" }}>
        <Header onBack={() => navigate("/menu", { state: { username } })} />
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "'Anton', sans-serif", }}>
          Pending connection requests
        </h1>
        <p style={{ color: "#9ca3af", marginBottom: "1rem", fontSize: "0.95rem" }}>
          Review requests from other InCollege members and accept or reject them.
        </p>

        <div style={buttonRowStyle}>
          <button
            type="button"
            style={secondaryButton}
            onClick={() => navigate("/menu", { state: { username } })}
          >
            Back to Main Menu
          </button>
        </div>

        {loading && (
          <div style={messageBar("#020617", "#e5e7eb")}>
            Loading pending requests...
          </div>
        )}

        {error && !loading && (
          <div style={messageBar("#450a0a", "#fecaca")}>{error}</div>
        )}

        {info && !loading && !error && (
          <div style={messageBar("#022c22", "#bbf7d0")}>{info}</div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div style={{ marginTop: "1.25rem" }}>
            {requests.map((req) => (
              <div
                key={req.senderUsername}
                style={{
                  borderRadius: "0.75rem",
                  border: "1px solid #1f2937",
                  padding: "0.75rem 0.9rem",
                  marginBottom: "0.75rem",
                  backgroundColor: "#020617",
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {req.senderFirstName || req.senderLastName
                    ? `${req.senderFirstName} ${req.senderLastName}`.trim()
                    : req.senderUsername}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#9ca3af",
                    marginTop: "0.1rem",
                  }}
                >
                  @{req.senderUsername}
                </div>

                <div style={buttonRowStyle}>
                  <button
                    type="button"
                    style={primaryButton}
                    disabled={loading}
                    onClick={() => handleRespond(req.senderUsername, "accept")}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    style={dangerButton}
                    disabled={loading}
                    onClick={() => handleRespond(req.senderUsername, "reject")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

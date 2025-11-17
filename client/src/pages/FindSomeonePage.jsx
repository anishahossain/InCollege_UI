// client/src/pages/FindSomeonePage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { findProfileByName, sendConnectionRequest } from "../api";
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

const sectionTitleStyle = {
  fontFamily: "'Anton', sans-serif",
  fontSize: "1.25rem",
  fontWeight: 400,
  letterSpacing: "0.5px",
  marginTop: "1.25rem",
  marginBottom: "0.5rem",
};


const labelStyle = {
  display: "block",
  fontSize: "0.9rem",
  marginBottom: "0.25rem",
  color: "#9ca3af",
};

const inputStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.5rem",
  border: "2px solid #4b5563",
  backgroundColor: "#020617",
  color: "#f9fafb",
  marginBottom: "0.75rem",
};

const buttonRowStyle = {
  display: "flex",
  gap: "0.75rem",
  marginTop: "1rem",
  flexWrap: "wrap",
  color: "#fcdbe2",
};

const primaryButtonStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "999px",
  border: "none",
  backgroundColor: "#fcdbe2",
  color: "#022c22",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  backgroundColor: "#1f2937",
  color: "#e5e7eb",
};

const badgeStyle = (bg) => ({
  display: "inline-block",
  padding: "0.15rem 0.5rem",
  borderRadius: "999px",
  fontSize: "0.75rem",
  backgroundColor: bg,
  marginRight: "0.5rem",
});

const messageBar = (bg, color) => ({
  marginTop: "0.75rem",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.5rem",
  backgroundColor: bg,
  color,
  fontSize: "0.9rem",
});

export default function FindSomeonePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Guest";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [requestStatus, setRequestStatus] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setRequestStatus("");
    setProfile(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter both first and last name.");
      return;
    }

    try {
      setLoading(true);
      const result = await findProfileByName(firstName, lastName);
      if (!result) {
        setInfo("No user profile exists for the name you have entered.");
      } else {
        setProfile(result);
      }
    } catch (err) {
      setError(err.message || "Failed to search profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!profile?.username) {
      setError("Cannot send request: missing username for selected profile.");
      return;
    }
    if (username === "Guest") {
      setError("You must be logged in to send connection requests.");
      return;
    }

    setError("");
    setRequestStatus("");

    try {
      setLoading(true);
      const res = await sendConnectionRequest(username, profile.username);
      setRequestStatus(res.message || "Successfully sent Connection Request");
    } catch (err) {
      setError(err.message || "Failed to send connection request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#000413", minHeight: "100vh" }}>
    <Header onBack={() => navigate("/menu", { state: { username } })} />
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1
  style={{
    fontFamily: "'Anton', sans-serif",
    fontSize: "1.9rem",
    fontWeight: 400,
    letterSpacing: "0.5px",
    marginBottom: "0.75rem",
    color: "#C3E7E6",
  }}
>

          Find someone you know
        </h1>
        <p style={{ color: "#9ca3af", marginBottom: "1rem", fontSize: "0.95rem" }}>
          Search by first and last name to see if they are on InCollege.
        </p>

        <form onSubmit={handleSearch}>
          <label style={labelStyle}>First name</label>
          <input
            style={inputStyle}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g., Jane"
          />

          <label style={labelStyle}>Last name</label>
          <input
            style={inputStyle}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g., Doe"
          />

          <div style={buttonRowStyle}>
            <button type="submit" style={primaryButtonStyle} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => navigate("/menu", { state: { username } })}
            >
              Back to Main Menu
            </button>
          </div>
        </form>

        {error && <div style={messageBar("#450a0a", "#fecaca")}>{error}</div>}
        {info && !error && <div style={messageBar("#020617", "#e5e7eb")}>{info}</div>}
        {requestStatus && !error && (
          <div style={messageBar("#022c22", "#bbf7d0")}>{requestStatus}</div>
        )}

        {profile && (
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid #1f2937", paddingTop: "1rem" }}>
            <h2 style={sectionTitleStyle}>User Profile</h2>
            <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>
              {profile.firstName} {profile.lastName}
            </p>

            <p style={{ marginTop: "0.25rem", fontSize: "0.95rem" }}>
              {profile.school ? (
                <>
                  <span style={badgeStyle("#312e81")}>{profile.school}</span>
                  {profile.major && <span style={badgeStyle("#052e16")}>{profile.major}</span>}
                  {profile.gradYear && (
                    <span style={badgeStyle("#042f2e")}>Class of {profile.gradYear}</span>
                  )}
                </>
              ) : (
                <span style={{ color: "#6b7280" }}>School info not added</span>
              )}
            </p>

            <h3 style={sectionTitleStyle}>About</h3>
            <p style={{ fontSize: "0.95rem", color: "#d1d5db" }}>
              {profile.about?.trim() ? profile.about : "Not added"}
            </p>

            <h3 style={sectionTitleStyle}>Experience</h3>
            {profile.experiences && profile.experiences.some(exp =>
              exp.title || exp.company || exp.dates || exp.description
            ) ? (
              profile.experiences.map((exp, idx) => (
                <div key={idx} style={{ marginBottom: "0.75rem" }}>
                  <strong>{exp.title || "Title not added"}</strong>
                  <div style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
                    {exp.company || "Company not added"}{" "}
                    {exp.dates ? `• ${exp.dates}` : ""}
                  </div>
                  <div style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
                    {exp.description?.trim() || "Description not added"}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                No experiences added yet.
              </p>
            )}

            <h3 style={sectionTitleStyle}>Education</h3>
            {profile.education && profile.education.some(ed =>
              ed.degree || ed.school || ed.years
            ) ? (
              profile.education.map((ed, idx) => (
                <div key={idx} style={{ marginBottom: "0.75rem" }}>
                  <strong>{ed.degree || "Degree not added"}</strong>
                  <div style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
                    {ed.school || "School not added"}{" "}
                    {ed.years ? `• ${ed.years}` : ""}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                No education added yet.
              </p>
            )}

            <div style={buttonRowStyle}>
              <button
                type="button"
                style={primaryButtonStyle}
                disabled={loading || username === "Guest"}
                onClick={handleSendRequest}
              >
                {loading ? "Processing..." : "Send Connection Request"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

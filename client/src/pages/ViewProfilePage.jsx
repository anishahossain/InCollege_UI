import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile } from "../api";

export default function ViewProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Guest";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!username || username === "Guest") {
          setError("No user is logged in.");
          setLoading(false);
          return;
        }

        const data = await getProfile(username);
        if (!cancelled) {
          setProfile(data);
        }
      } catch (err) {
        if (!cancelled) {
          // most likely 404: profile not found
          setError(err.message || "Profile not found.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [username]);

  const hasProfile = !!profile;

  const experiences = (profile?.experiences || []).filter(
    (e) => e.title || e.company || e.dates || e.description
  );

  const education = (profile?.education || []).filter(
    (ed) => ed.degree || ed.school || ed.years
  );

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "#f9fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Epilogue, sans-serif",
        }}
      >
        Loading profile...
      </div>
    );
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
          justifyContent: "space-between",
          padding: "0 2.5rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        }}
      >
        <span
          style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: "2rem",
            letterSpacing: "0.12em",
          }}
        >
          INCOLLEGE
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => navigate("/profile", { state: { username } })}
            style={{
              borderRadius: "999px",
              border: "1px solid #1f2937",
              padding: "0.4rem 0.9rem",
              background: "#020617",
              color: "#e5e7eb",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Edit Profile
          </button>
          <button
            onClick={() => navigate("/menu", { state: { username } })}
            style={{
              borderRadius: "999px",
              border: "1px solid #1f2937",
              padding: "0.4rem 0.9rem",
              background: "#020617",
              color: "#e5e7eb",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            ⟵ Back to Main Menu
          </button>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.25rem", color: "#C3E7E6"}}>
          My Profile
        </h1>
        <p style={{ opacity: 0.8, marginBottom: "1.5rem" }}>
          Logged in as <strong>{username}</strong>
        </p>

        {error && !hasProfile && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid #b45309",
              background: "rgba(251,191,36,0.1)",
              color: "#fed7aa",
              fontSize: "0.9rem",
            }}
          >
            {error === "Profile not found"
              ? "You don't have a profile yet. Create one to get started!"
              : error}
          </div>
        )}

        {!hasProfile && (
          <button
            onClick={() => navigate("/profile", { state: { username } })}
            style={{
              padding: "0.7rem 1.4rem",
              borderRadius: "999px",
              border: "none",
              background:
                "linear-gradient(135deg, #22c55e, #38bdf8, #a855f7)",
              color: "#020617",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
            }}
          >
            Create My Profile
          </button>
        )}

        {hasProfile && (
          <div
            style={{
              borderRadius: "1rem",
              border: "1px solid #1f2937",
              padding: "1.75rem",
              background:
                "radial-gradient(circle at top left, rgba(56,189,248,0.08), #020617 60%)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {/* Basic info */}
            <section style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
  <div>
    <strong style={{ opacity: 0.85 }}>Name:</strong>
    <p style={{ color: "#fcdbe2"  }}>
      {profile.firstName || profile.lastName
        ? `${profile.firstName} ${profile.lastName}`.trim()
        : "Not added"}
    </p>
  </div>

  <div>
    <strong style={{ opacity: 0.85 }}>Major:</strong>
    <p style={{ color: "#fcdbe2"  }}>
      {profile.major || "Not added"}
    </p>
  </div>

  <div>
    <strong style={{ opacity: 0.85 }}>School:</strong>
    <p style={{ color: "#fcdbe2"}}>
      {profile.school || "Not added"}
    </p>
  </div>

  <div>
    <strong style={{ opacity: 0.85 }}>Graduation Year:</strong>
    <p style={{color: "#fcdbe2" }}>
      {profile.gradYear || "Not added"}
    </p>
  </div>
</section>


            {/* About */}
            <section>
  <h3
    style={{
      fontSize: "1.1rem",
      marginBottom: "0.35rem",
      fontWeight: 600,
      opacity: 0.85,
    }}
  >
    About
  </h3>

  <p style={{ opacity: 0.9, whiteSpace: "pre-wrap" }}>
    {profile.about?.trim() ? profile.about : "Not added"}
  </p>
</section>


            {/* Experience */}
            <section>
  <h3
    style={{
      fontSize: "1.1rem",
      marginBottom: "0.5rem",
      fontWeight: 600,
      opacity: 0.85,
    }}
  >
    Experience
  </h3>

  {experiences.length === 0 ? (
    <p style={{ opacity: 0.7 }}>No experiences added yet.</p>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      {experiences.map((exp, idx) => (
        <div
          key={idx}
          style={{
            padding: "0.8rem 1rem",
            borderRadius: "0.75rem",
            border: "1px solid #1f2937",
            background: "rgba(15,23,42,0.8)",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
            {exp.title || "Role not set"}
            {exp.company ? ` · ${exp.company}` : ""}
          </p>

          {exp.dates && (
            <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>{exp.dates}</p>
          )}

          {exp.description && (
            <p style={{ marginTop: "0.4rem", opacity: 0.9, fontSize: "0.9rem" }}>
              {exp.description}
            </p>
          )}
        </div>
      ))}
    </div>
  )}
</section>


            <section>
  <h3
    style={{
      fontSize: "1.1rem",
      marginBottom: "0.5rem",
      fontWeight: 600,
      opacity: 0.85,
    }}
  >
    Education
  </h3>

  {education.length === 0 ? (
    <p style={{ opacity: 0.7 }}>No education added yet.</p>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      {education.map((ed, idx) => (
        <div
          key={idx}
          style={{
            padding: "0.8rem 1rem",
            borderRadius: "0.75rem",
            border: "1px solid #1f2937",
            background: "rgba(15,23,42,0.8)",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
            {ed.degree || "Degree not set"}
            {ed.school ? ` · ${ed.school}` : ""}
          </p>

          {ed.years && (
            <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>{ed.years}</p>
          )}
        </div>
      ))}
    </div>
  )}
</section>


            {/* If profile exists but is almost empty */}
            {!profile.about &&
              experiences.length === 0 &&
              education.length === 0 && (
                <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>
                  Your profile is created but looks a bit empty. Use{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/profile", { state: { username } })}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#38bdf8",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                      fontSize: "0.9rem",
                    }}
                  >
                    Edit Profile
                  </button>{" "}
                  to add more details.
                </p>
              )}
          </div>
        )}
      </main>
    </div>
  );
}

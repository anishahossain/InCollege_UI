// client/src/pages/ProfileEditPage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile, saveProfile } from "../api";

export default function ProfileEditPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Guest";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    school: "",
    major: "",
    gradYear: "",
    about: "",
    experiences: [
      { title: "", company: "", dates: "", description: "" },
      { title: "", company: "", dates: "", description: "" },
      { title: "", company: "", dates: "", description: "" },
    ],
    education: [
      { degree: "", school: "", years: "" },
      { degree: "", school: "", years: "" },
      { degree: "", school: "", years: "" },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load existing profile (if any) on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!username || username === "Guest") {
          setLoading(false);
          return;
        }

        const data = await getProfile(username);

        if (!cancelled && data) {
          setForm((prev) => ({
            ...prev,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            school: data.school || "",
            major: data.major || "",
            gradYear: data.gradYear || "",
            about: data.about || "",
            experiences:
              data.experiences && data.experiences.length
                ? [
                    ...(data.experiences[0]
                      ? [data.experiences[0]]
                      : [{ title: "", company: "", dates: "", description: "" }]),
                    ...(data.experiences[1]
                      ? [data.experiences[1]]
                      : [{ title: "", company: "", dates: "", description: "" }]),
                    ...(data.experiences[2]
                      ? [data.experiences[2]]
                      : [{ title: "", company: "", dates: "", description: "" }]),
                  ]
                : prev.experiences,
            education:
              data.education && data.education.length
                ? [
                    ...(data.education[0]
                      ? [data.education[0]]
                      : [{ degree: "", school: "", years: "" }]),
                    ...(data.education[1]
                      ? [data.education[1]]
                      : [{ degree: "", school: "", years: "" }]),
                    ...(data.education[2]
                      ? [data.education[2]]
                      : [{ degree: "", school: "", years: "" }]),
                  ]
                : prev.education,
          }));
        }
      } catch (err) {
        // 404 / no profile is fine; anything else we can log
        console.warn("Profile load error:", err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleExperienceChange(index, field, value) {
    setForm((prev) => {
      const copy = [...prev.experiences];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, experiences: copy };
    });
  }

  function handleEducationChange(index, field, value) {
    setForm((prev) => {
      const copy = [...prev.education];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, education: copy };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // simple required fields check
    if (
      !form.firstName ||
      !form.lastName ||
      !form.school ||
      !form.major ||
      !form.gradYear
    ) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      setSaveLoading(true);

      await saveProfile(username, {
        firstName: form.firstName,
        lastName: form.lastName,
        school: form.school,
        major: form.major,
        gradYear: form.gradYear,
        about: form.about,
        experiences: form.experiences,
        education: form.education,
      });

      setSuccess("Profile saved successfully!");

    } catch (err) {
      console.error("Save failed:", err);
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaveLoading(false);
    }
  }

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
      </header>

      <main
        style={{
          flex: 1,
          padding: "2rem",
        }}
      >
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: "1.8rem", marginBottom: "0.25rem", color: "#C3E7E6" }}>
          Create / Edit My Profile
        </h1>
        <p style={{ opacity: 0.8, marginBottom: "1.5rem" }}>
          Logged in as <strong>{username}</strong>
        </p>

        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid #b91c1c",
              background: "rgba(248,113,113,0.1)",
              color: "#fecaca",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid #166534",
              background: "rgba(34,197,94,0.15)",
              color: "#bbf7d0",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            padding: "1.75rem",
            borderRadius: "1rem",
            border: "1px solid #1f2937",
            background:
              "radial-gradient(circle at top left, rgba(56,189,248,0.08), #020617 60%)",
          }}
        >
          {/* Basic Info */}
          <section>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem", color: "#fcdbe2" }}>
              Basic Information
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.5rem",
              }}
            >
              <Field
                label="First Name (required)"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
              />
              <Field
                label="Last Name (required)"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
              <Field
                label="University / College (required)"
                name="school"
                value={form.school}
                onChange={handleChange}
              />
              <Field
                label="Major (required)"
                name="major"
                value={form.major}
                onChange={handleChange}
              />
              <Field
                label="Graduation Year (yyyy, required)"
                name="gradYear"
                value={form.gradYear}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* About Me */}
          <section>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem", color: "#fcdbe2"}}>
              About Me
            </h2>
            <label style={{ display: "block", fontSize: "0.9rem" }}>
              <span style={{ display: "block", marginBottom: "0.35rem" }}>
                About me (optional, ~200 characters)
              </span>
              <textarea
                name="about"
                value={form.about}
                onChange={handleChange}
                rows={4}
                style={{
                  width: "99%",
                  borderRadius: "0.75rem",
                  border: "1px solid #1f2937",
                  padding: "0.7rem 0.9rem",
                  background: "#020617",
                  color: "#e5e7eb",
                  resize: "vertical",
                }}
              />
            </label>
          </section>

          {/* Experiences */}
          <section>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem", color: "#fcdbe2" }}>
              Experiences (up to 3)
            </h2>
            {form.experiences.map((exp, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: "1rem",
                  padding: "0.9rem",
                  borderRadius: "0.75rem",
                  border: "1px dashed #374151",
                  gap: "1rem",
                }}
              >
                <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: "#eebac5ff" }}>
                  Experience {idx + 1}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <Field
                    label="Job Title"
                    value={exp.title}
                    onChange={(e) =>
                      handleExperienceChange(idx, "title", e.target.value)
                    }
                  />
                  <Field
                    label="Company"
                    value={exp.company}
                    onChange={(e) =>
                      handleExperienceChange(idx, "company", e.target.value)
                    }
                  />
                  <Field
                    label="Dates Worked"
                    value={exp.dates}
                    onChange={(e) =>
                      handleExperienceChange(idx, "dates", e.target.value)
                    }
                  />
                </div>
                <label style={{ display: "block", marginTop: "0.6rem" }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Description
                  </span>
                  <textarea
                    value={exp.description}
                    onChange={(e) =>
                      handleExperienceChange(
                        idx,
                        "description",
                        e.target.value
                      )
                    }
                    rows={3}
                    style={{
                      width: "98%",
                      borderRadius: "0.75rem",
                      border: "1px solid #1f2937",
                      padding: "0.7rem 0.9rem",
                      background: "#020617",
                      color: "#e5e7eb",
                      resize: "vertical",
                    }}
                  />
                </label>
              </div>
            ))}
          </section>

          {/* Education */}
          <section>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem", color: "#fcdbe2" }}>
              Education (up to 3)
            </h2>
            {form.education.map((edu, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: "1rem",
                  padding: "0.9rem",
                  borderRadius: "0.75rem",
                  border: "1px dashed #374151",
                  gap: "1rem",
                }}
              >
                <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: "#eebac5ff" }}>
                  Education {idx + 1}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <Field
                    label="Degree"
                    value={edu.degree}
                    onChange={(e) =>
                      handleEducationChange(idx, "degree", e.target.value)
                    }
                  />
                  <Field
                    label="School"
                    value={edu.school}
                    onChange={(e) =>
                      handleEducationChange(idx, "school", e.target.value)
                    }
                  />
                  <Field
                    label="Years"
                    value={edu.years}
                    onChange={(e) =>
                      handleEducationChange(idx, "years", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </section>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/jobs", { state: { username } })}
              style={{
                padding: "0.7rem 1.2rem",
                borderRadius: "999px",
                border: "1px solid #374151",
                background: "#020617",
                color: "#e5e7eb",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              style={{
                padding: "0.7rem 1.4rem",
                borderRadius: "999px",
                border: "none",
                background:
                  "linear-gradient(135deg, #22c55e, #38bdf8, #a855f7)",
                opacity: saveLoading ? 0.7 : 1,
                cursor: saveLoading ? "default" : "pointer",
                color: "#020617",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              {saveLoading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Field({ label, name, value, onChange }) {
  return (
    <label style={{ display: "block", fontSize: "0.9rem" }}>
      <span style={{ display: "block", marginBottom: "0.35rem" }}>{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        style={{
          width: "94%",
          borderRadius: "0.75rem",
          border: "2px solid #1f2937",
          padding: "0.6rem 0.85rem",
          background: "#020617",
          color: "#e5e7eb",
        }}
      />
    </label>
  );
}

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { postJob } from "../api";
import HeaderJob from "../components/HeaderJob";

export default function PostJobPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Guest";

  const [form, setForm] = useState({
    title: "",
    description: "",
    employer: "",
    location: "",
    salary: "",
  });
  const [status, setStatus] = useState({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
  e.preventDefault();
  setStatus({ type: null, message: "" });

  try {
    setIsSubmitting(true);
    await postJob(username, form);

    // ✅ success message
    setStatus({ type: "success", message: "Job posted successfully!" });

    // ✅ clear the form fields
    setForm({
      title: "",
      description: "",
      employer: "",
      location: "",
      salary: "",
    });
  } catch (err) {
    setStatus({ type: "error", message: err.message || "Failed to post job." });
  } finally {
    setIsSubmitting(false);
  }
}


  // Styles (similar vibe to JobsMenuPage)
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
    padding: "24px 28px",
    width: "100%",
    maxWidth: "640px",
    boxShadow: "0 24px 60px rgba(15,23,42,0.7)",
  };

  const inputStyle = {
    width: "96%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #4b5563",
    background: "#020617",
    color: "#f9fafb",
    fontSize: "0.9rem",
    marginBottom: "12px",
    marginTop: "6px",
  };

  const buttonStyle = {
    padding: "0.7rem 1.4rem",
    borderRadius: "999px",
    border: "none",
    background:"linear-gradient(135deg, #22c55e, #38bdf8, #a855f7)",
    color: "#020617",
    fontWeight: 600,
    fontSize: "0.9rem",
  };

  const secondaryButton = {
    padding: "0.7rem 1.4rem",
    border: "1px solid #4b5563",
    borderRadius: "999px",
    background: "transparent",
    color: "#e5e7eb",
    borderColor: "#4b5563",
    fontWeight: 600,
    fontSize: "0.9rem",
  };

  return (
    <div style={{ backgroundColor: "#000413", minHeight: "100vh" }}>
                    <HeaderJob onBack={() => navigate("/jobs", { state: { username } })} />
    <div style={containerStyle}>

      <main style={mainStyle}>
        <div style={cardStyle}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px", fontFamily: "'Anton', sans-serif",
            color: "#fecaca", }}>
            Post a New Job / Internship
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: "16px" }}>
            Fill out the details below. Required fields are marked with *.
          </p>

          {status.type && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                marginBottom: "12px",
                fontSize: "0.85rem",
                border:
                  status.type === "success"
                    ? "1px solid #16a34a"
                    : "1px solid #ef4444",
                background:
                  status.type === "success"
                    ? "rgba(22,163,74,0.1)"
                    : "rgba(239,68,68,0.1)",
                color: status.type === "success" ? "#bbf7d0" : "#fecaca",
              }}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: "0.85rem" }}>
              Job Title*
              <input
                style={inputStyle}
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </label>

            <label style={{ fontSize: "0.85rem" }}>
              Employer*
              <input
                style={inputStyle}
                name="employer"
                value={form.employer}
                onChange={handleChange}
                required
              />
            </label>

            <label style={{ fontSize: "0.85rem" }}>
              Location*
              <input
                style={inputStyle}
                name="location"
                value={form.location}
                onChange={handleChange}
                required
              />
            </label>

            <label style={{ fontSize: "0.85rem" }}>
              Salary (optional)
              <input
                style={inputStyle}
                name="salary"
                value={form.salary}
                onChange={handleChange}
              />
            </label>

            <label style={{ fontSize: "0.85rem" }}>
              Description*{" "}
              <textarea
                style={{ ...inputStyle, height: "120px", resize: "vertical" }}
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </label>

            <div
              style={{
                marginTop: "12px",
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                style={secondaryButton}
                onClick={() => navigate("/jobs", { state: { username } })}
              >
                Cancel
              </button>
              <button type="submit" style={buttonStyle} disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Job"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
    </div>
  );
}

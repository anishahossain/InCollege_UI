import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getJobs, applyToJob } from "../api";
import HeaderJob from "../components/HeaderJob";


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
  maxWidth: "900px",
  width: "100%",
  backgroundColor: "#111827",
  borderRadius: "0.75rem",
  padding: "1.75rem",
  boxShadow: "0 20px 45px rgba(0,0,0,0.6)",
};

const formRow = {
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap",
  marginBottom: "1rem",
};

const inputStyle = {
  padding: "0.4rem 0.6rem",
  borderRadius: "0.5rem",
  border: "1px solid #374151",
  backgroundColor: "#020617",
  color: "#e5e7eb",
  fontSize: "0.9rem",
};

const primaryButton = {
  padding: "0.45rem 0.9rem",
  borderRadius: "999px",
  border: "none",
  backgroundColor: "#C3E7E6",
  color: "#022c22",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.9rem",
};

const secondaryButton = {
  ...primaryButton,
  backgroundColor: "#1f2937",
  color: "#e5e7eb",
};

const messageBar = (bg, color) => ({
  marginTop: "0.75rem",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.5rem",
  backgroundColor: bg,
  color,
  fontSize: "0.9rem",
});

export default function JobsSearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Guest";
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState({
    title: "",
    employer: "",
    location: "",
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (username === "Guest") {
      setError("You must be logged in to browse jobs.");
      setLoading(false);
      return;
    }

    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  async function loadJobs(customFilters) {
  setLoading(true);
  setError("");
  setInfo("");

  try {
    const data = await getJobs(customFilters || filters);
    const list = data?.jobs || [];
    setJobs(list);

    // Only show "no jobs" if user actually performed a search
    if (hasSearched && list.length === 0) {
      setInfo("No jobs match your search.");
    }
  } catch (err) {
    setError(err.message || "Failed to load jobs.");
  } finally {
    setLoading(false);
  }
}


  const handleChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSearch = (e) => {
    setHasSearched(true);
    e.preventDefault();
    loadJobs(filters);
  };

  const handleApply = async (job) => {
    setError("");
    setInfo("");
    try {
      setLoading(true);
      const res = await applyToJob(username, job);
      setInfo(res.message || "Application submitted.");
    } catch (err) {
      setError(err.message || "Failed to apply for job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#000413", minHeight: "100vh" }}>
            <HeaderJob onBack={() => navigate("/jobs", { state: { username } })} />
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            fontFamily: "'Anton', sans-serif",
            color: "#fecaca",
          }}
        >
          Job / Internship Search
        </h1>
        <p
          style={{
            color: "#9ca3af",
            marginBottom: "1rem",
            fontSize: "0.95rem",
          }}
        >
          Browse jobs and internships posted on InCollege and apply directly.
        </p>

        <form onSubmit={handleSearch} style={formRow}>
          <input
            style={{ ...inputStyle, flex: "1 1 200px" }}
            placeholder="Job title"
            value={filters.title}
            onChange={handleChange("title")}
          />
          <input
            style={{ ...inputStyle, flex: "1 1 200px" }}
            placeholder="Employer"
            value={filters.employer}
            onChange={handleChange("employer")}
          />
          <input
            style={{ ...inputStyle, flex: "1 1 200px" }}
            placeholder="Location"
            value={filters.location}
            onChange={handleChange("location")}
          />
          <button onClick={handleSearch} type="submit" style={primaryButton}>
            Search
          </button>
        </form>

        {loading && (
          <div style={messageBar("#020617", "#e5e7eb")}>
            Loading jobs...
          </div>
        )}

        {!loading && error && (
          <div style={messageBar("#450a0a", "#fecaca")}>{error}</div>
        )}

        {!loading && !error && info && (
          <div style={messageBar("#022c22", "#bbf7d0")}>{info}</div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div style={{ marginTop: "1.25rem" }}>
            {jobs.map((job, idx) => (
              <div
                key={`${job.title}-${job.employer}-${job.location}-${idx}`}
                style={{
                  borderRadius: "0.75rem",
                  border: "1px solid #1f2937",
                  padding: "0.75rem 0.9rem",
                  marginBottom: "0.75rem",
                  backgroundColor: "#020617",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "1rem" }}>
                  {job.title}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#9ca3af",
                    marginTop: "0.1rem",
                  }}
                >
                  {job.employer} • {job.location}
                </div>
                {job.salary && job.salary.trim() && (
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#bbf7d0",
                      marginTop: "0.1rem",
                    }}
                  >
                    Salary: {job.salary}
                  </div>
                )}
                {job.description && (
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#d1d5db",
                      marginTop: "0.4rem",
                    }}
                  >
                    {job.description.length > 180
                      ? job.description.slice(0, 180) + "..."
                      : job.description}
                  </div>
                )}

                <div
                  style={{
                    marginTop: "0.6rem",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    style={primaryButton}
                    disabled={loading}
                    onClick={() => handleApply(job)}
                  >
                    Apply
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

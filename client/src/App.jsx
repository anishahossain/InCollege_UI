// client/src/App.jsx
import { useState } from "react";
import { login, register } from "./api";

function App() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    // simple front-end validation (COBOL will still do its own checks)
    if (!form.username || !form.password) {
      setResult({ error: "Username and password are required." });
      return;
    }

    // optional: mirror COBOL's password-length rule on sign up
    if (
      mode === "register" &&
      (form.password.length < 8 || form.password.length > 12)
    ) {
      setResult({
        error: "Password must be between 8 and 12 characters.",
      });
      return;
    }

    setLoading(true);

    try {
      let data;
      if (mode === "login") {
        // backend login(username, password)
        data = await login(form.username, form.password);
      } else {
        // backend register({ username, password })
        data = await register({
          username: form.username,
          password: form.password,
        });
      }

      setResult(data || {});
    } catch (err) {
      setResult({ error: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#050608",
        color: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Epilogue, sans-serif",
      }}
    >
      {/* Top header bar */}
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
            fontFamily: '"Anton", sans-serif',
            fontSize: "2rem",
            letterSpacing: "0.12em",
          }}
        >
          INCOLLEGE
        </span>
      </header>

      {/* Centered auth card */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            padding: "2.5rem 2.75rem",
            borderRadius: "1.5rem",
            background:
              "radial-gradient(circle at top left, #0b1220 0%, #020617 50%, #020617 100%)",
            width: "100%",
            maxWidth: "540px",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(148,163,184,0.08)",
          }}
        >
          <h1
            style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: "2.3rem",
              letterSpacing: "0.08em",
              textAlign: "center",
              margin: 0,
              marginBottom: "1.75rem",
              color: "#C3E7E6",
            }}
          >
            INCOLLEGE
          </h1>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              marginBottom: "1.5rem",
              gap: "1.5rem",
              justifyContent: "center",
              fontSize: "1rem",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setResult(null);
              }}
              style={{
                flex: 1,
                padding: "0.4rem 0",
                border: "none",
                background: "transparent",
                color: mode === "login" ? "#e2f3ff" : "#94a3b8",
                fontWeight: mode === "login" ? 600 : 400,
                cursor: "pointer",
                position: "relative",
              }}
            >
              Log In
              {mode === "login" && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: -6,
                    width: "100%",
                    height: "2px",
                    borderRadius: "999px",
                    background: "#7cf2ff",
                  }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setResult(null);
              }}
              style={{
                flex: 1,
                padding: "0.4rem 0",
                border: "none",
                background: "transparent",
                color: mode === "register" ? "#e2f3ff" : "#94a3b8",
                fontWeight: mode === "register" ? 600 : 400,
                cursor: "pointer",
                position: "relative",
              }}
            >
              Sign Up
              {mode === "register" && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: -6,
                    width: "100%",
                    height: "2px",
                    borderRadius: "999px",
                    background: "#7cf2ff",
                  }}
                />
              )}
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: "0.75rem" }}
          >
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.5rem",
                padding: "0.6rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "#22c55e",
                color: "#022c22",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loading
                ? "Talking to COBOL..."
                : mode === "login"
                ? "Log In"
                : "Create Account"}
            </button>
          </form>

          {/* Result / COBOL output */}
          {result && (
            <div style={{ marginTop: "1.2rem", fontSize: "0.9rem" }}>
              {result.error && (
                <p style={{ color: "#f97373" }}>Error: {result.error}</p>
              )}
              {result.success && !result.error && (
                <p style={{ color: "#bef264" }}>Success!</p>
              )}
              {result.rawOutput && (
                <>
                  <p style={{ marginTop: "0.4rem", opacity: 0.7 }}>
                    COBOL output:
                  </p>
                  <pre
                    style={{
                      maxHeight: "160px",
                      overflow: "auto",
                      background: "#020617",
                      padding: "0.5rem",
                      borderRadius: "0.75rem",
                      border: "1px solid #1f2933",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {result.rawOutput}
                  </pre>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const inputStyle = {
  padding: "0.65rem 0.8rem",
  borderRadius: "0.75rem",
  border: "1px solid #1f2933",
  background: "#020617",
  color: "#f9fafb",
  fontSize: "0.95rem",
  outline: "none",
  fontFamily: "Epilogue, sans-serif",
};

export default App;

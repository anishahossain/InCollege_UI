// src/pages/AuthPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setStatus(null);
    setMsg("");

    try {
      const res = await fetch("https://incollege-byanisha.onrender.com/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        navigate("/menu", { state: { username } });
      } else {
        setStatus("error");
        setMsg("Invalid username or password.");
      }
    } catch {
      setStatus("error");
      setMsg("Server error. Try again.");
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setStatus(null);
    setMsg("");

    if (password.length < 8 || password.length > 12) {
      setStatus("error");
      setMsg("Password must be 8–12 characters.");
      return;
    }

    try {
      const res = await fetch("https://incollege-byanisha.onrender.com/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMsg("Account created successfully! Please log in.");
        setTab("login");
      } else {
        setStatus("error");
        setMsg("This username is already taken.");
      }
    } catch {
      setStatus("error");
      setMsg("Server error. Try again.");
    }
  }

  return (
    <div
      className="auth-wrapper"
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
      {/* HEADER */}
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

      {/* MAIN CARD */}
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

          {/* TAB BUTTONS */}
          <div
            style={{
              display: "flex",
              marginBottom: "1.5rem",
              gap: "1.5rem",
              justifyContent: "center",
              fontSize: "1rem",
            }}
          >
            {/* LOGIN TAB */}
            <button
              onClick={() => {
                setTab("login");
                setStatus(null);
                setMsg("");
              }}
              type="button"
              style={{
                flex: 1,
                padding: "0.4rem 0",
                border: "none",
                background: "transparent",
                color: tab === "login" ? "#e2f3ff" : "#94a3b8",
                fontWeight: tab === "login" ? 600 : 400,
                cursor: "pointer",
                fontFamily: "Epilogue, sans-serif",
                fontSize: "1rem",
                position: "relative",
              }}
            >
              Log In
              {tab === "login" && (
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

            {/* SIGN UP TAB */}
            <button
              onClick={() => {
                setTab("signup");
                setStatus(null);
                setMsg("");
              }}
              type="button"
              style={{
                flex: 1,
                padding: "0.4rem 0",
                border: "none",
                background: "transparent",
                color: tab === "signup" ? "#e2f3ff" : "#94a3b8",
                fontWeight: tab === "signup" ? 600 : 400,
                cursor: "pointer",
                fontFamily: "Epilogue, sans-serif",
                fontSize: "1rem",
                position: "relative",
              }}
            >
              Sign Up
              {tab === "signup" && (
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

          {/* LOGIN FORM */}
          {tab === "login" && (
            <form style={{ display: "grid", gap: "0.75rem" }} onSubmit={handleLogin}>
              <input
                value={username}
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
              />
              <input
                value={password}
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
              <button type="submit" style={buttonStyle}>
                Log In
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {tab === "signup" && (
            <form style={{ display: "grid", gap: "0.75rem" }} onSubmit={handleSignup}>
              <input
                value={username}
                placeholder="Create a username"
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
              />
              <input
                value={password}
                type="password"
                placeholder="Create a password"
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
              <button type="submit" style={buttonStyle}>
                Create Account
              </button>
            </form>
          )}

          {/* STATUS */}
          {status && (
            <p
              style={{
                marginTop: "1.2rem",
                fontSize: "0.9rem",
                fontFamily: "Epilogue, sans-serif",
                color: status === "success" ? "#bef264" : "#f97373",
              }}
            >
              {msg}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

/* ----------------------- */
/* SHARED INPUT & BUTTONS  */
/* ----------------------- */

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

const buttonStyle = {
  marginTop: "0.5rem",
  padding: "0.6rem",
  borderRadius: "0.75rem",
  fontSize: "0.8rem",
  border: "none",
  background: "#C3E7E6",
  color: "#022c22",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "Epilogue, sans-serif",
};

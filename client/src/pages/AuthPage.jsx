// src/pages/AuthPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, register as apiRegister } from "../api";

function extractCobolMessage(rawOutput) {
  if (!rawOutput) return null;

  const lines = rawOutput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (!line.startsWith("TYPE:")) continue;

    const [typePart, ...messageParts] = line.split("|");
    if (messageParts.length === 0) continue;

    const tag = typePart.slice(5).trim().toUpperCase(); // remove "TYPE:"
    if (!["ERROR", "INFO", "SUCCESS"].includes(tag)) continue;

    const message = messageParts.join("|").trim();
    if (message) return message;
  }

  return null;
}


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
    const data = await apiLogin(username, password); // uses /api/login

    if (data.success) {
      setStatus("success");
      navigate("/menu", { state: { username } });
    } else {
      setStatus("error");
      setMsg("Invalid username or password.");
    }
  } catch (err) {
    console.error("Login error:", err);
    setStatus("error");
    setMsg(err.message || "Server error. Try again.");
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
    const data = await apiRegister({ username, password }); // uses /api/register

    if (data.success) {
      setStatus("success");
      setMsg("Account created successfully! Please log in.");
      setTab("login");
    } else {
      setStatus("error");
      const serverMsg =
        extractCobolMessage(data.rawOutput) ||
        "Account could not be created. Please try a different username or password.";
      setMsg(serverMsg);
    }
  } catch (err) {
    console.error("Signup error:", err);
    setStatus("error");
    setMsg(err.message || "Server error. Try again.");
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
            <>
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
              <div style={infoBoxStyle}>
                <p style={{ margin: 0, fontWeight: 600, color: "#f8fafc" }}>New to InCollege?</p>
                <p style={{ margin: "0.35rem 0 0" }}>
                  You must create your account first on the Sign Up tab. Once it is created, come back here
                  and sign in with the exact same username and password.
                </p>
              </div>
            </>
          )}

          {/* SIGNUP FORM */}
          {tab === "signup" && (
            <>
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
              <div style={infoBoxStyle}>
                <p style={{ margin: 0, color: "#f8fafc" }}>
                  Please do not try to make multiple accounts with the same username.
                </p>
                <p style={{ margin: "0.5rem 0 0", fontWeight: 600, color: "#e0f2fe" }}>Password requirements</p>
                <ul
                  style={{
                    margin: "0.35rem 0 0",
                    paddingLeft: "1.2rem",
                    color: "#e2e8f0",
                    fontSize: "0.85rem",
                    lineHeight: 1.4,
                  }}
                >
                  <li>8–12 characters long</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one lowercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character (!@#$%^&*())</li>
                </ul>
              </div>
            </>
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

const infoBoxStyle = {
  marginTop: "1rem",
  padding: "0.85rem 1rem",
  borderRadius: "0.85rem",
  border: "1px solid rgba(148,163,184,0.35)",
  background: "rgba(148,163,184,0.08)",
  fontSize: "0.85rem",
  lineHeight: 1.5,
  color: "#cbd5f5",
  fontFamily: "Epilogue, sans-serif",
};

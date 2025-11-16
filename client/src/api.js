// client/src/api.js
const BASE_URL = "http://localhost:4000";

async function handleJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleJson(res);
}

export async function register(data) {
  const res = await fetch(`${BASE_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleJson(res);
}

// 🔽 NEW: load profile
export async function getProfile(username) {
  const res = await fetch(
    `${BASE_URL}/api/profile/${encodeURIComponent(username)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  return handleJson(res);
}

// 🔽 NEW: save profile
export async function saveProfile(username, profile) {
  console.log("Calling saveProfile for", username, profile); // debug
  const res = await fetch(
    `${BASE_URL}/api/profile/${encodeURIComponent(username)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    }
  );
  const data = await handleJson(res);
  console.log("saveProfile response:", data); // debug
  return data;
}

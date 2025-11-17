// client/src/api.js
const BASE_URL = "http://localhost:4000";

async function handleJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data?.error || data?.message || `Request failed (${res.status})`;
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

// GET /api/profile/:username
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

// PUT /api/profile/:username
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

// GET /api/find-profile?first=...&last=...
export async function findProfileByName(firstName, lastName) {
  const params = new URLSearchParams({
    first: firstName,
    last: lastName,
  });

  const res = await fetch(
    `${BASE_URL}/api/find-profile?${params.toString()}`
  );

  if (res.status === 404) {
    return null; // no profile
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to search profile");
  }

  return res.json();
}

// POST /api/connections/request
export async function sendConnectionRequest(sender, recipient) {
  const res = await fetch(`${BASE_URL}/api/connections/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender, recipient }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.error || "Failed to send connection request");
  }

  return body;
}
// GET /api/connections/pending/:username
export async function getPendingRequests(username) {
  const res = await fetch(
    `${BASE_URL}/api/connections/pending/${encodeURIComponent(username)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  return handleJson(res); // returns { requests: [...] }
}

// POST /api/connections/respond
export async function respondToRequest(sender, recipient, action) {
  const res = await fetch(`${BASE_URL}/api/connections/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender, recipient, action }),
  });
  return handleJson(res);
}

// GET /api/connections/network/:username
export async function getNetwork(username) {
  const res = await fetch(
    `${BASE_URL}/api/connections/network/${encodeURIComponent(username)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  return handleJson(res); // returns { connections: [...] }
}
// GET /api/jobs?title=&employer=&location=
export async function getJobs(filters = {}) {
  const params = new URLSearchParams();

  if (filters.title) params.set("title", filters.title);
  if (filters.employer) params.set("employer", filters.employer);
  if (filters.location) params.set("location", filters.location);

  const query = params.toString();
  const url = query
    ? `${BASE_URL}/api/jobs?${query}`
    : `${BASE_URL}/api/jobs`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleJson(res); // { jobs: [...] }
}

// POST /api/jobs/apply
export async function applyToJob(username, job) {
  const res = await fetch(`${BASE_URL}/api/jobs/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      title: job.title,
      employer: job.employer,
      location: job.location,
    }),
  });

  return handleJson(res); // { success, message }
}


export async function postJob(username, job) {
  const res = await fetch(`${BASE_URL}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, ...job }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to post job");
  }
  return res.json();
}

export async function getMyApplications(username) {
  const res = await fetch(
    `${BASE_URL}/api/applications/${encodeURIComponent(username)}`
  ); //         ^^^^^^^ add this

  if (!res.ok) {
    throw new Error("Failed to load applications");
  }
  return res.json();
}

export async function sendMessage(sender, recipient, text) {
  const res = await fetch(`${BASE_URL}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender, recipient, text }),
  });
  return handleJson(res); // will throw if not ok
}

export async function getMyMessages(username) {
  const res = await fetch(
    `${BASE_URL}/api/messages/${encodeURIComponent(username)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  return handleJson(res); // returns an array
}

export async function getSentMessages(username) {
  const res = await fetch(
    `${BASE_URL}/api/messages/sent/${encodeURIComponent(username)}`
  );
  return handleJson(res);
}

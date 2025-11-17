// server/profileRoutes.js

const fs = require("fs");
const path = require("path");
const express = require("express");
const { encodeProfile, decodeProfile } = require("./profileCodec");

const router = express.Router();

// directory where COBOL keeps the files
const COBOL_DIR = path.join(__dirname, "..", "cobol");

// core files
const PROFILES_PATH = path.join(COBOL_DIR, "InCollege-Profiles.txt");
const PENDING_REQUESTS_PATH = path.join(
  COBOL_DIR,
  "InCollege-PendingRequests.txt"
);
const CONNECTIONS_PATH = path.join(
  COBOL_DIR,
  "InCollege-Connections.txt"
);


// jobs + applications files
const JOBS_PATH = path.join(COBOL_DIR, "InCollege-Jobs.txt");
const APPLICATIONS_PATH = path.join(
  COBOL_DIR,
  "InCollege-Applications.txt"
);

const MESSAGES_PATH = path.join(COBOL_DIR, "InCollege-Messages.txt");


// ───────────────── helpers ─────────────────

function readLinesSafe(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf8");
  return content.split(/\r?\n/).filter((l) => l.trim().length > 0);
}

function pad(str, len) {
  return (str || "").toString().slice(0, len).padEnd(len, " ");
}

function readConnections() {
  const lines = readLinesSafe(CONNECTIONS_PATH);
  return lines.map((line) => ({
    userA: line.slice(0, 20).trim(),
    userB: line.slice(20, 40).trim(),
  }));
}

function readPendingRequests() {
  const lines = readLinesSafe(PENDING_REQUESTS_PATH);
  return lines.map((line) => ({
    sender: line.slice(0, 20).trim(),
    recipient: line.slice(20, 40).trim(),
  }));
}

function appendPendingRequest(sender, recipient) {
  const record = pad(sender, 20) + pad(recipient, 20) + "\n";
  fs.appendFileSync(PENDING_REQUESTS_PATH, record, "utf8");
}

function appendConnection(userA, userB) {
  const record = pad(userA, 20) + pad(userB, 20) + "\n";
  fs.appendFileSync(CONNECTIONS_PATH, record, "utf8");
}
// Decode one job record line (fixed-width like COBOL)
function decodeJobLine(line) {
  const padded = line.padEnd(690, " ");

  const title = padded.slice(0, 50).trimEnd();
  const description = padded.slice(50, 550).trimEnd();
  const employer = padded.slice(550, 600).trimEnd();
  const location = padded.slice(600, 650).trimEnd();
  const salary = padded.slice(650, 670).trimEnd();
  const poster = padded.slice(670, 690).trimEnd();

  return { title, description, employer, location, salary, poster };
}

function readJobs() {
  const lines = readLinesSafe(JOBS_PATH);
  return lines.map(decodeJobLine);
}

function readApplications() {
  const lines = readLinesSafe(APPLICATIONS_PATH);
  return lines.map((line) => {
    const padded = line.padEnd(170, " ");
    const username = padded.slice(0, 20).trimEnd();
    const title = padded.slice(20, 70).trimEnd();
    const employer = padded.slice(70, 120).trimEnd();
    const location = padded.slice(120, 170).trimEnd();
    return { username, title, employer, location };
  });
}

function appendApplication(username, title, employer, location) {
  const record =
    pad(username, 20) +
    pad(title, 50) +
    pad(employer, 50) +
    pad(location, 50) +
    "\n";
  fs.appendFileSync(APPLICATIONS_PATH, record, "utf8");
}
// ───────────── messages helpers ─────────────

function parseMessageRecord(line) {
  const padded = line.padEnd(262, " ");

  const idStr = padded.slice(0, 8).trim();
  return {
    id: parseInt(idStr || "0", 10),
    sender: padded.slice(8, 28).trimEnd(),
    recipient: padded.slice(28, 48).trimEnd(),
    timestamp: padded.slice(48, 62).trimEnd(), // YYYYMMDDHHMMSS
    text: padded.slice(62, 262).trimEnd(),
  };
}

function formatDisplayTimestamp(ts) {
  if (!ts || ts.length !== 14) return ts;
  return `${ts.slice(0, 4)}/${ts.slice(4, 6)}/${ts.slice(6, 8)} ${ts.slice(
    8,
    10
  )}:${ts.slice(10, 12)}:${ts.slice(12, 14)}`;
}

function areConnected(userA, userB) {
  const a = userA.trim().toLowerCase();
  const b = userB.trim().toLowerCase();

  const connections = readConnections();
  return connections.some((c) => {
    const u1 = c.userA.trim().toLowerCase();
    const u2 = c.userB.trim().toLowerCase();
    return (
      (u1 === a && u2 === b) ||
      (u1 === b && u2 === a)
    );
  });
}

function chunkMessageText(text, size = 200) {
  const normalized = (text || "").toString();
  if (!normalized.length) return [""];
  const chunks = [];
  for (let i = 0; i < normalized.length; i += size) {
    chunks.push(normalized.slice(i, i + size));
  }
  return chunks;
}

async function getNextMessageId() {
  try {
    const content = await fs.promises.readFile(MESSAGES_PATH, "utf8");
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    let maxId = 0;
    for (const line of lines) {
      const idStr = line.slice(0, 8).trim();
      const idNum = parseInt(idStr || "0", 10);
      if (!Number.isNaN(idNum) && idNum > maxId) {
        maxId = idNum;
      }
    }
    return maxId + 1;
  } catch (err) {
    if (err.code === "ENOENT") {
      return 1; // file doesn't exist yet
    }
    throw err;
  }
}

async function appendMessage({ sender, recipient, text }) {
  const id = await getNextMessageId();
  const now = new Date();

  const yyyy = String(now.getFullYear()).padStart(4, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const timestamp = `${yyyy}${mm}${dd}${hh}${min}${ss}`;

  const chunks = chunkMessageText(text, 200);

  const lines = chunks
    .map((chunk) => {
      const idStr = String(id).padStart(8, "0");
      const senderField = pad(sender, 20);
      const recipientField = pad(recipient, 20);
      const tsField = pad(timestamp, 14);
      const textField = pad(chunk, 200);
      return idStr + senderField + recipientField + tsField + textField + "\n";
    })
    .join("");

  await fs.promises.appendFile(MESSAGES_PATH, lines, "utf8");
}

// ───────────────── profile routes ─────────────────

// Utility: pad / truncate to fixed width
function formatField(text, width) {
  const str = (text || "").toString();
  if (str.length >= width) return str.slice(0, width);
  return str.padEnd(width, " ");
}

// GET /api/profile/:username
router.get("/profile/:username", (req, res) => {
  const username = req.params.username;

  const lines = readLinesSafe(PROFILES_PATH);
  for (const line of lines) {
    const recordUsername = line.slice(0, 20).trim();
    if (recordUsername === username) {
      const profile = decodeProfile(line);
      return res.json(profile);
    }
  }

  return res.status(404).json({ error: "Profile not found" });
});

// PUT /api/profile/:username
router.put("/profile/:username", express.json(), (req, res) => {
  const username = req.params.username;
  const body = req.body || {};

  const profile = {
    username,
    firstName: body.firstName || "",
    lastName: body.lastName || "",
    school: body.school || "",
    major: body.major || "",
    gradYear: body.gradYear || "",
    about: body.about || "",
    experiences: body.experiences || [],
    education: body.education || [],
  };

  const record = encodeProfile(profile);

  const lines = readLinesSafe(PROFILES_PATH);
  let found = false;
  const newLines = lines.map((line) => {
    const recordUsername = line.slice(0, 20).trim();
    if (recordUsername === username) {
      found = true;
      return record;
    }
    return line;
  });

  if (!found) {
    newLines.push(record);
  }

  fs.writeFileSync(PROFILES_PATH, newLines.join("\n") + "\n", "utf8");
  return res.json({ ok: true, created: !found });
});

// GET /api/find-profile?first=...&last=...
router.get("/find-profile", (req, res) => {
  const { first, last } = req.query;

  if (!first || !last) {
    return res.status(400).json({ error: "First and last name are required" });
  }

  const searchFirst = first.trim().toLowerCase();
  const searchLast = last.trim().toLowerCase();

  const lines = readLinesSafe(PROFILES_PATH);

  for (const line of lines) {
    // username: 0–19, firstName: 20–39, lastName: 40–59
    const recordFirst = line.slice(20, 40).trim();
    const recordLast = line.slice(40, 60).trim();

    if (
      recordFirst.toLowerCase() === searchFirst &&
      recordLast.toLowerCase() === searchLast
    ) {
      const profile = decodeProfile(line);
      return res.json(profile);
    }
  }

  return res.status(404).json({
    error: "No user profile exists for the name you have entered.",
  });
});

// POST /api/connections/request
router.post("/connections/request", express.json(), (req, res) => {
  const { sender, recipient } = req.body || {};

  if (!sender || !recipient) {
    return res.status(400).json({ error: "Sender and recipient are required" });
  }

  const s = sender.trim();
  const r = recipient.trim();

  // cannot connect with yourself
  if (s.toLowerCase() === r.toLowerCase()) {
    return res.status(400).json({ error: "You cannot connect with yourself." });
  }

  try {
    const connections = readConnections();
    const pending = readPendingRequests();

    // already connected
    const alreadyConnected = connections.some(
      (c) =>
        (c.userA.toLowerCase() === s.toLowerCase() &&
          c.userB.toLowerCase() === r.toLowerCase()) ||
        (c.userB.toLowerCase() === s.toLowerCase() &&
          c.userA.toLowerCase() === r.toLowerCase())
    );
    if (alreadyConnected) {
      return res.status(400).json({
        error: "You are already connected with this user.",
      });
    }

    // pending from s → r
    const pendingFound = pending.some(
      (pr) =>
        pr.sender.toLowerCase() === s.toLowerCase() &&
        pr.recipient.toLowerCase() === r.toLowerCase()
    );
    if (pendingFound) {
      return res.status(400).json({
        error: "You have already sent this user a connection request.",
      });
    }

    // pending from r → s
    const pendingOtherWay = pending.some(
      (pr) =>
        pr.sender.toLowerCase() === r.toLowerCase() &&
        pr.recipient.toLowerCase() === s.toLowerCase()
    );
    if (pendingOtherWay) {
      return res.status(400).json({
        error: "This user has already sent you a connection request.",
      });
    }

    appendPendingRequest(s, r);

    return res.json({
      success: true,
      message: "Successfully sent Connection Request",
    });
  } catch (err) {
    console.error("Error in /api/connections/request:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

async function appendJob(job) {
  // COBOL layout:
  //  job-title       PIC X(50)
  //  job-description PIC X(500)
  //  job-employer    PIC X(50)
  //  job-location    PIC X(50)
  //  job-salary      PIC X(20)
  //  job-poster      PIC X(20)
  const line =
    formatField(job.title, 50) +
    formatField(job.description, 500) +
    formatField(job.employer, 50) +
    formatField(job.location, 50) +
    formatField(job.salary || "", 20) +
    formatField(job.poster, 20) +
    "\n";

  await fs.promises.appendFile(JOBS_PATH, line, "utf8");
}

// GET /api/connections/pending/:username
router.get("/connections/pending/:username", (req, res) => {
  const username = req.params.username.trim().toLowerCase();

  // all pending requests
  const pending = readPendingRequests();

  // only those where this user is the recipient
  const myPending = pending.filter(
    (pr) => pr.recipient.toLowerCase() === username
  );

  if (myPending.length === 0) {
    return res.json({ requests: [] });
  }

  // build map of username -> profile (to show first/last)
  const profileLines = readLinesSafe(PROFILES_PATH);
  const profiles = profileLines.map((line) => decodeProfile(line));
  const profileMap = new Map(
    profiles.map((p) => [p.username.trim().toLowerCase(), p])
  );

  const result = myPending.map((pr) => {
    const senderKey = pr.sender.toLowerCase();
    const p = profileMap.get(senderKey);
    return {
      senderUsername: pr.sender,
      senderFirstName: p?.firstName || "",
      senderLastName: p?.lastName || "",
    };
  });

  return res.json({ requests: result });
});
// POST /api/connections/respond
// body: { sender, recipient, action: "accept" | "reject" }
router.post("/connections/respond", express.json(), (req, res) => {
  const { sender, recipient, action } = req.body || {};

  if (!sender || !recipient || !action) {
    return res.status(400).json({
      error: "Sender, recipient, and action are required",
    });
  }

  const s = sender.trim();
  const r = recipient.trim();
  const act = action.toLowerCase();

  if (act !== "accept" && act !== "reject") {
    return res.status(400).json({ error: "Invalid action" });
  }

  try {
    const pending = readPendingRequests();

    const matchIndex = pending.findIndex(
      (pr) =>
        pr.sender.toLowerCase() === s.toLowerCase() &&
        pr.recipient.toLowerCase() === r.toLowerCase()
    );

    if (matchIndex === -1) {
      return res.status(404).json({
        error: "Pending request not found",
      });
    }

    // remove this request from pending
    const remaining = pending.filter((_, idx) => idx !== matchIndex);
    const newPendingLines = remaining.map(
      (pr) => pad(pr.sender, 20) + pad(pr.recipient, 20)
    );
    fs.writeFileSync(
      PENDING_REQUESTS_PATH,
      newPendingLines.join("\n") + (newPendingLines.length ? "\n" : ""),
      "utf8"
    );

    if (act === "accept") {
      const connections = readConnections();
      const alreadyConnected = connections.some(
        (c) =>
          (c.userA.toLowerCase() === s.toLowerCase() &&
            c.userB.toLowerCase() === r.toLowerCase()) ||
          (c.userB.toLowerCase() === s.toLowerCase() &&
            c.userA.toLowerCase() === r.toLowerCase())
      );
      if (!alreadyConnected) {
        appendConnection(s, r);
      }

      return res.json({
        success: true,
        action: "accept",
        message: "Connection accepted",
      });
    }

    // reject
    return res.json({
      success: true,
      action: "reject",
      message: "Connection request rejected",
    });
  } catch (err) {
    console.error("Error in /api/connections/respond:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/connections/network/:username
router.get("/connections/network/:username", (req, res) => {
  const username = req.params.username.trim().toLowerCase();

  // 1) get all stored connections
  const connections = readConnections();

  // 2) find all usernames connected to this one
  const connectedUsernames = new Set();

  connections.forEach((c) => {
    const a = c.userA.toLowerCase();
    const b = c.userB.toLowerCase();

    if (a === username) {
      connectedUsernames.add(c.userB.trim());
    } else if (b === username) {
      connectedUsernames.add(c.userA.trim());
    }
  });

  if (connectedUsernames.size === 0) {
    return res.json({ connections: [] });
  }

  // 3) load all profiles so we can show details
  const lines = readLinesSafe(PROFILES_PATH);
  const profiles = lines.map((line) => decodeProfile(line));

  const profileMap = new Map(
    profiles.map((p) => [p.username.trim().toLowerCase(), p])
  );

  const result = Array.from(connectedUsernames).map((uname) => {
    const p = profileMap.get(uname.toLowerCase());
    return {
      username: uname,
      firstName: p?.firstName || "",
      lastName: p?.lastName || "",
      school: p?.school || "",
      major: p?.major || "",
      gradYear: p?.gradYear || "",
    };
  });

  return res.json({ connections: result });
});

// POST /api/jobs/apply
// body: { username, title, employer, location }
router.post("/jobs/apply", express.json(), (req, res) => {
  const { username, title, employer, location } = req.body || {};

  if (!username || !title || !employer || !location) {
    return res.status(400).json({
      error: "Username, title, employer, and location are required",
    });
  }

  const u = username.trim();
  const t = title.trim();
  const e = employer.trim();
  const l = location.trim();

  try {
    // ensure job actually exists
    const jobs = readJobs();
    const jobExists = jobs.some(
      (j) =>
        j.title.trim().toLowerCase() === t.toLowerCase() &&
        j.employer.trim().toLowerCase() === e.toLowerCase() &&
        j.location.trim().toLowerCase() === l.toLowerCase()
    );

    if (!jobExists) {
      return res
        .status(404)
        .json({ error: "Job not found. It may have been removed." });
    }

    const apps = readApplications();
    const alreadyApplied = apps.some(
      (a) =>
        a.username.trim().toLowerCase() === u.toLowerCase() &&
        a.title.trim().toLowerCase() === t.toLowerCase() &&
        a.employer.trim().toLowerCase() === e.toLowerCase() &&
        a.location.trim().toLowerCase() === l.toLowerCase()
    );

    if (alreadyApplied) {
      return res
        .status(400)
        .json({ error: "You have already applied to this job." });
    }

    appendApplication(u, t, e, l);

    return res.json({
      success: true,
      message: "Application submitted successfully.",
    });
  } catch (err) {
    console.error("Error in /api/jobs/apply:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/jobs?title=&employer=&location=
// Browse/search jobs/internships
router.get("/jobs", async (req, res) => {
  const { title, employer, location } = req.query;

  const allJobs = readJobs();

  // basic filtering (case-insensitive "contains")
  const filtered = allJobs.filter((job) => {
    const t = job.title.toLowerCase();
    const e = job.employer.toLowerCase();
    const l = job.location.toLowerCase();

    const okTitle =
      !title || t.includes(title.trim().toLowerCase());
    const okEmployer =
      !employer || e.includes(employer.trim().toLowerCase());
    const okLocation =
      !location || l.includes(location.trim().toLowerCase());

    return okTitle && okEmployer && okLocation;
  });

  return res.json({ jobs: filtered });
});

// POST /api/jobs/apply
// body: { username, title, employer, location }
router.post("/jobs/apply", express.json(), (req, res) => {
  const { username, title, employer, location } = req.body || {};

  if (!username || !title || !employer || !location) {
    return res.status(400).json({
      error: "Username, title, employer, and location are required",
    });
  }

  const u = username.trim();
  const t = title.trim();
  const e = employer.trim();
  const l = location.trim();

  try {
    // 1) ensure job exists
    const jobs = readJobs();
    const jobExists = jobs.some(
      (j) =>
        j.title.trim().toLowerCase() === t.toLowerCase() &&
        j.employer.trim().toLowerCase() === e.toLowerCase() &&
        j.location.trim().toLowerCase() === l.toLowerCase()
    );

    if (!jobExists) {
      return res
        .status(404)
        .json({ error: "Job not found. It may have been removed." });
    }

    // 2) check if already applied
    const apps = readApplications();
    const alreadyApplied = apps.some(
      (a) =>
        a.username.trim().toLowerCase() === u.toLowerCase() &&
        a.title.trim().toLowerCase() === t.toLowerCase() &&
        a.employer.trim().toLowerCase() === e.toLowerCase() &&
        a.location.trim().toLowerCase() === l.toLowerCase()
    );

    if (alreadyApplied) {
      return res
        .status(400)
        .json({ error: "You have already applied to this job." });
    }

    // 3) append application record
    appendApplication(u, t, e, l);

    return res.json({
      success: true,
      message: "Application submitted successfully.",
    });
  } catch (err) {
    console.error("Error in /api/jobs/apply:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/jobs", async (req, res) => {

  try {
    const { username, title, description, employer, location, salary } = req.body;

    // Basic validation (match COBOL: title/description/employer/location required)
    if (!username || !title || !description || !employer || !location) {
      return res.status(400).json({
        error: "username, title, description, employer, and location are required.",
      });
    }

    const job = {
      title: title.trim(),
      description: description.trim(),
      employer: employer.trim(),
      location: location.trim(),
      salary: (salary || "").toString().trim(),
      poster: username.trim(),
    };

    await appendJob(job);

    return res.status(201).json({ success: true, job });
  } catch (err) {
    console.error("Error posting job:", err);
    return res.status(500).json({ error: "Failed to post job." });

  }
});

router.get("/applications/:username", async (req, res) => {
  try {
    const username = req.params.username.trim();

    // reuse your existing helper
    const allApps = await readApplications(); 
    // allApps presumably like: { username, jobTitle, employer, location }

    const myApps = allApps.filter(
      (app) => app.username.trim() === username
    );

    return res.json(myApps);
  } catch (err) {
    console.error("Error fetching applications:", err);
    return res.status(500).json({ error: "Failed to load applications." });
  }
});

router.get("/messages/:username", async (req, res) => {
  const username = (req.params.username || "").trim();
  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }

  try {
    let content;
    try {
      content = await fs.promises.readFile(MESSAGES_PATH, "utf8");
    } catch (err) {
      if (err.code === "ENOENT") {
        // No messages file yet
        return res.json([]);
      }
      throw err;
    }

    const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
    const upperUser = username.toUpperCase();

    // Filter for messages where this user is the recipient
    const records = lines
      .map(parseMessageRecord)
      .filter(
        (r) => r.recipient.trim().toUpperCase() === upperUser
      );

    if (!records.length) {
      return res.json([]);
    }

    // Group by msg-id, preserving file order
    const byId = new Map();
    for (const rec of records) {
      const idKey = rec.id;
      if (!byId.has(idKey)) {
        byId.set(idKey, {
          id: rec.id,
          sender: rec.sender,
          recipient: rec.recipient,
          timestamp: rec.timestamp,
          text: rec.text || "",
        });
      } else {
        const msg = byId.get(idKey);
        msg.text = (msg.text + rec.text).trim();
      }
    }

    const messages = Array.from(byId.values()).sort((a, b) => a.id - b.id);

    const response = messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      recipient: m.recipient,
      timestamp: m.timestamp,
      displayTimestamp: formatDisplayTimestamp(m.timestamp),
      text: m.text,
    }));

    return res.json(response);
  } catch (err) {
    console.error("Error reading messages:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while loading messages." });
  }
});
router.post("/messages", express.json(), async (req, res) => {
  try {
    const { sender, recipient, text } = req.body || {};

    if (!sender || !recipient) {
      return res
        .status(400)
        .json({ error: "Sender and recipient are required." });
    }

    const trimmedText = (text ?? "").trim();
    if (!trimmedText) {
      return res.status(400).json({ error: "Message text cannot be empty." });
    }

    if (sender.trim().toUpperCase() === recipient.trim().toUpperCase()) {
      return res
        .status(400)
        .json({ error: "You cannot send a message to yourself." });
    }

    const connected = areConnected(sender, recipient);
    if (!connected) {
      return res.status(403).json({
        error:
          "You are not connected with this person. You can only message users you are connected with.",
      });
    }

    await appendMessage({
      sender: sender.trim(),
      recipient: recipient.trim(),
      text: trimmedText,
    });

    return res
      .status(201)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("Error sending message:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while sending the message." });
  }
});

router.get("/messages/sent/:username", async (req, res) => {
  const username = (req.params.username || "").trim();
  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }

  try {
    let content;
    try {
      content = await fs.promises.readFile(MESSAGES_PATH, "utf8");
    } catch (err) {
      if (err.code === "ENOENT") {
        return res.json([]);
      }
      throw err;
    }

    const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
    const upperUser = username.toUpperCase();

    // Filter where sender is our user
    const records = lines
      .map(parseMessageRecord)
      .filter(
        (r) => r.sender.trim().toUpperCase() === upperUser
      );

    if (!records.length) return res.json([]);

    // Group by msg-id (same logic as received messages)
    const byId = new Map();
    for (const rec of records) {
      const id = rec.id;
      if (!byId.has(id)) {
        byId.set(id, {
          id: rec.id,
          sender: rec.sender,
          recipient: rec.recipient,
          timestamp: rec.timestamp,
          text: rec.text || "",
        });
      } else {
        const m = byId.get(id);
        m.text = (m.text + rec.text).trim();
      }
    }

    const messages = Array.from(byId.values()).sort((a, b) => b.id - a.id);

    const response = messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      recipient: m.recipient,
      timestamp: m.timestamp,
      displayTimestamp: formatDisplayTimestamp(m.timestamp),
      text: m.text,
    }));

    return res.json(response);
  } catch (err) {
    console.error("Error reading sent messages:", err);
    return res.status(500).json({ error: "Failed to load sent messages." });
  }
});

router.get("/messages/sent/:username", async (req, res) => {
  const username = (req.params.username || "").trim();
  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }

  try {
    let content;
    try {
      content = await fs.promises.readFile(MESSAGES_PATH, "utf8");
    } catch (err) {
      if (err.code === "ENOENT") {
        // No messages file yet
        return res.json([]);
      }
      throw err;
    }

    const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
    const upperUser = username.toUpperCase();

    // 🔹 Filter messages where THIS user is the SENDER
    const records = lines
      .map(parseMessageRecord)
      .filter(
        (r) => r.sender.trim().toUpperCase() === upperUser
      );

    if (!records.length) {
      return res.json([]);
    }

    // 🔹 Group by msg-id, just like inbox
    const byId = new Map();
    for (const rec of records) {
      const idKey = rec.id;
      if (!byId.has(idKey)) {
        byId.set(idKey, {
          id: rec.id,
          sender: rec.sender,
          recipient: rec.recipient,
          timestamp: rec.timestamp,
          text: rec.text || "",
        });
      } else {
        const msg = byId.get(idKey);
        msg.text = (msg.text + rec.text).trim();
      }
    }

    // 🔹 Sort newest first (higher id = newer)
    const messages = Array.from(byId.values()).sort((a, b) => b.id - a.id);

    const response = messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      recipient: m.recipient,
      timestamp: m.timestamp,
      displayTimestamp: formatDisplayTimestamp(m.timestamp),
      text: m.text,
    }));

    return res.json(response);
  } catch (err) {
    console.error("Error reading sent messages:", err);
    return res
      .status(500)
      .json({ error: "Failed to load sent messages." });
  }
});


module.exports = router;

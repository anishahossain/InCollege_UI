// server/server.js
const express = require("express");
const profileRoutes = require("./profileRoutes");
const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");
const { execFile } = require("child_process");

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173", // your dev environment
      "https://in-college-3ww36mxv0-anishahossains-projects.vercel.app", // your Vercel site
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);



app.use(express.json());

const COBOL_DIR = path.join(__dirname, "../cobol");
const INPUT_PATH = path.join(COBOL_DIR, "InCollege-Input.txt");
const OUTPUT_PATH = path.join(COBOL_DIR, "InCollege-Output.txt");

// (optional for later)
const PROFILES_PATH = path.join(COBOL_DIR, "InCollege-Profiles.txt");
const PENDING_REQUESTS_PATH = path.join(COBOL_DIR, "InCollege-PendingRequests.txt");
const CONNECTIONS_PATH = path.join(COBOL_DIR, "InCollege-Connections.txt");
const MESSAGES_FILE = path.join(COBOL_DIR, "InCollege-Messages.txt");


// Helper: run COBOL with a given sequence of inputs
async function runCobolWithInputs(lines) {
  return new Promise(async (resolve, reject) => {
    try {
      const inputContent = lines.join("\n") + "\n";
      await fs.writeFile(INPUT_PATH, inputContent, "utf8");

      try {
        await fs.unlink(OUTPUT_PATH);
      } catch (e) {
        // ignore if file doesn't exist
      }

      execFile("./incollege", { cwd: COBOL_DIR }, async (err) => {
        if (err) {
          return reject(err);
        }

        let attempts = 0;
        const maxAttempts = 20; // ~2 seconds max
        const waitForOutput = setInterval(async () => {
          attempts++;
          try {
            const output = await fs.readFile(OUTPUT_PATH, "utf8");
            clearInterval(waitForOutput);
            resolve(output);
          } catch (readErr) {
            if (attempts > maxAttempts) {
              clearInterval(waitForOutput);
              reject(
                new Error("COBOL did not create output file after execution")
              );
            }
          }
        }, 100);
      });
    } catch (outerErr) {
      reject(outerErr);
    }
  });
}

function formatField(value, length) {
  const s = (value ?? "").toString();
  if (s.length >= length) {
    return s.slice(0, length);
  }
  return s.padEnd(length, " ");
}

function parseMessageRecord(line) {
  const idStr = line.slice(0, 8).trim();
  return {
    id: parseInt(idStr || "0", 10),
    rawId: line.slice(0, 8),
    sender: line.slice(8, 28).trimEnd(),
    recipient: line.slice(28, 48).trimEnd(),
    timestamp: line.slice(48, 62).trimEnd(), // YYYYMMDDHHMMSS
    text: line.slice(62, 262).trimEnd(),
  };
}

async function getNextMessageId() {
  try {
    const content = await fs.readFile(MESSAGES_FILE, "utf8");
    const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
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
      // File doesn't exist yet
      return 1;
    }
    throw err;
  }
}

async function areConnected(userA, userB) {
  const a = userA.trim().toUpperCase();
  const b = userB.trim().toUpperCase();

  try {
    const content = await fs.readFile(CONNECTIONS_PATH, "utf8");
    const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");

    for (const line of lines) {
      const u1 = line.slice(0, 20).trimEnd().toUpperCase();
      const u2 = line.slice(20, 40).trimEnd().toUpperCase();

      if (
        (u1 === a && u2 === b) ||
        (u1 === b && u2 === a)
      ) {
        return true;
      }
    }
    return false;
  } catch (err) {
    if (err.code === "ENOENT") {
      // No connections file yet -> no one is connected
      return false;
    }
    throw err;
  }
}

function getCobolTimestamp() {
  const now = new Date();

  const yyyy = now.getFullYear().toString().padStart(4, "0");
  const mm = (now.getMonth() + 1).toString().padStart(2, "0");
  const dd = now.getDate().toString().padStart(2, "0");
  const hh = now.getHours().toString().padStart(2, "0");
  const min = now.getMinutes().toString().padStart(2, "0");
  const ss = now.getSeconds().toString().padStart(2, "0");

  return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
}

function formatDisplayTimestamp(ts) {
  // Convert "YYYYMMDDHHMMSS" → "YYYY/MM/DD HH:MM:SS"
  if (!ts || ts.length !== 14) return ts;
  return `${ts.slice(0, 4)}/${ts.slice(4, 6)}/${ts.slice(6, 8)} ${ts.slice(
    8,
    10
  )}:${ts.slice(10, 12)}:${ts.slice(12, 14)}`;
}

function chunkMessageText(text, size = 200) {
  const normalized = (text ?? "").toString();
  if (!normalized.length) return [""]; // at least one record

  const chunks = [];
  for (let i = 0; i < normalized.length; i += size) {
    chunks.push(normalized.slice(i, i + size));
  }
  return chunks;
}

async function appendMessage({ sender, recipient, text }) {
  const id = await getNextMessageId();
  const timestamp = getCobolTimestamp();
  const chunks = chunkMessageText(text, 200);

  const lines = chunks
    .map((chunk) => {
      const idStr = String(id).padStart(8, "0");
      const senderField = formatField(sender, 20);
      const recipientField = formatField(recipient, 20);
      const tsField = formatField(timestamp, 14);
      const textField = formatField(chunk, 200);
      return idStr + senderField + recipientField + tsField + textField + "\n";
    })
    .join("");

  await fs.appendFile(MESSAGES_FILE, lines, "utf8");
}


// --- LOGIN ---
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const script = [
    "1",          // initial menu: Log In
    username,     // username prompt
    password,     // password prompt
    "10"          // from main menu: Exit program
  ];

  try {
    const cobolOutput = await runCobolWithInputs(script);

    const success =
      cobolOutput.includes("You have successfully logged in") ||
      cobolOutput.toLowerCase().includes("successfully logged in");

    res.json({
      success,
      rawOutput: cobolOutput,
    });
  } catch (err) {
    console.error("COBOL error", err);
    res.status(500).json({ error: "Failed to run COBOL program" });
  }
});

// --- REGISTER / CREATE ACCOUNT ---
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const script = [
    "2",        // initial menu: Create Account
    username,   // username prompt
    password,   // password prompt
    "10"        // exit program after main menu
  ];

  try {
    const cobolOutput = await runCobolWithInputs(script);

    const success =
      cobolOutput.toLowerCase().includes("account created") ||
      cobolOutput.toLowerCase().includes("successfully created");

    res.json({
      success,
      rawOutput: cobolOutput,
    });
  } catch (err) {
    console.error("COBOL error", err);
    res.status(500).json({ error: "Failed to run COBOL program" });
  }
});

// mount all profile-related routes (view/edit/find)
app.use("/api", profileRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

